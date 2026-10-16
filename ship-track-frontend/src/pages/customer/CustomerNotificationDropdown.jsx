
import { Check, Package, Clock, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CustomerNotificationDropdown({
  notifications,
  onNotificationRead,
  markingReadId,
}) {
  const navigate = useNavigate();

  // Open delivery confirmation without automatically marking it as read.
  const handleConfirmClick = (notification) => {
    if (!notification.trackingNumber) {
      return;
    }

    navigate(
      `/customer/delivery-confirmation/${notification.trackingNumber}?notificationId=${notification.id}`
    );
  };

  const handleMarkAsRead = (notification) => {
    if (markingReadId === notification.id) {
      return;
    }

    onNotificationRead(notification.id);
  };

  return (
    <div className="absolute right-0 top-full z-50 mt-3 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:w-96">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Notifications
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Your shipment updates
          </p>
        </div>

        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Package size={19} />
        </span>
      </div>

      {/* Notification list */}
      {notifications.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <CheckCircle2 size={24} />
          </span>

          <p className="mt-3 text-sm font-semibold text-slate-700">
            You're all caught up!
          </p>

          <p className="mt-1 text-xs text-slate-500">
            You don't have any unread notifications.
          </p>
        </div>
      ) : (
        <ul className="max-h-[min(28rem,65vh)] overflow-y-auto">
          {notifications.map((notification) => {
            const isMarkingRead =
              String(markingReadId) === String(notification.id);

            const isDeliveryConfirmation =
              notification.message === "Delivery Confirmation Required";

            return (
              <li
                key={notification.id}
                className="border-b border-slate-100 last:border-b-0"
              >
                <div className="bg-blue-50/60 px-5 py-4 transition-colors hover:bg-blue-50">
                  {/* Notification message */}
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                      <Package size={18} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="break-words text-sm font-semibold leading-5 text-slate-800">
                          {notification.message}
                        </p>

                        <span
                          className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600"
                          aria-label="Unread notification"
                          title="Unread"
                        />
                      </div>

                      {/* Tracking number */}
                      {notification.trackingNumber && (
                        <p className="mt-2 text-xs text-slate-500">
                          Shipment ID:{" "}
                          <span className="break-all font-semibold text-slate-700">
                            {notification.trackingNumber}
                          </span>
                        </p>
                      )}

                      {/* Created date */}
                      {notification.createdAt && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                          <Clock size={13} />

                          {new Date(
                            notification.createdAt
                          ).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 pl-12">
                    {isDeliveryConfirmation && (
                      <button
                        type="button"
                        onClick={() =>
                          handleConfirmClick(notification)
                        }
                        disabled={!notification.trackingNumber}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Click to Confirm
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(notification)}
                      disabled={isMarkingRead}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-wait disabled:opacity-60"
                    >
                      <Check size={14} />

                      {isMarkingRead ? "Marking..." : "Mark as Read"}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
          <p className="text-center text-xs text-slate-500">
            {notifications.length} unread{" "}
            {notifications.length === 1
              ? "notification"
              : "notifications"}
          </p>
        </div>
      )}
    </div>
  );
}

