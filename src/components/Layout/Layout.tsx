import { useRef, useState, useCallback, useEffect } from "react";
import Header from "../Header/Header";
import MainContent from "../MainContent/MainContent";
import Footer from "../Footer/Footer";
import Dashboard from "../Dashboard/Dashboard";
import type { MainContentRef } from "../MainContent/MainContent";
import type { Project } from "../../services/projectService";
import { saveProject } from "../../services/projectService";
import { useAuth } from "../../context/AuthContext";

// LocalStorage keys used by the editor
const LOCAL_STORAGE_FILES_KEY = "ice-files";

// Default template to compare against
const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Page</title>
</head>
<body>
    <div class="card">
        <h1>Hello, World! 👋</h1>
        <p>Start editing to see your changes live!</p>
        <button onclick="handleClick()">Click Me</button>
    </div>
</body>
</html>`;

interface LocalFileState {
    id: string;
    name: string;
    language: string;
    content: string;
}

function Layout() {
    const mainContentRef = useRef<MainContentRef>(null);
    const [isZenMode, setIsZenMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showDashboard, setShowDashboard] = useState(false);
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
    const [currentProjectTitle, setCurrentProjectTitle] = useState("Untitled Project");
    const [hasClaimedWork, setHasClaimedWork] = useState(false);
    const { user } = useAuth();

    // Detect new login and check for local guest work to claim
    useEffect(() => {
        // Only run when user just logged in and we haven't claimed yet
        if (!user || hasClaimedWork) return;

        const autoClaimLocalWork = async () => {
            try {
                const localData = localStorage.getItem(LOCAL_STORAGE_FILES_KEY);
                if (!localData) {
                    setHasClaimedWork(true);
                    return;
                }

                const localFiles: LocalFileState[] = JSON.parse(localData);
                const htmlFile = localFiles.find(f => f.name === "index.html");

                // Check if the local work is different from the default template
                const hasCustomWork = htmlFile && htmlFile.content.trim() !== DEFAULT_HTML.trim();

                if (hasCustomWork) {
                    setIsSaving(true);
                    console.log("Found guest work, auto-saving to cloud...");

                    const cssFile = localFiles.find(f => f.name === "styles.css");
                    const jsFile = localFiles.find(f => f.name === "script.js");

                    // Auto-save to Firestore (now Realtime DB)
                    // We use a shorter timeout since this is background
                    const savePromise = saveProject(user.uid, {
                        title: "My Claimed Project",
                        html: htmlFile?.content || "",
                        css: cssFile?.content || "",
                        js: jsFile?.content || "",
                    });

                    const savedId = await savePromise;

                    // Clear localStorage after successful cloud save
                    localStorage.removeItem(LOCAL_STORAGE_FILES_KEY);
                    localStorage.removeItem("ice-cdn");
                    localStorage.removeItem("ice-editor");

                    setCurrentProjectId(savedId);
                    setCurrentProjectTitle("My Claimed Project");

                    // Optional: Show a small toast or log here instead of a modal
                    console.log("Guest work successfully saved to cloud!");

                    // If dashboard ends up being shown, we might not want to switch project immediately
                    // But for now, loading it into current context is fine.
                }

                setHasClaimedWork(true);
            } catch (error) {
                console.error("Error auto-claiming local storage:", error);
                // If error, we just mark as claimed so we don't loop, 
                // but user keeps their local data for next try or manual save
                setHasClaimedWork(true);
            } finally {
                setIsSaving(false);
            }
        };

        autoClaimLocalWork();
    }, [user, hasClaimedWork]);

    const handleFormat = () => {
        mainContentRef.current?.formatCode();
    };

    const handleSettingsOpen = () => {
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

    const handleSave = useCallback(async () => {
        if (!user || !mainContentRef.current) return;

        setIsSaving(true);
        try {
            const projectData = mainContentRef.current.getProjectData();
            const savedId = await saveProject(user.uid, {
                id: currentProjectId || undefined,
                title: currentProjectTitle,
                html: projectData.html,
                css: projectData.css,
                js: projectData.js,
            });

            if (!currentProjectId) {
                setCurrentProjectId(savedId);
            }

            console.log("Project saved successfully:", savedId);
        } catch (error) {
            console.error("Failed to save project:", error);
            alert("Failed to save project. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }, [user, currentProjectId, currentProjectTitle]);

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

    const handleDashboard = useCallback(() => {
        setShowDashboard(true);
    }, []);

    return (
        <div className="min-h-screen h-screen flex flex-col bg-slate-900 text-slate-100 overflow-hidden relative">
            {/* Header - slides up when in Zen Mode */}
            <div
                className={`transition-all duration-300 ease-in-out ${isZenMode ? '-translate-y-full h-0 opacity-0' : 'translate-y-0 opacity-100'
                    }`}
            >
                <Header
                    onFormat={handleFormat}
                    onSettingsOpen={handleSettingsOpen}
                    onDownload={handleDownload}
                    onExportHTML={handleExportHTML}
                    onShare={handleShare}
                    onZenMode={toggleZenMode}
                    isZenMode={isZenMode}
                    onSave={handleSave}
                    isSaving={isSaving}
                    onDashboard={user ? handleDashboard : undefined}
                />
            </div>

            {/* Main Editor Content */}
            <div className={`flex-1 overflow-hidden relative flex flex-col ${showDashboard && user ? 'hidden' : 'flex'}`}>
                <MainContent ref={mainContentRef} isZenMode={isZenMode} />
            </div>

            {/* Dashboard View - Overlay */}
            {showDashboard && user && (
                <div className="absolute inset-0 top-[64px] z-50 bg-slate-900 overflow-y-auto settings-scrollbar animate-in fade-in duration-200">
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
                <Footer />
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
