interface Tab {
    id: string;
    name: string;
    language: string;
}

interface TabBarProps {
    tabs: Tab[];
    activeTabId: string;
    onTabClick: (id: string) => void;
}

function TabBar({ tabs, activeTabId, onTabClick }: TabBarProps) {
    return (
        <div className="flex items-center bg-slate-800 border-b border-slate-700 overflow-x-auto flex-shrink-0 min-h-[40px] select-none">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabClick(tab.id)}
                    className={`
            px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-r border-slate-700 min-w-[80px] sm:min-w-[100px] text-left transition-colors whitespace-nowrap flex-shrink-0
            ${activeTabId === tab.id
                            ? "bg-slate-800 text-blue-400 border-t-2 border-t-blue-500"
                            : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-t-2 border-t-transparent"
                        }
          `}
                >
                    <div className="flex items-center gap-1 sm:gap-2">
                        <span className="text-[10px] sm:text-xs opacity-50">
                            {tab.language === "html" && "HTML"}
                            {tab.language === "css" && "#"}
                            {tab.language === "javascript" && "JS"}
                        </span>
                        <span className="truncate">{tab.name}</span>
                    </div>
                </button>
            ))}
        </div>
    );
}

export default TabBar;
