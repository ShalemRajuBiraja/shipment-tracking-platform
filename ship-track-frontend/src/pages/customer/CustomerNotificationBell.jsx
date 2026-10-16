
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

import CustomerNotificationDropdown from "./CustomerNotificationDropdown";

import {
  getUnreadNotifications,
  markNotificationAsRead,
} from "../../services/notificationService";

export default function CustomerNotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [markingReadId, setMarkingReadId] = useState(null);

  const containerRef = useRef(null);

  // Fetch unread notifications belonging to the logged-in customer.
  const loadNotifications = useCallback(async () => {
    try {
      const response = await getUnreadNotifications();

      if (response?.data?.success === true) {
        setNotifications(response.data.data || []);
      } else {
        console.error(
          "Unable to load notifications:",
          response?.data?.message
        );
      }
    } catch (error) {
      console.error(
        "Error fetching customer notifications:",
        error
      );
    }
  }, []);

  // Load notifications and refresh when the page becomes active.
  useEffect(() => {
    loadNotifications();

    const handleNotificationsUpdated = () => {
      loadNotifications();
    };

    window.addEventListener(
      "notifications:updated",
      handleNotificationsUpdated
    );

    window.addEventListener("focus", loadNotifications);
    window.addEventListener("pageshow", loadNotifications);

    return () => {
      window.removeEventListener(
        "notifications:updated",
        handleNotificationsUpdated
      );

      window.removeEventListener("focus", loadNotifications);
      window.removeEventListener("pageshow", loadNotifications);
    };
  }, [loadNotifications]);

  // Close the dropdown when clicking outside it.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // Mark only the selected notification as read.
  const handleNotificationRead = async (notificationId) => {
    if (markingReadId !== null) {
      return;
    }

    console.log(
      "Mark as Read clicked. Notification ID:",
      notificationId
    );

    setMarkingReadId(notificationId);

    try {
      // Call the existing backend API.
      const response =
        await markNotificationAsRead(notificationId);

      console.log("Mark as Read API response:", response);

      if (response?.data?.success !== true) {
        throw new Error(
          response?.data?.message ||
            "Failed to mark notification as read."
        );
      }

      // Remove the selected notification from the unread list.
      setNotifications((previous) =>
        previous.filter(
          (notification) =>
            String(notification.id) !== String(notificationId)
        )
      );

      // Notify other components that notification state changed.
      window.dispatchEvent(
        new Event("notifications:updated")
      );

      console.log(
        "Notification marked as read successfully."
      );
    } catch (error) {
      console.error(
        "Mark as Read failed:",
        error
      );

      console.error(
        "Backend response:",
        error.response?.data
      );

      // Refresh the unread list if the request fails.
      await loadNotifications();
    } finally {
      setMarkingReadId(null);
    }
  };

  const unreadCount = notifications.length;

  return (
    <div className="relative" ref={containerRef}>
      {/* Notification bell */}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700 transition-colors hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={open}
      >
        <Bell size={22} />

        {/* Unread notification count */}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Customer notification dropdown */}
      {open && (
        <CustomerNotificationDropdown
          notifications={notifications}
          onNotificationRead={handleNotificationRead}
          markingReadId={markingReadId}
        />
      )}
    </div>
  );
}

