import { useState, useRef, useEffect } from "react";

interface PreviewProps {
    srcDoc: string;
    onRefresh?: () => void;
    onToggleVisibility?: () => void;
}

type DeviceMode = "desktop" | "tablet" | "mobile";

const DEVICE_SIZES: Record<DeviceMode, { width: string; label: string }> = {
    desktop: { width: "100%", label: "Desktop" },
    tablet: { width: "768px", label: "Tablet" },
    mobile: { width: "375px", label: "Mobile" },
};

function Preview({ srcDoc, onRefresh, onToggleVisibility }: PreviewProps) {
    const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
    const popoutWindowRef = useRef<Window | null>(null);

    const isSimulated = deviceMode !== "desktop";

    // Update pop-out window when srcDoc changes
    useEffect(() => {
        if (popoutWindowRef.current && !popoutWindowRef.current.closed) {
            popoutWindowRef.current.document.open();
            popoutWindowRef.current.document.write(srcDoc);
            popoutWindowRef.current.document.close();
        }
    }, [srcDoc]);

    return (
        <div className="flex-1 min-h-[300px] lg:min-h-0 bg-slate-800 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700 select-none flex-shrink-0">
                <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-slate-400 mr-3">Preview</span>

                    {/* Device Buttons */}
                    <div className="flex items-center bg-slate-900 rounded-lg p-0.5">
                        {/* Desktop */}
                        <button
                            onClick={() => setDeviceMode("desktop")}
                            className={`p-1.5 rounded-md transition-colors ${deviceMode === "desktop"
                                ? "bg-blue-600 text-white"
                                : "text-slate-400 hover:text-white hover:bg-slate-700"
                                }`}
                            title="Desktop (100%)"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </button>

                        {/* Tablet */}
                        <button
                            onClick={() => setDeviceMode("tablet")}
                            className={`p-1.5 rounded-md transition-colors ${deviceMode === "tablet"
                                ? "bg-blue-600 text-white"
                                : "text-slate-400 hover:text-white hover:bg-slate-700"
                                }`}
                            title="Tablet (768px)"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </button>

                        {/* Mobile */}
                        <button
                            onClick={() => setDeviceMode("mobile")}
                            className={`p-1.5 rounded-md transition-colors ${deviceMode === "mobile"
                                ? "bg-blue-600 text-white"
                                : "text-slate-400 hover:text-white hover:bg-slate-700"
                                }`}
                            title="Mobile (375px)"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </div>

                    {isSimulated && (
                        <span className="ml-2 text-xs text-slate-500">
                            {DEVICE_SIZES[deviceMode].width}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Pop Out Button */}
                    <button
                        onClick={() => {
                            // Close existing popout if open
                            if (popoutWindowRef.current && !popoutWindowRef.current.closed) {
                                popoutWindowRef.current.focus();
                                return;
                            }
                            const newWindow = window.open("", "_blank");
                            if (newWindow) {
                                newWindow.document.write(srcDoc);
                                newWindow.document.close();
                                popoutWindowRef.current = newWindow;
                            }
                        }}
                        className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
                        title="Open in new tab (live updates)"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Pop Out
                    </button>
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            ⟳ Refresh
                        </button>
                    )}
                    {onToggleVisibility && (
                        <button
                            onClick={onToggleVisibility}
                            className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
                            title="Hide Preview"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                            Hide
                        </button>
                    )}
                </div>
            </div>

            {/* Preview Container */}
            <div className={`flex-1 overflow-auto ${isSimulated ? 'bg-slate-900 p-4' : ''}`}>
                <div
                    className={`
            h-full mx-auto transition-all duration-300 ease-out
            ${isSimulated ? 'rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700' : ''}
          `}
                    style={{
                        width: DEVICE_SIZES[deviceMode].width,
                        maxWidth: "100%"
                    }}
                >
                    {/* Device Frame Notch (for mobile) */}
                    {deviceMode === "mobile" && (
                        <div className="bg-slate-700 h-6 flex items-center justify-center">
                            <div className="w-20 h-4 bg-slate-800 rounded-full" />
                        </div>
                    )}

                    {/* Iframe */}
                    <div className={`bg-white ${deviceMode === "mobile" ? "h-[calc(100%-24px)]" : "h-full"}`}>
                        <iframe
                            title="Preview"
                            srcDoc={srcDoc}
                            sandbox="allow-scripts"
                            className="w-full h-full border-0"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Preview;
