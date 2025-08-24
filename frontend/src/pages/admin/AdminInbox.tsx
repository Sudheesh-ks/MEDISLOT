import { useState, useEffect, useContext } from 'react';
import { MessageSquare, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react';
import SearchBar from '../../components/common/SearchBar';
import { AdminContext } from '../../context/AdminContext';
import { getComplaintsPaginatedAPI, updateComplainStatusAPI } from '../../services/adminServices';
import type { ComplaintTypes } from '../../types/complaint';
import { toast } from 'react-toastify';

const AdminInbox = () => {
  const adminCtx = useContext(AdminContext);
  if (!adminCtx) throw new Error('Missing contexts');

  const { aToken } = adminCtx;

  const [page, setPage] = useState<number>(1);
  const [query, setQuery] = useState<string>('');
  const [load, setLoad] = useState<boolean>(false);

  const [complaints, setComplaints] = useState<ComplaintTypes[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedMessage, setSelectedMessage] = useState<ComplaintTypes | null>(null);
  const [newStatus, setNewStatus] = useState<string>('pending');

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoad(true);
      try {
        const res = await getComplaintsPaginatedAPI(page, 6, aToken);
        if (res.data.success) {
          setComplaints(res.data.data || []);
          setTotalPages(res.data.pagination.totalPages);
        }
      } catch (err) {
        console.error('Error fetching Complaints:', err);
      } finally {
        setLoad(false);
      }
    };

    fetchComplaints();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, aToken]);

  useEffect(() => {
    if (selectedMessage) {
      setNewStatus(selectedMessage.status || 'pending');
    }
  }, [selectedMessage]);

  const formatTimestamp = (timestamp: string | number | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filtered = complaints.filter(
    (msg: ComplaintTypes) =>
      msg.userData?.name?.toLowerCase().includes(query.toLowerCase()) ||
      msg.userData?.email?.toLowerCase().includes(query.toLowerCase()) ||
      msg.description?.toLowerCase().includes(query.toLowerCase()) ||
      msg.subject?.toLowerCase().includes(query.toLowerCase())
  );

  const glass = 'bg-white/5 backdrop-blur ring-1 ring-white/10';

  const openMessage = (message: ComplaintTypes) => setSelectedMessage(message);
  const closeMessage = () => setSelectedMessage(null);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await updateComplainStatusAPI(id, status, aToken);
      if (res.data.success) {
        setComplaints((prev) =>
          prev.map((c) => (c._id === id ? { ...c, status: status as ComplaintTypes['status'] } : c))
        );
        toast.success(res.data.message);
        if (selectedMessage?._id === id) {
          setSelectedMessage({ ...selectedMessage, status: status as ComplaintTypes['status'] });
        }
      }
    } catch (err) {
      console.error('Error updating complaint status:', err);
    }
  };

  return (
    <div className="m-5 text-slate-100 max-h-[90vh] overflow-y-auto">
      <h1 className="text-lg font-medium mb-4">Inbox</h1>
      <div className="mb-6 max-w-sm">
        <SearchBar placeholder="Search by name, email or subject" onSearch={setQuery} />
      </div>

      {load ? (
        <div className="text-center py-10 text-slate-400 text-sm">Loading Complaints…</div>
      ) : filtered.length ? (
        <>
          <div className="w-full flex flex-wrap gap-6">
            {filtered.map((message: ComplaintTypes) => (
              <div
                key={message._id}
                className={`${glass} max-w-80 rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1 cursor-pointer`}
                onClick={() => openMessage(message)}
              >
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/10 p-2 rounded-full">
                        <User className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-100 truncate">
                          {message.userData?.name || 'Unknown User'}
                        </h3>
                        <p className="text-xs text-slate-400 truncate">
                          {message.userData?.email || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white/10 px-2 py-1 outline rounded-full">
                      <span className="text-slate-100 text-xs font-medium flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        Complaint
                      </span>
                    </div>
                  </div>

                  {/* Subject */}
                  <h4 className="text-sm font-medium text-blue-400">
                    {message.subject || 'No Subject'}
                  </h4>

                  <div className="min-h-[60px]">
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {message.description.length > 120
                        ? `${message.description.substring(0, 120)}...`
                        : message.description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(message.createdAt)}
                    </div>
                    <div
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        message.status === 'resolved'
                          ? 'bg-green-600/30 text-green-400'
                          : message.status === 'in-progress'
                            ? 'bg-yellow-600/30 text-yellow-400'
                            : message.status === 'rejected'
                              ? 'bg-red-600/30 text-red-400'
                              : 'bg-slate-600/30 text-slate-300'
                      }`}
                    >
                      {message.status || 'pending'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-white/10 text-slate-300 hover:bg-white/20 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-slate-400 text-sm mx-4">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg bg-white/10 text-slate-300 hover:bg-white/20 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-10 text-slate-400 text-sm">No complaints found.</div>
      )}

      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div
            className={`${glass} w-full max-w-2xl rounded-xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto mx-4 border border-white/10`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-full">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">
                    {selectedMessage.userData?.name || 'Unknown User'}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {selectedMessage.userData?.email || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="bg-white/10 px-3 py-1 rounded-full">
                <span className="text-slate-100 text-xs font-medium flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Complaint
                </span>
              </div>
            </div>

            {/* Subject + Body */}
            <h2 className="text-blue-400 text-lg font-semibold mb-2">
              {selectedMessage.subject || 'No Subject'}
            </h2>
            <div className="mb-4">
              <p className="text-slate-200 leading-relaxed">{selectedMessage.description}</p>
            </div>

            {/* Current Status Badge */}
            <div className="mb-4">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium
                  ${
                    selectedMessage.status === 'resolved'
                      ? 'bg-green-600/30 text-green-300'
                      : selectedMessage.status === 'in-progress'
                        ? 'bg-yellow-600/30 text-yellow-300'
                        : selectedMessage.status === 'rejected'
                          ? 'bg-red-600/30 text-red-300'
                          : 'bg-slate-600/30 text-slate-300'
                  }`}
              >
                Current Status: {selectedMessage.status || 'pending'}
              </span>
            </div>

            {/* Status Selection + Update */}
            <div className="flex items-center gap-3 border-t border-white/10 pt-4">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className={`appearance-none bg-slate-800 text-slate-200 text-sm rounded-md px-3 py-1 
    focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer
    border border-slate-700
    ${
      newStatus === 'resolved'
        ? 'bg-green-900 text-green-300 focus:ring-green-400'
        : newStatus === 'in-progress'
          ? 'bg-yellow-900 text-yellow-300 focus:ring-yellow-400'
          : newStatus === 'rejected'
            ? 'bg-red-900 text-red-300 focus:ring-red-400'
            : 'bg-slate-800 text-slate-300 focus:ring-slate-400'
    }`}
              >
                <option className="bg-slate-800 text-slate-200" value="pending">
                  Pending
                </option>
                <option className="bg-slate-800 text-slate-200" value="in-progress">
                  In Progress
                </option>
                <option className="bg-slate-800 text-slate-200" value="resolved">
                  Resolved
                </option>
                <option className="bg-slate-800 text-slate-200" value="rejected">
                  Rejected
                </option>
              </select>

              <button
                onClick={() => updateStatus(selectedMessage._id, newStatus)}
                className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                Update
              </button>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={closeMessage}
                className="px-4 py-2 text-sm rounded-md bg-white/10 hover:bg-white/20 text-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInbox;
