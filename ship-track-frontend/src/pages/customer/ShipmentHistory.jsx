import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Package,
  Search,
  Eye,
  Loader2,
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
      return "cd-chip--green";
    }

    if (status === "CANCELLED") {
      return "cd-chip--red";
    }

    return "cd-chip--slate";

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
      <div className="cd-loading">
        <Loader2 size={22} className="cd-spin" />
        <p>
          Loading shipment history...
        </p>
      </div>
    );

  }


  return (

    <div className="cd-wide">


      {/* ================= PAGE HEADER ================= */}

      <div className="cd-pagetitle cd-pagetitle--icon">

        <span className="cd-card__badge cd-card__badge--solid cd-card__badge--lg">

          <Package size={24} />

        </span>


        <div>

          <h1>
            Shipment History
          </h1>

          <p>
            View your completed and cancelled shipments.
          </p>

        </div>

      </div>


      {/* ================= TABLE CONTAINER ================= */}

      <div className="cd-card cd-card--table">


        {/* ================= TABLE TOP ================= */}

        <div className="cd-tabletop">


          <div>

            <h2>
              All History
            </h2>

            <p>
              Total shipments: {filteredShipments.length}
            </p>

          </div>


          {/* ================= SEARCH ================= */}

          <div className="cd-searchbox">

            <Search size={18} />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              placeholder="Search shipment..."
            />

          </div>

        </div>


        {/* ================= TABLE ================= */}

        <div className="cd-table-wrap">

          <table className="cd-table">


            {/* ================= TABLE HEAD ================= */}

            <thead>

              <tr>

                <th>Shipment ID</th>

                <th>Tracking Number</th>

                <th>Sender</th>

                <th>Route</th>

                <th>Status</th>

                <th>Date</th>

                <th className="is-center">Action</th>

              </tr>

            </thead>


            {/* ================= TABLE BODY ================= */}

            <tbody>

              {filteredShipments.length === 0 ? (

                <tr>

                  <td
                    colSpan="7"
                    className="cd-table__empty"
                  >
                    No shipment history found.
                  </td>

                </tr>

              ) : (

                filteredShipments.map((shipment) => (

                  <tr key={shipment.id}>


                    {/* SHIPMENT ID */}

                    <td>

                      <span className="cd-table__id">
                        #{shipment.id}
                      </span>

                    </td>


                    {/* TRACKING NUMBER */}

                    <td>

                      <span className="cd-table__strong">
                        {shipment.trackingNumber}
                      </span>

                    </td>


                    {/* SENDER */}

                    <td>

                      {shipment.senderName || "-"}

                    </td>


                    {/* ROUTE */}

                    <td className="cd-table__route">

                      <span>

                        {shipment.pickupCity}
                        {" → "}
                        {shipment.deliveryCity}

                      </span>

                    </td>


                    {/* STATUS */}

                    <td>

                      <span
                        className={`cd-chip ${getStatusStyle(
                          shipment.status
                        )}`}
                      >

                        {shipment.status?.replaceAll("_", " ")}

                      </span>

                    </td>


                    {/* DATE */}

                    <td className="cd-table__muted">

                      {formatDate(shipment.updatedAt)}

                    </td>


                    {/* ACTION */}

                    <td className="is-center">
                      <button
                        onClick={() =>
                          navigate(`/customer/shipment/${shipment.trackingNumber}`)
                        }
                        className="cd-link"
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


      <footer className="cd-footer">
        © 2026 QuickShip. All rights reserved.
      </footer>

    </div>

  );

};

export default ShipmentHistory;
