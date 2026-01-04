import { useState, useCallback, useEffect } from "react";

/**
 * Hook for managing vertically resizable drawers rooted at the bottom of the screen.
 * @param initialHeight - Initial height in pixels (default: 192 - equivalent to h-48)
 * @param minHeight - Minimum height in pixels (default: 48)
 * @param maxHeight - Maximum height in pixels (default: 800)
 */
export function useVerticalResizable(
    initialHeight: number = 192,
    minHeight: number = 48,
    maxHeight: number = 800
) {
    const [height, setHeight] = useState(initialHeight);
    const [isResizing, setIsResizing] = useState(false);

    const startResizing = useCallback(() => {
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback(
        (event: MouseEvent) => {
            if (isResizing) {
                // Since it's a bottom drawer, height is distance from bottom
                const newHeight = window.innerHeight - event.clientY;
                if (newHeight >= minHeight && newHeight <= maxHeight) {
                    setHeight(newHeight);
                }
            }
        },
        [isResizing, minHeight, maxHeight]
    );

    useEffect(() => {
        if (isResizing) {
            window.addEventListener("mousemove", resize);
            window.addEventListener("mouseup", stopResizing);
            // Prevent text selection while resizing
            document.body.style.cursor = "row-resize";
            document.body.style.userSelect = "none";
        } else {
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        }

        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };
    }, [isResizing, resize, stopResizing]);

    return { height, startResizing, isResizing };
}
