import { memo } from 'react';

/**
 * LoadingSpinner Component
 * 
 * Displays a centered, animated loading spinner while lazy-loaded route chunks download.
 * Used as the fallback component in React Suspense for code-split routes.
 */
function LoadingSpinner() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="flex flex-col items-center gap-4">
                {/* Spinner Animation */}
                <div className="relative w-16 h-16">
                    {/* Outer ring */}
                    <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                    {/* Spinning gradient ring */}
                    <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 border-r-purple-400 rounded-full animate-spin"></div>
                </div>

                {/* Loading text with pulse animation */}
                <p className="text-slate-400 text-sm font-medium animate-pulse">
                    Loading...
                </p>
            </div>
        </div>
    );
}

export default memo(LoadingSpinner);
