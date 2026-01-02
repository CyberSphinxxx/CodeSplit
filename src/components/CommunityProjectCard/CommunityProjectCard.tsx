import { Heart, Eye, Edit2 } from "lucide-react";
import type { CommunityProject } from "../../services/communityService";

interface CommunityProjectCardProps {
    project: CommunityProject;
    onClick: () => void;
    onEdit?: () => void;
    showEditButton?: boolean;
}

function CommunityProjectCard({ project, onClick, onEdit, showEditButton = false }: CommunityProjectCardProps) {
    // Generate gradient based on project content
    const gradientHue1 = Math.abs((project.html?.length || 0) * 7) % 360;
    const gradientHue2 = Math.abs(((project.css?.length || 0) * 11) + 60) % 360;
    const gradientStyle = {
        background: `linear-gradient(135deg, 
            hsl(${gradientHue1}, 70%, 45%), 
            hsl(${gradientHue2}, 70%, 35%))`
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit?.();
    };

    return (
        <div
            onClick={onClick}
            className="group bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-500 hover:bg-slate-800 transition-all cursor-pointer hover:shadow-lg hover:shadow-blue-500/10 relative"
        >
            {/* Thumbnail */}
            <div className="aspect-video relative" style={gradientStyle}>
                {/* Tags overlay */}
                {project.tags && project.tags.length > 0 && (
                    <div className="absolute top-2 left-2 flex gap-1.5">
                        {project.tags.slice(0, 2).map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-0.5 bg-black/40 backdrop-blur-sm text-white text-xs font-medium rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Edit button - top right */}
                {showEditButton && onEdit && (
                    <button
                        onClick={handleEditClick}
                        className="absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-sm text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 z-10"
                        title="Edit post"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex items-center gap-2 text-white text-sm font-medium">
                        <Eye className="w-4 h-4" />
                        Click to Preview
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-3">
                <div className="flex items-center justify-between gap-2">
                    {/* Left: Title & Author */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        {/* Author Avatar */}
                        <div className="relative group/avatar">
                            <img
                                src={project.ownerPhotoURL || "https://via.placeholder.com/24"}
                                alt={project.ownerName || "Author"}
                                className="w-6 h-6 rounded-full border border-slate-600 flex-shrink-0"
                            />
                            {/* Tooltip */}
                            {project.ownerUsername && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-700 text-white text-xs rounded opacity-0 group-hover/avatar:opacity-100 pointer-events-none whitespace-nowrap z-10 transition-opacity">
                                    @{project.ownerUsername}
                                </div>
                            )}
                        </div>
                        {/* Title */}
                        <h3 className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                            {project.title || "Untitled Project"}
                        </h3>
                    </div>

                    {/* Right: Stats */}
                    <div className="flex items-center gap-3 flex-shrink-0 text-slate-400">
                        {/* Likes */}
                        <div className="flex items-center gap-1 text-xs">
                            <Heart className="w-3.5 h-3.5" />
                            <span>{project.likes ?? 0}</span>
                        </div>
                        {/* Views */}
                        <div className="flex items-center gap-1 text-xs">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{project.views ?? 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CommunityProjectCard;
