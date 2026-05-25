import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Assignment, { IAssignment } from "../models/Assignment";
import GeneratedPaper from "../models/GeneratedPaper";
import { addGenerationJob } from "../queues/assignmentQueue";

const router = Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, PNG, JPG, and PPTX files are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// POST /api/assignments — Create assignment + queue generation
router.post("/", upload.single("file"), async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      subject,
      class: className,
      dueDate,
      questionTypes,
      totalQuestions,
      totalMarks,
      additionalInstructions,
    } = req.body;

    // Validate required fields
    if (!title || !dueDate || !questionTypes) {
      res.status(400).json({
        success: false,
        error: "title, dueDate, and questionTypes are required",
      });
      return;
    }

    // Parse questionTypes if it's a string (from FormData)
    let parsedQuestionTypes = questionTypes;
    if (typeof questionTypes === "string") {
      try {
        parsedQuestionTypes = JSON.parse(questionTypes);
      } catch {
        res.status(400).json({
          success: false,
          error: "Invalid questionTypes format",
        });
        return;
      }
    }

    // Validate due date is in the future
    const dueDateObj = new Date(dueDate);
    if (isNaN(dueDateObj.getTime())) {
      res.status(400).json({
        success: false,
        error: "Invalid due date format",
      });
      return;
    }

    // Validate question types
    if (!Array.isArray(parsedQuestionTypes) || parsedQuestionTypes.length === 0) {
      res.status(400).json({
        success: false,
        error: "At least one question type is required",
      });
      return;
    }

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : "";

    const assignment = await Assignment.create({
      title,
      subject: subject || "",
      class: className || "",
      dueDate: dueDateObj,
      questionTypes: parsedQuestionTypes,
      totalQuestions: parseInt(totalQuestions, 10) || 0,
      totalMarks: parseInt(totalMarks, 10) || 0,
      additionalInstructions: additionalInstructions || "",
      fileUrl,
      status: "pending",
    });

    // Add job to BullMQ queue
    await addGenerationJob(assignment._id.toString());

    res.status(201).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    const err = error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Create assignment error: ${err}`);
    res.status(500).json({
      success: false,
      error: `Failed to create assignment: ${err}`,
    });
  }
});

// GET /api/assignments — List all assignments
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const assignments = await Assignment.find()
      .sort({ createdAt: -1 })
      .lean<IAssignment[]>();

    res.json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    const err = error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ List assignments error: ${err}`);
    res.status(500).json({
      success: false,
      error: `Failed to fetch assignments: ${err}`,
    });
  }
});

// GET /api/assignments/:id — Get single assignment
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const assignment = await Assignment.findById(req.params.id).lean();

    if (!assignment) {
      res.status(404).json({
        success: false,
        error: "Assignment not found",
      });
      return;
    }

    res.json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    const err = error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Get assignment error: ${err}`);
    res.status(500).json({
      success: false,
      error: `Failed to fetch assignment: ${err}`,
    });
  }
});

// GET /api/assignments/:id/result — Get generated paper
router.get("/:id/result", async (req: Request, res: Response): Promise<void> => {
  try {
    const paper = await GeneratedPaper.findOne({
      assignmentId: req.params.id,
    }).lean();

    if (!paper) {
      res.status(404).json({
        success: false,
        error: "Generated paper not found. It may still be processing.",
      });
      return;
    }

    res.json({
      success: true,
      data: paper,
    });
  } catch (error) {
    const err = error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Get result error: ${err}`);
    res.status(500).json({
      success: false,
      error: `Failed to fetch generated paper: ${err}`,
    });
  }
});

// DELETE /api/assignments/:id — Delete assignment + generated paper
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      res.status(404).json({
        success: false,
        error: "Assignment not found",
      });
      return;
    }

    // Delete associated generated paper
    await GeneratedPaper.deleteOne({ assignmentId: req.params.id });

    // Delete the assignment
    await Assignment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      data: { message: "Assignment deleted successfully" },
    });
  } catch (error) {
    const err = error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Delete assignment error: ${err}`);
    res.status(500).json({
      success: false,
      error: `Failed to delete assignment: ${err}`,
    });
  }
});

// POST /api/assignments/:id/regenerate — Regenerate paper
router.post("/:id/regenerate", async (req: Request, res: Response): Promise<void> => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      res.status(404).json({
        success: false,
        error: "Assignment not found",
      });
      return;
    }

    // Reset status and re-queue
    assignment.status = "pending";
    await assignment.save();

    await addGenerationJob(assignment._id.toString());

    res.json({
      success: true,
      data: { message: "Regeneration queued successfully" },
    });
  } catch (error) {
    const err = error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Regenerate error: ${err}`);
    res.status(500).json({
      success: false,
      error: `Failed to regenerate paper: ${err}`,
    });
  }
});

