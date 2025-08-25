import { useNavigate } from 'react-router-dom';

const BlockedPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-red-50 px-4">
      <div className="bg-red-100 border border-red-500 text-red-700 p-8 rounded-xl shadow-lg max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4">🚫 Access Denied</h1>
        <p className="mb-6">
          Your account has been <strong>blocked by the admin</strong>. You can no longer access this
          system.
        </p>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default BlockedPage;
