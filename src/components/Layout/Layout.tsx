import { useRef, useState, useCallback, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import Header from "../Header/Header";
import MainContent from "../MainContent/MainContent";
import Footer from "../Footer/Footer";
import Dashboard from "../Dashboard/Dashboard";
import type { MainContentRef } from "../MainContent/MainContent";
import type { Project } from "../../services/projectService";
import { renameProject, getProjectById } from "../../services/projectService";
import { useAuth } from "../../context/AuthContext";



interface LayoutProps {
    showDashboardOnMount?: boolean;
}

function Layout({ showDashboardOnMount = false }: LayoutProps) {
    const { id: projectId } = useParams<{ id?: string }>();
    const location = useLocation();
    const mainContentRef = useRef<MainContentRef>(null);
    const [isZenMode, setIsZenMode] = useState(false);
    const [isSaving] = useState(false);
    const [showDashboard, setShowDashboard] = useState(showDashboardOnMount);
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
    const [currentProjectTitle, setCurrentProjectTitle] = useState("Untitled Project");
    const [projectLoaded, setProjectLoaded] = useState(false);
    const { user } = useAuth();

    // Load project from navigation state or fetch from database
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
                setProjectLoaded(true);
            } else {
                // No state available (direct URL access or forked template) - fetch from database
                console.log("No project state, fetching from database...");
                try {
                    const fetchedProject = await getProjectById(projectId);
                    if (fetchedProject) {
                        console.log("Loaded project from database:", fetchedProject.title);
                        setCurrentProjectId(fetchedProject.id);
                        setCurrentProjectTitle(fetchedProject.title || "Untitled Project");

                        // Also load the content into the editor
                        if (mainContentRef.current) {
                            mainContentRef.current.loadProject(
                                fetchedProject.html,
                                fetchedProject.css,
                                fetchedProject.js
                            );
                        }
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

    // Load project content into editor once ref is ready
    useEffect(() => {
        const loadContent = () => {
            if (!projectId || !mainContentRef.current || !projectLoaded) return;

            // Get project from navigation state
            const state = location.state as { project?: Project } | null;
            const project = state?.project;

            if (project) {
                console.log("Loading project content:", project.title);
                mainContentRef.current.loadProject(project.html, project.css, project.js);
            }
        };

        // Small delay to ensure ref is ready after mount
        const timer = setTimeout(loadContent, 100);
        return () => clearTimeout(timer);
    }, [projectId, projectLoaded, location.state]);

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
                    isSaving={isSaving}
                    isSaved={!isSaving}
                    projectTitle={currentProjectTitle}
                    onProjectTitleChange={handleTitleChange}
                    isDashboardView={showDashboard}
                />
            </div>

            {/* Main Editor Content */}
            <div className={`flex-1 overflow-hidden relative flex flex-col ${showDashboard && user ? 'hidden' : 'flex'}`}>
                <MainContent ref={mainContentRef} isZenMode={isZenMode} />
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
        </div>
    );
}

export default Layout;
