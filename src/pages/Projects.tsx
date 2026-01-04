import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserProjects, deleteProject, renameProject, duplicateProject, toggleProjectFeatured } from "../services/projectService";
import type { Project } from "../services/projectService";

type SortOption = "date-desc" | "date-asc" | "name";

// Predefined gradient color pairs for project cards
const GRADIENT_COLORS = [
    ["#6366f1", "#8b5cf6"],
    ["#3b82f6", "#06b6d4"],
    ["#10b981", "#14b8a6"],
    ["#f59e0b", "#ef4444"],
    ["#ec4899", "#8b5cf6"],
    ["#06b6d4", "#3b82f6"],
    ["#8b5cf6", "#ec4899"],
    ["#14b8a6", "#10b981"],
    ["#f97316", "#eab308"],
    ["#ef4444", "#f97316"],
    ["#a855f7", "#6366f1"],
    ["#22c55e", "#84cc16"],
];

function getGradient(title: string): string {
    const str = title || "Untitled Project";
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % GRADIENT_COLORS.length;
    const [color1, color2] = GRADIENT_COLORS[index];
    return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
}

// Rename Modal Component
function RenameModal({
    isOpen,
    currentTitle,
    onClose,
    onSave,
    isSaving
}: {
    isOpen: boolean;
    currentTitle: string;
    onClose: () => void;
    onSave: (newTitle: string) => void;
    isSaving: boolean;
}) {
    const [title, setTitle] = useState(currentTitle);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTitle(currentTitle);
            setTimeout(() => inputRef.current?.select(), 50);
        }
    }, [isOpen, currentTitle]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            onSave(title.trim());
        }
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-5 border-b border-slate-700">
                        <h2 className="text-lg font-semibold text-white">Rename Project</h2>
                    </div>
                    <div className="px-6 py-5">
                        <label className="block text-sm font-medium text-slate-400 mb-2">
                            Project Name
                        </label>
                        <input
                            ref={inputRef}
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                            placeholder="Enter project name"
                            autoFocus
                        />
                    </div>
                    <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-700 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="px-4 py-2 text-slate-300 font-medium rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || !title.trim()}
                            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                "Save"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Project Card Dropdown Menu
