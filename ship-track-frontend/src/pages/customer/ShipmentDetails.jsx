import {
  UserRound,
  Phone,
  Package,
  MapPin,
  Hash,
  CircleCheck,
  Calendar,
  Weight,
  Download,
} from "lucide-react";

import { useState } from "react";
import { toast } from "react-toastify";

import { downloadPodApi } from "../../services/deliveryConfirmationService";


const ShipmentDetails = ({ shipment }) => {

  const [downloadingPod, setDownloadingPod] = useState(false);


  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (dateTime) => {

    if (!dateTime) return "-";

    return new Date(dateTime).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  // =========================================================
  // FORMAT STATUS
  // =========================================================

  const formatStatus = (status) => {

    return status?.replaceAll("_", " ") || "-";

  };


  // =========================================================
  // CHECK DELIVERED STATUS
  // =========================================================

  const isDelivered =
    shipment?.currentStatus === "DELIVERED" ||
    shipment?.status === "DELIVERED";


  // =========================================================
  // DOWNLOAD POD
  // =========================================================

  const handleDownloadPod = async () => {

    if (!shipment?.trackingNumber) {

      toast.error("Tracking number is unavailable.");

      return;
    }


    try {

      setDownloadingPod(true);


      const response =
        await downloadPodApi(
          shipment.trackingNumber
        );


      const blob =
        new Blob(
          [response.data],
          {
            type: "application/pdf",
          }
        );


      const url =
        window.URL.createObjectURL(
          blob
        );


      const link =
        document.createElement("a");


      link.href = url;

      link.download =
        `POD-${shipment.trackingNumber}.pdf`;


      document.body.appendChild(
        link
      );


      link.click();


      link.remove();


      window.URL.revokeObjectURL(
        url
      );


      toast.success(
        "POD PDF downloaded successfully."
      );

    } catch (error) {

      console.error(
        "Error downloading POD:",
        error
      );


      toast.error(
        error.response?.data?.message ||
          "Unable to download POD PDF."
      );

    } finally {

      setDownloadingPod(false);

    }

  };

  // UI

  return (

    <section className="cd-card cd-card--embed">


      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="cd-detail__head">


        <div>
          <h2>Shipment Details</h2>

          <div className="cd-detail__track">
            <Hash size={15} />

            <span>{shipment.trackingNumber}</span>
          </div>
        </div>


        {/* =================================================
            STATUS + POD
        ================================================== */}

        <div className="cd-detail__side">


          {/* CURRENT STATUS */}

          <span className="cd-chip cd-chip--blue">

            <CircleCheck size={15} />

            {formatStatus(
              shipment.currentStatus ||
                shipment.status
            )}

          </span>


          {/* DOWNLOAD POD */}

          {isDelivered && (

            <button
              type="button"
              onClick={
                handleDownloadPod
              }
              disabled={
                downloadingPod
              }
              className="cd-btn cd-btn--auto cd-btn--sm"
            >

              <Download size={15} />

              {downloadingPod
                ? "Downloading..."
                : "Download POD PDF"}

            </button>

          )}

        </div>

      </div>


      {/* =====================================================
          SHIPMENT DETAILS GRID
      ====================================================== */}

      <div className="cd-info-grid">


        {/* SENDER */}

        <div className="cd-info">

          <div className="cd-info__head">
            <UserRound size={17} />
            <h3>Sender</h3>
          </div>

          <p className="cd-info__value">
            {shipment.senderName || "-"}
          </p>

        </div>


        {/* RECEIVER */}

        <div className="cd-info">

          <div className="cd-info__head">
            <UserRound size={17} />
            <h3>Receiver</h3>
          </div>

          <p className="cd-info__value">
            {shipment.receiverName || "-"}
          </p>

          <div className="cd-info__meta">
            <Phone size={14} />
            <span>{shipment.receiverPhone || "-"}</span>
          </div>

        </div>


        {/* PACKAGE */}

        <div className="cd-info">

          <div className="cd-info__head">
            <Package size={17} />
            <h3>Package</h3>
          </div>

          <p className="cd-info__value">
            {shipment.packageDescription || "-"}
          </p>

          <div className="cd-info__meta">
            <Weight size={14} />
            <span>Weight: {shipment.weight || "-"} kg</span>
          </div>

        </div>


        {/* PICKUP ADDRESS */}

        <div className="cd-info">

          <div className="cd-info__head">
            <MapPin size={17} />
            <h3>Pickup Address</h3>
          </div>

          <p className="cd-info__text">
            {[
              shipment.pickupAddress,
              shipment.pickupCity,
              shipment.pickupState,
              shipment.pickupPincode,
            ]
              .filter(Boolean)
              .join(", ") || "-"}
          </p>

        </div>


        {/* DELIVERY ADDRESS */}

        <div className="cd-info">

          <div className="cd-info__head">
            <MapPin size={17} />
            <h3>Delivery Address</h3>
          </div>

          <p className="cd-info__text">
            {[
              shipment.deliveryAddress,
              shipment.deliveryCity,
              shipment.deliveryState,
              shipment.deliveryPincode,
            ]
              .filter(Boolean)
              .join(", ") || "-"}
          </p>

        </div>


        {/* SHIPMENT DATES */}

        <div className="cd-info">

          <div className="cd-info__head">
            <Calendar size={17} />
            <h3>Shipment Created</h3>
          </div>

          <p className="cd-info__text">
            {formatDate(shipment.createdAt)}
          </p>


          {/* DELIVERED */}

          {isDelivered && (
            <>
              <div className="cd-info__head cd-info__head--gap">
                <CircleCheck size={17} />
                <h3>Delivered</h3>
              </div>

              <p className="cd-info__text">
                {formatDate(shipment.deliveredAt)}
              </p>
            </>
          )}

        </div>

      </div>

    </section>

  );

};


export default ShipmentDetails;
