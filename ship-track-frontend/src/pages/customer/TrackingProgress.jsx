import { Check, Info, X, MapPin, Clock } from "lucide-react";

const TrackingProgress = ({ shipment }) => {
  const steps = [
    {
      status: "CREATED",
      label: "Created",
    },
    {
      status: "PICKED_UP",
      label: "Picked Up",
    },
    {
      status: "IN_TRANSIT",
      label: "In Transit",
    },
    {
      status: "OUT_FOR_DELIVERY",
      label: "Out for Delivery",
    },
    {
      status: "DELIVERED",
      label: "Delivered",
    },
  ];

  // =========================================================
  // FIND CURRENT SHIPMENT STATUS POSITION
  // =========================================================
  const currentIndex = steps.findIndex(
    (step) => step.status === shipment?.currentStatus
  );

  // =========================================================
  // CHECK IF SHIPMENT IS CANCELLED
  // =========================================================
  const isCancelled = shipment?.currentStatus === "CANCELLED";

  // =========================================================
  // FIND TRACKING RECORD FOR EACH STATUS
  // =========================================================
  const getTrackingRecord = (status) => {
    return shipment?.trackingHistory?.find(
      (history) => history.status === status
    );
  };

  // =========================================================
  // FORMAT DATE AND TIME
  // =========================================================
  const formatDateTime = (dateTime) => {
    if (!dateTime) return null;

    return new Date(dateTime).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="cd-tp">
      {/* HEADER INFO */}
      <div className="cd-tp__head">
        <span className="cd-tp__label">Tracking ID</span>
        <div className="cd-tp__row">
          <p className="cd-tp__id">
            {shipment?.trackingNumber || "N/A"}
          </p>
          <span className="cd-tp__count">
            {steps.length} Milestones
          </span>
        </div>
      </div>

      {/* TIMELINE PROGRESS */}
      <div className="cd-tp__steps">
        {steps.map((step, index) => {
          const isCompleted = !isCancelled && index <= currentIndex;
          const isCurrent = !isCancelled && index === currentIndex;
          const trackingRecord = getTrackingRecord(step.status);
          const isLastStep = index === steps.length - 1;
          const formattedDate = formatDateTime(trackingRecord?.createdAt);

          return (
            <div
              key={step.status}
              className={`cd-tp__step ${isCompleted ? "is-done" : ""} ${isCurrent ? "is-current" : ""}`}
            >
              {/* CONNECTING LINE */}
              {!isLastStep && (
                <div
                  className={`cd-tp__line ${
                    !isCancelled && index < currentIndex ? "is-done" : ""
                  }`}
                />
              )}

              {/* NODE CIRCLE */}
              <div className="cd-tp__node">
                {isCompleted ? (
                  <Check size={15} strokeWidth={3} />
                ) : isCurrent ? (
                  <span className="cd-tp__pulse" />
                ) : (
                  <span className="cd-tp__dot" />
                )}
              </div>

              {/* STEP DETAILS */}
              <div className="cd-tp__body">
                <div className="cd-tp__title">
                  <h3>{step.label}</h3>

                  {isCurrent && (
                    <span className="cd-tp__active">Active</span>
                  )}
                </div>

                {/* DATE & TIME STAMP */}
                <div className="cd-tp__stamp">
                  <Clock size={14} />
                  <span className={formattedDate ? "" : "is-pending"}>
                    {formattedDate || "Pending update"}
                  </span>
                </div>

                {/* LOCATION LOG */}
                {trackingRecord?.location && (
                  <div className="cd-tp__loc">
                    <MapPin size={13} />
                    <span>{trackingRecord.location}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER STATUS BANNER */}
      {isCancelled ? (
        <div className="cd-banner cd-banner--red">
          <span className="cd-banner__icon">
            <X size={16} strokeWidth={3} />
          </span>
          <div>
            <p className="cd-banner__title">Shipment Cancelled</p>
            <p className="cd-banner__text">
              This order was terminated before completion.
            </p>
          </div>
        </div>
      ) : (
        <div className="cd-banner">
          <span className="cd-banner__icon">
            <Info size={16} />
          </span>
          <div>
            <span className="cd-banner__label">Current Stage</span>
            <p className="cd-banner__title cd-banner__title--cap">
              {shipment?.currentStatus?.replaceAll("_", " ")?.toLowerCase()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingProgress;
