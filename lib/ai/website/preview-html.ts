export function hashPreviewFiles(
  files: Array<{
    path: string;
    content: string;
  }>
): string {
  let hash = 0;
  for (const file of files) {
    const value = `${file.path}::${file.content}`;
    for (let index = 0; index < value.length; index++) {
      hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
    }
  }
  return String(hash);
}

export function buildPreviewHtml(
  files: Array<{
    path: string;
    content: string;
  }>
): string {
  const fileMap: Record<string, string> = {};
  for (const file of files) {
    fileMap[file.path] = file.content;
  }

  const filesJson = JSON.stringify(fileMap)
    .replace(/<\/script>/gi, "<\\/script>")
    .replace(/<!--/g, "<\\!--");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Generated Preview</title>
  <script>
    window.__CENATE_PREVIEW_FILES__ = ${filesJson};
  </script>
</head>
<body data-hash="${hashPreviewFiles(files)}">
  <div id="root"></div>
</body>
</html>`;
}
