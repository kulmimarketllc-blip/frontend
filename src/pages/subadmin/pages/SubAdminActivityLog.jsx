import React, { useState, useEffect } from 'react';
import { ClipboardList, Loader2, Calendar } from 'lucide-react';
import SubAdminPageHeader from '../components/SubAdminPageHeader';
import subAdminService from '../../../services/subAdminService';
import Pagination from '../../admin/components/Pagination';

const ITEMS_PER_PAGE = 20;

const DETAIL_LABELS = {
  action: 'Action',
  reason: 'Reason',
  storeName: 'Store',
  commissionRate: 'Commission',
  resolution: 'Resolution',
  notes: 'Notes',
  status: 'Status',
  title: 'Title',
  description: 'Description',
};

const formatDetailValue = (key, value) => {
  if (value == null || value === '') return null;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (key === 'commissionRate') return `${value}%`;
  if (typeof value === 'string') return value.replace(/_/g, ' ');
  if (typeof value === 'object') return null;
  return String(value);
};

const formatDetails = (details) => {
  if (!details) return [];
  const obj = typeof details === 'string'
    ? (() => { try { return JSON.parse(details); } catch { return { note: details }; } })()
    : details;
  if (typeof obj !== 'object' || Array.isArray(obj)) return [];

  return Object.entries(obj)
    .map(([key, value]) => {
      const formatted = formatDetailValue(key, value);
      if (!formatted) return null;
      return {
        label: DETAIL_LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()),
        value: formatted,
      };
    })
    .filter(Boolean);
};

const SubAdminActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const response = await subAdminService.getActivityLogs(page, ITEMS_PER_PAGE);
      const logsArray = Array.isArray(response.data)
        ? response.data
        : (Array.isArray(response) ? response : []);

      setLogs(logsArray);
      setTotalItems(Number(response?.meta?.total || logsArray.length));
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
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
          {logs.length > 0 ? logs.map((log) => {
            const details = formatDetails(log.details);
            return (
              <div key={log.id} className="border-border hover:border-teal/20 flex items-start gap-3 rounded-md border p-3 transition-colors">
                <div className="bg-teal/10 text-teal flex h-9 w-9 shrink-0 items-center justify-center rounded">
                  <ClipboardList size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[0.875rem] font-semibold capitalize text-white">
                      {log.action?.replace(/_/g, ' ') || 'Action'}
                    </p>
                    <div className="text-gray flex shrink-0 items-center gap-1 text-[0.7rem]">
                      <Calendar size={10} />
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <p className="text-gray2 mt-0.5 text-[0.8rem]">
                    {log.admin?.firstName} {log.admin?.lastName} modified {log.targetType}{' '}
                    <span className="text-teal">#{log.targetId?.slice(-6) || 'N/A'}</span>
                  </p>
                  {details.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 rounded border border-white/5 bg-navy3/50 px-3 py-2">
                      {details.map(({ label, value }) => (
                        <div key={label} className="text-[0.75rem]">
                          <span className="text-gray">{label}: </span>
                          <span className="text-gray2 capitalize">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          }) : null}
          {logs.length === 0 && (
            <div className="text-gray py-20 text-center">No activity logs found</div>
          )}
        </div>

        {logs.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={(page) => fetchLogs(page)}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default SubAdminActivityLog;
