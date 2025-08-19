
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CronJob {
  jobname: string;
  schedule: string;
  active: boolean;
  database?: string;
}

interface CronRun {
  jobname: string;
  runid: number;
  status: string;
  return_message?: string;
  start_time: string;
  end_time?: string;
}

interface TaskStats {
  [key: string]: number;
}

interface SystemStatus {
  cron_active: boolean;
  last_run?: string;
  last_status?: string;
}

interface CronStatusResponse {
  success: boolean;
  timestamp: string;
  cron_jobs: CronJob[];
  recent_runs: CronRun[];
  task_statistics: TaskStats;
  system_status: SystemStatus;
}

export function CronSystemMonitor() {
  const [statusData, setStatusData] = useState<CronStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchCronStatus = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cron-status', {
        body: { action: 'status_check' }
      });

      if (error) {
        console.error('Error fetching cron status:', error);
        toast.error('Failed to fetch cron status');
        return;
      }

      setStatusData(data);
      setLastRefresh(new Date());
      toast.success('Cron status updated successfully');
    } catch (err) {
      console.error('Error calling cron-status function:', err);
      toast.error('Failed to fetch cron status');
    } finally {
      setLoading(false);
    }
  };

  const triggerManualExecution = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('scheduled-task-processor', {
        body: { source: 'manual', timestamp: new Date().toISOString() }
      });

      if (error) {
        console.error('Error triggering manual execution:', error);
        toast.error('Failed to trigger manual execution');
        return;
      }

      toast.success('Manual execution triggered successfully');
      // Refresh status after manual execution
      setTimeout(() => fetchCronStatus(), 2000);
    } catch (err) {
      console.error('Error triggering manual execution:', err);
      toast.error('Failed to trigger manual execution');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCronStatus();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'succeeded':
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case 'failed':
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      case 'running':
      case 'processing':
        return <Badge variant="secondary">Running</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!statusData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Cron System Monitor
          </CardTitle>
          <CardDescription>
            Loading cron system status...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Cron System Monitor
          </CardTitle>
          <CardDescription>
            Monitor and manage your scheduled task processing system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {statusData.system_status.cron_active ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium">
                System Status: {statusData.system_status.cron_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={triggerManualExecution}
                disabled={loading}
                size="sm"
                variant="outline"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Trigger Manual Run"}
              </Button>
              <Button
                onClick={fetchCronStatus}
                disabled={loading}
                size="sm"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Refresh"}
              </Button>
            </div>
          </div>
          
          {lastRefresh && (
            <p className="text-sm text-muted-foreground mb-4">
              Last updated: {formatTimestamp(lastRefresh.toISOString())}
            </p>
          )}

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="jobs">Cron Jobs</TabsTrigger>
              <TabsTrigger value="runs">Recent Runs</TabsTrigger>
              <TabsTrigger value="tasks">Task Queue</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Active Cron Jobs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statusData.cron_jobs.filter(job => job.active).length}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Last Run Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(statusData.system_status.last_status || 'Unknown')}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Pending Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statusData.task_statistics.pending || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {statusData.system_status.last_run && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Last execution: {formatTimestamp(statusData.system_status.last_run)}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="jobs" className="space-y-4">
              <div className="space-y-2">
                {statusData.cron_jobs.map((job, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{job.jobname}</h3>
                          <p className="text-sm text-muted-foreground">
                            Schedule: {job.schedule}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {job.active ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Inactive</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="runs" className="space-y-4">
              <div className="space-y-2">
                {statusData.recent_runs.map((run, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{run.jobname}</h3>
                          <p className="text-sm text-muted-foreground">
                            Started: {formatTimestamp(run.start_time)}
                          </p>
                          {run.end_time && (
                            <p className="text-sm text-muted-foreground">
                              Ended: {formatTimestamp(run.end_time)}
                            </p>
                          )}
                          {run.return_message && (
                            <p className="text-sm text-muted-foreground">
                              Message: {run.return_message}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(run.status)}
                          <span className="text-sm text-muted-foreground">
                            #{run.runid}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(statusData.task_statistics).map(([status, count]) => (
                  <Card key={status}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm capitalize">{status}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{count}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
