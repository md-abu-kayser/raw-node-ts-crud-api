import fs from "fs";
import path from "path";

const filePath = path.resolve(process.cwd(), "src/data/users.json");

export interface User {
  id: string | number;
  [key: string]: unknown;
}

export function readUsers(): User[] {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data) as User[];
  } catch {
    return [];
  }
}

export function writeUsers(users: User[]): void {
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2), "utf-8");
}
