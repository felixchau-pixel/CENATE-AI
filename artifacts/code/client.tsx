import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CodeEditor } from "@/components/chat/code-editor";
import {
  Console,
  type ConsoleOutput,
  type ConsoleOutputContent,
} from "@/components/chat/console";
import { Artifact } from "@/components/chat/create-artifact";
import { FileTree } from "@/components/chat/file-tree";
import {
  CopyIcon,
  LogsIcon,
  MessageIcon,
  PlayIcon,
  RedoIcon,
  UndoIcon,
} from "@/components/chat/icons";
import {
  countCompletedFiles,
  getCurrentStreamingFile,
  isProjectContent,
  parseProjectContent,
} from "@/lib/project-manifest";
import { generateUUID } from "@/lib/utils";

const OUTPUT_HANDLERS = {
  matplotlib: `
    import io
    import base64
    from matplotlib import pyplot as plt
    plt.clf()
    plt.close('all')
    plt.switch_backend('agg')
    def setup_matplotlib_output():
        def custom_show():
            if plt.gcf().get_size_inches().prod() * plt.gcf().dpi ** 2 > 25_000_000:
                plt.gcf().set_dpi(100)
            png_buf = io.BytesIO()
            plt.savefig(png_buf, format='png')
            png_buf.seek(0)
            png_base64 = base64.b64encode(png_buf.read()).decode('utf-8')
            print(f'data:image/png;base64,{png_base64}')
            png_buf.close()
            plt.clf()
            plt.close('all')
        plt.show = custom_show
  `,
  basic: `# Basic output capture setup`,
};

function detectRequiredHandlers(code: string): string[] {
  const handlers: string[] = ["basic"];
  if (code.includes("matplotlib") || code.includes("plt.")) {
    handlers.push("matplotlib");
  }
  return handlers;
}

type Metadata = {
  outputs: ConsoleOutput[];
};

