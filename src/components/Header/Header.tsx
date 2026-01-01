import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    Download,
    Share2,
    CloudCheck,
    Loader2,
    LogOut,
    ChevronDown,
    ChevronRight,
    Archive,
    FileCode,
} from "lucide-react";

interface HeaderProps {
    title?: string;
    projectTitle?: string;
    onProjectTitleChange?: (title: string) => void;
    onDownload?: () => void;
    onExportHTML?: () => void;
    onShare?: () => void;
    isSaving?: boolean;
    isSaved?: boolean;
    isDashboardView?: boolean;
}

function Header({
    title = "CodeSplit",
    projectTitle = "Untitled Project",
    onProjectTitleChange,
    onDownload,
    onExportHTML,
    onShare,
    isSaving,
    isSaved = true,
    isDashboardView = false,
}: HeaderProps) {
    const navigate = useNavigate();
    const { user, logInWithGithub, logOut, loading: authLoading } = useAuth();
    const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [editableTitle, setEditableTitle] = useState(projectTitle);
    const [downloadMenuPosition, setDownloadMenuPosition] = useState({ top: 0, right: 0 });
    const [profileMenuPosition, setProfileMenuPosition] = useState({ top: 0, right: 0 });
    const downloadMenuRef = useRef<HTMLDivElement>(null);
    const downloadButtonRef = useRef<HTMLButtonElement>(null);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const profileButtonRef = useRef<HTMLButtonElement>(null);

    // Sync editableTitle with projectTitle prop
    useEffect(() => {
        setEditableTitle(projectTitle);
    }, [projectTitle]);

    // Toggle download dropdown and calculate position
    const toggleDownloadDropdown = () => {
        if (!isDownloadMenuOpen && downloadButtonRef.current) {
            const rect = downloadButtonRef.current.getBoundingClientRect();
            setDownloadMenuPosition({
                top: rect.bottom + 4,
                right: window.innerWidth - rect.right,
            });
        }
        setIsDownloadMenuOpen(!isDownloadMenuOpen);
    };

    // Toggle profile dropdown and calculate position
    const toggleProfileDropdown = () => {
        if (!isProfileMenuOpen && profileButtonRef.current) {
            const rect = profileButtonRef.current.getBoundingClientRect();
            setProfileMenuPosition({
                top: rect.bottom + 4,
                right: window.innerWidth - rect.right,
            });
        }
        setIsProfileMenuOpen(!isProfileMenuOpen);
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                downloadMenuRef.current &&
                !downloadMenuRef.current.contains(event.target as Node) &&
                downloadButtonRef.current &&
                !downloadButtonRef.current.contains(event.target as Node)
            ) {
                setIsDownloadMenuOpen(false);
            }
            if (
                profileMenuRef.current &&
                !profileMenuRef.current.contains(event.target as Node) &&
                profileButtonRef.current &&
                !profileButtonRef.current.contains(event.target as Node)
            ) {
                setIsProfileMenuOpen(false);
            }
        };

        if (isDownloadMenuOpen || isProfileMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDownloadMenuOpen, isProfileMenuOpen]);

    // Handle project title change
    const handleTitleBlur = () => {
        if (onProjectTitleChange && editableTitle !== projectTitle) {
            onProjectTitleChange(editableTitle);
        }
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.currentTarget.blur();
        }
    };

    return (
        <header className="sticky top-0 z-[9999] w-full h-12 bg-slate-800 border-b border-slate-700 shadow-lg flex-shrink-0 select-none">
            <div className="h-full max-w-full mx-auto px-4">
                <div className="flex items-center justify-between h-full">
                    {/* Left Section: Breadcrumb Style */}
                    <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
                        {/* Logo - Clickable to Dashboard */}
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                            title="Go to Dashboard"
                        >
                            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-xs">&lt;/&gt;</span>
                            </div>
                            <span className="text-slate-100 text-sm font-medium">{title}</span>
                        </button>

                        {/* Breadcrumb Separator + Project Title (only in editor view) */}
                        {!isDashboardView && (
                            <>
                                <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                <input
                                    type="text"
                                    value={editableTitle}
                                    onChange={(e) => setEditableTitle(e.target.value)}
                                    onBlur={handleTitleBlur}
                                    onKeyDown={handleTitleKeyDown}
                                    className="bg-transparent text-slate-300 text-sm border-none outline-none px-1.5 py-0.5 rounded hover:bg-slate-700/50 focus:bg-slate-700 focus:text-slate-100 focus:ring-1 focus:ring-blue-500 transition-all min-w-0 max-w-[180px] truncate"
                                    placeholder="Project Title"
                                    title="Click to rename project"
                                />
                            </>
                        )}
                    </div>

                    {/* Right Section: High-level actions only */}
                    <nav className="flex items-center gap-1 flex-shrink-0">
                        {/* Editor-only actions */}
                        {!isDashboardView && (
                            <>
                                {/* Cloud Status Indicator */}
                                {user && (
                                    <div
                                        className="flex items-center gap-1.5 px-2 py-1 text-xs"
                                        title={isSaving ? "Saving to cloud..." : "Saved to cloud"}
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                                                <span className="text-slate-400 hidden sm:inline">Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CloudCheck className={`w-3.5 h-3.5 ${isSaved ? "text-emerald-400" : "text-slate-500"}`} />
                                                <span className="text-slate-400 hidden sm:inline">Saved</span>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Export Dropdown */}
                                <div className="relative">
                                    <button
                                        ref={downloadButtonRef}
                                        onClick={toggleDownloadDropdown}
                                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors flex items-center gap-0.5"
                                        title="Export"
                                    >
                                        <Download className="w-4 h-4" />
                                        <ChevronDown className="w-3 h-3" />
                                    </button>
                                </div>

                                {/* Share Button */}
                                <button
                                    onClick={onShare}
                                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                                    title="Share"
                                >
                                    <Share2 className="w-4 h-4" />
                                </button>

                                {/* Divider */}
                                <div className="w-px h-5 bg-slate-600 mx-1" />
                            </>
                        )}

                        {/* Auth Section - Always visible */}
                        {authLoading ? (
                            <div className="w-7 h-7 rounded-full bg-slate-700 animate-pulse" />
                        ) : user ? (
                            <div className="relative">
                                <button
                                    ref={profileButtonRef}
                                    onClick={toggleProfileDropdown}
                                    className="flex items-center gap-1 rounded-full hover:ring-2 hover:ring-slate-600 transition-all"
                                    title={user.displayName || user.email || "User menu"}
                                >
                                    <img
                                        src={user.photoURL || "https://via.placeholder.com/28"}
                                        alt={user.displayName || "User"}
                                        className="w-7 h-7 rounded-full border border-slate-600"
                                    />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={logInWithGithub}
                                className="px-2.5 py-1 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors flex items-center gap-1.5"
                                title="Login with GitHub"
                            >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                </svg>
                                <span className="hidden sm:inline">Login</span>
                            </button>
                        )}
                    </nav>
                </div>
            </div>

            {/* Download Dropdown Menu - Portal */}
            {isDownloadMenuOpen && createPortal(
                <div
                    ref={downloadMenuRef}
                    className="fixed w-52 bg-slate-700 rounded-lg shadow-xl border border-slate-600 py-1 z-[99999] animate-in fade-in slide-in-from-top-2 duration-150"
                    style={{
                        top: downloadMenuPosition.top,
                        right: downloadMenuPosition.right,
                    }}
                >
                    <button
                        onClick={() => {
                            onDownload?.();
                            setIsDownloadMenuOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-sm text-left text-slate-200 hover:bg-slate-600 flex items-center gap-3 transition-colors"
                    >
                        <Archive className="w-4 h-4 text-slate-400" />
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
                        <FileCode className="w-4 h-4 text-slate-400" />
                        <div>
                            <div className="font-medium">Export as Single HTML</div>
                            <div className="text-xs text-slate-400">CSS & JS embedded inline</div>
                        </div>
                    </button>
                </div>,
                document.body
            )}

            {/* Profile Dropdown Menu - Portal */}
            {isProfileMenuOpen && user && createPortal(
                <div
                    ref={profileMenuRef}
                    className="fixed w-56 bg-slate-700 rounded-lg shadow-xl border border-slate-600 py-1 z-[99999] animate-in fade-in slide-in-from-top-2 duration-150"
                    style={{
                        top: profileMenuPosition.top,
                        right: profileMenuPosition.right,
                    }}
                >
                    <div className="px-4 py-3 border-b border-slate-600">
                        <div className="flex items-center gap-3">
                            <img
                                src={user.photoURL || "https://via.placeholder.com/40"}
                                alt={user.displayName || "User"}
                                className="w-10 h-10 rounded-full"
                            />
                            <div className="min-w-0">
                                <div className="text-sm font-medium text-slate-100 truncate">
                                    {user.displayName || "User"}
                                </div>
                                <div className="text-xs text-slate-400 truncate">
                                    {user.email}
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            logOut();
                            setIsProfileMenuOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-sm text-left text-slate-200 hover:bg-slate-600 hover:text-red-400 flex items-center gap-3 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>,
                document.body
            )}
        </header>
    );
}

export default Header;
