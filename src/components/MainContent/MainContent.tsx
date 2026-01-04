import { useImperativeHandle, forwardRef, useState, useMemo, useCallback, useEffect, useRef } from "react";
import * as prettier from "prettier/standalone";
import * as prettierHtml from "prettier/plugins/html";
import * as prettierCss from "prettier/plugins/postcss";
import * as prettierBabel from "prettier/plugins/babel";
import * as prettierEstree from "prettier/plugins/estree";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import LZString from "lz-string";

import CodeEditor from "../CodeEditor/CodeEditor";
import Preview from "../Preview/Preview";
import TabBar from "../TabBar/TabBar";
import ConsoleDrawer from "../ConsoleDrawer/ConsoleDrawer";
import SettingsModal, { CDN_LIBRARIES } from "../SettingsModal/SettingsModal";
import Toast from "../Toast/Toast";
import type { CdnSettings, EditorSettings } from "../SettingsModal/SettingsModal";
import type { LogEntry, LogLevel } from "../ConsoleDrawer/ConsoleDrawer";
import useDebounce from "../../hooks/useDebounce";
import useLocalStorage from "../../hooks/useLocalStorage";
import { useResizable } from "../../hooks/useResizable";

interface FileState {
    id: string;
    name: string;
    language: string;
    content: string;
}

