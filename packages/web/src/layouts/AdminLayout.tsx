import { ReactNode, useState } from "react";
import AdminHeader from "../components/admin/Header";
import AdminSidebar from "../components/admin/Sidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggle = () => setIsSidebarOpen((prev) => !prev);
  const hideSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar isOpen={isSidebarOpen} onClose={hideSidebar} />
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={hideSidebar}
        />
      )}
      <div className="flex-1 flex flex-col min-h-screen">
        <AdminHeader onToggleSidebar={handleToggle} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;

