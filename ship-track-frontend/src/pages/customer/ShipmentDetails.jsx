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

    <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-5">


      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 pb-4 border-b border-slate-200">


        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Shipment Details
          </h2>

          <div className="flex items-center gap-1.5 mt-1">
            <Hash
              size={15}
              className="text-emerald-600"
            />

            <span className="text-sm font-semibold text-emerald-600 break-all">

              {shipment.trackingNumber}

            </span>

          </div>

        </div>


        {/* =================================================
            STATUS + POD
        ================================================== */}

        <div className="flex flex-col items-start sm:items-end gap-2">


          {/* CURRENT STATUS */}

          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-md w-fit">

            <CircleCheck
              size={15}
            />


            <span className="text-xs font-semibold">

              {formatStatus(
                shipment.currentStatus ||
                  shipment.status
              )}

            </span>

          </div>


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
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              <Download
                size={15}
              />


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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border border-slate-200 rounded-lg overflow-hidden">


        {/* =================================================
            SENDER
        ================================================== */}

        <div className="p-4 border-b border-slate-200 lg:border-r">

          <div className="flex items-center gap-2 mb-3">

            <UserRound
              size={17}
              className="text-emerald-600"
            />


            <h3 className="text-sm font-bold text-slate-700">
              Sender
            </h3>

          </div>


          <p className="font-semibold text-sm text-slate-800">

            {shipment.senderName || "-"}

          </p>

        </div>


        {/* =================================================
            RECEIVER
        ================================================== */}

        <div className="p-4 border-b border-slate-200 lg:border-r">

          <div className="flex items-center gap-2 mb-3">

            <UserRound
              size={17}
              className="text-emerald-600"
            />


            <h3 className="text-sm font-bold text-slate-700">
              Receiver
            </h3>

          </div>


          <p className="font-semibold text-sm text-slate-800">

            {shipment.receiverName || "-"}

          </p>


          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">

            <Phone
              size={14}
              className="text-emerald-600 shrink-0"
            />


            <span className="break-all">

              {shipment.receiverPhone || "-"}

            </span>

          </div>

        </div>


        {/* =================================================
            PACKAGE
        ================================================== */}

        <div className="p-4 border-b border-slate-200">

          <div className="flex items-center gap-2 mb-3">

            <Package
              size={17}
              className="text-emerald-600"
            />


            <h3 className="text-sm font-bold text-slate-700">
              Package
            </h3>

          </div>


          <p className="font-semibold text-sm text-slate-800">

            {shipment.packageDescription || "-"}

          </p>


          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">

            <Weight
              size={14}
              className="text-emerald-600"
            />


            <span>

              Weight: {shipment.weight || "-"} kg

            </span>

          </div>

        </div>


        {/* =================================================
            PICKUP ADDRESS
        ================================================== */}

        <div className="p-4 border-b border-slate-200 lg:border-r">

          <div className="flex items-center gap-2 mb-3">

            <MapPin
              size={17}
              className="text-emerald-600"
            />


            <h3 className="text-sm font-bold text-slate-700">
              Pickup Address
            </h3>

          </div>


        <p className="text-sm text-slate-600 leading-5 break-words whitespace-normal">
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


        {/* =================================================
            DELIVERY ADDRESS
        ================================================== */}

        <div className="p-4 border-b border-slate-200 lg:border-r">

          <div className="flex items-center gap-2 mb-3">

            <MapPin
              size={17}
              className="text-emerald-600"
            />


            <h3 className="text-sm font-bold text-slate-700">
              Delivery Address
            </h3>

          </div>


          <p className="text-sm text-slate-600 leading-5 break-words whitespace-normal">
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


       {/* =================================================
          SHIPMENT DATES
      ================================================== */}

      <div className="p-4">

        {/* SHIPMENT CREATED */}

        <div className="flex items-center gap-2 mb-2">

          <Calendar
            size={17}
            className="text-emerald-600"
          />

          <h3 className="text-sm font-bold text-slate-700">
            Shipment Created
          </h3>

        </div>

        <p className="text-sm text-slate-600 mb-4">
          {formatDate(shipment.createdAt)}
        </p>


        {/* DELIVERED */}

        {isDelivered && (
          <>
            <div className="flex items-center gap-2 mb-2">

              <CircleCheck
                size={17}
                className="text-emerald-600"
              />

              <h3 className="text-sm font-bold text-slate-700">
                Delivered
              </h3>

            </div>

            <p className="text-sm text-slate-600">
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