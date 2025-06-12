import React, { ReactNode, useState } from "react";

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
  badge?: number;
}

interface TabsWrapperProps {
  tabs: Tab[];
  defaultTabId?: string;
  className?: string;
  cardClassName?: string;
  tabsClassName?: string;
  tabsType?: "boxed" | "bordered" | "lifted";
}

const TabsWrapper: React.FC<TabsWrapperProps> = ({
  tabs,
  defaultTabId,
  className = "",
  cardClassName = "",
  tabsClassName = "",
  tabsType = "boxed",
}) => {
  const [activeTab, setActiveTab] = useState(defaultTabId || tabs[0]?.id);

  return (
    <div className={` ${className} ${cardClassName}`}>
      <div className={`tabs tabs-${tabsType} ${tabsClassName}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? "tab-active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span className="badge badge-primary ml-2">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>
      <div className="">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

export default TabsWrapper;
