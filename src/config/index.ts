import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const portValue = Number(process.env.PORT ?? 5000);

const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number.isNaN(portValue) ? 5000 : portValue,
};

export default config;
