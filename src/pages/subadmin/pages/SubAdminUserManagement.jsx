import React, { useState, useEffect } from 'react';
import { Search, UserRoundCog, Loader2, ShieldAlert, AlertTriangle, UserCheck } from 'lucide-react';
import SubAdminPageHeader from '../components/SubAdminPageHeader';
import subAdminService from '../../../services/subAdminService';
import { toast } from 'react-toastify';

const SubAdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await subAdminService.listUsers({ search: searchTerm });
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleModerate = async (id, action) => {
    const reason = prompt(`Enter reason for ${action}:`);
    if (!reason) return;

    try {
      setProcessingId(id);
      await subAdminService.moderateUser(id, action, reason);
      toast.success(`User ${action}ed successfully`);
      fetchUsers(); // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} user`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="text-teal animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="animate-[fadeUp_0.4s_ease_both]">
      <SubAdminPageHeader
        title={<><span>User </span><span className="text-teal">Management</span></>}
        subtitle="Monitor user account status and enforce platform rules"
      />

      <div className="bg-card border-border rounded-md border p-3">
        <div className="bg-navy3 border-border mb-3 flex items-center gap-2 rounded border px-3 py-2">
          <Search size={14} className="text-gray" />
          <input 
            className="text-gray2 placeholder:text-gray w-full bg-transparent text-[0.82rem] outline-none" 
            placeholder="Search users by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-navy3">
                {['User', 'Role', 'Status', 'Joined', 'Actions'].map((head) => (
                  <th key={head} className="text-gray px-3 py-2 text-left text-[0.7rem] font-semibold tracking-[0.08em] uppercase">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? users.map((user) => (
                <tr key={user.id} className="border-border border-b last:border-none">
                  <td className="px-3 py-2.5">
                    <div className="inline-flex items-center gap-2">
                      <UserRoundCog size={13} className="text-teal" />
                      <div>
                        <div className="text-[0.875rem] font-semibold text-white">{user.firstName} {user.lastName}</div>
                        <div className="text-gray text-[0.75rem]">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-[0.7rem] font-semibold capitalize ${
                      user.role === 'customer' ? 'bg-blue-500/10 text-blue-500' : 
                      user.role === 'merchant' ? 'bg-teal/10 text-teal' : 'bg-purple-500/10 text-purple-500'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {user.isSuspended ? (
                      <span className="text-red bg-red/10 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold flex w-fit items-center gap-1">
                        <ShieldAlert size={10} /> Suspended
                      </span>
                    ) : user.isActive ? (
                      <span className="text-green-500 bg-green-500/10 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold flex w-fit items-center gap-1">
                        <UserCheck size={10} /> Active
                      </span>
                    ) : (
                      <span className="text-gray bg-gray/10 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold">Inactive</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-[0.8rem] text-gray">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => handleModerate(user.id, 'warn')}
                        className="text-yellow bg-yellow/10 hover:bg-yellow/20 rounded border border-yellow/40 px-2 py-1 text-[0.7rem] font-semibold flex items-center gap-1"
                      >
                        <AlertTriangle size={12} /> Warn
                      </button>
                      {user.isSuspended ? (
                        <button 
                          onClick={() => handleModerate(user.id, 'restore')}
                          className="text-green-500 bg-green-500/10 hover:bg-green-500/20 rounded border border-green-500/30 px-2 py-1 text-[0.7rem] font-semibold"
                        >
                          Restore
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleModerate(user.id, 'suspend')}
                          className="text-red bg-red/10 hover:bg-red/20 rounded border border-red/30 px-2 py-1 text-[0.7rem] font-semibold"
                        >
                          Suspend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="text-gray py-20 text-center">
                    {loading ? <Loader2 size={24} className="animate-spin mx-auto" /> : 'No users found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubAdminUserManagement;
