import { useEffect, useState } from 'react';
import { CreditCard, Eye, EyeOff, Search, TrendingUp, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { getDoctorWalletAPI } from '../../services/doctorServices';
import { currencySymbol } from '../../utils/commonUtils';
import Pagination from '../../components/common/Pagination';

const glass = 'bg-white/5 backdrop-blur ring-1 ring-white/10';
const cardBase = 'text-white p-6 rounded-xl shadow-md flex items-center gap-4';

const DoctorWallet = () => {
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionType, setTransactionType] = useState('all');

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
    return <div className="text-white p-10 text-center">Loading wallet data...</div>;
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
    <div className="m-5 space-y-10 text-slate-100">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {balanceCards.map((c, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={`${cardBase} bg-gradient-to-r ${c.gradient}`}
          >
            <c.icon className="w-12 h-12" />
            <div>
              <p className="text-2xl font-bold">
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <CreditCard className="w-5" /> Wallet Transactions
          </h2>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="pl-9 pr-4 py-1.5 text-sm rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-sm bg-slate-800 text-slate-200 border border-white/20 rounded-lg px-3 py-1.5 text-white"
            >
              <option value="all">All</option>
              <option value="today">Today</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>

            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="text-sm bg-slate-800 text-slate-200 border border-white/20 rounded-lg px-3 py-1.5 text-white"
            >
              <option value="all">Type</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
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

          {filteredTransactions.length === 0 && (
            <div className="py-10 text-center text-slate-400">No transactions found</div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil((walletData?.total || 0) / 10)}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
    </div>
  );
};

export default DoctorWallet;
