import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";

interface HeaderProps {
    title?: string;
    onFormat?: () => void;
    onSettingsOpen?: () => void;
    onDownload?: () => void;
    onExportHTML?: () => void;
    onShare?: () => void;
    onZenMode?: () => void;
    isZenMode?: boolean;
    onSave?: () => void;
    isSaving?: boolean;
    onDashboard?: () => void;
}

function Header({
    title = "CodeSplit",
    onFormat,
    onSettingsOpen,
    onDownload,
    onExportHTML,
    onShare,
    onZenMode,
    onSave,
    isSaving,
    onDashboard,
}: HeaderProps) {
    const { user, logInWithGithub, logOut, loading: authLoading } = useAuth();
    const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
    const downloadMenuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Toggle dropdown and calculate position synchronously
    const toggleDropdown = () => {
        if (!isDownloadMenuOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setMenuPosition({
                top: rect.bottom + 4,
                right: window.innerWidth - rect.right,
            });
        }
        setIsDownloadMenuOpen(!isDownloadMenuOpen);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                downloadMenuRef.current &&
                !downloadMenuRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsDownloadMenuOpen(false);
            }
        };

        if (isDownloadMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDownloadMenuOpen]);

    return (
        <header className="sticky top-0 z-[9999] w-full bg-slate-800 border-b border-slate-700 shadow-lg flex-shrink-0 select-none">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    {/* Logo / Title */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">&lt;/&gt;</span>
                        </div>
                        <h1 className="text-lg font-semibold text-slate-100 tracking-tight hidden sm:block">
                            {title}
                        </h1>
                    </div>

                    {/* Toolbar Buttons */}
                    <nav className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        {/* Zen Mode Toggle */}
                        <button
                            onClick={onZenMode}
                            className="px-2 sm:px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1.5"
                            title="Enter Zen Mode"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span className="hidden sm:inline">Zen</span>
                        </button>
                        <button
                            onClick={onFormat}
                            className="px-2 sm:px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1.5"
                            title="Format code with Prettier"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8.571 23.429A.571.571 0 0 1 8 24H2.286a.571.571 0 0 1 0-1.143H8c.316 0 .571.256.571.572zM8 20.571H6.857a.571.571 0 0 0 0 1.143H8a.571.571 0 0 0 0-1.143zm-5.714 1.143H4.57a.571.571 0 0 0 0-1.143H2.286a.571.571 0 0 0 0 1.143zM8 18.286H2.286a.571.571 0 0 0 0 1.143H8a.571.571 0 0 0 0-1.143zM16 16H5.714a.571.571 0 0 0 0 1.143H16a.571.571 0 0 0 0-1.143zm-.571-3.429H2.286a.571.571 0 0 0 0 1.143h13.143a.571.571 0 0 0 0-1.143zm.571-4.571v1.143a.571.571 0 0 1-.571.571H2.286a.571.571 0 0 1 0-1.143h12.571V8a.571.571 0 0 1 1.143 0zM2.286 6.857h10.857a.571.571 0 0 0 0-1.143H2.286a.571.571 0 0 0 0 1.143zM21.714 0a.571.571 0 0 1 .572.571v2.286a.571.571 0 0 1-1.143 0V.571A.571.571 0 0 1 21.714 0zM8 5.714H2.286a.571.571 0 0 1 0-1.143H8a.571.571 0 0 1 0 1.143zm10.286-2.857a.571.571 0 0 0 0 1.143h1.143a.571.571 0 0 0 0-1.143h-1.143zM16 4H13.714a.571.571 0 0 0 0 1.143H16a.571.571 0 0 0 0-1.143zm-5.714 0h-.572a.571.571 0 0 0 0 1.143h.572a.571.571 0 0 0 0-1.143zM8 0h.571a.571.571 0 0 1 0 1.143H8A.571.571 0 0 1 8 0zm0 2.857h.571a.571.571 0 0 1 0 1.143H8a.571.571 0 0 1 0-1.143zM4.571 0H5.143a.571.571 0 0 1 0 1.143H4.571a.571.571 0 0 1 0-1.143zm0 2.857h.572a.571.571 0 0 1 0 1.143h-.572a.571.571 0 0 1 0-1.143zM1.143 0h.571a.571.571 0 0 1 0 1.143h-.571a.571.571 0 0 1 0-1.143zm0 2.857h.571a.571.571 0 0 1 0 1.143h-.571a.571.571 0 0 1 0-1.143z" />
                            </svg>
                            <span className="hidden sm:inline">Prettier</span>
                        </button>

                        {/* Download Dropdown */}
                        <div className="relative">
                            <button
                                ref={buttonRef}
                                onClick={toggleDropdown}
                                className="px-2 sm:px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1.5"
                                title="Export options"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span className="hidden sm:inline">Export</span>
                                <svg className="w-3 h-3 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>

                        <button
                            onClick={onShare}
                            className="px-2 sm:px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1.5"
                            title="Share code via URL"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            <span className="hidden sm:inline">Share</span>
                        </button>
                        <button
                            onClick={onSettingsOpen}
                            className="px-2 sm:px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1.5"
                            title="Open Settings"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="hidden sm:inline">Settings</span>
                        </button>

                        {/* Divider */}
                        <div className="hidden sm:block w-px h-6 bg-slate-600 mx-1" />

                        {/* Save Button - Only show when logged in */}
                        {user && (
                            <button
                                onClick={onSave}
                                disabled={isSaving}
                                className="px-2 sm:px-3 py-1.5 text-sm font-medium text-emerald-400 hover:text-emerald-300 hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Save project to cloud"
                            >
                                {isSaving ? (
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                    </svg>
                                )}
                                <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save"}</span>
                            </button>
                        )}

                        {/* Dashboard Button - Only show when logged in */}
                        {user && onDashboard && (
                            <button
                                onClick={onDashboard}
                                className="px-2 sm:px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1.5"
                                title="View all projects"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                <span className="hidden sm:inline">Projects</span>
                            </button>
                        )}

                        {/* Auth Section */}
                        {authLoading ? (
                            <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />
                        ) : user ? (
                            <div className="flex items-center gap-2">
                                {/* User Avatar */}
                                <img
                                    src={user.photoURL || "https://via.placeholder.com/32"}
                                    alt={user.displayName || "User"}
                                    className="w-8 h-8 rounded-full border-2 border-slate-600 hover:border-slate-500 transition-colors"
                                    title={user.displayName || user.email || "User"}
                                />
                                {/* Logout Button */}
                                <button
                                    onClick={logOut}
                                    className="px-2 sm:px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-red-400 hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1.5"
                                    title="Logout"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={logInWithGithub}
                                className="px-3 py-1.5 text-sm font-medium bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors flex items-center gap-2"
                                title="Login with GitHub"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                </svg>
                                <span className="hidden sm:inline">Login with GitHub</span>
                            </button>
                        )}
                    </nav>
                </div>
            </div>

            {/* Dropdown Menu - Rendered via Portal */}
            {isDownloadMenuOpen && createPortal(
                <div
                    ref={downloadMenuRef}
                    className="fixed w-52 bg-slate-700 rounded-lg shadow-xl border border-slate-600 py-1 z-[99999] animate-in fade-in slide-in-from-top-2 duration-150"
                    style={{
                        top: menuPosition.top,
                        right: menuPosition.right,
                    }}
                >
                    <button
                        onClick={() => {
                            onDownload?.();
                            setIsDownloadMenuOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-sm text-left text-slate-200 hover:bg-slate-600 flex items-center gap-3 transition-colors"
                    >
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        <div>
                            <div className="font-medium">Download as ZIP</div>
                            <div className="text-xs text-slate-400">Separate HTML, CSS, JS files</div>
                        </div>
                    </button>
                    <button
                        onClick={() => {
                            onExportHTML?.();
                            setIsDownloadMenuOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-sm text-left text-slate-200 hover:bg-slate-600 flex items-center gap-3 transition-colors"
                    >
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                            <div className="font-medium">Export as Single HTML</div>
                            <div className="text-xs text-slate-400">CSS & JS embedded inline</div>
                        </div>
                    </button>
                </div>,
                document.body
            )}
        </header>
    );
}

export default Header;
