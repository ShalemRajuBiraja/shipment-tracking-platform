import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getShipmentsApi } from "../../services/shipmentService";

const BusinessDashboard = () => {
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await getShipmentsApi();

        console.log("Fetched shipments:", response.data);

        if (response.data.success === true) {
          setShipments(response.data.data);
        } else {
          console.error(
            "Failed to fetch shipments:",
            response.data.message
          );
        }
      } catch (error) {
        console.error("Error fetching dashboard shipments:", error);
      }
    };

    fetchShipments();
  }, []);

  // Statistics
  const stats = [
    {
      title: "Total Shipments",
      value: shipments.length,
      icon: Package,
      description: "All business shipments",
    },
    {
      title: "In Transit",
      value: shipments.filter(
        (shipment) => shipment.status === "IN_TRANSIT"
      ).length,
      icon: Truck,
      description: "Currently moving",
    },
    {
      title: "Delivered",
      value: shipments.filter(
        (shipment) => shipment.status === "DELIVERED"
      ).length,
      icon: CheckCircle,
      description: "Successfully delivered",
    },
    {
      title: "Pending",
      value: shipments.filter(
        (shipment) => shipment.status === "CREATED"
      ).length,
      icon: Clock,
      description: "Waiting for processing",
    },
  ];

  // Latest 4 shipments
  const recentShipments = [...shipments]
    .sort(
      (a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    )
    .slice(0, 4);

  const getStatusStyle = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-700";

      case "IN_TRANSIT":
        return "bg-blue-100 text-blue-700";

      case "CREATED":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="p-5 md:p-7">

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {stats.map((stat) => {

          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-500">
                    {stat.title}
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-slate-800">
                    {stat.value}
                  </h2>

                </div>

                <div className="rounded-lg bg-blue-50 p-2">

                  <Icon
                    size={22}
                    className="text-blue-600"
                  />

                </div>

              </div>

              <p className="mt-3 text-xs text-slate-400">
                {stat.description}
              </p>

            </div>
          );
        })}

      </div>


      {/* Recent Shipments */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-5 py-4">

          <h2 className="font-semibold text-slate-800">
            Recent Shipments
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest shipments created by your business.
          </p>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-slate-50 text-slate-500">

              <tr>

                <th className="px-5 py-3 text-left">
                  Tracking Number
                </th>

                <th className="px-5 py-3 text-left">
                  Destination
                </th>

                <th className="px-5 py-3 text-left">
                  Status
                </th>

              </tr>

            </thead>


            <tbody>

              {recentShipments.length > 0 ? (

                recentShipments.map((shipment) => (

                  <tr
                    key={shipment.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >

                    <td className="px-5 py-4 font-medium text-blue-600">
                      {shipment.trackingNumber}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {shipment.deliveryAddress}
                    </td>

                    <td className="px-5 py-4">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                          shipment.status
                        )}`}
                      >
                        {shipment.status}
                      </span>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="3"
                    className="py-8 text-center text-slate-500"
                  >
                    No recent shipments found.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default BusinessDashboard;