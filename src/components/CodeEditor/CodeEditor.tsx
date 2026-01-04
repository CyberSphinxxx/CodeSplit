import { useRef, useEffect } from "react";
import Editor, { type OnMount, loader } from "@monaco-editor/react";
import { emmetHTML, emmetCSS } from "emmet-monaco-es";
import type * as Monaco from "monaco-editor";
import type { EditorTheme } from "../SettingsModal/SettingsModal";

// Configure Monaco Editor to load from CDN instead of bundling
// This reduces bundle size from ~1.2MB to ~50KB
loader.config({
    paths: {
        vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs'
    }
});


// Custom theme definitions for Monaco
const CUSTOM_THEMES: Record<string, Monaco.editor.IStandaloneThemeData> = {
    dracula: {
        base: "vs-dark",
        inherit: true,
        rules: [
            { token: "", foreground: "f8f8f2", background: "282a36" },
            { token: "comment", foreground: "6272a4", fontStyle: "italic" },
            { token: "string", foreground: "f1fa8c" },
            { token: "keyword", foreground: "ff79c6" },
            { token: "number", foreground: "bd93f9" },
            { token: "type", foreground: "8be9fd", fontStyle: "italic" },
            { token: "function", foreground: "50fa7b" },
            { token: "variable", foreground: "f8f8f2" },
            { token: "constant", foreground: "bd93f9" },
            { token: "tag", foreground: "ff79c6" },
            { token: "attribute.name", foreground: "50fa7b" },
            { token: "attribute.value", foreground: "f1fa8c" },
        ],
        colors: {
            "editor.background": "#282a36",
            "editor.foreground": "#f8f8f2",
            "editor.lineHighlightBackground": "#44475a",
            "editor.selectionBackground": "#44475a",
            "editorCursor.foreground": "#f8f8f2",
            "editorWhitespace.foreground": "#3B3A32",
            "editorIndentGuide.activeBackground": "#9D550FB0",
            "editor.selectionHighlightBorder": "#222218",
        },
    },
    monokai: {
        base: "vs-dark",
        inherit: true,
        rules: [
            { token: "", foreground: "f8f8f2", background: "272822" },
            { token: "comment", foreground: "75715e", fontStyle: "italic" },
            { token: "string", foreground: "e6db74" },
            { token: "keyword", foreground: "f92672" },
            { token: "number", foreground: "ae81ff" },
            { token: "type", foreground: "66d9ef", fontStyle: "italic" },
            { token: "function", foreground: "a6e22e" },
            { token: "variable", foreground: "f8f8f2" },
            { token: "constant", foreground: "ae81ff" },
            { token: "tag", foreground: "f92672" },
            { token: "attribute.name", foreground: "a6e22e" },
            { token: "attribute.value", foreground: "e6db74" },
        ],
        colors: {
            "editor.background": "#272822",
            "editor.foreground": "#f8f8f2",
            "editor.lineHighlightBackground": "#3e3d32",
            "editor.selectionBackground": "#49483e",
            "editorCursor.foreground": "#f8f8f0",
            "editorWhitespace.foreground": "#3B3A32",
            "editorIndentGuide.activeBackground": "#9D550FB0",
            "editor.selectionHighlightBorder": "#222218",
        },
    },
    "github-dark": {
        base: "vs-dark",
        inherit: true,
        rules: [
            { token: "", foreground: "c9d1d9", background: "0d1117" },
            { token: "comment", foreground: "8b949e", fontStyle: "italic" },
            { token: "string", foreground: "a5d6ff" },
            { token: "keyword", foreground: "ff7b72" },
            { token: "number", foreground: "79c0ff" },
            { token: "type", foreground: "ffa657" },
            { token: "function", foreground: "d2a8ff" },
            { token: "variable", foreground: "c9d1d9" },
            { token: "constant", foreground: "79c0ff" },
            { token: "tag", foreground: "7ee787" },
            { token: "attribute.name", foreground: "79c0ff" },
            { token: "attribute.value", foreground: "a5d6ff" },
        ],
        colors: {
            "editor.background": "#0d1117",
            "editor.foreground": "#c9d1d9",
            "editor.lineHighlightBackground": "#161b22",
            "editor.selectionBackground": "#264f78",
            "editorCursor.foreground": "#c9d1d9",
            "editorWhitespace.foreground": "#484f58",
            "editorIndentGuide.activeBackground": "#30363d",
            "editor.selectionHighlightBorder": "#17191e",
        },
    },
};

