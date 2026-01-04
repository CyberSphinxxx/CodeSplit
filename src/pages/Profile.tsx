import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../hooks/useProfile";
import { updateUserProfile, checkUsernameAvailability, claimUsername, validateUsername } from "../services/userService";
import { getUserPublishedProjects, type CommunityProject } from "../services/communityService";
import { Globe, Lock, Edit2, Save, X, Briefcase, ExternalLink, Settings2, Github, Linkedin, Link as LinkIcon, Pin, Check, AlertCircle, Loader2, MessageSquare } from "lucide-react";
import type { Project } from "../services/projectService";
import ManageFeaturedModal from "../components/ManageFeaturedModal";
import CommunityProjectCard from "../components/CommunityProjectCard/CommunityProjectCard";
import EditPostModal from "../components/EditPostModal/EditPostModal";

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

// Detect tags from project code
function detectTags(project: Project): string[] {
    const tags: string[] = [];
    const html = project.html || "";
    const css = project.css || "";
    const js = project.js || "";

    if (html.length > 100) tags.push("HTML");
    if (css.length > 100) tags.push("CSS");
    if (js.length > 100) tags.push("JavaScript");

    // Detect patterns
    if (js.includes("fetch(") || js.includes("XMLHttpRequest")) tags.push("API");
    if (css.includes("@keyframes") || css.includes("animation")) tags.push("Animated");
    if (css.includes("@media")) tags.push("Responsive");

    return tags.slice(0, 3);
}

// Generate description from HTML
function generateDescription(project: Project): string {
    const html = project.html || "";
    const textMatch = html.match(/<(?:p|h[1-6]|span|div)[^>]*>([^<]{10,80})/i);
    if (textMatch) {
        return textMatch[1].substring(0, 60).trim() + "...";
    }
    return "A web project built with HTML, CSS, and JavaScript.";
}

