import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Github, Heart, Users, Sparkles, Loader2, X, Eye, Copy } from "lucide-react";
import { officialTemplates } from "../data/templates";
import type { Template } from "../data/templates";
import { forkTemplate } from "../services/projectService";
import { useAuth } from "../context/AuthContext";

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

function Community() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loadingTemplateId, setLoadingTemplateId] = useState<string | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

    const handleUseTemplate = async (templateId: string) => {
        if (!user) {
            return;
        }

        setLoadingTemplateId(templateId);
        try {
            const newProjectId = await forkTemplate(templateId, user.uid);
            setPreviewTemplate(null); // Close modal if open
            navigate(`/editor/${newProjectId}`);
        } catch (error) {
            console.error("Failed to fork template:", error);
            setLoadingTemplateId(null);
        }
    };

    const openPreview = (template: Template) => {
        setPreviewTemplate(template);
    };

    const closePreview = () => {
        setPreviewTemplate(null);
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Community</h1>
                <p className="text-slate-400">
                    Connect with other developers and explore templates
                </p>
            </div>

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
                                onClick={() => openPreview(template)}
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
                                    onClick={() => openPreview(template)}
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

            {/* Preview Modal */}
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
        </div>
    );
}

export default Community;
