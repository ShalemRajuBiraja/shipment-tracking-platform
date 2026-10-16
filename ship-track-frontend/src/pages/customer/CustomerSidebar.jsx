import {
  Truck,
  LayoutDashboard,
  PackageCheck,
  PackagePlus,
  Settings,
  LogOut,
  Headphones,
  Menu,
  X,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";

const CustomerSidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/customer/dashboard",
    },
    {
      name: "Shipment History",
      icon: PackageCheck,
      path: "/customer/shipment-history",
    },
    {
      name: "Create Shipment",
      icon: PackagePlus,
      path: "/customer/create-shipment",
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/customer/settings",
    },
    {
      name: "Support",
      icon: Headphones,
      path: "/customer/support",
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
    navigate("/customer/support");
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="cd-topbar">
        <div className="cd-brand">
          <span className="cd-brand__logo">
            <Truck size={20} />
          </span>
          <span className="cd-brand__name">QuickShip</span>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="cd-iconbtn cd-iconbtn--light"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="cd-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`cd-sidebar ${isOpen ? "is-open" : ""}`}>
        {/* Logo */}
        <div className="cd-sidebar__head">
          <div className="cd-brand">
            <span className="cd-brand__logo">
              <Truck size={22} />
            </span>

            <div>
              <h1 className="cd-brand__name">QuickShip</h1>
              <p className="cd-brand__sub">Customer Dashboard</p>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="cd-iconbtn cd-iconbtn--light cd-sidebar__close"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <p className="cd-nav__label">Menu</p>
        <nav className="cd-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `cd-nav__item ${isActive ? "is-active" : ""}`
                }
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="cd-sidebar__foot">
         
          {/* Logout */}
          <button onClick={handleLogout} className="cd-logout">
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default CustomerSidebar;
