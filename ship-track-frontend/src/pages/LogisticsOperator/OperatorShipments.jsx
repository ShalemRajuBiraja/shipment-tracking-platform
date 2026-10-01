import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Package,
  MapPin,
  Eye,
  UserRound,
} from "lucide-react";
import { getAllOperatorShipments } from "../../services/operatorService";

const OperatorShipments = () => {
  const navigate = useNavigate();

  const [shipments, setShipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const response = await getAllOperatorShipments();

      if (response.data.success === true) {
        setShipments(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching shipments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredShipments = shipments.filter(
    (shipment) =>
      shipment.trackingNumber
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      shipment.senderName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      shipment.receiverName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      shipment.pickupCity
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      shipment.deliveryCity
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-700";

      case "IN_TRANSIT":
        return "bg-blue-100 text-blue-700";

      case "CREATED":
        return "bg-amber-100 text-amber-700";

      case "PICKED_UP":
        return "bg-purple-100 text-purple-700";

      case "OUT_FOR_DELIVERY":
        return "bg-orange-100 text-orange-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const formatStatus = (status) => {
    return status
      ?.replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleViewDetails = (id) => {
    navigate(`/logistics-operator/shipments/${id}`);
  };

  if (loading) {
    return (
      <div className="p-4 text-sm text-slate-500">
        Loading shipments...
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        {/* Left */}
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            My Shipments
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View and manage all shipments.
          </p>
        </div>


      </div>


      {/* Summary Card */}
      <div className="inline-flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-5 py-3 shadow-sm">

        <div className="rounded-lg bg-emerald-50 p-2">
          <Package
            size={22}
            className="text-emerald-600"
          />
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Total Shipments
          </p>

          <p className="text-lg font-semibold text-slate-800">
            {shipments.length}
          </p>
        </div>

      </div>


      {/* Shipments Table Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* Card Header */}
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="font-semibold text-slate-800">
              Shipment List
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Monitor and manage all shipments in the system.
            </p>
          </div>


          {/* Search */}
          <div className="relative w-full sm:w-64">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search shipments..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-500"
            />

          </div>

        </div>


        {/* Table */}
        <div className="overflow-x-auto">

          <table className="w-full min-w-[900px]">

            <thead className="border-b border-slate-200 bg-slate-50">

              <tr>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                  Tracking Number
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                  Sender
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                  Receiver
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                  Route
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                  Status
                </th>

                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500">
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredShipments.map((shipment) => (

                <tr
                  key={shipment.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >

                  <td className="px-5 py-4 text-sm font-semibold text-emerald-600">
                    {shipment.trackingNumber}
                  </td>


                  <td className="px-5 py-4 text-sm text-slate-700">
                    {shipment.senderName}
                  </td>


                  <td className="px-5 py-4 text-sm text-slate-700">
                    {shipment.receiverName}
                  </td>


                  <td className="px-5 py-4">

                    <div className="flex items-center gap-2 text-sm text-slate-600">

                      <MapPin
                        size={16}
                        className="text-emerald-600"
                      />

                      <span>
                        {shipment.pickupCity}
                      </span>

                      <span className="text-slate-400">
                        →
                      </span>

                      <span>
                        {shipment.deliveryCity}
                      </span>

                    </div>

                  </td>


                  <td className="px-5 py-4">

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                        shipment.status
                      )}`}
                    >
                      {formatStatus(shipment.status)}
                    </span>

                  </td>


                  {/* View Details */}
                  <td className="px-5 py-4 text-center">

                    <button
                      onClick={() =>
                        handleViewDetails(shipment.id)
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-600 transition hover:bg-emerald-50"
                    >
                      <Eye size={15} />

                      View Details
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>


          {/* Empty State */}
          {filteredShipments.length === 0 && (

            <div className="py-10 text-center">

              <Package
                size={35}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-sm text-slate-500">
                No shipments found.
              </p>

            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default OperatorShipments;