import fs from "node:fs";
import path from "node:path";

for (const envPath of [
  path.resolve(process.cwd(), ".env.local"),
  path.resolve(process.cwd(), "../.env.local"),
]) {
  if (!fs.existsSync(envPath)) continue;

  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.trim().match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}

const command = process.argv[2] ?? "openai-gate";
const missing = ["OPENAI_API_KEY"].filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    `${command} blocked: missing ${missing.join(", ")}. ` +
      "Real OpenAI image/story quality gates cannot run without live credentials.",
  );
  process.exit(1);
}

console.log(`${command} ready: OPENAI_API_KEY is present.`);

