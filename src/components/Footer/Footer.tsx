function Footer() {
    return (
        <footer className="flex-shrink-0 bg-slate-800 border-t border-slate-700 px-4 py-2 select-none">
            <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                    <span>CodeSplit</span>
                    <span className="text-slate-600">•</span>
                    <span>Built with React + Monaco</span>
                </div>
                <div className="flex items-center gap-3">
                    <a
                        href="https://github.com/CyberSphinxxx/Interactive_Code_Editor"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-slate-300 transition-colors"
                    >
                        GitHub
                    </a>
                    <span className="text-slate-600">|</span>
                    <span>© 2024</span>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
