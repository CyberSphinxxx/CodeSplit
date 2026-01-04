import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Home, FolderOpen, Globe, Settings, ChevronLeft, ChevronRight, LogOut, User } from "lucide-react";

// Grouped navigation structure
const NAV_SECTIONS = [
    {
        label: "Workspace",
        items: [
            { to: "/dashboard", label: "Overview", icon: Home, end: true },
            { to: "/dashboard/projects", label: "All Projects", icon: FolderOpen },
        ]
    },
    {
        label: "Explore",
        items: [
            { to: "/dashboard/community", label: "Community", icon: Globe },
        ]
    },
    {
        label: "Account",
        items: [
            { to: "/dashboard/profile", label: "Profile", icon: User },
            { to: "/dashboard/settings", label: "Settings", icon: Settings },
        ]
    }
];

function DashboardLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { user, logOut } = useAuth();
    const location = useLocation();

    // Generate breadcrumbs from pathname
    const getBreadcrumbs = () => {
        const paths = location.pathname.split("/").filter(Boolean);
        return paths.map((path, index) => ({
            label: path.charAt(0).toUpperCase() + path.slice(1),
            isLast: index === paths.length - 1,
        }));
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <div className="min-h-screen flex bg-gray-900">
            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-full bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 z-40 ${isCollapsed ? "w-16" : "w-60"
                    }`}
            >
                {/* Logo */}
                <div className={`h-14 flex items-center border-b border-slate-800 ${isCollapsed ? "justify-center px-2" : "px-4"}`}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">&lt;/&gt;</span>
                    </div>
                    {!isCollapsed && (
                        <span className="ml-3 text-lg font-bold text-white tracking-tight">CodeSplit</span>
                    )}
                </div>

                {/* Navigation */}
                <nav className={`flex-1 py-4 px-2 overflow-y-auto ${isCollapsed ? 'scrollbar-none' : 'settings-scrollbar'}`}>
                    {NAV_SECTIONS.map((section, sectionIndex) => (
                        <div key={section.label} className={sectionIndex > 0 ? "mt-6" : ""}>
                            {/* Section Label */}
                            {!isCollapsed && (
                                <div className="px-3 mb-2">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        {section.label}
                                    </span>
                                </div>
                            )}
                            {isCollapsed && sectionIndex > 0 && (
                                <div className="mx-2 mb-2 border-t border-slate-700/50" />
                            )}

                            {/* Section Items */}
                            <div className="space-y-1">
                                {section.items.map((item) => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        end={item.end}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative ${isActive
                                                ? "bg-slate-700/50 text-white"
                                                : "text-slate-400 hover:text-white hover:bg-slate-800"
                                            } ${isCollapsed ? "justify-center" : ""}`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                {isActive && (
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-r" />
                                                )}
                                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                                {!isCollapsed && (
                                                    <span className="text-sm font-medium">{item.label}</span>
                                                )}
                                                {isCollapsed && (
                                                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                                                        {item.label}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Collapse Toggle */}
                <div className="p-2 border-t border-slate-800">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="w-5 h-5" />
                        ) : (
                            <>
                                <ChevronLeft className="w-5 h-5" />
                                <span className="text-sm">Collapse</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Area */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? "ml-16" : "ml-60"}`}>
                {/* Top Header */}
                <header className="sticky top-0 z-30 h-14 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-sm">
                        {breadcrumbs.map((crumb, index) => (
                            <span key={index} className="flex items-center gap-2">
                                {index > 0 && <span className="text-slate-600">/</span>}
                                <span className={crumb.isLast ? "text-white font-medium" : "text-slate-400"}>
                                    {crumb.label}
                                </span>
                            </span>
                        ))}
                    </nav>

                    {/* User Section */}
                    <div className="flex items-center gap-3">
                        {user && (
                            <div className="flex items-center gap-3">
                                <img
                                    src={user.photoURL || "https://via.placeholder.com/32"}
                                    alt={user.displayName || "User"}
                                    className="w-8 h-8 rounded-full border border-slate-700"
                                />
                                <button
                                    onClick={logOut}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;
