import React, { memo, useMemo } from 'react';
import { 
  Mail, 
  Users, 
  Phone, 
  Target, 
  TrendingUp, 
  Activity, 
  Database, 
  Linkedin, 
  BarChart3 
} from "lucide-react";

// Memoized metric card component
const MetricCard = memo(({ metric }: { metric: any }) => (
  <div className="bg-background/50 rounded-lg p-3 border border-border/10">
    <div className="flex items-center gap-2 mb-1">
      <metric.icon className={`h-3 w-3 ${metric.color}`} />
      <span className="text-xs text-muted-foreground">{metric.label}</span>
    </div>
    <div className="text-sm font-bold text-foreground">{metric.value}</div>
    <div className="text-xs text-green-500 flex items-center gap-1">
      <TrendingUp className="h-2 w-2" />
      {metric.change}
    </div>
  </div>
));

MetricCard.displayName = 'MetricCard';

// Memoized activity item component
const ActivityItem = memo(({ activity }: { activity: any }) => (
  <div className="flex items-center gap-2 py-0.5">
    <div className={`w-1.5 h-1.5 rounded-full ${
      activity.type === 'lead' ? 'bg-green-500' : 
      activity.type === 'email' ? 'bg-blue-500' : 'bg-purple-500'
    }`} />
    <div className="flex-1">
      <span className="text-xs text-foreground">{activity.action}</span>
    </div>
    <span className="text-xs text-muted-foreground">{activity.time}</span>
  </div>
));

ActivityItem.displayName = 'ActivityItem';

// Memoized quick action component
const QuickAction = memo(({ action }: { action: any }) => (
  <div className="bg-background/50 rounded-lg p-2 text-center hover-lift border border-border/10 cursor-pointer">
    <action.icon className={`h-4 w-4 ${action.color} mx-auto mb-1`} />
    <div className="text-xs text-muted-foreground">{action.label}</div>
  </div>
));

QuickAction.displayName = 'QuickAction';

// Memoized floating element component
const FloatingElement = memo(({ className, delay }: { className: string; delay?: string }) => (
  <div className={`${className} ${delay ? `[animation-delay:${delay}]` : ''}`} />
));

FloatingElement.displayName = 'FloatingElement';

// Main optimized dashboard mockup component
export const OptimizedDashboardMockup = memo(() => {
  // Memoized static data for performance
  const metrics = useMemo(() => [
    { icon: Mail, label: "Berichten", value: "1,247", change: "+12.5%", color: "text-primary" },
    { icon: Users, label: "Leads", value: "342", change: "+8.2%", color: "text-blue-500" },
    { icon: Phone, label: "Meetings", value: "28", change: "+15.3%", color: "text-green-500" },
    { icon: Target, label: "Conversie", value: "14.8%", change: "+2.1%", color: "text-purple-500" }
  ], []);

  const activities = useMemo(() => [
    { action: "Nieuwe lead toegevoegd", time: "2 min", type: "lead" },
    { action: "Email verstuurd", time: "5 min", type: "email" },
    { action: "Meeting ingepland", time: "12 min", type: "meeting" }
  ], []);

  const quickActions = useMemo(() => [
    { icon: Database, label: "Database", color: "text-blue-500" },
    { icon: Mail, label: "Campagnes", color: "text-green-500" },
    { icon: Linkedin, label: "LinkedIn", color: "text-purple-500" },
    { icon: BarChart3, label: "Analytics", color: "text-orange-500" }
  ], []);

  return (
    <div className="relative max-w-3xl">
      <div className="bg-card/40 backdrop-blur-sm rounded-xl border border-border/20 p-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500/60 rounded-full"></div>
            <div className="w-2 h-2 bg-yellow-500/60 rounded-full"></div>
            <div className="w-2 h-2 bg-green-500/60 rounded-full"></div>
          </div>
        </div>

        {/* Dashboard Header */}
        <div className="mb-4">
          <h3 className="text-base font-semibold text-foreground">Dashboard</h3>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {metrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-background/50 rounded-lg p-3 border border-border/10 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium text-foreground">Activiteit</span>
          </div>
          <div className="space-y-1">
            {activities.map((activity, i) => (
              <ActivityItem key={i} activity={activity} />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((action, i) => (
            <QuickAction key={i} action={action} />
          ))}
        </div>
      </div>

      {/* Floating elements - memoized for performance */}
      <FloatingElement className="absolute -top-2 -right-2 w-6 h-6 bg-primary/20 rounded-full animate-pulse" />
      <FloatingElement className="absolute -bottom-2 -left-2 w-4 h-4 bg-secondary/20 rounded-full animate-pulse" delay="1s" />
      <FloatingElement className="absolute top-1/4 -right-4 w-3 h-3 bg-green-500/20 rounded-full animate-float" delay="2s" />
    </div>
  );
});

OptimizedDashboardMockup.displayName = 'OptimizedDashboardMockup';
