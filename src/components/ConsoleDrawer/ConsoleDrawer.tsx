// ConsoleDrawer component - displays captured console logs from preview iframe with REPL

import { useState, useRef, useEffect } from "react";
import { useVerticalResizable } from "../../hooks/useVerticalResizable";

export type LogLevel = "log" | "warn" | "error" | "info" | "result" | "command";

export interface LogEntry {
    id: string;
    level: LogLevel;
    messages: any[];
    timestamp: number;
}

interface ConsoleDrawerProps {
    logs: LogEntry[];
    onClear: () => void;
    isOpen: boolean;
    onToggle: () => void;
    onExecute?: (code: string) => void;
}

function ConsoleDrawer({ logs, onClear, isOpen, onToggle, onExecute }: ConsoleDrawerProps) {
    const [inputValue, setInputValue] = useState("");
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const outputRef = useRef<HTMLDivElement>(null);

    // Vertical resizing
    const { height, startResizing, isResizing } = useVerticalResizable(192, 48, 600);

    // Auto-scroll to bottom when new logs appear
    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [logs]);

    // Focus input when console opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleExecute = () => {
        const code = inputValue.trim();
        if (!code) return;

        // Add to history
        setCommandHistory((prev) => [...prev.filter((c) => c !== code), code]);
        setHistoryIndex(-1);
        setInputValue("");

        // Execute in iframe
        if (onExecute) {
            onExecute(code);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleExecute();
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (commandHistory.length > 0) {
                const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
                setHistoryIndex(newIndex);
                setInputValue(commandHistory[commandHistory.length - 1 - newIndex] || "");
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInputValue(commandHistory[commandHistory.length - 1 - newIndex] || "");
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInputValue("");
            }
        } else if (e.key === "Escape") {
            setInputValue("");
            setHistoryIndex(-1);
        }
    };

    const getLevelStyles = (level: LogLevel) => {
        switch (level) {
            case "error":
                return "bg-red-900/10 text-red-300";
            case "warn":
                return "bg-amber-900/10 text-amber-300";
            case "result":
                return "bg-blue-900/10 text-blue-300";
            case "command":
                return "bg-slate-800/50 text-slate-400";
            case "info":
                return "text-cyan-300";
            default:
                return "text-slate-300";
        }
    };

    const getLevelPrefix = (level: LogLevel) => {
        switch (level) {
            case "command":
                return "›";
            case "result":
                return "←";
            case "error":
                return "✕";
            case "warn":
                return "⚠";
            default:
                return "";
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={onToggle}
                className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 border-t border-slate-700 text-slate-400 text-xs hover:text-slate-200 hover:bg-slate-800 transition-colors w-full text-left"
            >
                <span className="font-bold">› Console</span>
                <span className="bg-slate-700 px-1.5 rounded-full text-[10px]">
                    {logs.length}
                </span>
            </button>
        );
    }

    return (
        <>
            {/* Global overlay during resize */}
            {isResizing && (
                <div
                    className="fixed inset-0 z-[9999] cursor-row-resize"
                    style={{ background: 'transparent' }}
                />
            )}
            <div
                className="flex flex-col bg-slate-900 border-t border-slate-700 transition-all duration-75 relative"
                style={{ height: height }}
            >
                {/* Resize Handle */}
                <div
                    className="absolute top-0 left-0 right-0 h-1 cursor-row-resize z-10 hover:bg-blue-500/50 transition-colors"
                    onMouseDown={startResizing}
                />

                {/* Console Header */}
                <div className="flex items-center justify-between px-4 py-1 bg-slate-800 border-b border-slate-700 select-none">
                    <button
                        onClick={onToggle}
                        className="text-xs font-bold text-slate-300 hover:text-white"
                    >
                        ⌄ Console
                    </button>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClear}
                            className="text-[10px] uppercase font-bold text-slate-500 hover:text-slate-300 px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {/* Console Output */}
                <div ref={outputRef} className="flex-1 overflow-auto p-2 font-mono text-xs">
                    {logs.length === 0 ? (
                        <div className="text-slate-600 italic px-2">No logs yet. Type JavaScript below to execute in the preview context...</div>
                    ) : (
                        logs.map((log) => (
                            <div
                                key={log.id}
                                className={`flex items-start gap-2 border-b border-slate-800/50 py-1 px-2 ${getLevelStyles(log.level)}`}
                            >
                                {log.level !== "command" && log.level !== "result" && (
                                    <span className="opacity-50 min-w-[50px]">
                                        {new Date(log.timestamp).toLocaleTimeString([], {
                                            hour12: false,
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                        })}
                                    </span>
                                )}
                                {(log.level === "command" || log.level === "result" || log.level === "error" || log.level === "warn") && (
                                    <span className={`font-bold ${log.level === "result" ? "text-blue-400" : log.level === "command" ? "text-slate-500" : ""}`}>
                                        {getLevelPrefix(log.level)}
                                    </span>
                                )}
                                <div className="flex-1 whitespace-pre-wrap break-words">
                                    {log.messages.map((msg, i) => (
                                        <span key={i} className="mr-2">
                                            {typeof msg === "object"
                                                ? JSON.stringify(msg, null, 2)
                                                : String(msg)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* REPL Input */}
                <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-800/50 border-t border-slate-700">
                    <span className="text-blue-400 font-mono text-xs font-bold">›</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type JavaScript and press Enter..."
                        className="flex-1 bg-transparent text-slate-200 font-mono text-xs outline-none placeholder:text-slate-600"
                        spellCheck={false}
                        autoComplete="off"
                    />
                    <button
                        onClick={handleExecute}
                        disabled={!inputValue.trim()}
                        className="text-[10px] uppercase font-bold text-slate-500 hover:text-slate-300 px-2 py-0.5 rounded hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Run
                    </button>
                </div>
            </div>
        </>
    );
}

export default ConsoleDrawer;
