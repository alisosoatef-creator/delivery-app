import fs from "node:fs";
import { execFileSync } from "node:child_process";

const requiredFiles = [
  "index.html",
  "src/main.jsx",
  "src/App.jsx",
  "src/styles.css",
  "backend/server.mjs",
  "backend/data.mjs",
  "backend/schema.sql",
  "backend/api-contract.md"
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing required file: ${file}`);
  }
}

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
for (const script of ["dev", "api", "build", "check"]) {
  if (!packageJson.scripts?.[script]) {
    throw new Error(`Missing npm script: ${script}`);
  }
}

execFileSync(process.execPath, ["--check", "backend/server.mjs"], { stdio: "inherit" });
execFileSync(process.execPath, ["--check", "backend/data.mjs"], { stdio: "inherit" });

console.log("project-check-ok");