interface CodeEditorProps {
    value: string;
    language: string;
    onChange: (value: string | undefined) => void;
    showMinimap?: boolean;
    wordWrap?: boolean;
    theme?: EditorTheme;
    onSave?: () => void;
}

function CodeEditor({
    value,
    language,
    onChange,
    showMinimap = true,
    wordWrap = true,
    theme = "vs-dark",
    onSave
}: CodeEditorProps) {
    const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<typeof Monaco | null>(null);
    const disposeEmmetRef = useRef<(() => void) | null>(null);
    const themesRegistered = useRef(false);

    // Map our language names to Monaco language IDs
    const getMonacoLanguage = (lang: string) => {
        switch (lang) {
            case "html": return "html";
            case "css": return "css";
            case "javascript": return "javascript";
            default: return "html";
        }
    };

    const handleEditorMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        // Register custom themes only once
        if (!themesRegistered.current) {
            Object.entries(CUSTOM_THEMES).forEach(([themeName, themeData]) => {
                monaco.editor.defineTheme(themeName, themeData);
            });
            themesRegistered.current = true;
        }

        // Apply initial theme (for custom themes that need registration first)
        if (CUSTOM_THEMES[theme]) {
            monaco.editor.setTheme(theme);
        }
        // Enable Emmet for HTML and CSS
        try {
            const disposeHtml = emmetHTML(monaco);
            const disposeCss = emmetCSS(monaco);
            disposeEmmetRef.current = () => {
                disposeHtml();
                disposeCss();
            };
        } catch (e) {
            console.warn("Emmet initialization warning:", e);
        }

        // Add Ctrl+S / Cmd+S keyboard shortcut
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            if (onSave) {
                onSave();
            }
        });

        // Enable suggestions/IntelliSense
        editor.updateOptions({
            quickSuggestions: {
                other: true,
                comments: false,
                strings: true,
            },
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: "on",
            tabCompletion: "on",
            wordBasedSuggestions: "currentDocument",
        });
    };

    // Update editor settings dynamically when props change
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.updateOptions({
                minimap: { enabled: showMinimap },
                wordWrap: wordWrap ? "on" : "off"
            });
        }
    }, [showMinimap, wordWrap]);

    // Update theme dynamically
    useEffect(() => {
        if (monacoRef.current) {
            monacoRef.current.editor.setTheme(theme);
        }
    }, [theme]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (disposeEmmetRef.current) {
                disposeEmmetRef.current();
            }
        };
    }, []);

    return (
        <Editor
            height="100%"
            language={getMonacoLanguage(language)}
            theme={theme}
            value={value}
            onChange={onChange}
            onMount={handleEditorMount}
            options={{
                minimap: { enabled: showMinimap },
                fontSize: 14,
                fontFamily: "'Fira Code', 'Consolas', monospace",
                lineNumbers: "on",
                wordWrap: wordWrap ? "on" : "off",
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                renderWhitespace: "selection",
                bracketPairColorization: { enabled: true },
                tabSize: 2,
                // IntelliSense enhancements
                quickSuggestions: {
                    other: true,
                    comments: false,
                    strings: true,
                },
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnEnter: "on",
                tabCompletion: "on",
                wordBasedSuggestions: "currentDocument",
                formatOnPaste: true,
                formatOnType: true,
            }}
        />
    );
}

export default CodeEditor;
