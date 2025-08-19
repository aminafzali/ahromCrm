import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../Button/Button';
import Input from '../Input/Input';

export interface Label {
  id: string;
  name: string;
}

interface LabelsProps {
  labels: Label[];
  selectedLabels?: string[];
  onLabelsChange?: (labelIds: string[]) => void;
  onAddLabel?: (label: Label) => void;
  onRemoveLabel?: (labelId: string) => void;
  className?: string;
  placeholder?: string;
  addNewLabel?: boolean;
  searchable?: boolean;
}

const Labels: React.FC<LabelsProps> = ({
  labels,
  selectedLabels = [],
  onLabelsChange,
  onAddLabel,
  onRemoveLabel,
  className = '',
  placeholder = 'Add to label',
  addNewLabel = true,
  searchable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newLabelName, setNewLabelName] = useState('');
  const [selected, setSelected] = useState<string[]>(selectedLabels);

  useEffect(() => {
    setSelected(selectedLabels);
  }, [selectedLabels]);

  const filteredLabels = labels.filter(label =>
    label.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleLabel = (labelId: string) => {
    const newSelected = selected.includes(labelId)
      ? selected.filter(id => id !== labelId)
      : [...selected, labelId];
    
    setSelected(newSelected);
    onLabelsChange?.(newSelected);
  };

  const handleAddNewLabel = () => {
    if (newLabelName.trim()) {
      const newLabel: Label = {
        id: Date.now().toString(),
        name: newLabelName.trim()
      };
      onAddLabel?.(newLabel);
      setNewLabelName('');
    }
  };

  const handleRemoveLabel = (labelId: string) => {
    onRemoveLabel?.(labelId);
    setSelected(selected.filter(id => id !== labelId));
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        className="w-full justify-start"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          {placeholder}
        </span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 top-full left-0 right-0 mt-2 bg-base-100 rounded-lg shadow-xl border border-base-300"
          >
            {searchable && (
              <div className="p-2 border-b">
                <Input
                  name="search"
                  placeholder="Search labels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
            )}

            <div className="max-h-60 overflow-y-auto">
              {filteredLabels.map(label => (
                <div
                  key={label.id}
                  className="flex items-center justify-between p-2 hover:bg-base-200 cursor-pointer"
                  onClick={() => handleToggleLabel(label.id)}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={selected.includes(label.id)}
                      onChange={() => {}}
                    />
                    <span>{label.name}</span>
                  </div>
                  {onRemoveLabel && (
                    <Button
                      variant="ghost"
                      size="xs"
                      className="text-error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveLabel(label.id);
                      }}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {addNewLabel && (
              <div className="p-2 border-t flex gap-2">
                <Input
                  name="newLabel"
                  placeholder="New label name"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddNewLabel}
                  disabled={!newLabelName.trim()}
                >
                  Add
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Labels;