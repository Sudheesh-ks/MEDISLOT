import { useContext, useEffect, useState } from 'react';
import { CreditCard, Eye, EyeOff, TrendingUp, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAdminWalletAPI } from '../../services/adminServices';
import { currencySymbol } from '../../utils/commonUtils';
import Pagination from '../../components/common/Pagination';
import { useNavigate } from 'react-router-dom';
import { AdminContext } from '../../context/AdminContext';
import SearchBar from '../../components/common/SearchBar';

const glass = 'bg-white/5 backdrop-blur ring-1 ring-white/10';
const cardBase = 'text-white p-6 rounded-xl shadow-md flex items-center gap-4';

const AdminWallet = () => {
  const navigate = useNavigate();

  const adminContext = useContext(AdminContext);
  if (!adminContext) throw new Error('Missing contexts');

  const { aToken } = adminContext;

  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionType, setTransactionType] = useState('all');

  useEffect(() => {
    if (!aToken) navigate('/admin/login');
  }, [aToken]);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await getAdminWalletAPI(
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
      amount: availableBalance || 0,
      icon: Wallet,
      gradient: 'from-cyan-500 to-fuchsia-600',
    },
    {
      title: 'Total Earnings',
      amount: totalCredits,
      icon: TrendingUp,
      gradient: 'from-indigo-500 to-violet-600',
    },
  ];

  return (
    <div className="m-3 sm:m-5 space-y-8 sm:space-y-10 text-slate-100">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {balanceCards.map((c, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={`${cardBase} bg-gradient-to-r ${c.gradient} flex items-center gap-3 sm:gap-4 p-4 sm:p-6`}
          >
            <c.icon className="w-10 h-10 sm:w-12 sm:h-12" />
            <div className="flex-1">
              <p className="text-lg sm:text-2xl font-bold truncate">
                {showBalance ? `${currencySymbol}${c.amount}` : '••••••'}
              </p>
              <p className="text-xs sm:text-sm opacity-80">{c.title}</p>
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

      {/* Wallet Transactions */}
      <div className={`${glass} rounded-xl`}>
        {/* Header & Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10">
          <h2 className="font-semibold text-base sm:text-lg flex items-center gap-2">
            <CreditCard className="w-4 sm:w-5" /> Wallet Transactions
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full lg:w-auto">
            {/* Search */}
            <div className="flex-1 sm:flex-initial">
              <SearchBar
                placeholder="Search transactions..."
                onSearch={(value) => {
                  setSearchTerm(value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Period Filter */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-sm bg-slate-800 text-slate-200 border-white/20 rounded-lg px-3 py-1.5"
            >
              <option value="all">All</option>
              <option value="today">Today</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>

            {/* Transaction Type Filter */}
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="text-sm bg-slate-800 text-slate-200 border-white/20 rounded-lg px-3 py-1.5"
            >
              <option value="all">Type</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead className="bg-white/5 border-b border-white/10 text-left text-slate-300">
              <tr>
                <th className="px-4 sm:px-6 py-3">Reason</th>
                <th className="px-4 sm:px-6 py-3">Type</th>
                <th className="px-4 sm:px-6 py-3">Amount</th>
                <th className="px-4 sm:px-6 py-3">Date</th>
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
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-white font-medium">
                    {tx.reason || '—'}
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${
                        tx.type === 'credit'
                          ? 'text-green-400 bg-green-500/20'
                          : 'text-red-400 bg-red-500/20'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">
                    {tx.type === 'credit' ? '+' : '-'}
                    {`${currencySymbol}${tx.amount}`}
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-300">
                    {formatDate(tx.date)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {/* No Transactions */}
          {filteredTransactions.length === 0 && (
            <div className="py-8 sm:py-10 text-center text-slate-400">No transactions found</div>
          )}

          {/* Pagination */}
          <div className="px-4 sm:px-6 pb-4">
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

export default AdminWallet;
