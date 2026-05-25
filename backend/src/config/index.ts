import dotenv from "dotenv";
dotenv.config();

interface Config {
  port: number;
  mongodbUri: string;
  redisUrl: string;
  geminiApiKey: string;
  frontendUrl: string;
  nodeEnv: string;
}

const config: Config = {
  port: parseInt(process.env.PORT || "5000", 10),
  mongodbUri: process.env.MONGODB_URI || "",
  redisUrl: process.env.REDIS_URL || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  nodeEnv: process.env.NODE_ENV || "development",
};

export default config;
