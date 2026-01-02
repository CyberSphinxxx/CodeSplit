import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";
import { getUserIdByUsername } from "../services/userService";
import { Globe, Briefcase, ExternalLink, Github, Linkedin, Link as LinkIcon, Lock, UserPlus } from "lucide-react";
import type { Project } from "../services/projectService";

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

function detectTags(project: Project): string[] {
    const tags: string[] = [];
    const html = project.html || "";
    const css = project.css || "";
    const js = project.js || "";

    if (html.length > 100) tags.push("HTML");
    if (css.length > 100) tags.push("CSS");
    if (js.length > 100) tags.push("JavaScript");
    if (js.includes("fetch(") || js.includes("XMLHttpRequest")) tags.push("API");
    if (css.includes("@keyframes") || css.includes("animation")) tags.push("Animated");
    if (css.includes("@media")) tags.push("Responsive");

    return tags.slice(0, 3);
}

function generateDescription(project: Project): string {
    const html = project.html || "";
    const textMatch = html.match(/<(?:p|h[1-6]|span|div)[^>]*>([^<]{10,80})/i);
    if (textMatch) {
        return textMatch[1].substring(0, 60).trim() + "...";
    }
    return "A web project built with HTML, CSS, and JavaScript.";
}

// Featured Project Card Component
function FeaturedProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
    const tags = detectTags(project);
    const description = generateDescription(project);

    return (
        <div
            className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 hover:bg-slate-800 transition-all cursor-pointer group"
            onClick={onClick}
        >
            <div
                className="aspect-video relative overflow-hidden"
                style={{ background: getGradient(project.title) }}
            >
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 left-4 right-4 space-y-2">
                        <div className="h-2 bg-white/30 rounded w-3/4" />
                        <div className="h-2 bg-white/20 rounded w-1/2" />
                        <div className="h-2 bg-white/25 rounded w-2/3" />
                        <div className="h-2 bg-white/15 rounded w-1/3" />
                    </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white/40 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="w-6 h-6 text-white drop-shadow-lg" />
                    </div>
                </div>
            </div>

            <div className="p-4">
                <h3 className="font-semibold text-white truncate group-hover:text-blue-400 transition-colors mb-1">
                    {project.title || "Untitled Project"}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                    {description}
                </p>
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-2 py-0.5 text-xs font-medium bg-slate-700/50 text-slate-300 rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function PublicProfile() {
    const { userId: paramId } = useParams<{ userId: string }>();
    const navigate = useNavigate();

    // State for resolving username to userId
    const [resolvedUserId, setResolvedUserId] = useState<string | null>(null);
    const [isResolvingUsername, setIsResolvingUsername] = useState(true);
    const [usernameNotFound, setUsernameNotFound] = useState(false);

    // Resolve username to userId if needed
    useEffect(() => {
        const resolveUser = async () => {
            if (!paramId) {
                setIsResolvingUsername(false);
                return;
            }

            // Remove @ prefix if present
            const cleanParam = paramId.startsWith("@") ? paramId.slice(1) : paramId;

            // Check if it looks like a Firebase UID (typically 28 chars, alphanumeric)
            const looksLikeUid = /^[a-zA-Z0-9]{20,}$/.test(cleanParam);

            if (looksLikeUid) {
                // Treat as direct userId
                setResolvedUserId(cleanParam);
                setIsResolvingUsername(false);
            } else {
                // Treat as username, look it up
                try {
                    const uid = await getUserIdByUsername(cleanParam);
                    if (uid) {
                        setResolvedUserId(uid);
                    } else {
                        setUsernameNotFound(true);
                    }
                } catch {
                    setUsernameNotFound(true);
                }
                setIsResolvingUsername(false);
            }
        };

        resolveUser();
    }, [paramId]);

    const { profile, featuredProjects, allProjects, languageStats, loading, error } = useProfile(resolvedUserId);

    const handleOpenProject = (project: Project) => {
        navigate(`/editor/${project.id}`, { state: { project } });
    };

    const handleFollow = () => {
        // Mock follow function for now
        alert("Follow feature coming soon!");
    };

    if (isResolvingUsername || loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="flex items-center gap-3 text-slate-300">
                    <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Loading profile...</span>
                </div>
            </div>
        );
    }

    // Profile not found (includes username not found case)
    if (error || !profile || usernameNotFound) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="max-w-md text-center px-6">
                    <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Profile not found</h2>
                    <p className="text-slate-400 mb-6">This profile doesn't exist or may have been removed.</p>
                    <a href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
                        ← Back to home
                    </a>
                </div>
            </div>
        );
    }

    // Private profile check
    if (!profile.isPublic) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="max-w-md text-center px-6">
                    <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-10 h-10 text-slate-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Private Profile</h2>
                    <p className="text-slate-400 mb-6">This user has set their profile to private.</p>
                    <a href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
                        ← Back to home
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Banner */}
            <div className="h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative">
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }} />
            </div>

            {/* Container */}
            <div className="max-w-5xl mx-auto px-6">
                {/* Profile Header */}
                <div className="relative -mt-16 mb-6">
                    <div className="flex items-end justify-between">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            {profile.photoURL ? (
                                <img
                                    src={profile.photoURL}
                                    alt={profile.displayName}
                                    className="w-32 h-32 rounded-full border-4 border-gray-900 shadow-2xl bg-slate-800"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-900 shadow-2xl">
                                    {profile.displayName?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                            )}
                        </div>

                        {/* Follow Button */}
                        <div className="flex items-center gap-3 pb-2">
                            <button
                                onClick={handleFollow}
                                className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
                            >
                                <UserPlus className="w-4 h-4" />
                                Follow
                            </button>
                        </div>
                    </div>
                </div>

                {/* Two Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-12">
                    {/* Left Column - Profile Info */}
                    <div className="md:col-span-4 space-y-6">
                        {/* Name & Email */}
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {profile.displayName || "Anonymous User"}
                            </h1>
                            <div className="flex items-center gap-2 mt-1 text-green-400 text-sm">
                                <Globe className="w-4 h-4" />
                                <span>Public Profile</span>
                            </div>
                        </div>

                        {/* Bio */}
                        {profile.bio && (
                            <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-4">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">About</span>
                                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap mt-2">
                                    {profile.bio}
                                </p>
                            </div>
                        )}

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-slate-800/30 rounded-lg p-3 text-center border border-slate-700/50">
                                <div className="text-xl font-bold text-white">{allProjects.length}</div>
                                <div className="text-xs text-slate-500">Projects</div>
                            </div>
                            <div className="bg-slate-800/30 rounded-lg p-3 text-center border border-slate-700/50">
                                <div className="text-xl font-bold text-white">{featuredProjects.length}</div>
                                <div className="text-xs text-slate-500">Featured</div>
                            </div>
                            <div className="bg-slate-800/30 rounded-lg p-3 text-center border border-slate-700/50">
                                <div className="text-sm font-bold text-white">
                                    {profile.createdAt
                                        ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                                        : "—"}
                                </div>
                                <div className="text-xs text-slate-500">Member</div>
                            </div>
                        </div>

                        {/* Social Links */}
                        {(profile.links?.github || profile.links?.linkedin || profile.links?.website) && (
                            <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-4">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Links</span>
                                <div className="mt-3 space-y-2">
                                    {profile.links?.github && (
                                        <a href={profile.links.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                                            <Github className="w-4 h-4" />
                                            <span className="truncate">GitHub</span>
                                        </a>
                                    )}
                                    {profile.links?.linkedin && (
                                        <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                                            <Linkedin className="w-4 h-4" />
                                            <span className="truncate">LinkedIn</span>
                                        </a>
                                    )}
                                    {profile.links?.website && (
                                        <a href={profile.links.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                                            <LinkIcon className="w-4 h-4" />
                                            <span className="truncate">Website</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Top Languages */}
                        {languageStats.total > 0 && (
                            <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-4">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top Languages</span>
                                <div className="mt-3 space-y-3">
                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-orange-400 font-medium">HTML</span>
                                            <span className="text-slate-500">{Math.round((languageStats.html / languageStats.total) * 100)}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
                                                style={{ width: `${(languageStats.html / languageStats.total) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-blue-400 font-medium">CSS</span>
                                            <span className="text-slate-500">{Math.round((languageStats.css / languageStats.total) * 100)}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                                                style={{ width: `${(languageStats.css / languageStats.total) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-yellow-400 font-medium">JavaScript</span>
                                            <span className="text-slate-500">{Math.round((languageStats.js / languageStats.total) * 100)}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full"
                                                style={{ width: `${(languageStats.js / languageStats.total) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Featured Projects */}
                    <div className="md:col-span-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Briefcase className="w-5 h-5 text-blue-400" />
                            <h2 className="text-lg font-semibold text-white">Featured Work</h2>
                        </div>

                        {featuredProjects.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {featuredProjects.map((project) => (
                                    <FeaturedProjectCard
                                        key={project.id}
                                        project={project}
                                        onClick={() => handleOpenProject(project)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-slate-700/50 rounded-xl p-12 text-center bg-slate-800/20">
                                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                    <Briefcase className="w-8 h-8 text-slate-600" />
                                </div>
                                <p className="text-slate-400 font-medium">No featured projects yet</p>
                                <p className="text-slate-500 text-sm mt-1">
                                    This user hasn't pinned any projects.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PublicProfile;
