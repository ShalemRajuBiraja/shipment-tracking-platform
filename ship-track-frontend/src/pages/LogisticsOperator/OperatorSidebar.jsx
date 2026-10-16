import {
  Truck,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  Headphones,
  LifeBuoy,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";

const OperatorSidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      name: "My Shipments",
      icon: Package,
      path: "/logistics-operator/shipments",
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/logistics-operator/settings",
    },
    {
      name: "Support",
      icon: LifeBuoy,
      path: "/logistics-operator/support",
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
    toast.info("Contact Support Agent for assistance.");
  };

  return (
    <>
      {/* ================= MOBILE HEADER ================= */}
      <div className="op-topbar">
        <div className="op-brand">
          <span className="op-brand__logo">
            <Truck size={20} />
          </span>
          <span className="op-brand__name">QuickShip</span>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="op-iconbtn op-iconbtn--light"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* ================= MOBILE OVERLAY ================= */}
      {isOpen && (
        <div
          className="op-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside className={`op-sidebar ${isOpen ? "is-open" : ""}`}>

        {/* ================= LOGO ================= */}
        <div className="op-sidebar__head">
          <div className="op-brand">
            <span className="op-brand__logo">
              <Truck size={22} />
            </span>

            <div>
              <h1 className="op-brand__name">QuickShip</h1>
              <p className="op-brand__sub">Logistics Operator</p>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="op-iconbtn op-iconbtn--light op-sidebar__close"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* ================= NAVIGATION ================= */}
        <p className="op-nav__label">Menu</p>
        <nav className="op-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `op-nav__item ${isActive ? "is-active" : ""}`
                }
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* ================= BOTTOM SECTION ================= */}
        <div className="op-sidebar__foot">

         

          {/* Logout */}
          <button onClick={handleLogout} className="op-logout">
            <LogOut size={19} />
            <span>Logout</span>
          </button>

        </div>
      </aside>
    </>
  );
};

export default OperatorSidebar;
