import { Outlet } from "react-router-dom";
import { UserRound } from "lucide-react";
import OperatorSidebar from "./OperatorSidebar";
import OperatorNotificationBell from "./OperatorNotificationBell";
import "./OperatorDashboard.css";

const OperatorLayout = () => {
  return (
    <div className="op">

      {/* Persistent Sidebar */}
      <OperatorSidebar />

      {/* Global Operator Header */}
      <header className="op-header">

        {/* Left - Title */}
        <div className="op-header__title">
          <h1>
            Operator Dashboard
          </h1>

          <p>
            Overview of your assigned shipments.
          </p>
        </div>

        {/* Right - Notifications + Profile */}
        <div className="op-header__right">

          {/* Operator Notifications */}
          <OperatorNotificationBell />

          {/* Profile */}
          <div className="op-profile">
            <span className="op-profile__avatar">
              <UserRound size={19} />
            </span>

            <span className="op-profile__name">
              Logistics Operator
            </span>
          </div>

        </div>

      </header>

      {/* Changing Content Area */}
      <main className="op-main">
        <div className="op-main__inner">
          <Outlet />
        </div>
      </main>

    </div>
  );
};

export default OperatorLayout;
