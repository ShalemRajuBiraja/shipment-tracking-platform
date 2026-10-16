import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Package,
  MapPin,
  Eye,
  UserRound,
  Loader2,
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
        return "op-chip--green";

      case "IN_TRANSIT":
        return "op-chip--blue";

      case "CREATED":
        return "op-chip--amber";

      case "PICKED_UP":
        return "op-chip--purple";

      case "OUT_FOR_DELIVERY":
        return "op-chip--orange";

      case "CANCELLED":
        return "op-chip--red";

      default:
        return "op-chip--slate";
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
      <div className="op-loading">
        <Loader2 size={22} className="op-spin" />
        <p>
          Loading shipments...
        </p>
      </div>
    );
  }

  return (
    <div className="op-wide">

      {/* Page Header */}
      <div className="op-pagetitle op-pagetitle--icon">

        <span className="op-card__badge op-card__badge--solid op-card__badge--lg">
          <Package size={24} />
        </span>

        {/* Left */}
        <div>
          <h1>
            My Shipments
          </h1>

          <p>
            View and manage all shipments.
          </p>
        </div>

      </div>

      {/* Summary Card */}
      <div className="op-stat op-stat--inline">

        <span className="op-stat__icon op-stat__icon--indigo">
          <Package size={22} />
        </span>

        <div>
          <p>
            Total Shipments
          </p>

          <strong>
            {shipments.length}
          </strong>
        </div>

      </div>

      {/* Shipments Table Card */}
      <div className="op-card op-card--table">

        {/* Card Header */}
        <div className="op-tabletop">

          <div>
            <h2>
              Shipment List
            </h2>

            <p>
              Monitor and manage all shipments in the system.
            </p>
          </div>

          {/* Search */}
          <div className="op-searchbox">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search shipments..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </div>

        </div>

        {/* Table */}
        <div className="op-table-wrap">

          <table className="op-table">

            <thead>
              <tr>
                <th>
                  Tracking Number
                </th>

                <th>
                  Sender
                </th>

                <th>
                  Receiver
                </th>

                <th>
                  Route
                </th>

                <th>
                  Status
                </th>

                <th className="is-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredShipments.map((shipment) => (
                <tr key={shipment.id}>

                  <td>
                    <span className="op-table__id">
                      {shipment.trackingNumber}
                    </span>
                  </td>

                  <td>
                    {shipment.senderName}
                  </td>

                  <td>
                    {shipment.receiverName}
                  </td>

                  <td>
                    <div className="op-route">
                      <MapPin size={16} />

                      <span>
                        {shipment.pickupCity}
                      </span>

                      <span className="op-route__arrow">
                        →
                      </span>

                      <span>
                        {shipment.deliveryCity}
                      </span>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`op-chip ${getStatusStyle(
                        shipment.status
                      )}`}
                    >
                      {formatStatus(shipment.status)}
                    </span>
                  </td>

                  {/* View Details */}
                  <td className="is-center">
                    <button
                      onClick={() =>
                        handleViewDetails(shipment.id)
                      }
                      className="op-link"
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
            <div className="op-tableempty">
              <Package size={35} />

              <p>
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
