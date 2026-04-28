import path from "node:path";
import { listDesignSpecFiles, lintDesignSpecFile } from "../lib/design-md";

const directory = path.join(process.cwd(), "design-specs");
const files = listDesignSpecFiles(directory).filter((file) => file.endsWith(".DESIGN.md"));

const results = files.map((file) => {
  const report = lintDesignSpecFile(file);
  return {
    file,
    summary: report.summary,
    findings: report.findings,
  };
});

console.log(JSON.stringify({ directory, files: results }, null, 2));

if (results.some((result) => result.summary.errors > 0)) {
  process.exitCode = 1;
}
