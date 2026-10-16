import {
  Clock,
  Package,
  ArrowRight,
  CircleCheck,
} from "lucide-react";

const SupportRecentShipments = ({
  recentShipments,
  onSelectShipment,
}) => {

  const formatStatus = (status) => {

    if (!status) return "-";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  };


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


  if (recentShipments.length === 0) {
    return null;
  }


  return (

    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">

        <div>

          <h2 className="text-lg font-bold text-slate-800">
            Recent Shipments
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Recently searched shipments
          </p>

        </div>

        <Clock
          size={20}
          className="text-blue-600"
        />

      </div>


      {/* Shipment List */}
      <div className="space-y-3">

        {recentShipments.map((item) => (

          <div
            key={item.trackingNumber}
            className="rounded-lg border border-slate-200 p-3 transition hover:border-blue-300 hover:bg-blue-50/30 md:p-4"
          >

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">


              {/* Left Side */}
              <div className="min-w-0">

                {/* Tracking Number */}
                <div className="flex items-center gap-2">

                  <Package
                    size={17}
                    className="shrink-0 text-blue-600"
                  />

                  <span className="text-sm font-bold text-slate-800">
                    {item.trackingNumber}
                  </span>

                </div>


                {/* Customer */}
                <p className="mt-2 text-xs text-slate-600">
                  {item.customer || "-"}
                </p>


                {/* Route */}
                <p className="mt-1 text-xs text-slate-500">

                  {item.origin || "-"}
                  {" → "}
                  {item.destination || "-"}

                </p>


                {/* Time */}
                <div className="mt-2 flex items-center gap-1.5">

                  <Clock
                    size={13}
                    className="text-slate-400"
                  />

                  <span className="text-xs text-slate-400">
                    Searched {getTrackedTime(item.trackedAt)}
                  </span>

                </div>

              </div>


              {/* Right Side */}
              <div className="flex items-center gap-3">

                {/* Status */}
                <div className="flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1.5 text-blue-700">

                  <CircleCheck size={14} />

                  <span className="text-xs font-semibold">
                    {formatStatus(item.status)}
                  </span>

                </div>


                {/* View */}
                <button
                  onClick={() =>
                    onSelectShipment(item.trackingNumber)
                  }
                  className="flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                >

                  View

                  <ArrowRight size={16} />

                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    </section>

  );
};

export default SupportRecentShipments;