import fs from "fs";
import path from "path";

const filepath = path.join(process.cwd(), "./src/data/users.json");
export function readUsers() {
  const data = fs.readFileSync(filepath, "utf-8");
  return JSON.parse(data);
}

export function writeUsers(users: any) {
  fs.writeFileSync(filepath, JSON.stringify(users, null, 2));
}
