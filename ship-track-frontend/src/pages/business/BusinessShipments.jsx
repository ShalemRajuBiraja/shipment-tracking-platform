import { Package, Search, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { getShipmentsApi } from "../../services/shipmentService";

const BusinessShipments = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [shipments, setShipments] = useState([]);

  const filteredShipments = shipments.filter((shipment) => {
    const search = searchTerm.toLowerCase();

    return (
      shipment.id?.toString().includes(searchTerm) ||
      shipment.trackingNumber?.toLowerCase().includes(search) ||
      shipment.receiverName?.toLowerCase().includes(search) ||
      shipment.deliveryAddress?.toLowerCase().includes(search)
    );
  });

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await getShipmentsApi();

        if (response.data.success) {
          setShipments(response.data.data);
        } else {
          console.error(
            "Failed to fetch shipments:",
            response.data.message
          );
        }
      } catch (error) {
        console.error("Error fetching shipments:", error);
      }
    };

    fetchShipments();
  }, []);

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case "CREATED":
        return "bg-purple-100 text-purple-700";

      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "IN_TRANSIT":
      case "IN TRANSIT":
        return "bg-blue-100 text-blue-700";

      case "OUT_FOR_DELIVERY":
        return "bg-orange-100 text-orange-700";

      case "DELIVERED":
        return "bg-green-100 text-green-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString();
  };

  const handleViewDetails = (shipmentId) => {
    navigate(`/business/shipments/${shipmentId}`);
  };

  return (
    <div className="p-5 md:p-7">

      {/* Page Header */}
      <div className="mb-6">

        <div className="flex items-center gap-3">

          <div className="p-2 bg-emerald-50 rounded-lg">
            <Package
              size={22}
              className="text-emerald-600"
            />
          </div>

          <div>
            <h5 className="text-2xl font-bold text-slate-800">
              My Shipments
            </h5>

            <p className="text-sm text-slate-500 mt-1">
              View and manage your business shipments.
            </p>
          </div>

        </div>

      </div>


      {/* Shipment Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">

        {/* Top Section */}
        <div className="p-5 border-b border-slate-100">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>
              <h2 className="font-semibold text-slate-800">
                All Shipments
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Total shipments: {shipments.length}
              </p>
            </div>


            {/* Search */}
            <div className="relative">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search shipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 border border-slate-300 rounded-lg py-2 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

            </div>

          </div>

        </div>


        {/* Table */}
        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-slate-50">

              <tr className="text-left text-slate-500">

                <th className="px-5 py-3 font-medium">
                  Shipment ID
                </th>

                <th className="px-5 py-3 font-medium">
                  Tracking Number
                </th>

                <th className="px-5 py-3 font-medium">
                  Recipient
                </th>

                <th className="px-5 py-3 font-medium">
                  Route
                </th>

                <th className="px-5 py-3 font-medium">
                  Status
                </th>

                <th className="px-5 py-3 font-medium">
                  Date
                </th>

                <th className="px-5 py-3 font-medium text-center">
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredShipments.length > 0 ? (

                filteredShipments.map((shipment) => (

                  <tr
                    key={shipment.id}
                    className="border-t border-slate-100 hover:bg-slate-50 transition"
                  >

                    {/* Shipment ID */}
                    <td className="px-5 py-4 font-medium text-emerald-600">
                      #{shipment.id}
                    </td>


                    {/* Tracking Number */}
                    <td className="px-5 py-4">

                      <span className="font-medium text-slate-700">
                        {shipment.trackingNumber || "-"}
                      </span>

                    </td>


                    {/* Recipient */}
                    <td className="px-5 py-4 text-slate-700">
                      {shipment.receiverName}
                    </td>


                    {/* Route */}
                    <td className="px-5 py-4 text-slate-600">

                      <div className="max-w-xs truncate">
                        {shipment.pickupAddress}
                        {" → "}
                        {shipment.deliveryAddress}
                      </div>

                    </td>


                    {/* Status */}
                    <td className="px-5 py-4">

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                          shipment.status
                        )}`}
                      >
                        {formatStatus(shipment.status)}
                      </span>

                    </td>


                    {/* Date */}
                    <td className="px-5 py-4 text-slate-500">
                      {formatDate(shipment.createdAt)}
                    </td>


                    {/* View Details */}
                    <td className="px-5 py-4 text-center">

                      <button
                        onClick={() =>
                          handleViewDetails(shipment.id)
                        }
                        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                      >
                        <Eye size={16} />

                        View Details
                      </button>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="7"
                    className="text-center py-8 text-slate-500"
                  >
                    No shipments found.
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

export default BusinessShipments;