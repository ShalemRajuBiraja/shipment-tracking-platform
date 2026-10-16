const AssignedShipments = ({ shipments = [] }) => {

  const formatStatus = (status) => {
    return status
      ?.replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };
  
  const statusStyle = {
    CREATED: "op-chip--amber",
    PICKED_UP: "op-chip--purple",
    IN_TRANSIT: "op-chip--blue",
    OUT_FOR_DELIVERY: "op-chip--orange",
    DELIVERED: "op-chip--green",
    CANCELLED: "op-chip--red",
  };

  return (
    <section className="op-card op-card--table">

      {/* Header */}
      <div className="op-card__head">
        <div>
          <h2>
            Shipments
          </h2>

          <p>
            Recent shipments in the system
          </p>
        </div>

        <button className="op-link">
          View All
        </button>
      </div>

      {/* Table */}
      <div className="op-table-wrap">
        <table className="op-table op-table--sm">
          <thead>
            <tr>
              <th>
                Tracking Number
              </th>

              <th>
                Receiver
              </th>

              <th>
                Destination
              </th>

              <th>
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {shipments.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="op-table__empty"
                >
                  No shipments found
                </td>
              </tr>
            ) : (
              shipments.map((shipment) => (
                <tr key={shipment.id}>
                  <td>
                    <span className="op-table__id">
                      {shipment.trackingNumber}
                    </span>
                  </td>

                  <td>
                    {shipment.receiverName}
                  </td>

                  <td>
                    {shipment.deliveryCity}
                  </td>

                  <td>
                    <span
                      className={`op-chip ${
                        statusStyle[shipment.status] ||
                        "op-chip--slate"
                      }`}
                    >
                      {formatStatus(shipment.status)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AssignedShipments;
