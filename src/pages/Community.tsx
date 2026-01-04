import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Github, Heart, Users, Sparkles, Loader2, X, Eye, Copy, Flame, Clock, TrendingUp } from "lucide-react";
import { officialTemplates } from "../data/templates";
import type { Template } from "../data/templates";
import { forkTemplate, saveProject } from "../services/projectService";
import { getCommunityProjects, type CommunityProject } from "../services/communityService";
import { useAuth } from "../context/AuthContext";
import CommunityProjectCard from "../components/CommunityProjectCard/CommunityProjectCard";

const COMMUNITY_LINKS = [
    {
        title: "GitHub Repository",
        description: "Star the project, report issues, or contribute code",
        icon: Github,
        href: "https://github.com/CyberSphinxxx/Interactive_Code_Editor",
        color: "from-slate-600 to-slate-800",
    },
    {
        title: "Discussions",
        description: "Join the community discussion, ask questions, share ideas",
        icon: Users,
        href: "https://github.com/CyberSphinxxx/Interactive_Code_Editor/discussions",
        color: "from-blue-600 to-blue-800",
    },
];

type TabType = "discover" | "templates";
type FilterType = "trending" | "newest";

function Community() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>("discover");
    const [activeFilter, setActiveFilter] = useState<FilterType>("trending");
    const [loadingTemplateId, setLoadingTemplateId] = useState<string | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
    const [previewProject, setPreviewProject] = useState<CommunityProject | null>(null);

    // Community projects state
    const [projects, setProjects] = useState<CommunityProject[]>([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);
    const [isForkingProject, setIsForkingProject] = useState(false);

    // Fetch community projects when tab or filter changes
    useEffect(() => {
        if (activeTab === "discover") {
            fetchProjects();
        }
    }, [activeTab, activeFilter]);

    const fetchProjects = async () => {
        setIsLoadingProjects(true);
        try {
            const fetchedProjects = await getCommunityProjects(activeFilter);
            setProjects(fetchedProjects);
        } catch (error) {
            console.error("Failed to fetch community projects:", error);
        } finally {
            setIsLoadingProjects(false);
        }
    };

    const handleUseTemplate = async (templateId: string) => {
        if (!user) {
            return;
        }

        setLoadingTemplateId(templateId);
        try {
            const newProjectId = await forkTemplate(templateId, user.uid);
            setPreviewTemplate(null);
            navigate(`/editor/${newProjectId}`);
        } catch (error) {
            console.error("Failed to fork template:", error);
            setLoadingTemplateId(null);
        }
    };

    const handleForkProject = async (project: CommunityProject) => {
        if (!user) return;

        setIsForkingProject(true);
        try {
            // Create a copy of the project for the current user
            const newProjectId = await saveProject(user.uid, {
                title: `Copy of ${project.title || "Untitled"}`,
                html: project.html || "",
                css: project.css || "",
                js: project.js || "",
            });
            setPreviewProject(null);
            navigate(`/editor/${newProjectId}`);
        } catch (error) {
            console.error("Failed to fork project:", error);
            setIsForkingProject(false);
        }
    };

    const openTemplatePreview = (template: Template) => {
        setPreviewTemplate(template);
        setPreviewProject(null);
    };

    const openProjectPreview = (project: CommunityProject) => {
        setPreviewProject(project);
        setPreviewTemplate(null);
    };

    const closePreview = () => {
        setPreviewTemplate(null);
        setPreviewProject(null);
    };

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">Community</h1>
                <p className="text-slate-400">
                    Discover amazing projects and templates from the community
                </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 mb-6 bg-slate-800/50 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab("discover")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "discover"
                            ? "bg-slate-700 text-white shadow-lg"
                            : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                        }`}
                >
                    <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Discover
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab("templates")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "templates"
                            ? "bg-slate-700 text-white shadow-lg"
                            : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                        }`}
                >
                    <span className="flex items-center gap-2">
                        <Copy className="w-4 h-4" />
                        Templates
                    </span>
                </button>
            </div>

            {/* Discover Tab Content */}
            {activeTab === "discover" && (
                <>
                    {/* Sub-filters */}
                    <div className="flex items-center gap-2 mb-6">
                        <button
                            onClick={() => setActiveFilter("trending")}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${activeFilter === "trending"
                                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                    : "text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600"
                                }`}
                        >
                            <Flame className="w-3.5 h-3.5" />
                            Trending
                        </button>
                        <button
                            onClick={() => setActiveFilter("newest")}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${activeFilter === "newest"
                                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                    : "text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600"
                                }`}
                        >
                            <Clock className="w-3.5 h-3.5" />
                            Newest
                        </button>
                    </div>

                    {/* Projects Grid */}
                    {isLoadingProjects ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...Array(6)].map((_, i) => (
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
                    ) : projects.length === 0 ? (
                        <div className="text-center py-16">
                            <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">No projects yet</h3>
                            <p className="text-slate-400 text-sm">
                                Be the first to publish a project to the community!
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {projects.map((project) => (
                                <CommunityProjectCard
                                    key={project.id}
                                    project={project}
                                    onClick={() => openProjectPreview(project)}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Templates Tab Content */}
            {activeTab === "templates" && (
                <>
                    {/* Community Links */}
                    <div className="mb-10">
                        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Connect</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {COMMUNITY_LINKS.map((link) => (
                                <a
                                    key={link.title}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group bg-slate-800/50 rounded-xl border border-slate-700 p-5 hover:border-slate-600 hover:bg-slate-800 transition-all"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl bg-gradient-to-br ${link.color}`}>
                                            <link.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                                                    {link.title}
                                                </h3>
                                                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                                            </div>
                                            <p className="text-sm text-slate-400 mt-1">{link.description}</p>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Featured Templates */}
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-4 h-4 text-yellow-400" />
                            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Featured Templates</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {officialTemplates.map((template) => (
                                <div
                                    key={template.id}
                                    className="bg-slate-800/50 rounded-xl border border-slate-700 p-5 hover:border-slate-600 hover:bg-slate-800 transition-all group"
                                >
                                    {/* Live Template Preview - Clickable */}
                                    <div
                                        className="h-40 rounded-lg overflow-hidden mb-4 bg-white relative cursor-pointer"
                                        onClick={() => openTemplatePreview(template)}
                                    >
                                        <iframe
                                            srcDoc={`<!DOCTYPE html><html><head><style>html,body{margin:0;overflow:hidden;scrollbar-width:none;-ms-overflow-style:none;}body::-webkit-scrollbar{display:none;}body{transform:scale(0.25);transform-origin:top left;width:400%;height:400%;}${template.css}</style></head><body>${template.html}</body></html>`}
                                            title={`${template.title} Preview`}
                                            className="w-full h-full border-0 pointer-events-none"
                                            sandbox="allow-scripts"
                                            loading="lazy"
                                        />
                                        {/* Preview overlay on hover */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="flex items-center gap-2 text-white text-sm font-medium">
                                                <Eye className="w-4 h-4" />
                                                Click to Preview
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors mb-1">
                                        {template.title}
                                    </h3>
                                    <p className="text-sm text-slate-400 mb-3">{template.description}</p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {template.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openTemplatePreview(template)}
                                            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Preview
                                        </button>
                                        <button
                                            onClick={() => handleUseTemplate(template.id)}
                                            disabled={loadingTemplateId !== null}
                                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            {loadingTemplateId === template.id ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-4 h-4" />
                                                    Use Template
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-slate-500 text-sm mt-4">
                            More templates coming soon!
                        </p>
                    </div>

                    {/* Support Section */}
                    <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl border border-pink-500/20 p-6 text-center">
                        <Heart className="w-8 h-8 text-pink-400 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-white mb-2">Support CodeSplit</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            If you enjoy using CodeSplit, consider starring the repo on GitHub!
                        </p>
                        <a
                            href="https://github.com/CyberSphinxxx/Interactive_Code_Editor"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                        >
                            <Github className="w-4 h-4" />
                            Star on GitHub
                        </a>
                    </div>
                </>
            )}

            {/* Template Preview Modal */}
            {previewTemplate && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={closePreview}
                >
                    <div
                        className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
                            <div>
                                <h2 className="text-lg font-semibold text-white">{previewTemplate.title}</h2>
                                <p className="text-sm text-slate-400">{previewTemplate.description}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex gap-2">
                                    {previewTemplate.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <button
                                    onClick={closePreview}
                                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body - Full Preview */}
                        <div className="flex-1 bg-white overflow-hidden">
                            <iframe
                                srcDoc={`<!DOCTYPE html><html><head><style>html,body{margin:0;scrollbar-width:none;-ms-overflow-style:none;}body::-webkit-scrollbar,::-webkit-scrollbar{display:none;}${previewTemplate.css}</style></head><body>${previewTemplate.html}<script>${previewTemplate.js}</script></body></html>`}
                                title={`${previewTemplate.title} Full Preview`}
                                className="w-full h-full border-0"
                                sandbox="allow-scripts"
                            />
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-700">
                            <button
                                onClick={closePreview}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleUseTemplate(previewTemplate.id)}
                                disabled={loadingTemplateId !== null}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                            >
                                {loadingTemplateId === previewTemplate.id ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        Use Template
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Project Preview Modal */}
            {previewProject && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={closePreview}
                >
                    <div
                        className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
                            <div className="flex items-center gap-3 min-w-0">
                                <img
                                    src={previewProject.ownerPhotoURL || "https://via.placeholder.com/40"}
                                    alt={previewProject.ownerName || "Author"}
                                    className="w-10 h-10 rounded-full border border-slate-600"
                                />
                                <div className="min-w-0">
                                    <h2 className="text-lg font-semibold text-white truncate">
                                        {previewProject.title || "Untitled Project"}
                                    </h2>
                                    <p className="text-sm text-slate-400">
                                        by {previewProject.ownerName || "Anonymous"}
                                        {previewProject.ownerUsername && (
                                            <span className="text-slate-500"> @{previewProject.ownerUsername}</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Stats */}
                                <div className="flex items-center gap-4 text-slate-400">
                                    <div className="flex items-center gap-1.5">
                                        <Heart className="w-4 h-4" />
                                        <span className="text-sm">{previewProject.likes ?? 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Eye className="w-4 h-4" />
                                        <span className="text-sm">{previewProject.views ?? 0}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={closePreview}
                                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Description & Tags */}
                        {(previewProject.description || (previewProject.tags && previewProject.tags.length > 0)) && (
                            <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50">
                                {previewProject.description && (
                                    <p className="text-sm text-slate-300 mb-2">{previewProject.description}</p>
                                )}
                                {previewProject.tags && previewProject.tags.length > 0 && (
                                    <div className="flex gap-2 flex-wrap">
                                        {previewProject.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-1 text-xs bg-slate-700 text-slate-300 rounded"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Modal Body - Full Preview */}
                        <div className="flex-1 bg-white overflow-hidden">
                            <iframe
                                srcDoc={`<!DOCTYPE html><html><head><style>html,body{margin:0;scrollbar-width:none;-ms-overflow-style:none;}body::-webkit-scrollbar,::-webkit-scrollbar{display:none;}${previewProject.css || ""}</style></head><body>${previewProject.html || ""}<script>${previewProject.js || ""}</script></body></html>`}
                                title={`${previewProject.title} Full Preview`}
                                className="w-full h-full border-0"
                                sandbox="allow-scripts"
                            />
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-700">
                            <button
                                onClick={closePreview}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                Close
                            </button>
                            {user && (
                                <button
                                    onClick={() => handleForkProject(previewProject)}
                                    disabled={isForkingProject}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                                >
                                    {isForkingProject ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Forking...
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Fork Project
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Community;
