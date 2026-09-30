import { 
  Headphones, 
  LayoutDashboard, 
  MessageSquare, 
  Search, 
  CheckCircle, 
  Settings,
  LogOut, 
  Menu, 
  X, 
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";

const SupportSidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/support-agent/dashboard",
    },
    {
      name: "Support Requests",
      icon: MessageSquare,
      path: "/support-agent/requests",
    },
    {
      name: "Shipment Lookup",
      icon: Search,
      path: "/support-agent/shipment-lookup",
    },
    {
      name: "Resolved Requests",
      icon: CheckCircle,
      path: "/support-agent/resolved",
    },
     { 
    name: "Settings", 
    icon: Settings, 
    path: "/support-agent/settings", 
  },
  ];

  const handleLogout = () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (isConfirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("userData");

      toast.warning("Logged out successfully!");

      navigate("/");
    }
  };

  const handleSupportClick = () => {
    alert("Currently, support is not available!");
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-emerald-950 px-4 shadow-md lg:hidden">

        <div className="flex items-center gap-2">
          <Headphones size={25} className="text-emerald-400" />

          <span className="text-lg font-bold text-white">
            QuickShip
          </span>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="rounded-lg p-2 text-white hover:bg-emerald-900"
        >
          <Menu size={24} />
        </button>

      </div>


      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}


      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-emerald-950 text-white transition-transform duration-300 ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5">

          <div className="flex items-center gap-3">

            <Headphones
              size={29}
              className="text-emerald-400"
            />

            <div>
              <h1 className="text-xl font-bold">
                QuickShip
              </h1>

              <p className="mt-0.5 text-xs text-emerald-200">
                Support Agent
              </p>
            </div>

          </div>


          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-2 hover:bg-emerald-900 lg:hidden"
          >
            <X size={22} />
          </button>

        </div>


        {/* Navigation */}
        <nav className="space-y-1 px-3">

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-lg px-4 py-3 transition ${
                    isActive
                      ? "bg-emerald-600 shadow-md"
                      : "hover:bg-emerald-900"
                  }`
                }
              >
                <Icon size={20} />

                <span className="text-sm font-medium">
                  {item.name}
                </span>

              </NavLink>
            );
          })}

        </nav>


       {/* Bottom Section */}
            <div className="mt-auto px-4 pb-5">

            {/* Divider */}
            <div className="border-t border-emerald-800 mb-5" />

           

            {/* Logout */}
            <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-5 py-3 rounded-xl
                text-red-300 hover:text-white
                hover:bg-red-500/20
                border border-red-500/30
                hover:border-red-400/50
                transition-all duration-200"
            >
                <LogOut size={22} />

                <span className="text-base font-semibold">
                Logout
                </span>
            </button>

            </div>

      </aside>
    </>
  );
};

export default SupportSidebar;