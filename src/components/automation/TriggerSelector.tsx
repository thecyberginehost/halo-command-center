interface TriggerSelectorProps {
  onTriggerSelect: (trigger: string) => void;
}

export function TriggerSelector({ onTriggerSelect }: TriggerSelectorProps) {
  const triggers = [
    'Webhook Trigger',
    'Schedule Trigger', 
    'Email Trigger',
    'Form Submission Trigger',
    'File Upload Trigger'
  ];

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-sm">Select a Trigger</h3>
      {triggers.map((trigger) => (
        <button
          key={trigger}
          onClick={() => onTriggerSelect(trigger)}
          className="w-full text-left p-2 rounded hover:bg-muted transition-colors"
        >
          {trigger}
        </button>
      ))}
    </div>
  );
}