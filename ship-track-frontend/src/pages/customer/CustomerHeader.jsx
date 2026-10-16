import { useLocation } from "react-router-dom";
import { UserRound } from "lucide-react";
import CustomerNotificationBell from "./CustomerNotificationBell";

const CustomerHeader = () => {
  const { pathname } = useLocation();

  const pageTitles = {
    "/customer/dashboard": "Welcome, Customer!",
    "/customer/shipment-history": "Shipment History",
    "/customer/create-shipment": "Create Shipment",
    "/customer/settings": "Settings",
    "/customer/support": "Contact Support",
  };

  const pageSubtitles = {
    "/customer/dashboard": "Track your shipments and see what's on the move.",
    "/customer/shipment-history": "Everything you've shipped, in one place.",
    "/customer/create-shipment": "Send a new package in a few steps.",
    "/customer/settings": "Manage your account security.",
    "/customer/support": "We're here to help with any issue.",
  };

  const title = pageTitles[pathname] || "Customer Dashboard";
  const subtitle = pageSubtitles[pathname];

  return (
    <header className="cd-header">
      {/* Current Page Title */}
      <div className="cd-header__title">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      {/* Notifications and Profile */}
      <div className="cd-header__right">
        <CustomerNotificationBell />

        <div className="cd-profile">
          <span className="cd-profile__avatar">
            <UserRound size={19} />
          </span>
          <span className="cd-profile__name">Customer</span>
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader;
