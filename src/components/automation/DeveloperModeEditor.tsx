import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bug, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DeveloperModeEditorProps {
  scriptCode: string;
  setScriptCode: (code: string) => void;
  setChatMessages: React.Dispatch<React.SetStateAction<Array<{role: string; content: string}>>>;
}

export function DeveloperModeEditor({ 
  scriptCode, 
  setScriptCode, 
  setChatMessages 
}: DeveloperModeEditorProps) {
  const { toast } = useToast();

  const handleDebugCode = () => {
    setChatMessages(prev => [...prev, 
      { role: 'user', content: 'Please debug my automation script' },
      { role: 'assistant', content: 'I\'ll analyze your script for potential issues. Let me check the syntax, logic flow, and suggest improvements...' }
    ]);
  };

  const handleRunScript = () => {
    console.log('Running script:', scriptCode);
    toast({
      title: "Script Execution",
      description: "Script is running in test mode...",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Automation Script</h3>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleDebugCode}>
            <Bug className="h-4 w-4 mr-2" />
            Debug Code
          </Button>
          <Button onClick={handleRunScript}>
            <Play className="h-4 w-4 mr-2" />
            Test Run
          </Button>
        </div>
      </div>
      <div className="border rounded-lg">
        <Textarea
          value={scriptCode}
          onChange={(e) => setScriptCode(e.target.value)}
          className="min-h-[500px] font-mono text-sm resize-none border-0 focus-visible:ring-0"
          placeholder="Write your automation script here..."
        />
      </div>
      <div className="text-sm text-muted-foreground">
        <p>• Use async/await for asynchronous operations</p>
        <p>• Return an object with success, message, and data properties</p>
        <p>• Console.log statements will appear in the execution logs</p>
      </div>
    </div>
  );
}