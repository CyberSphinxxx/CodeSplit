import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Globe, Tag, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { publishProject, updatePublishedProject } from "../../services/communityService";
import { renameProject } from "../../services/projectService";

interface PublishModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    projectTitle: string;
    projectHtml: string;
    projectCss: string;
    userId: string;
    onSuccess?: () => void;
    onTitleChange?: (title: string) => void;
    isPublic?: boolean;
    initialDescription?: string;
    initialTags?: string[];
}

function PublishModal({
    isOpen,
    onClose,
    projectId,
    projectTitle,
    projectHtml,
    projectCss,
    userId,
    onSuccess,
    onTitleChange,
    isPublic = false,
    initialDescription = "",
    initialTags = [],
}: PublishModalProps) {
    const [title, setTitle] = useState(projectTitle);
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [isPublishing, setIsPublishing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Sync state when modal opens
    useEffect(() => {
        if (isOpen) {
            setTitle(projectTitle);
            setDescription(initialDescription);
            setTags(initialTags);
            setTagInput("");
            setError(null);
            setShowSuccess(false);
        }
    }, [isOpen, projectTitle, initialDescription, initialTags]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                if (!isPublishing && !showSuccess) {
                    onClose();
                }
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose, isPublishing, showSuccess]);

    // Handle tag input
    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && tagInput.trim()) {
            e.preventDefault();
            if (tags.length >= 5) {
                setError("Maximum 5 tags allowed");
                return;
            }
            const newTag = tagInput.trim().toLowerCase();
            if (tags.includes(newTag)) {
                setError("Tag already exists");
                return;
            }
            setTags([...tags, newTag]);
            setTagInput("");
            setError(null);
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter((t) => t !== tagToRemove));
    };

    // Publish handler
    const handlePublish = async () => {
        if (!description.trim()) {
            setError("Please add a description");
            return;
        }

        setIsPublishing(true);
        setError(null);

        try {
            // Update title if changed
            if (title !== projectTitle) {
                await renameProject(projectId, title);
                onTitleChange?.(title);
            }

            // Publish or update to community
            if (isPublic) {
                // Update existing community post
                await updatePublishedProject(projectId, userId, {
                    title: title !== projectTitle ? title : undefined,
                    description: description.trim(),
                    tags,
                });
            } else {
                // New publish
                await publishProject(projectId, userId, {
                    description: description.trim(),
                    tags,
                });
            }

            // Success! Show confetti
            setShowSuccess(true);

            // Fire confetti
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#60A5FA", "#A78BFA", "#34D399", "#FBBF24"],
            });

            // Additional confetti burst
            setTimeout(() => {
                confetti({
                    particleCount: 50,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ["#60A5FA", "#A78BFA"],
                });
                confetti({
                    particleCount: 50,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ["#34D399", "#FBBF24"],
                });
            }, 200);

            // Close modal after delay
            setTimeout(() => {
                onSuccess?.();
                onClose();
            }, 2500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to publish");
            setIsPublishing(false);
        }
    };

    if (!isOpen) return null;

    // Generate preview gradient (simplified version of actual preview)
    const previewGradient = `linear-gradient(135deg, 
        hsl(${Math.abs(projectHtml.length * 7) % 360}, 70%, 50%), 
        hsl(${Math.abs((projectCss.length * 11) + 60) % 360}, 70%, 40%))`;

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                ref={modalRef}
                className="relative bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Success Overlay */}
                {showSuccess && (
                    <div className="absolute inset-0 z-10 bg-slate-800/95 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center animate-bounce">
                            <Sparkles className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">Your project is {isPublic ? 'updated!' : 'live!'}</h3>
                        <p className="text-slate-400 text-sm">It&apos;s now visible in the Community feed</p>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Globe className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                {isPublic ? 'Update Community Post' : 'Publish to Community'}
                            </h2>
                            <p className="text-xs text-slate-400">
                                {isPublic ? 'Update your project details' : 'Share your creation with the world'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isPublishing || showSuccess}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto settings-scrollbar">
                    {/* Project Title */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Project Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="My Awesome Project"
                            disabled={isPublishing}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Description
                            <span className="float-right text-xs text-slate-500">
                                {description.length}/140
                            </span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => {
                                if (e.target.value.length <= 140) {
                                    setDescription(e.target.value);
                                }
                            }}
                            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none h-20"
                            placeholder="Describe your project in a few words..."
                            disabled={isPublishing}
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Tags
                            <span className="float-right text-xs text-slate-500">
                                {tags.length}/5
                            </span>
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
                                >
                                    <Tag className="w-3 h-3" />
                                    {tag}
                                    <button
                                        onClick={() => removeTag(tag)}
                                        className="ml-0.5 hover:text-blue-200 transition-colors"
                                        disabled={isPublishing}
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Type a tag and press Enter..."
                            disabled={isPublishing || tags.length >= 5}
                        />
                    </div>

                    {/* Preview Card */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">
                            Preview
                        </label>
                        <div className="bg-slate-900 rounded-xl border border-slate-700 p-3">
                            <div className="flex gap-3">
                                {/* Thumbnail */}
                                <div
                                    className="w-24 h-16 rounded-lg flex-shrink-0"
                                    style={{ background: previewGradient }}
                                />
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-white truncate">
                                        {title || "Untitled Project"}
                                    </h4>
                                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                                        {description || "No description yet..."}
                                    </p>
                                    {tags.length > 0 && (
                                        <div className="flex gap-1 mt-1.5 flex-wrap">
                                            {tags.slice(0, 3).map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-1.5 py-0.5 bg-slate-700 text-slate-400 rounded text-[10px]"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                            {tags.length > 3 && (
                                                <span className="text-[10px] text-slate-500">
                                                    +{tags.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-700 bg-slate-800/50">
                    <button
                        onClick={handlePublish}
                        disabled={isPublishing || showSuccess}
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                    >
                        {isPublishing ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Publishing...
                            </>
                        ) : (
                            <>
                                <Globe className="w-5 h-5" />
                                {isPublic ? 'Update Post' : 'Publish Now'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default PublishModal;
