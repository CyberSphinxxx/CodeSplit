import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserProjects } from "../services/projectService";
import { FolderOpen, Zap, Clock } from "lucide-react";
import { Link } from "react-router-dom";

function Overview() {
    const { user } = useAuth();
    const [projectCount, setProjectCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    const firstName = user?.displayName?.split(" ")[0] || "there";

    // Fetch project count
    useEffect(() => {
        const fetchProjectCount = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const projects = await getUserProjects(user.uid);
                setProjectCount(projects.length);
            } catch (error) {
                console.error("Error fetching projects:", error);
                setProjectCount(0);
            } finally {
                setLoading(false);
            }
        };

        fetchProjectCount();
    }, [user]);

    return (
        <div className="max-w-6xl mx-auto">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome back, {firstName}!
                </h1>
                <p className="text-slate-400">
                    Here's what's happening with your projects.
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <StatCard
                    icon={<FolderOpen className="w-5 h-5" />}
                    label="Total Projects"
                    value={loading ? "..." : String(projectCount ?? 0)}
                    subtext="View all projects"
                    href="/dashboard/projects"
                />
                <StatCard
                    icon={<Clock className="w-5 h-5" />}
                    label="Last Activity"
                    value="Just now"
                    subtext="Keep coding!"
                />
                <StatCard
                    icon={<Zap className="w-5 h-5" />}
                    label="Quick Tip"
                    value="Use Zen Mode"
                    subtext="Press the footer button"
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link
                        to="/dashboard/projects"
                        className="flex items-center gap-4 p-4 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                            <FolderOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-medium text-white">Browse Projects</h3>
                            <p className="text-sm text-slate-400">View and manage all projects</p>
                        </div>
                    </Link>

                    <Link
                        to="/editor"
                        className="flex items-center gap-4 p-4 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-medium text-white">New Project</h3>
                            <p className="text-sm text-slate-400">Start from scratch</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    subtext,
    href,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    subtext: string;
    href?: string;
}) {
    const content = (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5 hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-3 mb-3">
                <div className="text-blue-400">{icon}</div>
                <span className="text-sm text-slate-400">{label}</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <p className="text-sm text-slate-500">{subtext}</p>
        </div>
    );

    if (href) {
        return <Link to={href}>{content}</Link>;
    }
    return content;
}

export default Overview;

