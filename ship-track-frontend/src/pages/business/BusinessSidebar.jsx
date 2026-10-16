import {
  Truck,
  LayoutDashboard,
  Package,
  PlusCircle,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Headphones,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";

const BusinessSidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/business/dashboard",
    },
    {
      name: "My Shipments",
      icon: Package,
      path: "/business/shipments",
    },
    {
      name: "Create Shipment",
      icon: PlusCircle,
      path: "/business/create-shipment",
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/business/settings",
    },
    {
      name: "Support",
      icon: Headphones,
      path: "/business/support",
    }
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
  navigate("/business/support");
  setIsOpen(false);
};

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-blue-950 flex items-center justify-between px-4 z-50 shadow-md">

        <div className="flex items-center gap-2">
          <Truck size={26} className="text-blue-400" />

          <span className="text-white font-bold text-lg">
            QuickShip
          </span>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="text-white p-2 hover:bg-blue-900 rounded-lg transition"
        >
          <Menu size={24} />
        </button>

      </div>


      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}


      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-blue-950 text-white flex flex-col z-50 transition-transform duration-300 ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >

        {/* Logo */}
        <div className="px-5 py-5 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <Truck
              size={30}
              className="text-blue-400"
            />

            <div>
              <h1 className="text-xl font-bold">
                QuickShip
              </h1>

              <p className="text-xs text-blue-200 mt-0.5">
                Business Client Dashboard
              </p>
            </div>

          </div>


          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 hover:bg-blue-900 rounded-lg"
          >
            <X size={22} />
          </button>

        </div>


        {/* Navigation */}
        <nav className="px-3 space-y-1">

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? "bg-blue-600 shadow-md"
                      : "hover:bg-blue-900"
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

          <div className="border-t border-blue-800 mb-5" />


          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-3 rounded-xl text-red-300 hover:text-white hover:bg-red-500/20 border border-red-500/30 hover:border-red-400/50 transition-all duration-200"
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

export default BusinessSidebar;