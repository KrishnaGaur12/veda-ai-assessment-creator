import mongoose from "mongoose";
import config from "./index";

const connectDB = async (): Promise<void> => {
  try {
    if (!config.mongodbUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }
    const conn = await mongoose.connect(config.mongodbUri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    const err = error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ MongoDB connection error: ${err}`);
    process.exit(1);
  }
};

export default connectDB;
