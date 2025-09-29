import { useContext, useEffect, useState } from 'react';
import { CreditCard, Eye, EyeOff, Search, TrendingUp, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { getDoctorWalletAPI } from '../../services/doctorServices';
import { currencySymbol } from '../../utils/commonUtils';
import Pagination from '../../components/common/Pagination';
import { DoctorContext } from '../../context/DoctorContext';
import { useNavigate } from 'react-router-dom';

const glass = 'bg-white/5 backdrop-blur ring-1 ring-white/10';
const cardBase = 'text-white p-6 rounded-xl shadow-md flex items-center gap-4';

const DoctorWallet = () => {
  const navigate = useNavigate();
  const context = useContext(DoctorContext);

  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionType, setTransactionType] = useState('all');

  if (!context) throw new Error('DoctorContext missing');
  const { dToken } = context;

  useEffect(() => {
    if (!dToken) {
      navigate('/doctor/login');
    }
  });

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await getDoctorWalletAPI(
          currentPage,
          10,
          searchTerm,
          selectedPeriod,
          transactionType
        );
        setWalletData(res.data);
        setFilteredTransactions(res.data?.history || []);
      } catch (err) {
        console.error('Failed to fetch wallet data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, [currentPage, searchTerm, selectedPeriod, transactionType]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!walletData) {
    return <div className="text-red-400 p-10 text-center">Failed to load wallet data.</div>;
  }

  const availableBalance = Math.max(walletData.balance, 0);

  const totalCredits =
    walletData.history
      ?.filter((tx: any) => tx.type === 'credit')
      .reduce((sum: number, tx: any) => sum + tx.amount, 0) || 0;

  const balanceCards = [
    {
      title: 'Available Balance',
      amount: availableBalance,
      icon: Wallet,
      gradient: 'from-cyan-500 to-blue-600',
    },
    {
      title: 'Total Earnings',
      amount: totalCredits,
      icon: TrendingUp,
      gradient: 'from-indigo-500 to-violet-600',
    },
  ];

  return (
    <div className="m-3 sm:m-5 space-y-10 text-slate-100">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {balanceCards.map((c, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={`${cardBase} bg-gradient-to-r ${c.gradient}`}
          >
            <c.icon className="w-10 h-10 sm:w-12 sm:h-12" />
            <div>
              <p className="text-xl sm:text-2xl font-bold">
                {showBalance ? `${currencySymbol}${c.amount}` : '••••••'}
              </p>
              <p className="text-sm opacity-80">{c.title}</p>
            </div>
            <button
              onClick={() => setShowBalance((s) => !s)}
              className="ml-auto p-1 hover:bg-white/10 rounded-full"
            >
              {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Transactions Table */}
      <div className={`${glass} rounded-xl`}>
        {/* Header + Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 py-4 border-b border-white/10">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <CreditCard className="w-5" /> Wallet Transactions
          </h2>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            {/* Period */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-sm bg-slate-800 text-slate-200 border border-white/20 rounded-lg px-3 py-1.5 w-full sm:w-auto"
            >
              <option value="all">All</option>
              <option value="today">Today</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>

            {/* Type */}
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="text-sm bg-slate-800 text-slate-200 border border-white/20 rounded-lg px-3 py-1.5 w-full sm:w-auto"
            >
              <option value="all">Type</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
          </div>
        </div>

        {/* Table Wrapper */}
        <div className="overflow-x-auto">
          {/* Desktop Table */}
          <table className="hidden sm:table w-full text-sm">
            <thead className="bg-white/5 border-b border-white/10 text-left text-slate-300">
              <tr>
                <th className="px-6 py-3">Reason</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredTransactions.map((tx, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-white/5"
                >
                  <td className="px-6 py-4 text-white font-medium">{tx.reason || '—'}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        tx.type === 'credit'
                          ? 'text-green-400 bg-green-500/20'
                          : 'text-red-400 bg-red-500/20'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    {tx.type === 'credit' ? '+' : '-'}
                    {`${currencySymbol}${tx.amount}`}
                  </td>
                  <td className="px-6 py-4 text-slate-300">{formatDate(tx.date)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Card View */}
          <div className="sm:hidden divide-y divide-white/10">
            {filteredTransactions.map((tx, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 hover:bg-white/5 space-y-2"
              >
                <div className="flex justify-between">
                  <p className="text-slate-400 text-xs">Reason</p>
                  <p className="text-white font-medium">{tx.reason || '—'}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-slate-400 text-xs">Type</p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      tx.type === 'credit'
                        ? 'text-green-400 bg-green-500/20'
                        : 'text-red-400 bg-red-500/20'
                    }`}
                  >
                    {tx.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <p className="text-slate-400 text-xs">Amount</p>
                  <p className="font-semibold">
                    {tx.type === 'credit' ? '+' : '-'}
                    {`${currencySymbol}${tx.amount}`}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-slate-400 text-xs">Date</p>
                  <p className="text-slate-300">{formatDate(tx.date)}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredTransactions.length === 0 && (
            <div className="py-10 text-center text-slate-400">No transactions found</div>
          )}

          {/* Pagination */}
          <div className="px-4 sm:px-6">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil((walletData?.total || 0) / 10)}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorWallet;
