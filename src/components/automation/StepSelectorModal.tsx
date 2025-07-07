import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface StepSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerSelect: (trigger: string) => void;
}

export function StepSelectorModal({ isOpen, onClose, onTriggerSelect }: StepSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const triggerOptions = [
    'Trigger manually',
    'On app event', 
    'On a schedule',
    'On webhook call',
    'On form submission',
    'When executed by another workflow',
    'On chat message',
    'On database change',
    'On file upload',
    'On email received'
  ];

  const filteredTriggers = triggerOptions.filter(trigger =>
    trigger.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 z-10"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-popover border rounded-lg shadow-lg p-4 w-80 z-10">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredTriggers.map((trigger) => (
              <button
                key={trigger}
                onClick={() => onTriggerSelect(trigger)}
                className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors text-sm"
              >
                {trigger}
              </button>
            ))}
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}