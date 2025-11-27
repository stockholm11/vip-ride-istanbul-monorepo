import { useNavigate } from "react-router-dom";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

const ADMIN_TOKEN_KEY = "adminToken";

const AdminHeader = ({ onToggleSidebar }: AdminHeaderProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
    navigate("/admin/login");
  };

  return (
    <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-100"
          onClick={onToggleSidebar}
          aria-label="Menüyü aç/kapat"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Yönetim Paneli</h1>
      </div>
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={handleLogout}
          className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition"
        >
          Çıkış Yap
        </button>
        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
          AD
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;

