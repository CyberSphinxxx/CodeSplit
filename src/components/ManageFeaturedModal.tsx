import { useState, useEffect } from "react";
import { X, Loader2, Check, AlertCircle } from "lucide-react";
import { getUserProjects, toggleProjectFeatured } from "../services/projectService";
import type { Project } from "../services/projectService";

const MAX_FEATURED = 6;

// Gradient colors for project items
const GRADIENT_COLORS = [
    ["#6366f1", "#8b5cf6"],
    ["#3b82f6", "#06b6d4"],
    ["#10b981", "#14b8a6"],
    ["#f59e0b", "#ef4444"],
    ["#ec4899", "#8b5cf6"],
    ["#06b6d4", "#3b82f6"],
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

interface ManageFeaturedModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    onUpdate?: () => void;
}

function ManageFeaturedModal({ isOpen, onClose, userId, onUpdate }: ManageFeaturedModalProps) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const featuredCount = projects.filter(p => p.isFeatured).length;

    useEffect(() => {
        if (isOpen && userId) {
            fetchProjects();
        }
    }, [isOpen, userId]);

    const fetchProjects = async () => {
        setLoading(true);
        setError(null);
        try {
            const userProjects = await getUserProjects(userId);
            setProjects(userProjects);
        } catch (err) {
            console.error("Failed to fetch projects:", err);
            setError("Failed to load projects");
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (project: Project) => {
        // If trying to feature and already at max, show error
        if (!project.isFeatured && featuredCount >= MAX_FEATURED) {
            return;
        }

        setTogglingId(project.id);
        try {
            await toggleProjectFeatured(project.id, !project.isFeatured);
            setProjects(prev =>
                prev.map(p =>
                    p.id === project.id ? { ...p, isFeatured: !p.isFeatured } : p
                )
            );
            onUpdate?.();
        } catch (err) {
            console.error("Failed to toggle featured:", err);
        } finally {
            setTogglingId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-semibold text-white">Manage Showcase</h2>
                        <p className="text-sm text-slate-400">Select projects to feature on your profile</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Counter */}
                <div className="px-6 py-3 border-b border-slate-700 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Featured Projects</span>
                        <span className={`text-sm font-medium ${featuredCount >= MAX_FEATURED ? "text-amber-400" : "text-blue-400"
                            }`}>
                            {featuredCount}/{MAX_FEATURED} Selected
                        </span>
                    </div>
                    {featuredCount >= MAX_FEATURED && (
                        <div className="flex items-center gap-2 mt-2 text-amber-400 text-xs">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Maximum featured projects reached</span>
                        </div>
                    )}
                </div>

                {/* Project List */}
                <div className="flex-1 overflow-y-auto settings-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 text-red-400">
                            {error}
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            No projects found. Create some projects first!
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-700/50">
                            {projects.map((project) => {
                                const isAtLimit = featuredCount >= MAX_FEATURED && !project.isFeatured;
                                const isToggling = togglingId === project.id;

                                return (
                                    <div
                                        key={project.id}
                                        className={`flex items-center gap-4 px-6 py-4 transition-colors ${isAtLimit
                                                ? "opacity-50 cursor-not-allowed"
                                                : "hover:bg-slate-700/30 cursor-pointer"
                                            }`}
                                        onClick={() => !isAtLimit && !isToggling && handleToggle(project)}
                                    >
                                        {/* Project Icon */}
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{ background: getGradient(project.title) }}
                                        >
                                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                            </svg>
                                        </div>

                                        {/* Project Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-white truncate">
                                                {project.title || "Untitled Project"}
                                            </h4>
                                            <p className="text-sm text-slate-500">
                                                {project.updatedAt
                                                    ? new Date(project.updatedAt).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric"
                                                    })
                                                    : "No date"
                                                }
                                            </p>
                                        </div>

                                        {/* Checkbox */}
                                        <div className="flex-shrink-0">
                                            {isToggling ? (
                                                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                                            ) : (
                                                <div
                                                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${project.isFeatured
                                                            ? "bg-blue-600 border-blue-600"
                                                            : isAtLimit
                                                                ? "border-slate-600"
                                                                : "border-slate-500 hover:border-slate-400"
                                                        }`}
                                                >
                                                    {project.isFeatured && (
                                                        <Check className="w-4 h-4 text-white" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-700 flex justify-end flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ManageFeaturedModal;
