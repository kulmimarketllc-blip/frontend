import React, { useState, useEffect } from 'react';
import { ClipboardList, Loader2, Calendar } from 'lucide-react';
import SubAdminPageHeader from '../components/SubAdminPageHeader';
import subAdminService from '../../../services/subAdminService';

const SubAdminActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await subAdminService.getActivityLogs();
        const logsArray = Array.isArray(response.data) 
          ? response.data 
          : (Array.isArray(response) ? response : []);
        
        setLogs(logsArray);
      } catch (error) {
        console.error('Failed to fetch activity logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="text-teal animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <SubAdminPageHeader
        title={<><span>Activity </span><span className="text-teal">Log</span></>}
        subtitle="Chronological record of moderation and support actions"
      />

      <div className="bg-card border-border rounded-md border p-3">
        <div className="space-y-2">
          {logs.length > 0 ? logs.map((log) => (
            <div key={log.id} className="border-border hover:border-teal/20 flex items-start gap-3 rounded-md border p-3 transition-colors">
              <div className="bg-teal/10 text-teal flex h-9 w-9 shrink-0 items-center justify-center rounded">
                <ClipboardList size={16} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[0.875rem] font-semibold text-white capitalize">
                    {log.action?.replace(/_/g, ' ') || 'Action'}
                  </p>
                  <div className="text-gray flex items-center gap-1 text-[0.7rem]">
                    <Calendar size={10} />
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
                <p className="text-[0.8rem] text-gray2 mt-0.5">
                   {log.admin?.firstName} {log.admin?.lastName} modified {log.targetType} <span className="text-teal">#{log.targetId?.slice(-6) || 'N/A'}</span>
                </p>
                {log.details && (
                  <div className="mt-2 text-[0.75rem] text-gray bg-navy3/50 rounded p-2 border border-white/5">
                    <pre className="whitespace-pre-wrap font-sans">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )) : null}
          {logs.length === 0 && (
            <div className="text-gray py-20 text-center">No activity logs found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubAdminActivityLog;
