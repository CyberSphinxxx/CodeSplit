import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Edit3, Tag, Check, Trash2 } from "lucide-react";
import { updatePublishedProject, unpublishProject } from "../../services/communityService";
import type { CommunityProject } from "../../services/communityService";

interface EditPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: CommunityProject;
    userId: string;
    onSuccess?: (message: string) => void;
    onUnpublished?: () => void;
}

function EditPostModal({
    isOpen,
    onClose,
    project,
    userId,
    onSuccess,
    onUnpublished,
}: EditPostModalProps) {
    const [title, setTitle] = useState(project.title || "");
    const [description, setDescription] = useState(project.description || "");
    const [tags, setTags] = useState<string[]>(project.tags || []);
    const [tagInput, setTagInput] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isUnpublishing, setIsUnpublishing] = useState(false);
    const [showConfirmUnpublish, setShowConfirmUnpublish] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Sync with project prop when modal opens
    useEffect(() => {
        if (isOpen) {
            setTitle(project.title || "");
            setDescription(project.description || "");
            setTags(project.tags || []);
            setTagInput("");
            setError(null);
            setShowSuccess(false);
            setShowConfirmUnpublish(false);
        }
    }, [isOpen, project]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                if (!isSaving && !isUnpublishing && !showSuccess) {
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
    }, [isOpen, onClose, isSaving, isUnpublishing, showSuccess]);

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

    // Save handler
    const handleSave = async () => {
        if (!description.trim()) {
            setError("Please add a description");
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            await updatePublishedProject(project.id, userId, {
                title: title.trim(),
                description: description.trim(),
                tags,
            });

            setShowSuccess(true);

            // Close modal after short delay
            setTimeout(() => {
                onSuccess?.("Post updated successfully");
                onClose();
            }, 1000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update");
            setIsSaving(false);
        }
    };

    // Unpublish handler
    const handleUnpublish = async () => {
        setIsUnpublishing(true);
        setError(null);

        try {
            await unpublishProject(project.id, userId);

            setTimeout(() => {
                onUnpublished?.();
                onSuccess?.("Project removed from community");
                onClose();
            }, 500);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to unpublish");
            setIsUnpublishing(false);
            setShowConfirmUnpublish(false);
        }
    };

    if (!isOpen) return null;

    // Generate preview gradient
    const gradientHue1 = Math.abs((project.html?.length || 0) * 7) % 360;
    const gradientHue2 = Math.abs(((project.css?.length || 0) * 11) + 60) % 360;
    const previewGradient = `linear-gradient(135deg, 
        hsl(${gradientHue1}, 70%, 50%), 
        hsl(${gradientHue2}, 70%, 40%))`;

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
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                            <Check className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-white">Updated!</h3>
                        <p className="text-slate-400 text-sm">Your changes have been saved</p>
                    </div>
                )}

                {/* Confirm Unpublish Overlay */}
                {showConfirmUnpublish && (
                    <div className="absolute inset-0 z-10 bg-slate-800/95 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-200 p-6">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                            <Trash2 className="w-8 h-8 text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white text-center">Remove from Community?</h3>
                        <p className="text-slate-400 text-sm text-center max-w-xs">
                            Your project will no longer be visible in the community feed. You can republish it later.
                        </p>
                        <div className="flex gap-3 mt-2">
                            <button
                                onClick={() => setShowConfirmUnpublish(false)}
                                disabled={isUnpublishing}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUnpublish}
                                disabled={isUnpublishing}
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {isUnpublishing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Removing...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        Yes, Remove
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                            <Edit3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Edit Community Post</h2>
                            <p className="text-xs text-slate-400">Update your project details</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isSaving || showSuccess}
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
                            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                            placeholder="My Awesome Project"
                            disabled={isSaving}
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
                            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none h-20"
                            placeholder="Describe your project in a few words..."
                            disabled={isSaving}
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
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm"
                                >
                                    <Tag className="w-3 h-3" />
                                    {tag}
                                    <button
                                        onClick={() => removeTag(tag)}
                                        className="ml-0.5 hover:text-amber-200 transition-colors"
                                        disabled={isSaving}
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
                            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                            placeholder="Type a tag and press Enter..."
                            disabled={isSaving || tags.length >= 5}
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
                <div className="p-4 border-t border-slate-700 bg-slate-800/50 space-y-3">
                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={isSaving || showSuccess}
                        className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25"
                    >
                        {isSaving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Check className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </button>

                    {/* Unpublish Button */}
                    <button
                        onClick={() => setShowConfirmUnpublish(true)}
                        disabled={isSaving || showSuccess}
                        className="w-full py-2.5 px-4 bg-transparent border-2 border-red-500/50 hover:border-red-500 hover:bg-red-500/10 text-red-400 hover:text-red-300 font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Remove from Community
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default EditPostModal;
