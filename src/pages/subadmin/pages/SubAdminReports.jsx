import React, { useEffect, useState } from 'react';
import { FileText, Loader2, Download } from 'lucide-react';
import SubAdminPageHeader from '../components/SubAdminPageHeader';
import subAdminService from '../../../services/subAdminService';
import { toast } from 'react-toastify';

const statusClass = {
  submitted: 'text-green-500 bg-green-500/10 border-green-500/30',
  draft: 'text-yellow bg-yellow/10 border-yellow/40',
  archived: 'text-gray bg-white/10 border-white/20',
};

const SubAdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await subAdminService.listReports();
      setReports(res.data || []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleCreateReport = async () => {
    const title = window.prompt('Enter report title:', `Moderation Report - ${new Date().toLocaleDateString()}`);
    if (!title) return;

    try {
      await subAdminService.generateReport(title, 'Generated from Reports page.');
      toast.success('Report generated successfully');
      fetchReports();
    } catch (error) {
      console.error('Report generation failed:', error);
      toast.error('Failed to generate report');
    }
  };

  const handleDownload = (report) => {
    const blob = new Blob([JSON.stringify(report.data || {}, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report_${report.id}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <SubAdminPageHeader
        title={<><span>My </span><span className="text-teal">Reports</span></>}
        subtitle="Generate and manage moderation reports"
        actions={
          <button 
            onClick={handleCreateReport}
            className="bg-teal text-navy hover:bg-teal2 rounded px-3 py-1.5 text-[0.8rem] font-semibold"
          >
            Create Report
          </button>
        }
      />

      <div className="bg-card border-border overflow-hidden rounded-md border">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="text-teal animate-spin" size={32} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-160">
              <thead>
                <tr className="bg-navy3">
                  {['Report ID', 'Title', 'Created', 'Status', 'Actions'].map((head) => (
                    <th key={head} className="text-gray px-3 py-2 text-left text-[0.7rem] font-semibold tracking-[0.08em] uppercase">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.length > 0 ? reports.map((report) => (
                  <tr key={report.id} className="border-border border-b last:border-none">
                    <td className="px-3 py-2.5 text-[0.875rem] text-teal inline-flex items-center gap-1.5 font-mono">
                      <FileText size={13} /> {report.id.slice(-8)}
                    </td>
                    <td className="px-3 py-2.5 text-[0.875rem] font-semibold text-white">{report.title}</td>
                    <td className="px-3 py-2.5 text-[0.875rem] text-gray2">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`${statusClass[report.status] || statusClass.draft} rounded-full border px-2 py-0.5 text-[0.7rem] font-semibold uppercase`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => handleDownload(report)}
                          className="text-teal bg-teal/10 hover:bg-teal/20 rounded border border-teal/30 px-2 py-1 text-[0.7rem] font-semibold flex items-center gap-1"
                        >
                          <Download size={12} /> Download
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="text-gray py-20 text-center">
                      No reports generated yet. Click "Create Report" to generate one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubAdminReports;
