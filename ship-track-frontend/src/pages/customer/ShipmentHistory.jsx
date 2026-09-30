import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Package,
  Search,
  Eye,
} from "lucide-react";

import { getShipmentHistoryApi } from "../../services/shipmentService";

const ShipmentHistory = () => {

  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();


  // ================= FETCH SHIPMENT HISTORY =================

  const fetchShipmentHistory = async () => {

    try {

      setLoading(true);

      const response = await getShipmentHistoryApi();

      if (response.data.success) {
        setShipments(response.data.data);
      }

    } catch (error) {

      console.error(
        "Error fetching shipment history:",
        error
      );

      setShipments([]);

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchShipmentHistory();

  }, []);


  // ================= SEARCH =================

  const filteredShipments = shipments.filter((shipment) => {

    const search = searchTerm.toLowerCase();

    return (
      shipment.trackingNumber
        ?.toLowerCase()
        .includes(search)
    );

  });


  // ================= STATUS STYLE =================

  const getStatusStyle = (status) => {

    if (status === "DELIVERED") {
      return "bg-emerald-100 text-emerald-700";
    }

    if (status === "CANCELLED") {
      return "bg-red-100 text-red-600";
    }

    return "bg-slate-100 text-slate-600";

  };


  // ================= DATE FORMAT =================

  const formatDate = (date) => {

    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      }
    );

  };


  // ================= LOADING =================

  if (loading) {

    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-slate-500">
          Loading shipment history...
        </p>
      </div>
    );

  }


  return (

    <div className="w-full">


      {/* ================= PAGE HEADER ================= */}

      <div className="flex items-center gap-3 mb-6">

        <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">

          <Package
            size={24}
            className="text-emerald-600"
          />

        </div>


        <div>

          <h1 className="text-2xl font-bold text-slate-800">
            Shipment History
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            View your completed and cancelled shipments.
          </p>

        </div>

      </div>


      {/* ================= TABLE CONTAINER ================= */}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">


        {/* ================= TABLE TOP ================= */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-5 border-b border-slate-200">


          <div>

            <h2 className="text-lg font-semibold text-slate-800">
              All History
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Total shipments: {filteredShipments.length}
            </p>

          </div>


          {/* ================= SEARCH ================= */}

          <div className="relative w-full md:w-80">

            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              placeholder="Search shipment..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />

          </div>

        </div>


        {/* ================= TABLE ================= */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[950px]">


            {/* ================= TABLE HEAD ================= */}

            <thead className="bg-slate-50 border-b border-slate-200">

              <tr>

                <th className="px-4 py-4 text-left text-sm font-semibold text-slate-500">
                  Shipment ID
                </th>


                <th className="px-4 py-4 text-left text-sm font-semibold text-slate-500">
                  Tracking Number
                </th>


                <th className="px-4 py-4 text-left text-sm font-semibold text-slate-500">
                  Sender
                </th>


                <th className="px-4 py-4 text-left text-sm font-semibold text-slate-500">
                  Route
                </th>


                <th className="px-4 py-4 text-left text-sm font-semibold text-slate-500">
                  Status
                </th>


                <th className="px-4 py-4 text-left text-sm font-semibold text-slate-500">
                  Date
                </th>


                <th className="px-4 py-4 text-center text-sm font-semibold text-slate-500">
                  Action
                </th>

              </tr>

            </thead>


            {/* ================= TABLE BODY ================= */}

            <tbody>

              {filteredShipments.length === 0 ? (

                <tr>

                  <td
                    colSpan="7"
                    className="text-center py-10 text-sm text-slate-500"
                  >
                    No shipment history found.
                  </td>

                </tr>

              ) : (

                filteredShipments.map((shipment) => (

                  <tr
                    key={shipment.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition"
                  >


                    {/* SHIPMENT ID */}

                    <td className="px-4 py-4">

                      <span className="text-sm font-semibold text-emerald-700">
                        #{shipment.id}
                      </span>

                    </td>


                    {/* TRACKING NUMBER */}

                    <td className="px-4 py-4">

                      <span className="text-sm font-semibold text-slate-700">
                        {shipment.trackingNumber}
                      </span>

                    </td>


                    {/* SENDER */}

                    <td className="px-4 py-4 text-sm text-slate-600">

                      {shipment.senderName || "-"}

                    </td>


                    {/* ROUTE */}

                    <td className="px-4 py-4 text-sm text-slate-600 max-w-[280px]">

                      <span className="truncate block">

                        {shipment.pickupCity}
                        {" → "}
                        {shipment.deliveryCity}

                      </span>

                    </td>


                    {/* STATUS */}

                    <td className="px-4 py-4">

                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold ${getStatusStyle(
                          shipment.status
                        )}`}
                      >

                        {shipment.status?.replaceAll("_", " ")}

                      </span>

                    </td>


                    {/* DATE */}

                    <td className="px-4 py-4 text-sm text-slate-500">

                      {formatDate(shipment.updatedAt)}

                    </td>

                  {/* ACTION */}

                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() =>
                        navigate(`/customer/shipment/${shipment.trackingNumber}`)
                      }
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition"
                    >
                      View Details
                    </button>
                  </td>
                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>


      <footer className="text-center text-xs text-slate-500 py-5">
        © 2026 QuickShip. All rights reserved.
      </footer>

    </div>

  );

};

export default ShipmentHistory;