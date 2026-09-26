
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
        return {
          container:
            "bg-blue-50 text-blue-700",
          icon:
            "text-blue-600",
        };


      case "PICKED_UP":
        return {
          container:
            "bg-purple-50 text-purple-700",
          icon:
            "text-purple-600",
        };


      case "IN_TRANSIT":
        return {
          container:
            "bg-amber-50 text-amber-700",
          icon:
            "text-amber-600",
        };


      case "OUT_FOR_DELIVERY":
        return {
          container:
            "bg-orange-50 text-orange-700",
          icon:
            "text-orange-600",
        };


      case "DELIVERED":
        return {
          container:
            "bg-emerald-50 text-emerald-700",
          icon:
            "text-emerald-600",
        };


      case "DELAYED":
        return {
          container:
            "bg-orange-50 text-orange-700",
          icon:
            "text-orange-600",
        };


      case "CANCELLED":
        return {
          container:
            "bg-red-50 text-red-700",
          icon:
            "text-red-600",
        };


      default:
        return {
          container:
            "bg-slate-50 text-slate-600",
          icon:
            "text-slate-500",
        };

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

    <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-5 mb-4">


      {/* Header */}
      <div className="flex items-center justify-between mb-4">

        <div>

          <h2 className="text-lg font-bold text-slate-800">
            Recent Shipments
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Your recently tracked shipments
          </p>

        </div>


        <Clock
          size={20}
          className="text-emerald-600"
        />

      </div>


      {/* Shipment List */}
      <div className="space-y-3">

        {recentShipments.map((item) => {

          const statusStyle =
            getStatusStyle(item.currentStatus);


          return (

            <div
              key={item.trackingNumber}
              className="border border-slate-200 rounded-lg p-3 md:p-4 hover:border-emerald-300 hover:bg-emerald-50/30 transition"
            >

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">


                {/* Left Side */}
                <div className="min-w-0">

                  <div className="flex items-center gap-2">

                    <Package
                      size={17}
                      className="text-emerald-600 shrink-0"
                    />

                    <span className="font-bold text-sm text-slate-800">
                      {item.trackingNumber}
                    </span>

                  </div>


                  {/* Sender → Receiver */}
                  <p className="text-xs text-slate-500 mt-2">

                    {item.senderName || "-"}
                    {" → "}
                    {item.receiverName || "-"}

                  </p>


                  {/* Time */}
                  <div className="flex items-center gap-1.5 mt-2">

                    <Clock
                      size={13}
                      className="text-slate-400"
                    />

                    <span className="text-xs text-slate-400">
                      Tracked {getTrackedTime(item.trackedAt)}
                    </span>

                  </div>

                </div>


                {/* Right Side */}
                <div className="flex items-center gap-3">


                  {/* Status */}
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md ${statusStyle.container}`}
                  >

                    <CircleCheck
                      size={14}
                      className={statusStyle.icon}
                    />

                    <span className="text-xs font-semibold">
                      {formatStatus(item.currentStatus)}
                    </span>

                  </div>


                  {/* View Button */}
                  <button
                    onClick={() =>
                      navigate(
                        `/customer/shipment/${item.trackingNumber}`
                      )
                    }
                    className="flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition"
                  >

                    View Details

                    <ArrowRight size={16} />

                  </button>

                </div>

              </div>

            </div>

          );

        })}

      </div>

    </section>

  );

};


export default RecentShipments;
