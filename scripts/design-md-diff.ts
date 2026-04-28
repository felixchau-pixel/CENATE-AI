import { readFileSync } from "node:fs";
import path from "node:path";
import { diffDesignSpecs } from "../lib/design-md";

const [, , beforeArg, afterArg] = process.argv;

if (!beforeArg || !afterArg) {
  console.error("Usage: pnpm design:diff -- <before> <after>");
  process.exit(1);
}

const beforePath = path.resolve(process.cwd(), beforeArg);
const afterPath = path.resolve(process.cwd(), afterArg);
const beforeContent = readFileSync(beforePath, "utf8");
const afterContent = readFileSync(afterPath, "utf8");
const diff = diffDesignSpecs(beforeContent, afterContent);

console.log(JSON.stringify({ beforePath, afterPath, diff }, null, 2));

if (diff.regression) {
  process.exitCode = 1;
}
