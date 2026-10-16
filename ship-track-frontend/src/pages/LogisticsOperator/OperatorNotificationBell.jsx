import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import OperatorNotificationDropdown from "./OperatorNotificationDropdown";
import {
getUnreadNotifications,
markNotificationAsRead,
} from "../../services/notificationService";

export default function OperatorNotificationBell() {
const [open, setOpen] = useState(false);
const [notifications, setNotifications] = useState([]);
const [markingReadIds, setMarkingReadIds] = useState([]);

const ref = useRef(null);

// Load unread notifications from the backend
useEffect(() => {
const loadNotifications = async () => {
try {
const response = await getUnreadNotifications();


    if (response.data.success === true) {
      setNotifications(response.data.data || []);
    }
  } catch (error) {
    console.error("Error fetching operator notifications:", error);
  }
};

loadNotifications();


}, []);

// Unread count
const unreadCount = notifications.length;

// Mark one notification as read in the database
const handleNotificationRead = async (notificationId) => {
if (markingReadIds.includes(notificationId)) {
return;
}


setMarkingReadIds((previous) => [...previous, notificationId]);

try {
  const response = await markNotificationAsRead(notificationId);

  if (response.data.success === true) {
    setNotifications((previous) =>
      previous.filter(
        (notification) => notification.id !== notificationId,
      ),
    );
  }
} catch (error) {
  console.error("Error marking notification as read:", error);
} finally {
  setMarkingReadIds((previous) =>
    previous.filter((id) => id !== notificationId),
  );
}


};

// Close dropdown when clicking outside
useEffect(() => {
function handleClickOutside(event) {
if (ref.current && !ref.current.contains(event.target)) {
setOpen(false);
}
}


document.addEventListener("mousedown", handleClickOutside);

return () => {
  document.removeEventListener("mousedown", handleClickOutside);
};


}, []);

return ( <div className="op-bellwrap" ref={ref}>
<button
type="button"
onClick={() => setOpen((previous) => !previous)}
className={`op-bell ${open ? "is-open" : ""}`}
aria-label="Notifications"
aria-expanded={open}
> <Bell size={20} />


    {unreadCount > 0 && (
      <span className="op-bell__badge">{unreadCount}</span>
    )}
  </button>

  {open && (
    <OperatorNotificationDropdown
      notifications={notifications}
      onNotificationRead={handleNotificationRead}
    />
  )}
</div>


);
}
