import { BellRing, Package, Check } from "lucide-react";

export default function OperatorNotificationDropdown({
notifications,
onNotificationRead,
}) {
return ( <div className="op-notif">
{/* Header */} <div className="op-notif__head"> <span>Notifications</span>


    {notifications.length > 0 && (
      <span className="op-notif__count">
        {notifications.length} unread
      </span>
    )}
  </div>

  {notifications.length === 0 ? (
    <div className="op-notif__empty">
      <span className="op-notif__emptyicon">
        <BellRing size={22} />
      </span>
      No new notifications
    </div>
  ) : (
    <ul className="op-notif__list">
      {notifications.map((notification) => (
        <li key={notification.id} className="op-notif__item">
          <span className="op-notif__icon">
            <Package size={16} />
          </span>

          <div className="op-notif__body">
            <p className="op-notif__msg">
              {notification.message}
            </p>

            {notification.trackingNumber && (
              <p className="op-notif__meta">
                Shipment:{" "}
                <span>{notification.trackingNumber}</span>
              </p>
            )}

            <p className="op-notif__time">
              {notification.createdAt
                ? new Date(notification.createdAt).toLocaleString()
                : ""}
            </p>

            <button
              type="button"
              className="op-notif__readbtn"
              onClick={() => onNotificationRead(notification.id)}
            >
              <Check size={14} />
              Mark as Read
            </button>
          </div>
        </li>
      ))}
    </ul>
  )}
</div>


);
}
