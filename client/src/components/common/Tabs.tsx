interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export const Tabs = ({ tabs, activeTab, onChange }: TabsProps) => {
  return (
    <div className="flex bg-esant-gray-100 rounded-lg p-1">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex-1 px-4 py-2
              text-sm font-medium
              rounded-md
              transition-all duration-150
              ${
                isActive
                  ? 'bg-white text-esant-gray-800 shadow-sm'
                  : 'text-esant-gray-600 hover:text-esant-gray-800'
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
