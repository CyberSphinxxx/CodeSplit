import { useRef, useState, useCallback, useEffect, lazy, Suspense } from "react";
import { useParams, useLocation } from "react-router-dom";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Dashboard from "../Dashboard/Dashboard";
import PublishModal from "../PublishModal/PublishModal";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import type { MainContentRef } from "../MainContent/MainContent";
import type { Project } from "../../services/projectService";
import { renameProject, getProjectById, saveProject } from "../../services/projectService";
import { useAuth } from "../../context/AuthContext";

// Lazy load MainContent to reduce initial bundle size
// This separates Monaco Editor (~1.2MB) into a separate chunk
const MainContent = lazy(() => import("../MainContent/MainContent"));



interface LayoutProps {
    showDashboardOnMount?: boolean;
}

function Layout({ showDashboardOnMount = false }: LayoutProps) {
    const { id: projectId } = useParams<{ id?: string }>();
    const location = useLocation();
    const mainContentRef = useRef<MainContentRef>(null);
    const [isZenMode, setIsZenMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showDashboard, setShowDashboard] = useState(showDashboardOnMount);
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
    const [currentProjectTitle, setCurrentProjectTitle] = useState("Untitled Project");
    const [projectLoaded, setProjectLoaded] = useState(false);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [currentHtml, setCurrentHtml] = useState("");
    const [currentCss, setCurrentCss] = useState("");
    const { user } = useAuth();

    // Publish modal state
    const [publishMetadata, setPublishMetadata] = useState<{
        isPublic: boolean;
        description: string;
        tags: string[];
    }>({ isPublic: false, description: "", tags: [] });

    // Load project from navigation state or fetch from database
    const [fetchedProject, setFetchedProject] = useState<Project | null>(null);

    useEffect(() => {
        const loadProject = async () => {
            if (!projectId) {
                setCurrentProjectTitle("Untitled Project");
                setProjectLoaded(true);
                return;
            }

            // Get project from navigation state
            const state = location.state as { project?: Project } | null;
            const project = state?.project;

            if (project) {
                console.log("Loading project from state:", project.title);
                setCurrentProjectId(project.id);
                setCurrentProjectTitle(project.title || "Untitled Project");
                setFetchedProject(project); // Store for loading into editor
                setProjectLoaded(true);
            } else {
                // No state available (direct URL access or forked template) - fetch from database
                console.log("No project state, fetching from database...");
                try {
                    const dbProject = await getProjectById(projectId);
                    if (dbProject) {
                        console.log("Loaded project from database:", dbProject.title);
                        setCurrentProjectId(dbProject.id);
                        setCurrentProjectTitle(dbProject.title || "Untitled Project");
                        setFetchedProject(dbProject); // Store for loading into editor
                    } else {
                        console.log("Project not found in database");
                        setCurrentProjectTitle("Untitled Project");
                    }
                } catch (error) {
                    console.error("Error fetching project:", error);
                    setCurrentProjectTitle("Untitled Project");
                }
                setProjectLoaded(true);
            }
        };

        loadProject();
    }, [projectId, location.state]);

    // Load project content into editor once ref is ready and project is fetched
    useEffect(() => {
        if (!fetchedProject || !mainContentRef.current || !projectLoaded) return;

        console.log("Loading project content into editor:", fetchedProject.title);
        mainContentRef.current.loadProject(
            fetchedProject.html,
            fetchedProject.css,
            fetchedProject.js
        );

        // Clear fetchedProject after loading to prevent re-triggering
        setFetchedProject(null);
    }, [fetchedProject, projectLoaded]);

    // Handle title change - save to database
    const handleTitleChange = useCallback(async (newTitle: string) => {
        setCurrentProjectTitle(newTitle);

        // Save to database if we have a project ID
        if (currentProjectId && newTitle !== currentProjectTitle) {
            try {
                await renameProject(currentProjectId, newTitle);
                console.log("Project title saved:", newTitle);
            } catch (error) {
                console.error("Error saving project title:", error);
            }
        }
    }, [currentProjectId, currentProjectTitle]);

    const handleFormat = () => {
        mainContentRef.current?.formatCode();
    };

    const handleSettings = () => {
        mainContentRef.current?.openSettings();
    };
    const handleDownload = () => {
        mainContentRef.current?.downloadProject();
    };

    const handleExportHTML = () => {
        mainContentRef.current?.exportHTML();
    };

    const handleShare = () => {
        mainContentRef.current?.shareCode();
    };

    const handlePublish = async () => {
        // Get current code from editor
        if (mainContentRef.current && currentProjectId) {
            const data = mainContentRef.current.getProjectData();
            setCurrentHtml(data.html || "");
            setCurrentCss(data.css || "");

            // AUTO-SAVE: Save project content to database before opening publish modal
            try {
                await saveProject(user?.uid || "", {
                    id: currentProjectId,
                    title: currentProjectTitle,
                    html: data.html,
                    css: data.css,
                    js: data.js
                });
                console.log("Auto-saved project before publish");

                // Fetch latest project data to check if already public
                const project = await getProjectById(currentProjectId);
                if (project) {
                    setPublishMetadata({
                        isPublic: !!project.isPublic,
                        description: project.description || "",
                        tags: project.tags || []
                    });
                }
            } catch (error) {
                console.error("Failed to auto-save project:", error);
                // Reset metadata on error
                setPublishMetadata({ isPublic: false, description: "", tags: [] });
            }
        }
        // Open modal after metadata is set
        setIsPublishModalOpen(true);
    };

    const toggleZenMode = () => {
        setIsZenMode(!isZenMode);
    };



    const handleOpenProject = useCallback((project: Project) => {
        if (mainContentRef.current) {
            mainContentRef.current.loadProject(project.html, project.css, project.js);
            setCurrentProjectId(project.id);
            setCurrentProjectTitle(project.title);
            setShowDashboard(false);
        }
    }, []);

    const handleCreateNew = useCallback(() => {
        if (mainContentRef.current) {
            mainContentRef.current.loadProject(
                `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
</body>
</html>`,
                `body {
    font-family: 'Segoe UI', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

h1 {
    color: white;
    text-align: center;
}`,
                `console.log('Hello, World!');`
            );
        }
        setCurrentProjectId(null);
        setCurrentProjectTitle("Untitled Project");
        setShowDashboard(false);
    }, []);

    // Handle code changes from editor - auto-save to database
    const handleCodeChange = useCallback(async (data: { html: string; css: string; js: string }) => {
        if (!currentProjectId || !user) return;

        try {
            await saveProject(user.uid, {
                id: currentProjectId,
                title: currentProjectTitle,
                html: data.html,
                css: data.css,
                js: data.js
            });
            console.log("Auto-saved to database");
        } catch (error) {
            console.error("Auto-save failed:", error);
        }
    }, [currentProjectId, currentProjectTitle, user]);

    // Handle manual save - saves to database immediately
    const handleSave = useCallback(async () => {
        if (!currentProjectId || !user || !mainContentRef.current) return;

        setIsSaving(true);
        try {
            const data = mainContentRef.current.getProjectData();
            await saveProject(user.uid, {
                id: currentProjectId,
                title: currentProjectTitle,
                html: data.html,
                css: data.css,
                js: data.js
            });
            console.log("Manually saved to database");
        } catch (error) {
            console.error("Manual save failed:", error);
        } finally {
            setIsSaving(false);
        }
    }, [currentProjectId, currentProjectTitle, user]);

    // Ctrl+S keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSave]);

    return (
        <div className="min-h-screen h-screen flex flex-col bg-slate-900 text-slate-100 overflow-hidden relative">
            {/* Header - slides up when in Zen Mode */}
            <div
                className={`transition-all duration-300 ease-in-out ${isZenMode ? '-translate-y-full h-0 opacity-0' : 'translate-y-0 opacity-100'
                    }`}
            >
                <Header
                    onDownload={handleDownload}
                    onExportHTML={handleExportHTML}
                    onShare={handleShare}
                    onPublish={handlePublish}
                    onSave={currentProjectId && user ? handleSave : undefined}
                    isSaving={isSaving}
                    isSaved={!isSaving}
                    projectTitle={currentProjectTitle}
                    onProjectTitleChange={handleTitleChange}
                    isDashboardView={showDashboard}
                />
            </div>

            {/* Main Editor Content */}
            <div className={`flex-1 overflow-hidden relative flex flex-col ${showDashboard && user ? 'hidden' : 'flex'}`}>
                <Suspense fallback={<LoadingSpinner />}>
                    <MainContent
                        ref={mainContentRef}
                        isZenMode={isZenMode}
                        onCodeChange={currentProjectId && user ? handleCodeChange : undefined}
                    />
                </Suspense>
            </div>


            {/* Dashboard View - Overlay */}
            {showDashboard && user && (
                <div className="absolute inset-0 top-[48px] z-50 bg-slate-900 overflow-y-auto settings-scrollbar animate-in fade-in duration-200">
                    <Dashboard
                        onOpenProject={handleOpenProject}
                        onCreateNew={handleCreateNew}
                    />
                </div>
            )}

            {/* Footer - slides down when in Zen Mode */}
            <div
                className={`transition-all duration-300 ease-in-out ${isZenMode ? 'translate-y-full h-0 opacity-0' : 'translate-y-0 opacity-100'
                    }`}
            >
                <Footer
                    onZenMode={toggleZenMode}
                    onFormat={handleFormat}
                    onSettings={handleSettings}
                    isZenMode={isZenMode}
                />
            </div>

            {/* Floating Exit Zen Mode Button */}
            {isZenMode && (
                <button
                    onClick={toggleZenMode}
                    className="fixed bottom-4 right-4 z-[9999] px-4 py-2 bg-slate-800/90 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-300 hover:text-white shadow-2xl backdrop-blur-sm transition-all duration-300 flex items-center gap-2 animate-fade-in"
                    title="Exit Zen Mode (Press Escape)"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Exit Zen Mode
                </button>
            )}

            {/* Publish Modal */}
            {currentProjectId && user && (
                <PublishModal
                    isOpen={isPublishModalOpen}
                    onClose={() => setIsPublishModalOpen(false)}
                    projectId={currentProjectId}
                    projectTitle={currentProjectTitle}
                    projectHtml={currentHtml}
                    projectCss={currentCss}
                    userId={user.uid}
                    onSuccess={() => setIsPublishModalOpen(false)}
                    onTitleChange={setCurrentProjectTitle}
                    isPublic={publishMetadata.isPublic}
                    initialDescription={publishMetadata.description}
                    initialTags={publishMetadata.tags}
                />
            )}
        </div>
    );
}

export default Layout;
