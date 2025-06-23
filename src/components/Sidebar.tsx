
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  BarChart, 
  Users, 
  List,
  Bell,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface MenuItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const Sidebar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const menuSections: MenuSection[] = [
    {
      title: "MAIN",
      items: [
        { title: "Dashboard", icon: LayoutDashboard, isActive: true },
        { title: "Automations", icon: List },
        { title: "Metrics", icon: BarChart },
        { title: "Insights", icon: BarChart },
        { title: "Logs", icon: List },
      ]
    },
    {
      title: "AI ASSIST",
      items: [
        { title: "Resonant Directive", icon: Bell },
        { title: "Suggestions", icon: List },
        { title: "AI Recommendations", icon: BarChart },
      ]
    },
    {
      title: "SETTINGS",
      items: [
        { title: "User Management", icon: Users },
        { title: "Credentials", icon: User },
        { title: "System Config", icon: Settings },
      ]
    }
  ];

  return (
    <div className="w-64 bg-halo-sidebar h-screen flex flex-col">
      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-6">
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
              {section.title}
            </h3>
            <nav className="space-y-1">
              {section.items.map((item, itemIndex) => (
                <Button
                  key={itemIndex}
                  variant="ghost"
                  className={`w-full justify-start text-left px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    item.isActive
                      ? 'bg-halo-accent text-white shadow-lg border-l-4 border-white'
                      : 'text-gray-300 hover:bg-halo-secondary hover:text-white'
                  }`}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.title}
                </Button>
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-halo-secondary">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-400">Dark Mode</span>
          <Switch
            checked={isDarkMode}
            onCheckedChange={setIsDarkMode}
            className="data-[state=checked]:bg-halo-accent"
          />
        </div>
        <div className="text-xs text-gray-500">
          HALO v2.1.0
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
