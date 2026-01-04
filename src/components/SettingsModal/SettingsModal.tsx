import { useState, useEffect } from "react";

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

    const handleEditorToggle = (key: keyof EditorSettings) => {
        setLocalEditorSettings((prev) => ({ ...prev, [key]: !prev[key] }));
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
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                    {/* Editor Settings */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                            Editor
                        </h3>
                        <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 hover:bg-slate-700/50 cursor-pointer transition-colors border border-slate-700/50">
                            <div>
                                <span className="text-white font-medium">Minimap</span>
                                <p className="text-xs text-slate-400">Show code minimap on the right side</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={localEditorSettings.showMinimap}
                                onChange={() => handleEditorToggle("showMinimap")}
                                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800"
                            />
                        </label>
                        <label className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 hover:bg-slate-700/50 cursor-pointer transition-colors border border-slate-700/50 mt-3">
                            <div>
                                <span className="text-white font-medium">Word Wrap</span>
                                <p className="text-xs text-slate-400">Wrap long lines to fit editor width</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={localEditorSettings.wordWrap}
                                onChange={() => handleEditorToggle("wordWrap")}
                                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800"
                            />
                        </label>
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
                                <label
                                    key={lib.id}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50 hover:bg-slate-700/50 cursor-pointer transition-colors border border-slate-700/50"
                                >
                                    <input
                                        type="checkbox"
                                        checked={!!localCdnSettings[lib.id]}
                                        onChange={() => handleCdnToggle(lib.id)}
                                        className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800"
                                    />
                                    <div>
                                        <span className="text-white font-medium">{lib.name}</span>
                                        <p className="text-xs text-slate-400">{lib.description}</p>
                                    </div>
                                </label>
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
