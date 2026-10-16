
import { UserRound } from "lucide-react";
import CustomerNotificationBell from "./CustomerNotificationBell";

const DashboardHeader = () => {
  return (
    <header className="cd-pagehead">
      <h1>Welcome, Customer!</h1>

      <div className="cd-header__right">
        <CustomerNotificationBell />

        <div className="cd-profile">
          <span className="cd-profile__avatar">
            <UserRound size={19} />
          </span>

          <span className="cd-profile__name">
            Customer
          </span>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
