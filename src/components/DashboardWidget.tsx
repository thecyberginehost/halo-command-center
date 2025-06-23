
import { ReactNode } from 'react';

interface DashboardWidgetProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const DashboardWidget = ({ title, children, className = "" }: DashboardWidgetProps) => {
  return (
    <div className={`widget-card ${className}`}>
      <h3 className="text-lg font-semibold text-halo-text mb-4">{title}</h3>
      {children}
    </div>
  );
};

export default DashboardWidget;
