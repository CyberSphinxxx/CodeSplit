// ConsoleDrawer component - displays captured console logs from preview iframe

export type LogLevel = "log" | "warn" | "error" | "info";

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
}

function ConsoleDrawer({ logs, onClear, isOpen, onToggle }: ConsoleDrawerProps) {
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
        <div className="flex flex-col h-48 bg-slate-900 border-t border-slate-700 transition-all duration-300">
            {/* Console Header */}
            <div className="flex items-center justify-between px-4 py-1 bg-slate-800 border-b border-slate-700">
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
            <div className="flex-1 overflow-auto p-2 font-mono text-xs">
                {logs.length === 0 ? (
                    <div className="text-slate-600 italic px-2">No logs yet...</div>
                ) : (
                    logs.map((log) => (
                        <div
                            key={log.id}
                            className={`
                flex items-start gap-2 border-b border-slate-800/50 py-1 px-2
                ${log.level === "error"
                                    ? "bg-red-900/10 text-red-300"
                                    : log.level === "warn"
                                        ? "bg-amber-900/10 text-amber-300"
                                        : "text-slate-300"
                                }
              `}
                        >
                            <span className="opacity-50 min-w-[50px]">
                                {new Date(log.timestamp).toLocaleTimeString([], {
                                    hour12: false,
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                })}
                            </span>
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
        </div>
    );
}

export default ConsoleDrawer;
