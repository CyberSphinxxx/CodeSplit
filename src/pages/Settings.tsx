import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Code2, Palette, User, Package } from "lucide-react";
import { EDITOR_THEMES, CDN_LIBRARIES } from "../components/SettingsModal/SettingsModal";
import type { EditorTheme, CdnSettings, EditorSettings } from "../components/SettingsModal/SettingsModal";

interface SettingCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    children: React.ReactNode;
}

function SettingCard({ icon, title, description, children }: SettingCardProps) {
    return (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5 hover:bg-slate-800/70 transition-colors">
            <div className="flex items-start gap-4">
                <div className="p-2.5 bg-slate-700/50 rounded-lg text-blue-400">
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white mb-1">{title}</h3>
                    <p className="text-sm text-slate-400 mb-4">{description}</p>
                    {children}
                </div>
            </div>
        </div>
    );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-blue-500" : "bg-slate-600"
                }`}
        >
            <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${checked ? "translate-x-5" : "translate-x-0"
                    }`}
            />
        </button>
    );
}

function Settings() {
    const { user } = useAuth();

    // Editor settings - same as SettingsModal
    const [editorSettings, setEditorSettings] = useState<EditorSettings>({
        showMinimap: false,
        wordWrap: true,
        theme: "vs-dark"
    });

    // CDN settings - same as SettingsModal
    const [cdnSettings, setCdnSettings] = useState<CdnSettings>({
        bootstrap: false,
        tailwind: false,
        fontawesome: false,
        jquery: false
    });

    // Load settings from localStorage (same keys as MainContent)
    useEffect(() => {
        const savedEditorSettings = localStorage.getItem("ice-editor");
        if (savedEditorSettings) {
            try {
                setEditorSettings(JSON.parse(savedEditorSettings));
            } catch (e) {
                console.error("Error parsing editor settings:", e);
            }
        }

        const savedCdnSettings = localStorage.getItem("ice-cdn");
        if (savedCdnSettings) {
            try {
                setCdnSettings(JSON.parse(savedCdnSettings));
            } catch (e) {
                console.error("Error parsing CDN settings:", e);
            }
        }
    }, []);

    // Save editor settings
    const updateEditorSettings = (newSettings: EditorSettings) => {
        setEditorSettings(newSettings);
        localStorage.setItem("ice-editor", JSON.stringify(newSettings));
    };

    // Save CDN settings
    const updateCdnSettings = (newSettings: CdnSettings) => {
        setCdnSettings(newSettings);
        localStorage.setItem("ice-cdn", JSON.stringify(newSettings));
    };

    const handleThemeChange = (themeId: EditorTheme) => {
        updateEditorSettings({ ...editorSettings, theme: themeId });
    };

    const handleEditorToggle = (key: "showMinimap" | "wordWrap") => {
        updateEditorSettings({ ...editorSettings, [key]: !editorSettings[key] });
    };

    const handleCdnToggle = (id: string) => {
        updateCdnSettings({ ...cdnSettings, [id]: !cdnSettings[id] });
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
                <p className="text-slate-400">
                    Customize your CodeSplit experience
                </p>
            </div>

            {/* Profile Section */}
            <div className="mb-8">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Profile</h2>
                <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
                    <div className="flex items-center gap-4">
                        <img
                            src={user?.photoURL || "https://via.placeholder.com/64"}
                            alt={user?.displayName || "User"}
                            className="w-16 h-16 rounded-full border-2 border-slate-600"
                        />
                        <div>
                            <h3 className="text-lg font-semibold text-white">{user?.displayName || "Anonymous"}</h3>
                            <p className="text-slate-400">{user?.email || "No email"}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Editor Section */}
            <div className="mb-8">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Editor</h2>
                <div className="space-y-4">
                    {/* Theme Selector */}
                    <SettingCard
                        icon={<Palette className="w-5 h-5" />}
                        title="Editor Theme"
                        description="Choose your preferred code editor color scheme"
                    >
                        <select
                            value={editorSettings.theme}
                            onChange={(e) => handleThemeChange(e.target.value as EditorTheme)}
                            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all cursor-pointer"
                        >
                            {EDITOR_THEMES.map((theme) => (
                                <option key={theme.id} value={theme.id}>
                                    {theme.name} - {theme.description}
                                </option>
                            ))}
                        </select>
                    </SettingCard>

                    <SettingCard
                        icon={<Code2 className="w-5 h-5" />}
                        title="Minimap"
                        description="Show a minimap of your code on the right side"
                    >
                        <Toggle
                            checked={editorSettings.showMinimap}
                            onChange={() => handleEditorToggle("showMinimap")}
                        />
                    </SettingCard>

                    <SettingCard
                        icon={<Code2 className="w-5 h-5" />}
                        title="Word Wrap"
                        description="Wrap long lines to fit editor width"
                    >
                        <Toggle
                            checked={editorSettings.wordWrap}
                            onChange={() => handleEditorToggle("wordWrap")}
                        />
                    </SettingCard>
                </div>
            </div>

            {/* CDN Libraries Section */}
            <div className="mb-8">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">CDN Libraries</h2>
                <p className="text-sm text-slate-400 mb-4">
                    Enable libraries to automatically inject them into your preview.
                </p>
                <div className="space-y-4">
                    {CDN_LIBRARIES.map((lib) => (
                        <SettingCard
                            key={lib.id}
                            icon={<Package className="w-5 h-5" />}
                            title={lib.name}
                            description={lib.description}
                        >
                            <Toggle
                                checked={cdnSettings[lib.id] || false}
                                onChange={() => handleCdnToggle(lib.id)}
                            />
                        </SettingCard>
                    ))}
                </div>
            </div>

            {/* Account Section */}
            <div className="mb-8">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Account</h2>
                <div className="space-y-4">
                    <SettingCard
                        icon={<User className="w-5 h-5" />}
                        title="Connected Account"
                        description="Your GitHub account is connected"
                    >
                        <div className="flex items-center gap-2 text-sm text-emerald-400">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Connected via GitHub
                        </div>
                    </SettingCard>
                </div>
            </div>
        </div>
    );
}

export default Settings;
