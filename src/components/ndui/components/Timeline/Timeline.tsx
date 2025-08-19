import React from 'react';

interface TimelineItem {
  id: string;
  title: string;
  content: React.ReactNode;
  date?: string;
  icon?: React.ReactNode;
  color?: string;
}

interface TimelineProps {
  items: TimelineItem[];
  side?: 'left' | 'right' | 'alternate';
}

const Timeline: React.FC<TimelineProps> = ({
  items,
  side = 'left',
}) => {
  return (
    <div className="relative">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`
            flex items-start gap-4 mb-8
            ${side === 'right' ? 'flex-row-reverse' : ''}
            ${side === 'alternate' ? (index % 2 === 0 ? '' : 'flex-row-reverse') : ''}
          `}
        >
          <div className="flex-1">
            <div className="bg-base-200 p-4 rounded-lg">
              <h3 className="font-bold mb-2">{item.title}</h3>
              {item.date && (
                <div className="text-sm text-base-content/70 mb-2">
                  {item.date}
                </div>
              )}
              <div>{item.content}</div>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center
              ${item.color || 'bg-primary text-primary-content'}
            `}>
              {item.icon || '●'}
            </div>
            <div className="w-0.5 h-full bg-base-300 -mb-8"></div>
          </div>
          
          <div className="flex-1"></div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;