import { NavLink } from "react-router-dom";

const links = [
  { to: "/admin", label: "Gösterge Paneli" },
  { to: "/admin/vehicles", label: "Araçlar" },
  { to: "/admin/tours", label: "Turlar" },
  { to: "/admin/categories", label: "Tur Kategorileri" },
  { to: "/admin/add-ons", label: "Ek Hizmetler" },
  { to: "/admin/featured-transfers", label: "Öne Çıkan Transferler" },
  { to: "/admin/reservations", label: "Rezervasyonlar" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar = ({ isOpen, onClose }: SidebarProps) => {
  return (
    <aside
      className={`fixed z-40 inset-y-0 left-0 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out md:static md:inset-auto md:z-10 md:transform-none md:h-auto md:flex-shrink-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0`}
    >
      <div className="h-full flex flex-col">
        <div className="px-6 py-5 border-b">
          <span className="text-xl font-semibold text-primary">VIP Ride Yönetim</span>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/admin"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;

