import { Worker, Job } from "bullmq";
import { getRedisConnection } from "../config/redis";
import Assignment from "../models/Assignment";
import GeneratedPaper from "../models/GeneratedPaper";
import { generatePaper } from "../services/geminiService";
import { broadcastMessage } from "../websocket/wsServer";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";

interface GenerationJobData {
  assignmentId: string;
}

export const startGenerationWorker = (): Worker => {
  const connection = getRedisConnection();

  const worker = new Worker<GenerationJobData>(
    "assignment-generation",
    async (job: Job<GenerationJobData>) => {
      const { assignmentId } = job.data;

      console.log(`🔄 Processing job for assignment: ${assignmentId}`);

      try {
        // 1. Fetch the assignment
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
          throw new Error(`Assignment not found: ${assignmentId}`);
        }

        // 2. Update status to processing
        assignment.status = "processing";
        await assignment.save();

        // Notify frontend via WebSocket
        broadcastMessage({
          type: "job:processing",
          assignmentId,
        });

        // 3. Extract text from PDF if available
        let referenceText = undefined;
        if (assignment.fileUrl && assignment.fileUrl.endsWith(".pdf")) {
          try {
            const filePath = path.join(__dirname, "../..", assignment.fileUrl);
            if (fs.existsSync(filePath)) {
              const dataBuffer = fs.readFileSync(filePath);
              const data = await pdfParse(dataBuffer);
              referenceText = data.text;
              console.log(`📄 Extracted ${referenceText.length} characters from PDF reference`);
            }
          } catch (pdfErr) {
            console.error("❌ Failed to parse PDF:", pdfErr);
          }
        }

        // 4. Call Gemini to generate the paper
        const paperData = await generatePaper(
          assignment.questionTypes,
          assignment.totalQuestions,
          assignment.totalMarks,
          assignment.additionalInstructions,
          assignment.title,
          assignment.subject,
          assignment.class,
          referenceText
        );

        // 4. Save the generated paper
        const existingPaper = await GeneratedPaper.findOne({ assignmentId });
        if (existingPaper) {
          // Update existing paper (for regeneration)
          existingPaper.title = paperData.title;
          existingPaper.subject = paperData.subject;
          existingPaper.class = paperData.class;
          existingPaper.totalMarks = paperData.totalMarks;
          existingPaper.duration = paperData.duration;
          existingPaper.sections = paperData.sections;
          existingPaper.answerKey = paperData.answerKey;
          await existingPaper.save();
        } else {
          await GeneratedPaper.create({
            assignmentId,
            ...paperData,
          });
        }

        // 5. Update assignment status to done
        assignment.status = "done";
        await assignment.save();

        // 6. Notify frontend via WebSocket
        broadcastMessage({
          type: "job:complete",
          assignmentId,
          result: paperData,
        });

        console.log(`✅ Paper generated for assignment: ${assignmentId}`);
        return { success: true, assignmentId };
      } catch (error) {
        // Update assignment status to failed
        try {
          await Assignment.findByIdAndUpdate(assignmentId, {
            status: "failed",
          });
        } catch (updateError) {
          console.error("❌ Failed to update assignment status to failed");
        }

        const err = error instanceof Error ? error.message : "Unknown error";

        // Notify frontend via WebSocket
        broadcastMessage({
          type: "job:failed",
          assignmentId,
          error: err,
        });

        console.error(`❌ Job failed for assignment ${assignmentId}: ${err}`);
        throw error;
      }
    },
    {
      connection,
      concurrency: 2,
      limiter: {
        max: 5,
        duration: 60000,
      },
    }
  );

  worker.on("completed", (job: Job<GenerationJobData>) => {
    console.log(`✅ Job ${job.id} completed successfully`);
  });

  worker.on("failed", (job: Job<GenerationJobData> | undefined, error: Error) => {
    console.error(`❌ Job ${job?.id} failed: ${error.message}`);
  });

  worker.on("error", (error: Error) => {
    console.error(`❌ Worker error: ${error.message}`);
  });

  console.log("✅ BullMQ generation worker started");
  return worker;
};

export default { startGenerationWorker };
