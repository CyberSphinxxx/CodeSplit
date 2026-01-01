import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, loading } = useAuth();

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <span className="text-slate-400 text-sm">Loading...</span>
                </div>
            </div>
        );
    }

    // Redirect to landing page if not authenticated
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // Render protected content
    return <>{children}</>;
}

export default ProtectedRoute;
