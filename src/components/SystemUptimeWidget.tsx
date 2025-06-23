
import DashboardWidget from './DashboardWidget';

const SystemUptimeWidget = () => {
  return (
    <DashboardWidget title="System Uptime">
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-halo-primary mb-1">99.97%</div>
          <div className="text-sm text-halo-textSecondary">30-day uptime</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-lg font-semibold text-halo-text">2</div>
            <div className="text-xs text-halo-textSecondary">Errors</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-halo-text">15m</div>
            <div className="text-xs text-halo-textSecondary">Downtime</div>
          </div>
        </div>
      </div>
    </DashboardWidget>
  );
};

export default SystemUptimeWidget;