// Featured Project Card Component - Large Preview Card
function FeaturedProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
    const tags = detectTags(project);
    const description = generateDescription(project);

    return (
        <div
            className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 hover:bg-slate-800 transition-all cursor-pointer group"
            onClick={onClick}
        >
            {/* Thumbnail - 16:9 aspect ratio */}
            <div
                className="aspect-video relative overflow-hidden"
                style={{ background: getGradient(project.title) }}
            >
                {/* Decorative code pattern */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 left-4 right-4 space-y-2">
                        <div className="h-2 bg-white/30 rounded w-3/4" />
                        <div className="h-2 bg-white/20 rounded w-1/2" />
                        <div className="h-2 bg-white/25 rounded w-2/3" />
                        <div className="h-2 bg-white/15 rounded w-1/3" />
                    </div>
                </div>
                {/* Code icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white/40 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="w-6 h-6 text-white drop-shadow-lg" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-semibold text-white truncate group-hover:text-blue-400 transition-colors mb-1">
                    {project.title || "Untitled Project"}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                    {description}
                </p>
                {/* Tags */}
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

function Profile() {
    const { userId } = useParams<{ userId?: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();

    const profileUserId = userId || user?.uid;
    const isOwnProfile = user?.uid === profileUserId;

    const { profile, featuredProjects, allProjects, languageStats, loading, error, refetch } = useProfile(profileUserId);

    // Edit state
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bioValue, setBioValue] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isTogglingPrivacy, setIsTogglingPrivacy] = useState(false);
    const [showFeaturedModal, setShowFeaturedModal] = useState(false);

    // Profile tabs
    type ProfileTab = "featured" | "published";
    const [activeTab, setActiveTab] = useState<ProfileTab>("featured");
    const [publishedProjects, setPublishedProjects] = useState<CommunityProject[]>([]);
    const [isLoadingPublished, setIsLoadingPublished] = useState(false);
    const [editingProject, setEditingProject] = useState<CommunityProject | null>(null);
    const [toastMessage, setToastMessage] = useState("");

    // Links editing state
    const [isEditingLinks, setIsEditingLinks] = useState(false);
    const [linksValue, setLinksValue] = useState({
        github: "",
        linkedin: "",
        website: ""
    });

    // Username editing state
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [usernameValue, setUsernameValue] = useState("");
    const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid" | "unchanged">("idle");
    const [usernameError, setUsernameError] = useState("");
    const [isSavingUsername, setIsSavingUsername] = useState(false);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (profile?.bio) {
            setBioValue(profile.bio);
        }
        if (profile?.links) {
            setLinksValue({
                github: profile.links.github || "",
                linkedin: profile.links.linkedin || "",
                website: profile.links.website || ""
            });
        }
        if (profile?.username) {
            setUsernameValue(profile.username);
        }
    }, [profile?.bio, profile?.links, profile?.username]);

    // Fetch published projects when tab changes
    useEffect(() => {
        if (activeTab === "published" && profileUserId) {
            fetchPublishedProjects();
        }
    }, [activeTab, profileUserId]);

    const fetchPublishedProjects = async () => {
        if (!profileUserId) return;
        setIsLoadingPublished(true);
        try {
            const projects = await getUserPublishedProjects(profileUserId);
            setPublishedProjects(projects);
        } catch (error) {
            console.error("Failed to fetch published projects:", error);
        } finally {
            setIsLoadingPublished(false);
        }
    };

    // Auto-dismiss toast
    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => setToastMessage(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    // Debounced username availability check
    const checkUsername = useCallback(async (username: string) => {
        // If same as current username, mark as unchanged
        if (username.toLowerCase() === profile?.username?.toLowerCase()) {
            setUsernameStatus("unchanged");
            setUsernameError("");
            return;
        }

        // Validate format first
        const validation = validateUsername(username);
        if (!validation.isValid) {
            setUsernameStatus("invalid");
            setUsernameError(validation.error || "Invalid username");
            return;
        }

        setUsernameStatus("checking");
        setUsernameError("");

        try {
            const available = await checkUsernameAvailability(username);
            setUsernameStatus(available ? "available" : "taken");
            setUsernameError(available ? "" : "Username is already taken");
        } catch {
            setUsernameStatus("invalid");
            setUsernameError("Failed to check availability");
        }
    }, [profile?.username]);

    // Handle username input change with debounce
    const handleUsernameChange = (value: string) => {
        setUsernameValue(value);

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        if (!value) {
            setUsernameStatus("idle");
            setUsernameError("");
            return;
        }

        debounceTimerRef.current = setTimeout(() => {
            checkUsername(value);
        }, 500);
    };

    // Save username
    const handleSaveUsername = async () => {
        if (!profileUserId || usernameStatus === "taken" || usernameStatus === "invalid" || usernameStatus === "checking") {
            return;
        }

        // If unchanged, just close
        if (usernameStatus === "unchanged" || usernameValue === profile?.username) {
            setIsEditingUsername(false);
            return;
        }

        setIsSavingUsername(true);
        try {
            await claimUsername(profileUserId, usernameValue);
            await refetch();
            setIsEditingUsername(false);
        } catch (err) {
            setUsernameError(err instanceof Error ? err.message : "Failed to claim username");
            setUsernameStatus("invalid");
        } finally {
            setIsSavingUsername(false);
        }
    };

    const handleCancelUsernameEdit = () => {
        setUsernameValue(profile?.username || "");
        setUsernameStatus("idle");
        setUsernameError("");
        setIsEditingUsername(false);
    };

    const handleSaveBio = async () => {
        if (!profileUserId) return;
        setIsSaving(true);
        try {
            await updateUserProfile(profileUserId, { bio: bioValue });
            await refetch();
            setIsEditingBio(false);
        } catch (err) {
            console.error("Failed to save bio:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setBioValue(profile?.bio || "");
        setIsEditingBio(false);
    };

    const handleSaveLinks = async () => {
        if (!profileUserId) return;
        setIsSaving(true);
        try {
            await updateUserProfile(profileUserId, { links: linksValue });
            await refetch();
            setIsEditingLinks(false);
        } catch (err) {
            console.error("Failed to save links:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelLinksEdit = () => {
        setLinksValue({
            github: profile?.links?.github || "",
            linkedin: profile?.links?.linkedin || "",
            website: profile?.links?.website || ""
        });
        setIsEditingLinks(false);
    };

    const handleTogglePrivacy = async () => {
        if (!profileUserId || !profile) return;
        setIsTogglingPrivacy(true);
        try {
            await updateUserProfile(profileUserId, { isPublic: !profile.isPublic });
            await refetch();
        } catch (err) {
            console.error("Failed to toggle privacy:", err);
        } finally {
            setIsTogglingPrivacy(false);
        }
    };

    const handleOpenProject = (project: Project) => {
        navigate(`/editor/${project.id}`, { state: { project } });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
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

    if (error || !profile) {
        return (
            <div className="max-w-2xl mx-auto py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Profile not found</h2>
                <p className="text-slate-400">This user doesn't exist or their profile is private.</p>
            </div>
        );
    }

    return (
        <div className="-m-6">
            {/* Banner */}
            <div className="h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative">
                <div className="absolute inset-0 bg-black/20" />
                {/* Decorative pattern */}
                <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }} />
            </div>

            {/* Container */}
            <div className="max-w-5xl mx-auto px-6">
                {/* Profile Header - Avatar overlapping banner */}
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

                        {/* Action Bar */}
                        {isOwnProfile && (
                            <div className="flex items-center gap-3 pb-2">
                                <button
                                    onClick={handleTogglePrivacy}
                                    disabled={isTogglingPrivacy}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm font-medium ${profile.isPublic
                                        ? "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
                                        : "bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
                                        } disabled:opacity-50`}
                                >
                                    {isTogglingPrivacy ? (
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    ) : profile.isPublic ? (
                                        <Globe className="w-4 h-4" />
                                    ) : (
                                        <Lock className="w-4 h-4" />
                                    )}
                                    {profile.isPublic ? "Public" : "Private"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Two Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-8">
                    {/* Left Column - Profile Info */}
                    <div className="md:col-span-4 space-y-6">
                        {/* Name & Username */}
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {profile.displayName || "Anonymous User"}
                            </h1>
                            {/* Username display/edit */}
                            {isEditingUsername ? (
                                <div className="mt-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">@</span>
                                            <input
                                                type="text"
                                                value={usernameValue}
                                                onChange={(e) => handleUsernameChange(e.target.value.replace(/\s/g, ''))}
                                                placeholder="username"
                                                className="w-full pl-7 pr-10 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                                                autoFocus
                                            />
                                            {/* Status indicator */}
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                {usernameStatus === "checking" && (
                                                    <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                                                )}
                                                {usernameStatus === "available" && (
                                                    <Check className="w-4 h-4 text-green-400" />
                                                )}
                                                {(usernameStatus === "taken" || usernameStatus === "invalid") && (
                                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                                )}
                                                {usernameStatus === "unchanged" && (
                                                    <Check className="w-4 h-4 text-slate-400" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Status message */}
                                    {usernameStatus === "available" && (
                                        <p className="text-green-400 text-xs mt-1.5">Username is available!</p>
                                    )}
                                    {usernameError && (
                                        <p className="text-red-400 text-xs mt-1.5">{usernameError}</p>
                                    )}
                                    {/* Action buttons */}
                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            onClick={handleCancelUsernameEdit}
                                            disabled={isSavingUsername}
                                            className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveUsername}
                                            disabled={isSavingUsername || usernameStatus === "checking" || usernameStatus === "taken" || usernameStatus === "invalid" || !usernameValue}
                                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                        >
                                            {isSavingUsername ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <Save className="w-3.5 h-3.5" />
                                            )}
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 mt-1">
                                    {profile.username ? (
                                        <span className="text-slate-400 text-sm">@{profile.username}</span>
                                    ) : isOwnProfile ? (
                                        <span className="text-slate-500 text-sm italic">No username set</span>
                                    ) : null}
                                    {isOwnProfile && (
                                        <button
                                            onClick={() => setIsEditingUsername(true)}
                                            className="text-slate-500 hover:text-white transition-colors p-1"
                                            title="Edit username"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            )}
                            {profile.email && !isEditingUsername && (
                                <p className="text-slate-500 text-sm mt-1">{profile.email}</p>
                            )}
                        </div>

                        {/* Bio */}
                        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">About</span>
                                {isOwnProfile && !isEditingBio && (
                                    <button
                                        onClick={() => setIsEditingBio(true)}
                                        className="text-slate-500 hover:text-white transition-colors"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {isEditingBio ? (
                                <div>
                                    <textarea
                                        value={bioValue}
                                        onChange={(e) => setBioValue(e.target.value)}
                                        placeholder="Write something about yourself..."
                                        className="w-full h-24 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
                                        autoFocus
                                    />
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button
                                            onClick={handleCancelEdit}
                                            disabled={isSaving}
                                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={handleSaveBio}
                                            disabled={isSaving}
                                            className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors disabled:opacity-50"
                                        >
                                            {isSaving ? (
                                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                            ) : (
                                                <Save className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                    {profile.bio || (
                                        <span className="text-slate-500 italic">
                                            {isOwnProfile ? "No bio yet. Click to add one." : "No bio."}
                                        </span>
                                    )}
                                </p>
                            )}
                        </div>

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
                        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Links</span>
                                {isOwnProfile && !isEditingLinks && (
                                    <button
                                        onClick={() => setIsEditingLinks(true)}
                                        className="text-slate-500 hover:text-white transition-colors"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {isEditingLinks ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Github className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                        <input
                                            type="url"
                                            value={linksValue.github}
                                            onChange={(e) => setLinksValue(prev => ({ ...prev, github: e.target.value }))}
                                            placeholder="https://github.com/username"
                                            className="flex-1 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Linkedin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                        <input
                                            type="url"
                                            value={linksValue.linkedin}
                                            onChange={(e) => setLinksValue(prev => ({ ...prev, linkedin: e.target.value }))}
                                            placeholder="https://linkedin.com/in/username"
                                            className="flex-1 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <LinkIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                        <input
                                            type="url"
                                            value={linksValue.website}
                                            onChange={(e) => setLinksValue(prev => ({ ...prev, website: e.target.value }))}
                                            placeholder="https://yourwebsite.com"
                                            className="flex-1 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2 pt-1">
                                        <button
                                            onClick={handleCancelLinksEdit}
                                            disabled={isSaving}
                                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={handleSaveLinks}
                                            disabled={isSaving}
                                            className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-colors disabled:opacity-50"
                                        >
                                            {isSaving ? (
                                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                            ) : (
                                                <Save className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
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
                                    {(!profile.links?.github && !profile.links?.linkedin && !profile.links?.website) && (
                                        <p className="text-slate-500 text-sm italic">
                                            {isOwnProfile ? "No links added yet." : "No links."}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Top Languages */}
                        {languageStats.total > 0 && (
                            <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-4">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top Languages</span>
                                <div className="mt-3 space-y-3">
                                    {/* HTML */}
                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-orange-400 font-medium">HTML</span>
                                            <span className="text-slate-500">{Math.round((languageStats.html / languageStats.total) * 100)}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
                                                style={{ width: `${(languageStats.html / languageStats.total) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    {/* CSS */}
                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-blue-400 font-medium">CSS</span>
                                            <span className="text-slate-500">{Math.round((languageStats.css / languageStats.total) * 100)}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                                                style={{ width: `${(languageStats.css / languageStats.total) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    {/* JavaScript */}
                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-yellow-400 font-medium">JavaScript</span>
                                            <span className="text-slate-500">{Math.round((languageStats.js / languageStats.total) * 100)}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full transition-all duration-500"
                                                style={{ width: `${(languageStats.js / languageStats.total) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Projects */}
                    <div className="md:col-span-8">
                        {/* Tabs */}
                        <div className="flex items-center gap-1 mb-4 bg-slate-800/50 p-1 rounded-xl w-fit">
                            <button
                                onClick={() => setActiveTab("featured")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === "featured"
                                    ? "bg-slate-700 text-white shadow-lg"
                                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                                    }`}
                            >
                                <Briefcase className="w-4 h-4" />
                                Featured
                            </button>
                            <button
                                onClick={() => setActiveTab("published")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === "published"
                                    ? "bg-slate-700 text-white shadow-lg"
                                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                                    }`}
                            >
                                <MessageSquare className="w-4 h-4" />
                                Published
                            </button>
                        </div>
                        {/* Featured Tab Content */}
                        {activeTab === "featured" && (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-blue-400" />
                                        <h2 className="text-lg font-semibold text-white">Featured Work</h2>
                                    </div>
                                    {isOwnProfile && (
                                        <button
                                            onClick={() => setShowFeaturedModal(true)}
                                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                        >
                                            <Settings2 className="w-4 h-4" />
                                            Manage
                                        </button>
                                    )}
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
                                        {/* Trophy illustration */}
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center mx-auto mb-5">
                                            <svg className="w-10 h-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                                            </svg>
                                        </div>
                                        <h3 className="text-white font-semibold mb-2">
                                            {isOwnProfile ? "Pin your favorites" : "No featured projects"}
                                        </h3>
                                        <p className="text-slate-400 text-sm max-w-xs mx-auto">
                                            {isOwnProfile
                                                ? "Pin your favorite projects here to show them to the world."
                                                : "This user hasn't pinned any projects yet."}
                                        </p>
                                        {isOwnProfile && (
                                            <button
                                                onClick={() => setShowFeaturedModal(true)}
                                                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <Pin className="w-4 h-4" />
                                                Pin Projects
                                            </button>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Published Tab Content */}
                        {activeTab === "published" && (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-green-400" />
                                        <h2 className="text-lg font-semibold text-white">Community Posts</h2>
                                    </div>
                                </div>

                                {isLoadingPublished ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden animate-pulse">
                                                <div className="aspect-video bg-slate-700" />
                                                <div className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-slate-700" />
                                                        <div className="h-4 bg-slate-700 rounded flex-1" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : publishedProjects.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {publishedProjects.map((project) => (
                                            <CommunityProjectCard
                                                key={project.id}
                                                project={project}
                                                onClick={() => handleOpenProject(project)}
                                                showEditButton={isOwnProfile}
                                                onEdit={() => setEditingProject(project)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-slate-700/50 rounded-xl p-12 text-center bg-slate-800/20">
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                                            <MessageSquare className="w-10 h-10 text-green-400" />
                                        </div>
                                        <h3 className="text-white font-semibold mb-2">
                                            {isOwnProfile ? "No community posts yet" : "No published projects"}
                                        </h3>
                                        <p className="text-slate-400 text-sm max-w-xs mx-auto">
                                            {isOwnProfile
                                                ? "Publish your projects to share them with the community."
                                                : "This user hasn't published any projects yet."}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Manage Featured Modal */}
            {profileUserId && (
                <ManageFeaturedModal
                    isOpen={showFeaturedModal}
                    onClose={() => setShowFeaturedModal(false)}
                    userId={profileUserId}
                    onUpdate={refetch}
                />
            )}

            {/* Edit Post Modal */}
            {editingProject && user && (
                <EditPostModal
                    isOpen={!!editingProject}
                    onClose={() => setEditingProject(null)}
                    project={editingProject}
                    userId={user.uid}
                    onSuccess={(msg) => {
                        setToastMessage(msg);
                        fetchPublishedProjects();
                    }}
                    onUnpublished={() => {
                        fetchPublishedProjects();
                    }}
                />
            )}

            {/* Toast */}
            {toastMessage && (
                <div className="fixed bottom-4 right-4 z-50 px-4 py-3 bg-green-500/90 text-white rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {toastMessage}
                </div>
            )}
        </div>
    );
}

export default Profile;
