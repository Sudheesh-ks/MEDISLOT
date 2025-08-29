import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { getUserWallet } from '../../services/userProfileServices';
import Pagination from '../../components/common/Pagination';
import { currencySymbol } from '../../utils/commonUtils';

const Wallet = () => {
  const nav = useNavigate();
  const context = useContext(UserContext);
  if (!context) throw new Error('Wallet must be within UserContext');
  const { token } = context;

  const [transactions, setTransactions] = useState<WalletTypes[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchWallet = async (pageNum = 1) => {
    try {
      const res = await getUserWallet(pageNum, limit);
      const wallet = res.data;

      setWalletBalance(wallet.balance || 0);

      const mappedTransactions = (wallet.history || []).map((entry, idx) => ({
        id: `TXN${(pageNum - 1) * limit + idx + 1}`,
        type: entry.type,
        amount: entry.amount,
        description: entry.reason || 'N/A',
        date: new Date(entry.date).toLocaleDateString(),
        time: new Date(entry.date).toLocaleTimeString(),
      }));

      setTransactions(mappedTransactions);
      setTotalPages(Math.ceil(wallet.total / limit));
    } catch (err) {
      console.error('Failed to fetch wallet:', err);
    }
  };

  useEffect(() => {
    if (!token) {
      nav('/');
      return;
    }
    fetchWallet(page);
  }, [token, nav, page]);

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

  const formatAmount = (amount, type) => {
    const sign = type === 'credit' ? '+' : '-';
    return `${sign}${currencySymbol}${amount.toFixed(2)}`;
  };

  const getTransactionIcon = (type) => {
    return type === 'credit' ? '↗️' : '↙️';
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      completed: 'bg-green-600 text-white',
      pending: 'bg-yellow-600 text-white',
      failed: 'bg-red-600 text-white',
    };

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${
          statusClasses[status] || 'bg-gray-600 text-white'
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => nav('/my-profile')}
            className="text-blue-400 hover:text-blue-300 mb-2 text-sm"
          >
            ← Back to Profile
          </button>
          <h1 className="text-2xl font-bold text-white mb-1">My Wallet</h1>
          <p className="text-gray-400 text-sm">Manage your balance and view transactions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Cards */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-6">
            <div className="text-center text-white">
              <p className="text-white/80 text-sm font-medium mb-2">Total Balance</p>
              <p className="text-3xl font-bold mb-4">
                {currencySymbol}
                {walletBalance.toFixed(2)}
              </p>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Available</span>
                  <span className="font-semibold">${walletBalance.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/20">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/70">Card: **** **** **** 8547</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-xl font-semibold text-white mb-4 sm:mb-0">Transaction History</h2>

              {/* Filter Buttons */}
              <div className="flex gap-2 flex-wrap">
                {['all', 'credit', 'debit'].map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      filter === filterType
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Transaction Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-2 text-gray-400 font-medium text-sm">
                      Transaction
                    </th>
                    <th className="text-left py-3 px-2 text-gray-400 font-medium text-sm">
                      Date & Time
                    </th>
                    <th className="text-right py-3 px-2 text-gray-400 font-medium text-sm">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors duration-200"
                    >
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg">
                            {getTransactionIcon(transaction.type)}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">
                              {transaction.description}
                            </p>
                            <p className="text-gray-400 text-xs">ID: {transaction.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="text-sm">
                          <p className="text-white">{transaction.date}</p>
                          <p className="text-gray-400 text-xs">{transaction.time}</p>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <span
                          className={`font-semibold ${
                            transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {formatAmount(transaction.amount, transaction.type)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty Message */}
            {filteredTransactions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400">No transactions found for the selected filter.</p>
              </div>
            )}

            {/* Pagination */}
            <div className="mt-6 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(newPage) => {
                  if (newPage >= 1 && newPage <= totalPages) {
                    setPage(newPage);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
