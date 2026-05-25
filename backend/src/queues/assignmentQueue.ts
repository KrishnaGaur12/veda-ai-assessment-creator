import { Queue } from "bullmq";
import { getRedisConnection } from "../config/redis";

let assignmentQueue: Queue | null = null;

export const getAssignmentQueue = (): Queue => {
  if (!assignmentQueue) {
    const connection = getRedisConnection();
    assignmentQueue = new Queue("assignment-generation", {
      connection,
      defaultJobOptions: {
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      },
    });

    console.log("✅ BullMQ assignment queue initialized");
  }

  return assignmentQueue;
};

export const addGenerationJob = async (assignmentId: string): Promise<void> => {
  try {
    const queue = getAssignmentQueue();
    await queue.add(
      "generate-paper",
      { assignmentId },
      {
        jobId: `gen-${assignmentId}`,
      }
    );
    console.log(`📋 Job added to queue for assignment: ${assignmentId}`);
  } catch (error) {
    const err = error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Failed to add job to queue: ${err}`);
    throw new Error(`Failed to queue assignment generation: ${err}`);
  }
};

export default getAssignmentQueue;
