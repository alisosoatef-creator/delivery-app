import fs from "node:fs";

const required = [
  "app/_layout.js",
  "app/index.js",
  "components/wasel-mobile-app.js",
  "data/fallback.js",
  "lib/api.js",
  "app.json",
  "eas.json"
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing ${file}`);
  }
}

const appJson = JSON.parse(fs.readFileSync("app.json", "utf8"));
if (appJson.expo.slug !== "wasel-delivery") {
  throw new Error("Unexpected Expo slug");
}

console.log("mobile-check-ok");
