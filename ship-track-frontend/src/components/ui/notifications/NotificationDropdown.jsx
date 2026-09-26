
import { useNavigate } from "react-router-dom";

export default function NotificationDropdown({
  notifications,
  onNotificationRead
}) {
  const navigate = useNavigate();

  const handleConfirmClick = (notification) => {
    navigate(
      `/customer/delivery-confirmation/${notification.trackingNumber}?notificationId=${notification.id}`
    );
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
      <div className="px-4 py-3 border-b border-slate-200 font-semibold text-sm text-slate-800">
        Notifications
      </div>

      {notifications.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-slate-500">
          No new notifications
        </div>
      ) : (
        <ul className="max-h-72 overflow-y-auto">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className="px-4 py-3 text-sm border-b border-slate-100 last:border-0 bg-emerald-50"
            >
              <p className="font-medium text-slate-800">
                {notification.message}
              </p>

              {notification.trackingNumber && (
                <p className="text-xs text-slate-500 mt-1">
                  Shipment:{" "}
                  <span className="font-medium text-slate-700">
                    {notification.trackingNumber}
                  </span>
                </p>
              )}

              {notification.message ===
                "Delivery Confirmation Required" && (
                <button
                  type="button"
                  onClick={() => handleConfirmClick(notification)}
                  className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-md transition"
                >
                  Click to Confirm
                </button>
              )}

              <p className="text-xs text-slate-400 mt-2">
                {new Date(
                  notification.createdAt
                ).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