function ProjectMenu({
    isOpen,
    onClose,
    onRename,
    onDuplicate,
    onDelete,
    onToggleFeatured,
    isDeleting,
    isFeatured,
    isFeaturingLoading
}: {
    isOpen: boolean;
    onClose: () => void;
    onRename: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    onToggleFeatured: () => void;
    isDeleting: boolean;
    isFeatured: boolean;
    isFeaturingLoading: boolean;
}) {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={menuRef}
            className="absolute right-0 top-full mt-1 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 py-1 animate-in fade-in slide-in-from-top-2 duration-150"
        >
            <button
                onClick={(e) => { e.stopPropagation(); onRename(); }}
                className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Rename
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Duplicate
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); onToggleFeatured(); }}
                disabled={isFeaturingLoading}
                className={`w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2 disabled:opacity-50 ${isFeatured
                    ? "text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
            >
                {isFeaturingLoading ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill={isFeatured ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                )}
                {isFeatured ? "Remove from Profile" : "Feature on Profile"}
            </button>
            <div className="border-t border-slate-700 my-1" />
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                disabled={isDeleting}
                className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
                {isDeleting ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                )}
                Delete
            </button>
        </div>
    );
}

function Projects() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
    const [featuringId, setFeaturingId] = useState<string | null>(null);

    // Search and Sort State
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("date-desc");

    // Dropdown Menu State
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // Rename Modal State
    const [renameModalOpen, setRenameModalOpen] = useState(false);
    const [renamingProject, setRenamingProject] = useState<Project | null>(null);
    const [isRenaming, setIsRenaming] = useState(false);

    useEffect(() => {
        const fetchProjects = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const userProjects = await getUserProjects(user.uid);
                setProjects(userProjects);
            } catch (err) {
                console.error("Error fetching projects:", err);
                setError("Failed to load projects. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [user]);

    // Filter and Sort Projects
    const filteredProjects = useMemo(() => {
        let result = [...projects];

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter((project) =>
                (project.title || "Untitled Project").toLowerCase().includes(query)
            );
        }

        switch (sortBy) {
            case "date-desc":
                result.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
                break;
            case "date-asc":
                result.sort((a, b) => (a.updatedAt || 0) - (b.updatedAt || 0));
                break;
            case "name":
                result.sort((a, b) =>
                    (a.title || "Untitled Project").localeCompare(b.title || "Untitled Project")
                );
                break;
        }

        return result;
    }, [projects, searchQuery, sortBy]);

    const handleOpenProject = (project: Project) => {
        navigate(`/editor/${project.id}`, { state: { project } });
    };

    const handleCreateNew = () => {
        navigate("/editor");
    };

    const handleDelete = async (projectId: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;

        setDeletingId(projectId);
        setOpenMenuId(null);
        try {
            await deleteProject(projectId);
            setProjects((prev) => prev.filter((p) => p.id !== projectId));
        } catch (err) {
            console.error("Error deleting project:", err);
            alert("Failed to delete project.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleRenameClick = (project: Project) => {
        setRenamingProject(project);
        setRenameModalOpen(true);
        setOpenMenuId(null);
    };

    const handleRenameSave = async (newTitle: string) => {
        if (!renamingProject) return;

        setIsRenaming(true);
        try {
            await renameProject(renamingProject.id, newTitle);
            setProjects((prev) =>
                prev.map((p) =>
                    p.id === renamingProject.id ? { ...p, title: newTitle, updatedAt: Date.now() } : p
                )
            );
            setRenameModalOpen(false);
            setRenamingProject(null);
        } catch (err) {
            console.error("Error renaming project:", err);
            alert("Failed to rename project.");
        } finally {
            setIsRenaming(false);
        }
    };

    const handleDuplicate = async (project: Project) => {
        if (!user) return;

        setDuplicatingId(project.id);
        setOpenMenuId(null);
        try {
            const newId = await duplicateProject(user.uid, project);
            const newProject: Project = {
                id: newId,
                title: `Copy of ${project.title || "Untitled Project"}`,
                html: project.html,
                css: project.css,
                js: project.js,
                ownerId: user.uid,
                updatedAt: Date.now()
            };
            setProjects((prev) => [newProject, ...prev]);
        } catch (err) {
            console.error("Error duplicating project:", err);
            alert("Failed to duplicate project.");
        } finally {
            setDuplicatingId(null);
        }
    };

    const handleToggleFeatured = async (project: Project) => {
        setFeaturingId(project.id);
        setOpenMenuId(null);
        try {
            await toggleProjectFeatured(project.id, !project.isFeatured);
            setProjects((prev) =>
                prev.map((p) =>
                    p.id === project.id ? { ...p, isFeatured: !p.isFeatured } : p
                )
            );
        } catch (err) {
            console.error("Error toggling featured:", err);
            alert("Failed to update featured status.");
        } finally {
            setFeaturingId(null);
        }
    };

    const formatDate = (timestamp: number | { toDate: () => Date } | null) => {
        if (!timestamp) return "Never";

        let date: Date;
        if (typeof timestamp === "number") {
            date = new Date(timestamp);
        } else if (typeof timestamp === "object" && "toDate" in timestamp) {
            date = timestamp.toDate();
        } else {
            return "Unknown";
        }

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex items-center gap-3 text-slate-300">
                    <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Loading your projects...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Your Projects</h1>
                    <p className="text-slate-400 mt-1">
                        {projects.length} project{projects.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <button
                    onClick={handleCreateNew}
                    className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Create New Project
                </button>
            </div>

            {/* Toolbar: Search & Sort */}
            {projects.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="appearance-none w-full sm:w-48 px-4 py-2.5 pr-10 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all cursor-pointer"
                        >
                            <option value="date-desc">Newest First</option>
                            <option value="date-asc">Oldest First</option>
                            <option value="name">Name (A-Z)</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-red-400">
                    {error}
                </div>
            )}

            {/* Empty State */}
            {projects.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="relative mb-8">
                        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center">
                            <svg className="w-16 h-16 text-blue-400" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="8" y="8" width="48" height="36" rx="4" stroke="currentColor" strokeWidth="2.5" />
                                <path d="M24 52H40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                <path d="M32 44V52" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                <path d="M22 20L16 26L22 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M42 20L48 26L42 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M36 18L28 34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">No projects yet</h2>
                    <p className="text-slate-400 mb-8 max-w-md text-center">
                        Create your first project and bring your ideas to life.
                    </p>
                    <button
                        onClick={handleCreateNew}
                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-lg rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 transform flex items-center gap-3"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Project
                    </button>
                </div>
            )}

            {/* No Search Results */}
            {projects.length > 0 && filteredProjects.length === 0 && (
                <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">No matching projects</h2>
                    <p className="text-slate-400 mb-6">Try a different search term</p>
                    <button
                        onClick={() => setSearchQuery("")}
                        className="px-5 py-2.5 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-colors"
                    >
                        Clear Search
                    </button>
                </div>
            )}

            {/* Project Grid */}
            {filteredProjects.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProjects.map((project) => (
                        <div
                            key={project.id}
                            className="bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-slate-600 hover:bg-slate-800/80 transition-all cursor-pointer group relative"
                            onClick={() => handleOpenProject(project)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg"
                                    style={{ background: getGradient(project.title) }}
                                >
                                    <svg className="w-5 h-5 text-white drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                </div>

                                <div className="relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenMenuId(openMenuId === project.id ? null : project.id);
                                        }}
                                        className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                        title="More options"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                        </svg>
                                    </button>

                                    <ProjectMenu
                                        isOpen={openMenuId === project.id}
                                        onClose={() => setOpenMenuId(null)}
                                        onRename={() => handleRenameClick(project)}
                                        onDuplicate={() => handleDuplicate(project)}
                                        onDelete={() => handleDelete(project.id)}
                                        onToggleFeatured={() => handleToggleFeatured(project)}
                                        isDeleting={deletingId === project.id}
                                        isFeatured={project.isFeatured ?? false}
                                        isFeaturingLoading={featuringId === project.id}
                                    />
                                </div>
                            </div>

                            <h3 className="font-semibold text-white mb-1 truncate group-hover:text-blue-400 transition-colors">
                                {project.title || "Untitled Project"}
                            </h3>

                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-500">
                                    Updated {formatDate(project.updatedAt)}
                                </p>
                                {duplicatingId === project.id && (
                                    <div className="flex items-center gap-1.5 text-xs text-blue-400">
                                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Duplicating...
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Rename Modal */}
            <RenameModal
                isOpen={renameModalOpen}
                currentTitle={renamingProject?.title || "Untitled Project"}
                onClose={() => {
                    setRenameModalOpen(false);
                    setRenamingProject(null);
                }}
                onSave={handleRenameSave}
                isSaving={isRenaming}
            />
        </div>
    );
}

export default Projects;
