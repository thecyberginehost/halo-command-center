
import DashboardWidget from './DashboardWidget';
import { Button } from '@/components/ui/button';

const AISuggestionsWidget = () => {
  const suggestions = [
    {
      title: "Optimize Email Workflow",
      description: "Reduce processing time by 23% with parallel execution",
      priority: "high"
    },
    {
      title: "Scale Database Connections",
      description: "Add connection pooling to handle peak loads",
      priority: "medium"
    },
    {
      title: "Enable Smart Routing",
      description: "Route requests based on geographic location",
      priority: "low"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <DashboardWidget title="AI Recommendations">
      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-medium text-halo-text">{suggestion.title}</h4>
              <span className={`status-indicator text-xs ${getPriorityColor(suggestion.priority)}`}>
                {suggestion.priority}
              </span>
            </div>
            <p className="text-xs text-halo-textSecondary mb-3">{suggestion.description}</p>
            <Button size="sm" variant="outline" className="text-xs">
              Apply Suggestion
            </Button>
          </div>
        ))}
      </div>
    </DashboardWidget>
  );
};

export default AISuggestionsWidget;