const DEFAULT_FILES: FileState[] = [
    {
        id: "index.html",
        name: "index.html",
        language: "html",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Page</title>
</head>
<body>
    <div class="card">
        <h1>Hello, World! 👋</h1>
        <p>Start editing to see your changes live!</p>
        <button onclick="handleClick()">Click Me</button>
    </div>
</body>
</html>`,
    },
    {
        id: "styles.css",
        name: "styles.css",
        language: "css",
        content: `body {
    font-family: 'Segoe UI', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

.card {
    background: white;
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    text-align: center;
    max-width: 400px;
}

h1 {
    color: #1e293b;
    margin: 0 0 16px;
}

p {
    color: #64748b;
    line-height: 1.6;
}

button {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}`,
    },
    {
        id: "script.js",
        name: "script.js",
        language: "javascript",
        content: `function handleClick() {
    console.log('Button clicked at ' + new Date().toLocaleTimeString());
    console.warn('This is a warning example');
    alert('Button clicked! 🎉 check console drawer');
}`,
    },
];

const DEFAULT_CDN_SETTINGS: CdnSettings = {
    bootstrap: false,
    tailwind: false,
    fontawesome: false,
    jquery: false,
};

const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
    showMinimap: true,
    wordWrap: true,
    theme: "vs-dark",
};

// Expose methods to parent via ref
export interface MainContentRef {
    formatCode: () => void;
    openSettings: () => void;
    downloadProject: () => void;
    exportHTML: () => void;
    shareCode: () => void;
    getProjectData: () => { html: string; css: string; js: string };
    loadProject: (html: string, css: string, js: string) => void;
}

interface MainContentProps {
    isZenMode?: boolean;
    onCodeChange?: (data: { html: string; css: string; js: string }) => void;
}

const MainContent = forwardRef<MainContentRef, MainContentProps>(({ isZenMode = false, onCodeChange }, ref) => {
    // Auto-save: files, CDN settings, and editor settings are persisted to localStorage
    const [files, setFiles] = useLocalStorage<FileState[]>("ice-files", DEFAULT_FILES);
    const [cdnSettings, setCdnSettings] = useLocalStorage<CdnSettings>("ice-cdn", DEFAULT_CDN_SETTINGS);
    const [editorSettings, setEditorSettings] = useLocalStorage<EditorSettings>("ice-editor", DEFAULT_EDITOR_SETTINGS);

    const [activeFileId, setActiveFileId] = useState("index.html");
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isConsoleOpen, setIsConsoleOpen] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isFormatting, setIsFormatting] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [isPreviewVisible, setIsPreviewVisible] = useState(true);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    // Track if initial load is complete to avoid triggering onCodeChange on mount
    const isInitialLoad = useRef(true);

    // Load from URL on mount
    useEffect(() => {
        const loadFromUrl = async () => {
            const path = window.location.pathname.slice(1); // Remove leading slash
            const params = new URLSearchParams(window.location.search);
            const codeParam = params.get("code");

            let loadedFiles: FileState[] | null = null;

            // 1. Try loading from Firestore (short ID in path)
            if (path && path.length > 0 && path !== "index.html") {
                try {
                    const { doc, getDoc } = await import("firebase/firestore");
                    const { db } = await import("../../lib/firebase");
                    const docRef = doc(db, "snippets", path);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data && data.files) {
                            loadedFiles = data.files;
                        }
                    } else {
                        console.warn("Snippet not found");
                    }
                } catch (e) {
                    console.error("Failed to load from Firestore:", e);
                }
            }
            // 2. Fallback: Try loading from query param (legacy)
            if (!loadedFiles && codeParam) {
                try {
                    const decompressed = LZString.decompressFromEncodedURIComponent(codeParam);
                    if (decompressed) {
                        const parsed = JSON.parse(decompressed);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            loadedFiles = parsed;
                        }
                    }
                } catch (e) {
                    console.error("Failed to load code from URL:", e);
                }
            }

            if (loadedFiles) {
                setFiles(loadedFiles);
                // Clean URL but keep the ID if it was a short link
                if (path && !codeParam) {
                    // Do nothing, keep the short path
                } else {
                    window.history.replaceState({}, "", window.location.pathname);
                }
            }
        };

        loadFromUrl();
        // Mark initial load as complete after a short delay
        const timer = setTimeout(() => {
            isInitialLoad.current = false;
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    // Debounced code content for triggering onCodeChange
    const codeContent = useMemo(() => {
        const htmlFile = files.find((f) => f.name === "index.html");
        const cssFile = files.find((f) => f.name === "styles.css");
        const jsFile = files.find((f) => f.name === "script.js");
        return {
            html: htmlFile?.content || "",
            css: cssFile?.content || "",
            js: jsFile?.content || "",
        };
    }, [files]);

    const debouncedCode = useDebounce(codeContent, 1500); // 1.5 second debounce for auto-save

    // Trigger onCodeChange callback when code changes (debounced)
    useEffect(() => {
        if (!isInitialLoad.current && onCodeChange) {
            onCodeChange(debouncedCode);
        }
    }, [debouncedCode, onCodeChange]);

    // Resizable split state
    const { width: editorWidth, startResizing, isResizing } = useResizable(50);

    // Get active file
    const activeFile = useMemo(
        () => files.find((f) => f.id === activeFileId) || files[0],
        [files, activeFileId]
    );

    // Debounce the entire files array to prevent rapid re-compilation
    const debouncedFiles = useDebounce(files, 500);

    // Generate CDN tags based on settings
    const cdnTags = useMemo(() => {
        return CDN_LIBRARIES
            .filter((lib) => cdnSettings[lib.id])
            .flatMap((lib) => lib.tags)
            .join("\n");
    }, [cdnSettings]);

    // Console interception script with REPL support
    const consoleScript = `
    <script>
      (function() {
        // Intercept console methods
        ['log', 'warn', 'error', 'info'].forEach(method => {
          const original = console[method];
          console[method] = function(...args) {
            window.parent.postMessage({
              type: 'console',
              level: method,
              messages: args,
              timestamp: Date.now()
            }, '*');
            original.apply(console, args);
          };
        });
        
        // Handle runtime errors
        window.addEventListener('error', function(event) {
          console.error(event.message);
        });
        
        // REPL: Listen for execute messages from parent
        window.addEventListener('message', function(event) {
          if (event.data && event.data.type === 'execute') {
            try {
              const result = eval(event.data.code);
              window.parent.postMessage({
                type: 'result',
                result: result,
                error: null,
                id: event.data.id,
                timestamp: Date.now()
              }, '*');
            } catch (err) {
              window.parent.postMessage({
                type: 'result',
                result: null,
                error: err.message || String(err),
                id: event.data.id,
                timestamp: Date.now()
              }, '*');
            }
          }
        });
      })();
    </script>
  `;

    // Compile code from all files
    const compiledDoc = useMemo(() => {
        const htmlFile = debouncedFiles.find((f) => f.name === "index.html");
        const cssFile = debouncedFiles.find((f) => f.name === "styles.css");
        const jsFile = debouncedFiles.find((f) => f.name === "script.js");

        if (!htmlFile) {
            return "<html><body><h1>Error: index.html not found</h1></body></html>";
        }

        const htmlContent = htmlFile.content;
        const cssContent = cssFile ? `<style>${cssFile.content}</style>` : "";
        const jsContent = jsFile ? `<script>${jsFile.content}</script>` : "";

        // Inject CDN tags, CSS, and console script before </head>
        let finalHtml = htmlContent.replace(
            "</head>",
            `${cdnTags}\n${cssContent}${consoleScript}</head>`
        );
        // Inject JS before </body>
        finalHtml = finalHtml.replace("</body>", `${jsContent}</body>`);

        return finalHtml;
    }, [debouncedFiles, cdnTags]);

    // Handle postMessage from iframe (console logs and REPL results)
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === "console") {
                setLogs((prev) => [
                    ...prev,
                    {
                        id: Math.random().toString(36).substr(2, 9),
                        level: event.data.level as LogLevel,
                        messages: event.data.messages,
                        timestamp: event.data.timestamp,
                    },
                ]);
            } else if (event.data && event.data.type === "result") {
                // REPL result from iframe
                if (event.data.error) {
                    setLogs((prev) => [
                        ...prev,
                        {
                            id: Math.random().toString(36).substr(2, 9),
                            level: "error" as LogLevel,
                            messages: [event.data.error],
                            timestamp: event.data.timestamp,
                        },
                    ]);
                } else {
                    // Format the result for display
                    const resultValue = event.data.result;
                    const displayValue = resultValue === undefined
                        ? "undefined"
                        : resultValue === null
                            ? "null"
                            : typeof resultValue === "object"
                                ? JSON.stringify(resultValue, null, 2)
                                : String(resultValue);
                    setLogs((prev) => [
                        ...prev,
                        {
                            id: Math.random().toString(36).substr(2, 9),
                            level: "result" as LogLevel,
                            messages: [displayValue],
                            timestamp: event.data.timestamp,
                        },
                    ]);
                }
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    // Execute code in iframe context (REPL)
    const handleExecuteCode = useCallback((code: string) => {
        // Add command to logs
        setLogs((prev) => [
            ...prev,
            {
                id: Math.random().toString(36).substr(2, 9),
                level: "command" as LogLevel,
                messages: [code],
                timestamp: Date.now(),
            },
        ]);

        // Send to iframe for execution
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage(
                {
                    type: "execute",
                    code: code,
                    id: Math.random().toString(36).substr(2, 9),
                },
                "*"
            );
        }
    }, []);

    const handleCodeChange = useCallback(
        (newContent: string | undefined) => {
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === activeFileId ? { ...f, content: newContent || "" } : f
                )
            );
        },
        [activeFileId, setFiles]
    );

    const handleRefresh = useCallback(() => {
        const iframe = document.querySelector("iframe");
        if (iframe) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (iframe as any).srcdoc = (iframe as any).srcdoc;
        }
    }, []);

    const handleClearLogs = useCallback(() => setLogs([]), []);

    // Format code with Prettier
    const handleFormatCode = useCallback(async () => {
        if (isFormatting) return;
        setIsFormatting(true);

        try {
            const file = files.find((f) => f.id === activeFileId);
            if (!file) return;

            let parser: string;
            let plugins: any[];

            switch (file.language) {
                case "html":
                    parser = "html";
                    plugins = [prettierHtml];
                    break;
                case "css":
                    parser = "css";
                    plugins = [prettierCss];
                    break;
                case "javascript":
                    parser = "babel";
                    plugins = [prettierBabel, prettierEstree];
                    break;
                default:
                    return;
            }

            const formatted = await prettier.format(file.content, {
                parser,
                plugins,
                tabWidth: 2,
                useTabs: false,
                semi: true,
                singleQuote: false,
            });

            setFiles((prev) =>
                prev.map((f) => (f.id === activeFileId ? { ...f, content: formatted } : f))
            );
        } catch (error) {
            console.error("Prettier formatting failed:", error);
        } finally {
            setIsFormatting(false);
        }
    }, [activeFileId, files, isFormatting, setFiles]);

    // Expose methods to parent via ref
    // Download project as ZIP with properly linked files
    const handleDownload = useCallback(() => {
        const zip = new JSZip();

        // Get current file contents
        const htmlFile = files.find((f) => f.name === "index.html");
        const cssFile = files.find((f) => f.name === "styles.css");
        const jsFile = files.find((f) => f.name === "script.js");

        if (!htmlFile) return;

        // Generate CDN tags for enabled libraries
        const cdnTagsForDownload = CDN_LIBRARIES
            .filter((lib) => cdnSettings[lib.id])
            .flatMap((lib) => lib.tags)
            .join("\n    ");

        // Create linked HTML file
        let linkedHtml = htmlFile.content;

        // Inject CDN libraries and CSS link before </head>
        const headInjection = `${cdnTagsForDownload ? cdnTagsForDownload + "\n    " : ""}<link rel="stylesheet" href="styles.css">`;
        linkedHtml = linkedHtml.replace("</head>", `    ${headInjection}\n</head>`);

        // Inject script before </body>
        linkedHtml = linkedHtml.replace("</body>", `    <script src="script.js"></script>\n</body>`);

        // Add files to ZIP
        zip.file("index.html", linkedHtml);
        if (cssFile) zip.file("styles.css", cssFile.content);
        if (jsFile) zip.file("script.js", jsFile.content);

        // Generate and download
        zip.generateAsync({ type: "blob" }).then((content) => {
            saveAs(content, "project.zip");
        });
    }, [files, cdnSettings]);

    // Export as single HTML file with embedded CSS and JS
    const handleExportHTML = useCallback(() => {
        const htmlFile = files.find((f) => f.name === "index.html");
        const cssFile = files.find((f) => f.name === "styles.css");
        const jsFile = files.find((f) => f.name === "script.js");

        if (!htmlFile) return;

        // Generate CDN tags for enabled libraries
        const cdnTagsForExport = CDN_LIBRARIES
            .filter((lib) => cdnSettings[lib.id])
            .flatMap((lib) => lib.tags)
            .join("\n    ");

        // Create standalone HTML with embedded CSS and JS
        let standaloneHtml = htmlFile.content;

        // Build the head injection with CDN tags and embedded CSS
        const cssEmbed = cssFile ? `<style>\n${cssFile.content}\n    </style>` : "";
        const headInjection = `${cdnTagsForExport ? cdnTagsForExport + "\n    " : ""}${cssEmbed}`;

        if (headInjection) {
            standaloneHtml = standaloneHtml.replace("</head>", `    ${headInjection}\n</head>`);
        }

        // Inject embedded JS before </body>
        if (jsFile) {
            const jsEmbed = `<script>\n${jsFile.content}\n    </script>`;
            standaloneHtml = standaloneHtml.replace("</body>", `    ${jsEmbed}\n</body>`);
        }

        // Create blob and download
        const blob = new Blob([standaloneHtml], { type: "text/html;charset=utf-8" });
        saveAs(blob, "index.html");
    }, [files, cdnSettings]);

    // Share code via URL
    const handleShare = useCallback(async () => {
        const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(files));

        setToastMessage("Generating link...");
        setShowToast(true);

        try {
            // Generate short ID
            const { nanoid } = await import("nanoid");
            const shortId = nanoid(10);

            // Save to Firestore
            const { doc, setDoc } = await import("firebase/firestore");
            const { db } = await import("../../lib/firebase");

            await setDoc(doc(db, "snippets", shortId), {
                files: files,
                createdAt: new Date().toISOString()
            });

            // Construct custom URL
            const finalUrl = `${window.location.origin}/${shortId}`;

            await navigator.clipboard.writeText(finalUrl);
            setToastMessage("Link copied to clipboard!");

        } catch (err) {
            console.error("Share failed:", err);
            const errorMessage = err instanceof Error ? err.message : String(err);

            // Fallback to legacy
            const legacyUrl = `${window.location.origin}?code=${compressed}`;

            try {
                await navigator.clipboard.writeText(legacyUrl);
                setToastMessage(`Error: ${errorMessage}. Long link copied.`);
            } catch {
                prompt(`Error: ${errorMessage}. Copy this link:`, legacyUrl);
            }
        }
        setShowToast(true);
    }, [files]);

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
        formatCode: handleFormatCode,
        openSettings: () => setIsSettingsOpen(true),
        downloadProject: handleDownload,
        exportHTML: handleExportHTML,
        shareCode: handleShare,
        getProjectData: () => {
            const htmlFile = files.find((f) => f.name === "index.html");
            const cssFile = files.find((f) => f.name === "styles.css");
            const jsFile = files.find((f) => f.name === "script.js");
            return {
                html: htmlFile?.content || "",
                css: cssFile?.content || "",
                js: jsFile?.content || "",
            };
        },
        loadProject: (html: string, css: string, js: string) => {
            setFiles([
                { id: "index.html", name: "index.html", language: "html", content: html },
                { id: "styles.css", name: "styles.css", language: "css", content: css },
                { id: "script.js", name: "script.js", language: "javascript", content: js },
            ]);
            setActiveFileId("index.html");
        },
    }));

    return (
        <>
            {/* Global overlay during resize to prevent iframe from capturing mouse */}
            {isResizing && (
                <div
                    className="fixed inset-0 z-[9999] cursor-col-resize"
                    style={{ background: 'transparent' }}
                />
            )}
            <main
                className={`flex-1 flex flex-col lg:flex-row min-h-0 bg-slate-900 overflow-hidden relative ${isResizing ? 'select-none' : ''}`}
            >
                {/* Editor Panel */}
                <div
                    className={`flex flex-col min-h-0 transition-all duration-300 ease-out ${isPreviewVisible
                        ? 'border-r border-slate-700'
                        : 'mx-auto border-x border-slate-700 rounded-lg overflow-hidden'
                        }`}
                    style={{
                        width: isPreviewVisible ? `${editorWidth}%` : '100%',
                        maxWidth: isPreviewVisible ? undefined : '1200px'
                    }}
                >
                    {/* TabBar - hidden in Zen Mode */}
                    {!isZenMode && (
                        <TabBar
                            tabs={files}
                            activeTabId={activeFileId}
                            onTabClick={setActiveFileId}
                        />
                    )}
                    <div className="flex-1 relative">
                        {isResizing && <div className="absolute inset-0 z-50 bg-transparent" />}
                        <CodeEditor
                            value={activeFile.content}
                            language={activeFile.language}
                            onChange={handleCodeChange}
                            showMinimap={editorSettings.showMinimap}
                            wordWrap={editorSettings.wordWrap}
                            theme={editorSettings.theme}
                            onSave={handleRefresh}
                        />
                    </div>
                </div>

                {/* Resize Handle */}
                {isPreviewVisible && (
                    <div
                        className="hidden lg:flex items-center justify-center w-2 cursor-col-resize hover:bg-blue-500/20 group relative z-50 -ml-1"
                        onMouseDown={startResizing}
                    >
                        <div className="w-0.5 h-8 bg-slate-600 group-hover:bg-blue-500 rounded-full transition-colors" />
                    </div>
                )}

                {/* Preview & Console Panel */}
                {isPreviewVisible ? (
                    <div className="flex-1 flex flex-col min-w-0 bg-slate-800 transition-all duration-300">
                        <Preview
                            srcDoc={compiledDoc}
                            onRefresh={handleRefresh}
                            onToggleVisibility={() => setIsPreviewVisible(false)}
                            iframeRef={iframeRef}
                        />

                        {/* Console - hidden in Zen Mode */}
                        {!isZenMode && (
                            <ConsoleDrawer
                                logs={logs}
                                onClear={handleClearLogs}
                                isOpen={isConsoleOpen}
                                onToggle={() => setIsConsoleOpen(!isConsoleOpen)}
                                onExecute={handleExecuteCode}
                            />
                        )}
                    </div>
                ) : (
                    /* Show Preview Toggle Button when hidden */
                    <button
                        onClick={() => setIsPreviewVisible(true)}
                        className="hidden lg:flex items-center justify-center w-10 bg-slate-800 hover:bg-slate-700 border-l border-slate-700 transition-colors group"
                        title="Show Preview"
                    >
                        <div className="flex flex-col items-center gap-1 text-slate-500 group-hover:text-slate-300">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span className="text-[10px] uppercase tracking-wider writing-mode-vertical" style={{ writingMode: 'vertical-rl' }}>Preview</span>
                        </div>
                    </button>
                )}
            </main>

            {/* Settings Modal */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                cdnSettings={cdnSettings}
                editorSettings={editorSettings}
                onSave={(cdn, editor) => {
                    setCdnSettings(cdn);
                    setEditorSettings(editor);
                }}
            />

            {/* Toast Notification */}
            <Toast
                message={toastMessage}
                isVisible={showToast}
                onClose={() => setShowToast(false)}
            />
        </>
    );
});

MainContent.displayName = "MainContent";

export default MainContent;
