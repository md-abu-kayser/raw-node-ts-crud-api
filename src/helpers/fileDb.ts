import fs from "fs";
import path from "path";
import { User } from "../types/user";

const dataDir = path.join(process.cwd(), "src", "data");
const filePath = path.join(dataDir, "users.json");

function ensureDatabaseFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]\n", "utf-8");
  }
}

ensureDatabaseFile();

export function readUsers(): User[] {
  try {
    const raw = fs.readFileSync(filePath, "utf-8").trim();

    if (!raw) return [];

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? (parsed as User[]) : [];
  } catch {
    return [];
  }
}

export function writeUsers(users: User[]) {
  const tempFilePath = `${filePath}.tmp`;

  fs.writeFileSync(
    tempFilePath,
    JSON.stringify(users, null, 2) + "\n",
    "utf-8",
  );
  fs.renameSync(tempFilePath, filePath);
}
