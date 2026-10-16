import {
  Truck,
  LayoutDashboard,
  Package,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  PlusCircle,
  Headphones,
  Copy,
  Check,
  
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";

const AdminSidebar = () => {

  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    {
      name: "Shipments",
      icon: Package,
      path: "/admin/shipments",
    },
    {
      name: "Analytics",
      icon: BarChart3,
      path: "/admin/analytics",
    },
    {
      name: "Create Shipment",
      icon: PlusCircle,
      path: "/admin/create-shipment",
    },
    {
      name: "Users",
      icon: Users,
      path: "/admin/users",
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/admin/settings",
    },
  ];

  // Logout
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

  // Support
const handleSupportClick = () => {

  setIsSupportModalOpen(true);

};
const handleCopyEmail = async () => {

  await navigator.clipboard.writeText(
    "shalemrajubiraja7@gmail.com"
  );

  setIsCopied(true);

  setTimeout(() => {

    setIsCopied(false);

  }, 2000);

};

  return (
    <>
      {/* ================= MOBILE HEADER ================= */}
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


      {/* ================= MOBILE OVERLAY ================= */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}


      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-blue-950 text-white flex flex-col z-50 transition-transform duration-300 ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >

        {/* ================= LOGO ================= */}
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
                Admin Dashboard
              </p>
            </div>

          </div>


          {/* Mobile Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 hover:bg-blue-900 rounded-lg"
          >
            <X size={22} />
          </button>

        </div>


        {/* ================= NAVIGATION ================= */}
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


        {/* ================= BOTTOM SECTION ================= */}
        <div className="mt-auto px-4 pb-5">

          {/* Divider */}
          <div className="border-t border-blue-800 mb-5" />


          {/* Need Help Section */}
         <button
            type="button"
            onClick={handleSupportClick}
            className="w-full bg-blue-900/70 border border-blue-800 rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-blue-900 transition mb-4 text-left"
          >
            <Headphones
              size={22}
              className="text-blue-300"
            />

            <div>
              <h3 className="font-semibold text-sm">
                Need Help?
              </h3>

              <p className="text-xs text-blue-100 mt-0.5">
                Contact Development Team
              </p>
            </div>
          </button>


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
      {/* ================= SUPPORT MODAL ================= */}

{isSupportModalOpen && (

  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

    {/* Overlay */}

    <div
      className="absolute inset-0 bg-black/50"
      onClick={() => setIsSupportModalOpen(false)}
    />


    {/* Modal */}

    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">

      {/* Close Button */}

      <button
        onClick={() => setIsSupportModalOpen(false)}
        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
      >
        <X size={20} />
      </button>


      {/* Icon */}

      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">

        <Headphones
          size={24}
          className="text-blue-600"
        />

      </div>


      {/* Title */}

      <h2 className="text-xl font-bold text-slate-800">

        Contact Development Team

      </h2>


      <p className="text-sm text-slate-500 mt-2 mb-5">

        Send your queries to the development team using the email below.

      </p>


      {/* Email Box */}

      <div className="flex items-center justify-between gap-3 border border-slate-200 bg-slate-50 rounded-xl px-4 py-3">

        <span className="text-sm font-medium text-slate-700 break-all">

          shalemrajubiraja7@gmail.com

        </span>


        <button
          onClick={handleCopyEmail}
          className="flex-shrink-0 p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
          title="Copy email"
        >

          {isCopied ? (

            <Check size={19} />

          ) : (

            <Copy size={19} />

          )}

        </button>

      </div>


      {/* Bottom Message */}

      <p className="text-xs text-slate-400 mt-4">

        Send your queries to this email.

      </p>


      {/* Close Button */}

      <button
        onClick={() => setIsSupportModalOpen(false)}
        className="w-full mt-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
      >

        Close

      </button>

    </div>

  </div>

)}
    </>
  );
};

export default AdminSidebar;