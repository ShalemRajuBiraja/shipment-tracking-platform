import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import {
  getUnreadNotifications,
  markNotificationAsRead,
} from "../../../services/notificationService";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const ref = useRef(null);

  // Always get the unread list from the backend so the UI reflects its latest state.
  const loadNotifications = useCallback(async () => {
    try {
      const response = await getUnreadNotifications();

      if (response?.data?.success === true) {
        setNotifications(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, []);

  useEffect(() => {
    loadNotifications();

    // DeliveryConfirmation can mark a notification as read while this component
    // remains mounted. Refresh the unread list as soon as that happens.
    const handleNotificationsUpdated = () => {
      loadNotifications();
    };

    window.addEventListener("notifications:updated", handleNotificationsUpdated);
    window.addEventListener("focus", loadNotifications);
    window.addEventListener("pageshow", loadNotifications);

    return () => {
      window.removeEventListener("notifications:updated", handleNotificationsUpdated);
      window.removeEventListener("focus", loadNotifications);
      window.removeEventListener("pageshow", loadNotifications);
    };
  }, [loadNotifications]);

  const unreadCount = notifications.length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);

      // Remove it immediately for a responsive UI; the service event also
      // refreshes the list from the backend to keep the state in sync.
      setNotifications((previous) =>
        previous.filter(
          (notification) => String(notification.id) !== String(notificationId)
        )
      );
    } catch (error) {
      console.error("Unable to mark notification as read:", error);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell size={22} />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationDropdown
          notifications={notifications}
          onNotificationRead={handleNotificationRead}
        />
      )}
    </div>
  );
}