export const codeArtifact = new Artifact<"code", Metadata>({
  kind: "code",
  description:
    "Useful for code generation; Code execution is only available for python code.",
  initialize: ({ setMetadata }) => {
    setMetadata({ outputs: [] });
  },
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-codeDelta") {
      setArtifact((draftArtifact) => {
        const nextContent = streamPart.data;
        console.debug("[preview-payload]", {
          exists: nextContent.length > 0,
          length: nextContent.length,
        });

        return {
          ...draftArtifact,
          content: nextContent,
          isVisible: nextContent.length > 0 || draftArtifact.isVisible,
          status: "streaming",
        };
      });
    }
  },
  content: ({ metadata, setMetadata, content, status, ...props }) => {
    const isProject = isProjectContent(content);
    const [selectedPath, setSelectedPath] = useState<string>("");

    // Parse the project manifest from real AI-generated files
    const project = useMemo(() => {
      if (!isProject || !content) return null;
      try {
        return parseProjectContent(content);
      } catch {
        return null;
      }
    }, [isProject, content]);

    // Set default selected file when project first loads
    const defaultPath = useMemo(() => {
      if (!project || project.files.length === 0) return "";
      // Prefer App.tsx or the entry file
      const appFile = project.files.find(
        (f) => f.path === "src/App.tsx" || f.path.endsWith("/App.tsx")
      );
      if (appFile) return appFile.path;
      // Fallback to first src file
      const srcFile = project.files.find((f) => f.path.startsWith("src/"));
      if (srcFile) return srcFile.path;
      return project.files[0].path;
    }, [project]);

    // Auto-select default when project loads
    if (selectedPath === "" && defaultPath !== "") {
      setSelectedPath(defaultPath);
    }

    // Streaming state for project mode
    if (isProject && status === "streaming") {
      const completedCount = countCompletedFiles(content);
      const currentFile = getCurrentStreamingFile(content);

      // If we have completed files, show them progressively
      if (project && project.files.length > 0) {
        const fileToShow =
          selectedPath && project.files.find((f) => f.path === selectedPath)
            ? selectedPath
            : defaultPath || project.files[0]?.path || "";

        const selectedFile = project.files.find(
          (f) => f.path === fileToShow
        );
        const fileContent = selectedFile?.content ?? "";

        return (
          <div className="flex h-full min-h-[400px]">
            <div className="w-[220px] shrink-0 overflow-hidden border-r border-border/50 bg-background">
              <FileTree
                files={project.files}
                selectedPath={fileToShow}
                onSelect={setSelectedPath}
              />
              {currentFile && (
                <div className="border-t border-border/50 px-3 py-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                    <span className="truncate">
                      Writing {currentFile}...
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="relative flex-1 overflow-hidden">
              <div className="absolute inset-x-0 top-0 z-10 flex h-8 items-center justify-between border-b border-border/50 bg-background px-3">
                <span className="truncate text-xs text-muted-foreground">
                  {fileToShow}
                </span>
                <span className="text-xs text-muted-foreground">
                  {completedCount} files
                </span>
              </div>
              <div className="absolute inset-0 pt-8">
                <CodeEditor
                  content={fileContent}
                  currentVersionIndex={props.currentVersionIndex}
                  isCurrentVersion={props.isCurrentVersion}
                  onSaveContent={() => null}
                  status="idle"
                  suggestions={[]}
                />
              </div>
            </div>
          </div>
        );
      }

      // Early streaming — no completed files yet
      return (
        <div className="flex h-full min-h-[200px] items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 animate-pulse rounded-full bg-blue-500"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="h-2 w-2 animate-pulse rounded-full bg-blue-500"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="h-2 w-2 animate-pulse rounded-full bg-blue-500"
                style={{ animationDelay: "300ms" }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Generating project files...
            </p>
            {completedCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {completedCount} files created
              </p>
            )}
          </div>
        </div>
      );
    }

    // Completed project mode: show file tree + code editor
    if (isProject && project && project.files.length > 0) {
      const fileToShow =
        selectedPath && project.files.find((f) => f.path === selectedPath)
          ? selectedPath
          : defaultPath || project.files[0]?.path || "";

      const selectedFile = project.files.find((f) => f.path === fileToShow);
      const fileContent = selectedFile?.content ?? "";

      return (
        <div className="flex h-full min-h-[400px]">
          <div className="w-[220px] shrink-0 overflow-hidden border-r border-border/50 bg-background">
            <FileTree
              files={project.files}
              selectedPath={fileToShow}
              onSelect={setSelectedPath}
            />
          </div>
          <div className="relative flex-1 overflow-hidden">
            <div className="absolute inset-x-0 top-0 z-10 flex h-8 items-center justify-between border-b border-border/50 bg-background px-3">
              <span className="truncate text-xs text-muted-foreground">
                {fileToShow}
              </span>
              <span className="text-xs text-muted-foreground">
                {project.files.length} files
              </span>
            </div>
            <div className="absolute inset-0 pt-8">
              <CodeEditor
                content={fileContent}
                currentVersionIndex={props.currentVersionIndex}
                isCurrentVersion={props.isCurrentVersion}
                onSaveContent={() => null}
                status="idle"
                suggestions={[]}
              />
            </div>
          </div>
        </div>
      );
    }

    // Standard code mode (non-project scripts)
    return (
      <>
        <div className="relative min-h-[200px]">
          <CodeEditor
            content={content}
            currentVersionIndex={props.currentVersionIndex}
            isCurrentVersion={props.isCurrentVersion}
            onSaveContent={props.onSaveContent}
            status={status}
            suggestions={props.suggestions}
          />
        </div>
        {metadata?.outputs && (
          <Console
            consoleOutputs={metadata.outputs}
            setConsoleOutputs={() => {
              setMetadata({ ...metadata, outputs: [] });
            }}
          />
        )}
      </>
    );
  },
  actions: [
    {
      icon: <PlayIcon size={18} />,
      label: "Run",
      description: "Execute code",
      onClick: async ({ content, setMetadata }) => {
        const runId = generateUUID();
        const outputContent: ConsoleOutputContent[] = [];

        setMetadata((metadata) => ({
          ...metadata,
          outputs: [
            ...metadata.outputs,
            { id: runId, contents: [], status: "in_progress" },
          ],
        }));

        try {
          // @ts-expect-error - loadPyodide is not defined
          const currentPyodideInstance = await globalThis.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
          });

          currentPyodideInstance.setStdout({
            batched: (output: string) => {
              outputContent.push({
                type: output.startsWith("data:image/png;base64")
                  ? "image"
                  : "text",
                value: output,
              });
            },
          });

          await currentPyodideInstance.loadPackagesFromImports(content, {
            messageCallback: (message: string) => {
              setMetadata((metadata) => ({
                ...metadata,
                outputs: [
                  ...metadata.outputs.filter((o) => o.id !== runId),
                  {
                    id: runId,
                    contents: [{ type: "text", value: message }],
                    status: "loading_packages",
                  },
                ],
              }));
            },
          });

          const requiredHandlers = detectRequiredHandlers(content);
          for (const handler of requiredHandlers) {
            if (OUTPUT_HANDLERS[handler as keyof typeof OUTPUT_HANDLERS]) {
              await currentPyodideInstance.runPythonAsync(
                OUTPUT_HANDLERS[handler as keyof typeof OUTPUT_HANDLERS]
              );
              if (handler === "matplotlib") {
                await currentPyodideInstance.runPythonAsync(
                  "setup_matplotlib_output()"
                );
              }
            }
          }

          await currentPyodideInstance.runPythonAsync(content);

          setMetadata((metadata) => ({
            ...metadata,
            outputs: [
              ...metadata.outputs.filter((o) => o.id !== runId),
              { id: runId, contents: outputContent, status: "completed" },
            ],
          }));
        } catch (error: unknown) {
          setMetadata((metadata) => ({
            ...metadata,
            outputs: [
              ...metadata.outputs.filter((o) => o.id !== runId),
              {
                id: runId,
                contents: [
                  {
                    type: "text",
                    value:
                      error instanceof Error ? error.message : String(error),
                  },
                ],
                status: "failed",
              },
            ],
          }));
        }
      },
    },
    {
      icon: <UndoIcon size={18} />,
      description: "View Previous version",
      onClick: ({ handleVersionChange }) => handleVersionChange("prev"),
      isDisabled: ({ currentVersionIndex }) => currentVersionIndex === 0,
    },
    {
      icon: <RedoIcon size={18} />,
      description: "View Next version",
      onClick: ({ handleVersionChange }) => handleVersionChange("next"),
      isDisabled: ({ isCurrentVersion }) => isCurrentVersion,
    },
    {
      icon: <CopyIcon size={18} />,
      description: "Copy code to clipboard",
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied to clipboard!");
      },
    },
  ],
  toolbar: [
    {
      icon: <MessageIcon />,
      description: "Add comments",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Add comments to the code snippet for understanding",
            },
          ],
        });
      },
    },
    {
      icon: <LogsIcon />,
      description: "Add logs",
      onClick: ({ sendMessage }) => {
        sendMessage({
          role: "user",
          parts: [
            {
              type: "text",
              text: "Add logs to the code snippet for debugging",
            },
          ],
        });
      },
    },
  ],
});
