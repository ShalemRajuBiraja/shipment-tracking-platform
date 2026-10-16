import {
  Clock,
  Package,
  ArrowRight,
  CircleCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";


const RecentShipments = ({ recentShipments }) => {

  const navigate = useNavigate();


  // Convert status like IN_TRANSIT → In Transit
  const formatStatus = (status) => {

    if (!status) return "-";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  };


  // Get different colors based on shipment status
  const getStatusStyle = (status) => {

    switch (status) {

      case "CREATED":
        return { container: "cd-chip--blue" };

      case "PICKED_UP":
        return { container: "cd-chip--purple" };

      case "IN_TRANSIT":
        return { container: "cd-chip--amber" };

      case "OUT_FOR_DELIVERY":
        return { container: "cd-chip--orange" };

      case "DELIVERED":
        return { container: "cd-chip--green" };

      case "DELAYED":
        return { container: "cd-chip--orange" };

      case "CANCELLED":
        return { container: "cd-chip--red" };

      default:
        return { container: "cd-chip--slate" };

    }

  };


  // Show relative tracked time
  const getTrackedTime = (trackedAt) => {

    const now = new Date().getTime();

    const trackedTime =
      new Date(trackedAt).getTime();

    const difference =
      now - trackedTime;

    const minutes =
      Math.floor(difference / (1000 * 60));

    const hours =
      Math.floor(difference / (1000 * 60 * 60));


    if (minutes < 1) {
      return "Just now";
    }


    if (minutes < 60) {
      return `${minutes} min ago`;
    }


    return `${hours} hour${hours > 1 ? "s" : ""} ago`;

  };


  // Don't render if there are no recent shipments
  if (recentShipments.length === 0) {
    return null;
  }


  return (

    <section className="cd-card">

      {/* Header */}
      <div className="cd-card__head">

        <div>

          <h2>Recent Shipments</h2>

          <p>Your recently tracked shipments</p>

        </div>

        <span className="cd-card__badge">
          <Clock size={18} />
        </span>

      </div>


      {/* Shipment List */}
      <div className="cd-list">

        {recentShipments.map((item) => {

          const statusStyle =
            getStatusStyle(item.currentStatus);

          return (

            <div
              key={item.trackingNumber}
              className="cd-ship"
            >

              {/* Left Side */}
              <div className="cd-ship__main">

                <span className="cd-ship__icon">
                  <Package size={20} />
                </span>

                <div className="cd-ship__info">

                  <span className="cd-ship__id">
                    {item.trackingNumber}
                  </span>

                  {/* Sender → Receiver */}
                  <p className="cd-ship__route">
                    {item.senderName || "-"}
                    <ArrowRight size={13} />
                    {item.receiverName || "-"}
                  </p>

                  {/* Time */}
                  <p className="cd-ship__time">
                    <Clock size={13} />
                    Tracked {getTrackedTime(item.trackedAt)}
                  </p>

                </div>

              </div>


              {/* Right Side */}
              <div className="cd-ship__side">

                {/* Status */}
                <span className={`cd-chip ${statusStyle.container}`}>
                  <CircleCheck size={14} />
                  {formatStatus(item.currentStatus)}
                </span>

                {/* View Button */}
                <button
                  onClick={() =>
                    navigate(
                      `/customer/shipment/${item.trackingNumber}`
                    )
                  }
                  className="cd-link"
                >
                  View Details
                  <ArrowRight size={16} />
                </button>

              </div>

            </div>

          );

        })}

      </div>

    </section>

  );

};


export default RecentShipments;
