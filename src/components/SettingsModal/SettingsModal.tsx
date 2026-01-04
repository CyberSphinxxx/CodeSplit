import { useState, useEffect } from "react";

// Available Monaco Editor themes
export const EDITOR_THEMES = [
    { id: "vs-dark", name: "VS Code Dark", description: "Default dark theme" },
    { id: "vs", name: "VS Code Light", description: "Default light theme" },
    { id: "hc-black", name: "High Contrast", description: "High contrast dark theme" },
    { id: "dracula", name: "Dracula", description: "Popular dark theme with purple accents" },
    { id: "monokai", name: "Monokai", description: "Classic dark theme with vibrant colors" },
    { id: "github-dark", name: "GitHub Dark", description: "GitHub's dark theme" },
] as const;

export type EditorTheme = typeof EDITOR_THEMES[number]["id"];

interface CdnLibrary {
    id: string;
    name: string;
    description: string;
    tags: string[]; // CDN URLs to inject
}

export const CDN_LIBRARIES: CdnLibrary[] = [
    {
        id: "bootstrap",
        name: "Bootstrap 5",
        description: "Popular CSS framework for responsive design",
        tags: [
            '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">',
            '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>',
        ],
    },
    {
        id: "tailwind",
        name: "Tailwind CSS",
        description: "Utility-first CSS framework",
        tags: [
            '<script src="https://cdn.tailwindcss.com"></script>',
        ],
    },
    {
        id: "fontawesome",
        name: "FontAwesome",
        description: "Icon library with thousands of icons",
        tags: [
            '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">',
        ],
    },
    {
        id: "jquery",
        name: "jQuery",
        description: "Fast and feature-rich JavaScript library",
        tags: [
            '<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>',
        ],
    },
];

export interface CdnSettings {
    [key: string]: boolean;
}

export interface EditorSettings {
    showMinimap: boolean;
    wordWrap: boolean;
    theme: EditorTheme;
}

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    cdnSettings: CdnSettings;
    editorSettings: EditorSettings;
    onSave: (cdnSettings: CdnSettings, editorSettings: EditorSettings) => void;
}

function SettingsModal({ isOpen, onClose, cdnSettings, editorSettings, onSave }: SettingsModalProps) {
    const [localCdnSettings, setLocalCdnSettings] = useState<CdnSettings>({ ...cdnSettings });
    const [localEditorSettings, setLocalEditorSettings] = useState<EditorSettings>({ ...editorSettings });

    // Sync local state when modal opens
    useEffect(() => {
        if (isOpen) {
            setLocalCdnSettings({ ...cdnSettings });
            setLocalEditorSettings({ ...editorSettings });
        }
    }, [isOpen, cdnSettings, editorSettings]);

    if (!isOpen) return null;

    const handleCdnToggle = (id: string) => {
        setLocalCdnSettings((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleEditorToggle = (key: "showMinimap" | "wordWrap") => {
        setLocalEditorSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleThemeChange = (themeId: EditorTheme) => {
        setLocalEditorSettings((prev) => ({ ...prev, theme: themeId }));
    };

    const handleSave = () => {
        onSave(localCdnSettings, localEditorSettings);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">Settings</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors text-2xl leading-none"
                    >
                        &times;
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto settings-scrollbar">
                    {/* Editor Settings */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                            Editor
                        </h3>

                        {/* Theme Selector */}
                        <div className="p-4 rounded-xl bg-slate-900/50 setting-card mb-3">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <span className="text-white font-medium">Theme</span>
                                    <p className="text-xs text-slate-400 mt-0.5">Choose editor color scheme</p>
                                </div>
                                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                </svg>
                            </div>
                            <select
                                value={localEditorSettings.theme}
                                onChange={(e) => handleThemeChange(e.target.value as EditorTheme)}
                                className="w-full px-4 py-2.5 rounded-lg text-white text-sm custom-select"
                            >
                                {EDITOR_THEMES.map((theme) => (
                                    <option key={theme.id} value={theme.id}>
                                        {theme.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div
                            className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 setting-card cursor-pointer"
                            onClick={() => handleEditorToggle("showMinimap")}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="text-white font-medium">Minimap</span>
                                    <p className="text-xs text-slate-400 mt-0.5">Show code minimap on the right side</p>
                                </div>
                            </div>
                            <div className={`toggle-switch ${localEditorSettings.showMinimap ? 'active' : ''}`} />
                        </div>

                        <div
                            className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 setting-card cursor-pointer mt-3"
                            onClick={() => handleEditorToggle("wordWrap")}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
                                    </svg>
                                </div>
                                <div>
                                    <span className="text-white font-medium">Word Wrap</span>
                                    <p className="text-xs text-slate-400 mt-0.5">Wrap long lines to fit editor width</p>
                                </div>
                            </div>
                            <div className={`toggle-switch ${localEditorSettings.wordWrap ? 'active' : ''}`} />
                        </div>
                    </div>

                    {/* CDN Libraries */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                            CDN Libraries
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">
                            Enable libraries to automatically inject them into your preview.
                        </p>

                        <div className="space-y-3">
                            {CDN_LIBRARIES.map((lib) => (
                                <div
                                    key={lib.id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 setting-card cursor-pointer"
                                    onClick={() => handleCdnToggle(lib.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="text-white font-medium">{lib.name}</span>
                                            <p className="text-xs text-slate-400 mt-0.5">{lib.description}</p>
                                        </div>
                                    </div>
                                    <div className={`toggle-switch ${localCdnSettings[lib.id] ? 'active' : ''}`} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-700 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SettingsModal;
