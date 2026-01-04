import { Eye, Sparkles, Settings } from "lucide-react";

interface FooterProps {
    onZenMode?: () => void;
    onFormat?: () => void;
    onSettings?: () => void;
    isZenMode?: boolean;
}

function Footer({ onZenMode, onFormat, onSettings, isZenMode = false }: FooterProps) {
    return (
        <footer className="flex-shrink-0 bg-slate-800 border-t border-slate-700 px-3 py-1.5 select-none">
            <div className="flex items-center justify-between text-xs text-slate-500">
                {/* Left Side: Branding */}
                <div className="flex items-center gap-2">
                    <span className="text-slate-400">CodeSplit</span>
                    <span className="text-slate-600">•</span>
                    <span>React + Monaco</span>
                </div>

                {/* Center: Tool Buttons */}
                <div className="flex items-center gap-0.5">
                    <button
                        onClick={onZenMode}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${isZenMode
                            ? "text-blue-400 bg-slate-700/50"
                            : "text-slate-500 hover:text-slate-300 hover:bg-slate-700/50"
                            }`}
                        title={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
                    >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Zen</span>
                    </button>
                    <button
                        onClick={onFormat}
                        className="flex items-center gap-1 px-2 py-0.5 rounded text-slate-500 hover:text-amber-400 hover:bg-slate-700/50 transition-colors"
                        title="Format Code (Prettier)"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Prettier</span>
                    </button>
                    <button
                        onClick={onSettings}
                        className="flex items-center gap-1 px-2 py-0.5 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 transition-colors"
                        title="Editor Settings"
                    >
                        <Settings className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Settings</span>
                    </button>
                </div>

                {/* Right Side: Links */}
                <div className="flex items-center gap-3">
                    <a
                        href="https://github.com/CyberSphinxxx/Interactive_Code_Editor"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-slate-300 transition-colors"
                    >
                        GitHub
                    </a>
                    <span className="text-slate-600">|</span>
                    <span>© 2024</span>
                </div>
            </div>
        </footer>
    );
}

export default Footer;