// POST /api/assignments/:id/pdf — Generate and download PDF
router.post("/:id/pdf", async (req: Request, res: Response): Promise<void> => {
  try {
    const paper = await GeneratedPaper.findOne({
      assignmentId: req.params.id,
    }).lean();

    if (!paper) {
      res.status(404).json({
        success: false,
        error: "Generated paper not found",
      });
      return;
    }

    // Dynamic import for puppeteer
    const puppeteer = await import("puppeteer");
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // Build HTML for the PDF
    const sectionsHtml = paper.sections
      .map(
        (section) => `
        <div class="section">
          <h2>${section.name}</h2>
          <p class="instruction"><em>${section.instruction}</em></p>
          <ol>
            ${section.questions
              .map(
                (q) => `
                <li>
                  <span class="question-text">${q.text}</span>
                  <span class="badge badge-${q.difficulty.toLowerCase()}">${q.difficulty}</span>
                  <span class="marks">[${q.marks} Mark${q.marks > 1 ? "s" : ""}]</span>
                </li>
              `
              )
              .join("")}
          </ol>
        </div>
      `
      )
      .join("");

    const answerKeyHtml = paper.answerKey.length
      ? `
        <div class="answer-key">
          <h2>Answer Key</h2>
          <ol>
            ${paper.answerKey.map((a) => `<li>${a.answer}</li>`).join("")}
          </ol>
        </div>
      `
      : "";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Times New Roman', serif; padding: 40px; font-size: 14px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 15px; }
          .header h1 { font-size: 22px; margin-bottom: 5px; }
          .header p { font-size: 14px; }
          .meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; }
          .note { text-align: center; font-style: italic; margin-bottom: 20px; font-size: 12px; }
          .student-info { margin-bottom: 20px; font-size: 13px; }
          .student-info span { margin-right: 30px; }
          .section { margin-bottom: 25px; }
          .section h2 { font-size: 16px; margin-bottom: 8px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
          .instruction { font-size: 13px; margin-bottom: 10px; color: #555; }
          ol { padding-left: 25px; }
          li { margin-bottom: 10px; }
          .question-text { margin-right: 8px; }
          .badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; margin-right: 5px; }
          .badge-easy { background: #d4edda; color: #155724; }
          .badge-medium { background: #fff3cd; color: #856404; }
          .badge-hard { background: #f8d7da; color: #721c24; }
          .marks { font-weight: bold; font-size: 12px; color: #333; }
          .answer-key { margin-top: 30px; border-top: 2px solid #000; padding-top: 15px; }
          .answer-key h2 { font-size: 16px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Delhi Public School, Sector-4, Bokaro</h1>
          <p>Subject: ${paper.subject} | Class: ${paper.class}</p>
        </div>
        <div class="meta">
          <span>Time Allowed: ${paper.duration}</span>
          <span>Maximum Marks: ${paper.totalMarks}</span>
        </div>
        <p class="note">All questions are compulsory unless stated otherwise.</p>
        <div class="student-info">
          <span>Name: ______________</span>
          <span>Roll No: ________</span>
          <span>Class: ${paper.class}</span>
          <span>Section: ________</span>
        </div>
        ${sectionsHtml}
        ${answerKeyHtml}
      </body>
      </html>
    `;

    await page.setContent(html, { waitUntil: "load" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="question-paper-${req.params.id}.pdf"`,
      "Content-Length": pdfBuffer.length.toString(),
    });

    res.send(pdfBuffer);
  } catch (error) {
    const err = error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ PDF generation error: ${err}`);
    res.status(500).json({
      success: false,
      error: `Failed to generate PDF: ${err}`,
    });
  }
});

export default router;
