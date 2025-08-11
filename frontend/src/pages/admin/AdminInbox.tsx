import { useState, useEffect, useContext } from 'react';
import { MessageSquare, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react';
import SearchBar from '../../components/common/SearchBar';
import { AdminContext } from '../../context/AdminContext';
import { getFeedbacksPaginatedAPI } from '../../services/adminServices';
import type { feedbackTypes } from '../../types/feedback';

const AdminInbox = () => {
  const adminCtx = useContext(AdminContext);
  if (!adminCtx) throw new Error('Missing contexts');

  const { aToken } = adminCtx;

  const [page, setPage] = useState<number>(1);
  const [query, setQuery] = useState<string>('');
  const [load, setLoad] = useState<boolean>(false);

  const [feedbackMessages, setFeedbackMessages] = useState<feedbackTypes[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedMessage, setSelectedMessage] = useState<feedbackTypes | null>(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoad(true);
      try {
        const res = await getFeedbacksPaginatedAPI(page, 6, aToken);
        if (res.data.success) {
          setFeedbackMessages(res.data.data || []);
          setTotalPages(res.data.pagination.totalPages);
        }
      } catch (err) {
        console.error('Error fetching feedback:', err);
      } finally {
        setLoad(false);
      }
    };

    fetchFeedback();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, aToken]);

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

  const filtered = feedbackMessages.filter(
    (msg: feedbackTypes) =>
      msg.userData?.name?.toLowerCase().includes(query.toLowerCase()) ||
      msg.userData?.email?.toLowerCase().includes(query.toLowerCase()) ||
      msg.message?.toLowerCase().includes(query.toLowerCase())
  );

  const glass = 'bg-white/5 backdrop-blur ring-1 ring-white/10';
  const pill =
    'text-xs font-medium px-4 py-1.5 rounded-md shadow-lg hover:-translate-y-0.5 hover:scale-105 transition-all duration-300';

  const openMessage = (message: feedbackTypes) => setSelectedMessage(message);
  const closeMessage = () => setSelectedMessage(null);

  return (
    <div className="m-5 text-slate-100 max-h-[90vh] overflow-y-auto">
      <h1 className="text-lg font-medium mb-4">Inbox</h1>
      <div className="mb-6 max-w-sm">
        <SearchBar placeholder="Search by name" onSearch={setQuery} />
      </div>

      {load ? (
        <div className="text-center py-10 text-slate-400 text-sm">Loading feedback messages…</div>
      ) : filtered.length ? (
        <>
          <div className="w-full flex flex-wrap gap-6">
            {filtered.map((message: feedbackTypes) => (
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
                    <div className="bg-white/10 px-2 py-1 rounded-full">
                      <span className="text-slate-100 text-xs font-medium flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        FEEDBACK
                      </span>
                    </div>
                  </div>

                  <div className="min-h-[60px]">
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {message.message.length > 120
                        ? `${message.message.substring(0, 120)}...`
                        : message.message}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(message.timestamp)}
                    </div>
                    {!message.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
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
        <div className="text-center py-10 text-slate-400 text-sm">
          No matching feedback messages found.
        </div>
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
                  FEEDBACK
                </span>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-slate-200 leading-relaxed">{selectedMessage.message}</p>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Clock className="w-4 h-4" />
                {formatTimestamp(selectedMessage.timestamp)}
              </div>
              <button
                onClick={closeMessage}
                className={`${pill} bg-white/10 text-slate-100 hover:bg-white/20`}
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
