import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import SignatureCanvas from "react-signature-canvas";
import { trackShipmentApi } from "../../services/shipmentService";
import {
  confirmDeliveryApi,
  saveSignatureApi,
} from "../../services/deliveryConfirmationService";
import { markNotificationAsRead } from "../../services/notificationService";

export default function DeliveryConfirmation() {
  const { trackingNumber } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const notificationId = searchParams.get("notificationId");

  const signatureRef = useRef(null);

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);

  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const [savingSignature, setSavingSignature] = useState(false);
  const [signatureSaved, setSignatureSaved] = useState(false);


  useEffect(() => {
    loadShipment();
  }, [trackingNumber]);

  const loadShipment = async () => {
    try {
      setLoading(true);

      const response = await trackShipmentApi(trackingNumber);
      const data = response?.data?.data || response?.data;

      console.log(  "DELIVERY CONFIRMATION SHIPMENT RESPONSE:", data );

      setShipment(data);

      if (data?.currentStatus === "DELIVERED") {
        setConfirmed(true);
      }
    } catch (error) {
      console.error(
        "Unable to load shipment:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to load shipment details"
      );
    } finally {
      setLoading(false);
    }
  };

  // Mark the opened notification as read when the user closes this page.
  // The previous button did this as part of the confirmation flow; the Close
  // button now needs to preserve that notification behavior.
  const handleClose = async () => {
    if (notificationId) {
      try {
        await markNotificationAsRead(notificationId);
      } catch (notificationError) {
        console.error(
          "Unable to mark notification as read:",
          notificationError
        );
      }
    }

    navigate(-1);
  };

  // ================= FINAL CONFIRM DELIVERY =================

  const handleConfirmDelivery = async () => {
    if (!signatureSaved) {
      toast.error(
        "Please save your signature first"
      );
      return;
    }

    try {
      setConfirming(true);

      const response =
        await confirmDeliveryApi(
          trackingNumber
        );

      setConfirmed(true);

      toast.success(
        response?.data?.message ||
          "Delivery confirmed successfully"
      );

      if (notificationId) {
        try {
          await markNotificationAsRead(
            notificationId
          );
        } catch (notificationError) {
          console.error(
            "Unable to mark notification as read:",
            notificationError
          );
        }
      }

      await loadShipment();
    } catch (error) {
      console.error(
        "Confirm delivery error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to confirm delivery"
      );
    } finally {
      setConfirming(false);
    }
  };

  // ================= SAVE SIGNATURE =================

  const handleSaveSignature = async () => {
    if (!signatureRef.current) {
      toast.error(
        "Signature area is not available"
      );
      return;
    }

    if (signatureRef.current.isEmpty()) {
      toast.error(
        "Please provide your signature"
      );
      return;
    }

    try {
      setSavingSignature(true);

      const signature =
        signatureRef.current.toDataURL(
          "image/png"
        );

      const response =
        await saveSignatureApi(
          trackingNumber,
          signature
        );

      setSignatureSaved(true);

      toast.success(
        response?.data?.message ||
          "Signature saved successfully"
      );
    } catch (error) {
      console.error(
        "Save signature error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to save signature"
      );
    } finally {
      setSavingSignature(false);
    }
  };

  const handleClearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }

    setSignatureSaved(false);
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="cd cd-dc cd-dc--center">
        <div className="cd-bigspin" />
        <p>
          Loading shipment details...
        </p>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="cd cd-dc cd-dc--center">
        <div className="cd-notfound">
          <span className="cd-notfound__icon">
            <span>!</span>
          </span>
          <h2>Something went wrong</h2>
          <p className="cd-dc__error">
            Shipment details could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="cd cd-dc">
      <div className="cd-dc__inner">

        {/* HEADER */}
        <div className="cd-dc__hero">
          <span className="cd-eyebrow">Delivery confirmation</span>
          <h1>
            Delivery Confirmation
          </h1>
          <p>
            Provide your signature to confirm the delivery.
          </p>
        </div>

        {/* SHIPMENT DETAILS */}
        <section className="cd-card cd-card--flat">
          <div className="cd-card__head">
            <h2>
              Shipment Details
            </h2>
            <span className="cd-tag cd-mono">
              {shipment?.trackingNumber || "N/A"}
            </span>
          </div>

          <div className="cd-dgrid">

            {/* TRACKING NUMBER */}
            <div className="cd-dgrid__item">
              <p>Tracking Number</p>
              <strong className="cd-break">
                {shipment?.trackingNumber || "N/A"}
              </strong>
            </div>

            {/* STATUS */}
            <div className="cd-dgrid__item">
              <p>Status</p>
              <strong>
                {shipment?.currentStatus || "N/A"}
              </strong>
            </div>

            {/* SENDER */}
            <div className="cd-dgrid__item">
              <p>Sender</p>
              <strong>
                {shipment?.senderName || "N/A"}
              </strong>
            </div>

            {/* RECEIVER */}
            <div className="cd-dgrid__item">
              <p>Receiver</p>
              <strong>
                {shipment?.receiverName || "N/A"}
              </strong>
            </div>

            {/* PHONE */}
            <div className="cd-dgrid__item">
              <p>Receiver Phone</p>
              <strong>
                {shipment?.receiverPhone || "N/A"}
              </strong>
            </div>

            {/* WEIGHT */}
            <div className="cd-dgrid__item">
              <p>Weight</p>
              <strong>
                {shipment?.weight !== null &&
                shipment?.weight !== undefined
                  ? `${shipment.weight} kg`
                  : "N/A"}
              </strong>
            </div>

            {/* CREATED AT */}
            <div className="cd-dgrid__item">
              <p>Created At</p>
              <strong>
                {shipment?.createdAt
                  ? new Date(
                      shipment.createdAt
                    ).toLocaleString()
                  : "N/A"}
              </strong>
            </div>

            {/* PACKAGE */}
            <div className="cd-dgrid__item">
              <p>Package</p>
              <strong className="cd-break">
                {shipment?.packageDescription ||
                  "N/A"}
              </strong>
            </div>

            {/* PICKUP ADDRESS */}
            <div className="cd-dgrid__item cd-dgrid__item--wide">
              <p>Pickup Address</p>
              <strong className="cd-dgrid__addr">
                {shipment?.pickupAddress ||
                  "N/A"}
              </strong>
              <span>
                {[
                  shipment?.pickupCity,
                  shipment?.pickupState
                ]
                  .filter(Boolean)
                  .join(", ")}
                {shipment?.pickupPincode
                  ? ` - ${shipment.pickupPincode}`
                  : ""}
              </span>
            </div>

            {/* DELIVERY ADDRESS */}
            <div className="cd-dgrid__item cd-dgrid__item--wide">
              <p>Delivery Address</p>
              <strong className="cd-dgrid__addr">
                {shipment?.deliveryAddress ||
                  "N/A"}
              </strong>
              <span>
                {[
                  shipment?.deliveryCity,
                  shipment?.deliveryState
                ]
                  .filter(Boolean)
                  .join(", ")}
                {shipment?.deliveryPincode
                  ? ` - ${shipment.deliveryPincode}`
                  : ""}
              </span>
            </div>

          </div>
        </section>

        {/* DIGITAL SIGNATURE */}
        {!confirmed && (
          <section className="cd-card cd-card--flat">
            <div className="cd-card__head">
              <div className="cd-card__headrow">
                <span className="cd-step">1</span>
                <div>
                  <h2>
                    Digital Signature
                  </h2>
                  <p>
                    Please provide your signature as delivery evidence.
                  </p>
                </div>
              </div>

              {signatureSaved && (
                <span className="cd-chip cd-chip--green">
                  ✓ Saved
                </span>
              )}
            </div>

            <div className="cd-dc__body">

              <div className="cd-sigbox">
                <SignatureCanvas
                  ref={signatureRef}
                  penColor="black"
                  canvasProps={{
                    className:
                      "cd-sigcanvas"
                  }}
                />
              </div>

              <div className="cd-btnrow">
                <button
                  type="button"
                  onClick={
                    handleClearSignature
                  }
                  disabled={savingSignature}
                  className="cd-btn cd-btn--auto cd-btn--ghost"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={
                    handleSaveSignature
                  }
                  disabled={
                    savingSignature ||
                    signatureSaved
                  }
                  className="cd-btn cd-btn--auto"
                >
                  {savingSignature
                    ? "Saving..."
                    : signatureSaved
                    ? "Signature Saved"
                    : "Save Signature"}
                </button>
              </div>

            </div>
          </section>
        )}

        {/* FINAL CONFIRM DELIVERY */}
        {!confirmed && (
          <section className="cd-card cd-card--flat">
            <div className="cd-card__head">
              <div className="cd-card__headrow">
                <span className="cd-step">2</span>
                <div>
                  <h2>
                    Complete Delivery
                  </h2>
                  <p>
                    Save your signature before confirming the delivery.
                  </p>
                </div>
              </div>
            </div>

            <div className="cd-dc__body">

              <button
                type="button"
                onClick={handleClose}
                className="cd-btn"
              >
                Close
              </button>

              {!signatureSaved ? (
                <p className="cd-dc__hint">
                  Save your signature to enable delivery confirmation.
                </p>
              ) : (
                <p className="cd-dc__hint cd-dc__hint--ok">
                  ✓ Signature saved. You can now confirm the delivery.
                </p>
              )}

            </div>
          </section>
        )}

        {/* COMPLETED */}
        {confirmed && (
          <div className="cd-done">
            <h2>
              ✓ Delivery Completed
            </h2>

            <p>
              Delivery confirmation and digital signature have been successfully completed.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
