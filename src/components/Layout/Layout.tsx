import { useRef, useState } from "react";
import Header from "../Header/Header";
import MainContent from "../MainContent/MainContent";
import Footer from "../Footer/Footer";
import type { MainContentRef } from "../MainContent/MainContent";

function Layout() {
    const mainContentRef = useRef<MainContentRef>(null);
    const [isZenMode, setIsZenMode] = useState(false);

    const handleFormat = () => {
        mainContentRef.current?.formatCode();
    };

    const handleSettingsOpen = () => {
        mainContentRef.current?.openSettings();
    };

    const handleDownload = () => {
        mainContentRef.current?.downloadProject();
    };

    const handleShare = () => {
        mainContentRef.current?.shareCode();
    };

    const toggleZenMode = () => {
        setIsZenMode(!isZenMode);
    };

    return (
        <div className="min-h-screen h-screen flex flex-col bg-slate-900 text-slate-100 overflow-hidden">
            {/* Header - slides up when in Zen Mode */}
            <div
                className={`transition-all duration-300 ease-in-out ${isZenMode ? '-translate-y-full h-0 opacity-0' : 'translate-y-0 opacity-100'
                    }`}
            >
                <Header
                    onFormat={handleFormat}
                    onSettingsOpen={handleSettingsOpen}
                    onDownload={handleDownload}
                    onShare={handleShare}
                    onZenMode={toggleZenMode}
                    isZenMode={isZenMode}
                />
            </div>

            <MainContent ref={mainContentRef} isZenMode={isZenMode} />

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
