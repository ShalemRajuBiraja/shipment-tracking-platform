import { Outlet } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";
import CustomerHeader from "./CustomerHeader";
import "./CustomerDashboard.css";

const CustomerLayout = () => {
  return (
    <div className="cd">
      {/* Persistent Customer Sidebar */}
      <CustomerSidebar />

      {/* Persistent Fixed Customer Header */}
      <CustomerHeader />

      {/* Changing Page Content */}
      <main className="cd-main">
        <div className="cd-main__inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default CustomerLayout;
