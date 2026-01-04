import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Code2, Zap, Cloud, Users, ArrowRight, Github } from "lucide-react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import ideScreenshot from "../assets/ide-screenshot.png";

function LandingPage() {
    const { user, logInWithGithub, loading } = useAuth();
    const navigate = useNavigate();

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if (user && !loading) {
            navigate("/dashboard");
        }
    }, [user, loading, navigate]);

    const handleGetStarted = async () => {
        try {
            await logInWithGithub();
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 overflow-x-hidden selection:bg-blue-500/30">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="text-white font-bold text-sm">&lt;/&gt;</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">CodeSplit</span>
                    </Link>
                    <button
                        onClick={handleGetStarted}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 hover:border-slate-600 hover:text-white"
                    >
                        <Github className="w-4 h-4" />
                        Sign in
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <main className="relative pt-32 pb-20 px-6">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black z-0" />

                {/* Content */}
                <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center text-center">

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-8 backdrop-blur-sm"
                    >
                        <Zap className="w-4 h-4" />
                        <span className="font-medium">v2.0 Now Available</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl sm:text-7xl font-extrabold mb-8 leading-tight tracking-tight"
                    >
                        Code. Preview.{" "}
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x">
                            Ship.
                        </span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        The lightweight browser IDE for rapid prototyping.
                        Write HTML, CSS, and JS with instant live preview. No setup required.
                    </motion.p>

                    {/* Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center gap-4 mb-20"
                    >
                        <button
                            onClick={handleGetStarted}
                            disabled={loading}
                            className="group relative inline-flex items-center gap-2 px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Launch Editor
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>

                        <a
                            href="https://github.com/CyberSphinxxx/Interactive_Code_Editor"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-slate-300 bg-slate-800/50 border border-slate-700 hover:border-slate-500 hover:text-white rounded-xl transition-all hover:-translate-y-0.5"
                        >
                            <Github className="w-5 h-5" />
                            Star on GitHub
                        </a>
                    </motion.div>

                    {/* Screenshot Hero Image */}
                    <motion.div
                        initial={{ opacity: 0, y: 100, rotateX: 20 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, type: "spring", stiffness: 100 }}
                        style={{ perspective: 1000 }}
                        className="relative w-full max-w-6xl mx-auto"
                    >
                        <motion.div
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="relative rounded-xl overflow-hidden shadow-2xl shadow-blue-500/20 border border-slate-800 bg-slate-900"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 opacity-50" />
                            <img
                                src={ideScreenshot}
                                alt="CodeSplit IDE Interface"
                                className="w-full h-auto object-cover"
                            />

                            {/* Glowing Reflection Effect */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl -z-10" />
                        </motion.div>
                    </motion.div>

                </div>

                {/* Features Grid */}
                <div className="relative z-10 max-w-6xl mx-auto mt-32 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <FeatureCard
                        icon={<Code2 className="w-6 h-6" />}
                        title="Monaco Editor"
                        description="VS Code's powerful editor with syntax highlighting and IntelliSense type checking."
                        delay={0.5}
                    />
                    <FeatureCard
                        icon={<Zap className="w-6 h-6" />}
                        title="Live Preview"
                        description="See your changes instantly as you type with our blazing fast refresh engine."
                        delay={0.6}
                    />
                    <FeatureCard
                        icon={<Cloud className="w-6 h-6" />}
                        title="Cloud Sync"
                        description="Your projects are automatically saved and synced across all your devices."
                        delay={0.7}
                    />
                    <FeatureCard
                        icon={<Users className="w-6 h-6" />}
                        title="Easy Sharing"
                        description="Share your code with a single link."
                        delay={0.8}
                    />
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-slate-800 bg-slate-900/50 backdrop-blur-xl py-12 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold text-xs">&lt;/&gt;</span>
                        </div>
                        <span className="font-semibold text-slate-400">CodeSplit</span>
                    </div>
                    <span>© 2024 CodeSplit. Open Source.</span>
                    <div className="flex items-center gap-6">
                        <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
                        <a
                            href="https://github.com/CyberSphinxxx/Interactive_Code_Editor"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-slate-300 transition-colors flex items-center gap-2"
                        >
                            <Github className="w-4 h-4" />
                            GitHub
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Feature Card Component with Animation
function FeatureCard({
    icon,
    title,
    description,
    delay = 0,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="p-8 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 hover:border-slate-600 transition-all group"
        >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-100">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
        </motion.div>
    );
}

export default LandingPage;
