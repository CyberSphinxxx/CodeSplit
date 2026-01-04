import { useRef, useEffect } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { emmetHTML, emmetCSS } from "emmet-monaco-es";
import type * as Monaco from "monaco-editor";

interface CodeEditorProps {
    value: string;
    language: string;
    onChange: (value: string | undefined) => void;
    showMinimap?: boolean;
    wordWrap?: boolean;
    theme?: string;
    onSave?: () => void;
}

function CodeEditor({
    value,
    language,
    onChange,
    showMinimap = true,
    wordWrap = true,
    theme = "vs-dark",
    onSave,
}: CodeEditorProps) {
    const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
    const disposeEmmetRef = useRef<(() => void) | null>(null);

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
