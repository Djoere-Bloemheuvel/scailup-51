
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CronMonitoringData {
  cronJobs: any[];
  recentRuns: any[];
  taskStats: Record<string, number>;
  systemStatus: {
    cron_active: boolean;
    last_run?: string;
    last_status?: string;
  };
}

export function useCronMonitoring() {
  const [data, setData] = useState<CronMonitoringData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCronStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: response, error } = await supabase.functions.invoke('cron-status', {
        body: { action: 'status_check' }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (response.success) {
        setData({
          cronJobs: response.cron_jobs || [],
          recentRuns: response.recent_runs || [],
          taskStats: response.task_statistics || {},
          systemStatus: response.system_status || { cron_active: false }
        });
      } else {
        throw new Error(response.error || 'Failed to fetch cron status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(`Failed to fetch cron status: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const triggerManualExecution = async () => {
    setLoading(true);
    
    try {
      const { data: response, error } = await supabase.functions.invoke('scheduled-task-processor', {
        body: { 
          source: 'manual', 
          timestamp: new Date().toISOString() 
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (response.success) {
        toast.success('Manual execution triggered successfully');
        // Refresh status after manual execution
        setTimeout(() => fetchCronStatus(), 2000);
      } else {
        throw new Error(response.error || 'Manual execution failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(`Failed to trigger manual execution: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCronStatus();
  }, []);

  return {
    data,
    loading,
    error,
    fetchCronStatus,
    triggerManualExecution
  };
}
