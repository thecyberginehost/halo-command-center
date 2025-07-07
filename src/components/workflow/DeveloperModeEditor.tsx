import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface DeveloperModeEditorProps {
  customCode: string;
  setCustomCode: (code: string) => void;
}

export const DeveloperModeEditor = ({ customCode, setCustomCode }: DeveloperModeEditorProps) => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-4">
        <Label className="text-sm font-medium text-halo-text">Custom Workflow Code</Label>
        <p className="text-xs text-halo-textSecondary mt-1">
          Write custom JavaScript/TypeScript code for your automation workflow
        </p>
      </div>
      <Textarea
        value={customCode}
        onChange={(e) => setCustomCode(e.target.value)}
        placeholder={`// Example workflow code:
async function executeWorkflow(data) {
  // Step 1: Process incoming data
  const processedData = await processInput(data);
  
  // Step 2: Send email notification
  await sendEmail({
    to: processedData.email,
    subject: 'Welcome!',
    body: 'Thank you for signing up!'
  });
  
  // Step 3: Add to CRM
  await addToCRM({
    name: processedData.name,
    email: processedData.email
  });
  
  return { success: true };
}`}
        className="flex-1 font-mono text-sm resize-none"
      />
    </div>
  );
};