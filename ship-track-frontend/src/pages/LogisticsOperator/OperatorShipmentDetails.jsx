import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import GoogleShipmentMap from "../../components/GoogleShipmentMap";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Clock,
  TrendingUp,
  CheckCircle2,
  Navigation,
  ShieldAlert,
  Download,
  Check,
} from "lucide-react";
import * as operatorService from "../../services/operatorService";
import { updateShipmentLocation } from "../../services/shipmentService";
import {
  getLatestShipmentLocation,
  getCurrentLocationToDeliveryRoute,
} from "../../services/LocationService";
import {
  confirmDeliveryApi,
  saveDeliveryImageApi,
  openDeliveryConfirmation,
  downloadPodApi,
} from "../../services/deliveryConfirmationService";

const {
  getOperatorShipmentById,
  updateOperatorShipmentStatus,
  getShipmentLocation,
  getShipmentRoute,
  getShipmentEta,
  getShipmentDeliveryForecast,
  getShipmentRouteHistory,
  getRoadFollowingRouteHistory,
} = operatorService;

const formatDuration = (duration) => {
  if (!duration) {
    return "N/A";
  }
  const seconds = parseInt(duration.replace("s", ""), 10);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${minutes}m`;
};

const formatTravelTime = (seconds) => {
  if (seconds === null || seconds === undefined) {
    return "N/A";
  }
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${minutes}m`;
};

const formatDistance = (meters) => {
  if (meters === null || meters === undefined) {
    return "N/A";
  }
  return `${(meters / 1000).toFixed(2)} km`;
};

const OperatorShipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyRoute, setHistoryRoute] = useState(null);
  const [historyRouteLoading, setHistoryRouteLoading] = useState(true);
  const [shipmentLocation, setShipmentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [locationUpdating, setLocationUpdating] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [route, setRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(true);
  const [encodedPolyline, setEncodedPolyline] = useState(null);
  const [currentRoutePolyline, setCurrentRoutePolyline] = useState(null);
  const [eta, setEta] = useState(null);
  const [etaLoading, setEtaLoading] = useState(true);
  const [deliveryForecast, setDeliveryForecast] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(true);
  const [liveLocation, setLiveLocation] = useState(null);
  const [locationInput, setLocationInput] = useState("");
  const [downloadingPod, setDownloadingPod] = useState(false);
  const [selectedDeliveryImage, setSelectedDeliveryImage] = useState(null);
  const [deliveryImagePreview, setDeliveryImagePreview] = useState("");
  const [deliveryImageSaved, setDeliveryImageSaved] = useState(false);
  const [savingDeliveryImage, setSavingDeliveryImage] = useState(false);
  const [confirmingDelivery, setConfirmingDelivery] = useState(false);
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const shipmentRef = useRef(shipment);

  useEffect(() => {
    shipmentRef.current = shipment;
  }, [shipment]);

  const shipmentStatusFlow = [
    "CREATED",
    "PICKED_UP",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];

  useEffect(() => {
    if (!shipment?.trackingNumber) {
      return;
    }
    const interval = setInterval(() => {
      const currentShipment = shipmentRef.current;
      if (currentShipment?.trackingNumber && currentShipment.status !== "DELIVERED") {
        fetchShipmentLocation(
          currentShipment.trackingNumber,
          currentShipment
        );
      }
    }, 900000);
    return () => {
      clearInterval(interval);
    };
  }, [shipment?.trackingNumber, shipment?.status]);

  useEffect(() => {
    fetchShipmentDetails();
  }, [id]);

  useEffect(() => {
    if (!shipment?.trackingNumber || shipment.status === "DELIVERED") {
      return;
    }
    fetchShipmentRouteHistory(shipment.trackingNumber);
    fetchRoadFollowingRouteHistory(shipment.trackingNumber);
  }, [shipment?.trackingNumber, shipment?.status]);

  const fetchShipmentDetails = async () => {
    try {
      setLoading(true);
      const response = await getOperatorShipmentById(id);
      if (response.data.success === true) {
        const shipmentData = response.data.data;
        setShipment(shipmentData);

        if (shipmentData.status === "DELIVERED") {
          setShipmentLocation(null);
          setLiveLocation(null);
          setRoute(null);
          setEncodedPolyline(null);
          setCurrentRoutePolyline(null);
          setEta(null);
          setLocationLoading(false);
          setRouteLoading(false);
          setEtaLoading(false);
          setDeliveryForecast({
            forecast: "DELIVERED",
            message: "Shipment has already been delivered.",
          });
          setForecastLoading(false);
          return;
        }

        fetchShipmentLocation(
          shipmentData.trackingNumber,
          shipmentData
        );
        fetchDeliveryForecast(shipmentData.trackingNumber);
      }
    } catch (error) {
      console.error("Error fetching shipment details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShipmentLocation = async (
    trackingNumber,
    shipmentData
  ) => {
    if (shipmentData?.status === "DELIVERED") {
      setShipmentLocation(null);
      setLiveLocation(null);
      setRoute(null);
      setEncodedPolyline(null);
      setCurrentRoutePolyline(null);
      setEncodedPolyline(null);
      setEta(null);
      setLocationLoading(false);
      setRouteLoading(false);
      setEtaLoading(false);
      return;
    }

    try {
      setLocationLoading(true);
      setRouteLoading(true);
      const response = await getShipmentLocation(trackingNumber);
      const locationData = response.data?.data;
      let latestLocation = null;

      try {
        const latestLocationResponse =
          await getLatestShipmentLocation(trackingNumber);
        latestLocation = latestLocationResponse.data?.data;
        setLiveLocation(latestLocation);

        try {
          const currentRouteResponse =
            await getCurrentLocationToDeliveryRoute(
              trackingNumber
            );
          const currentRouteData =
            currentRouteResponse.data?.routes?.[0];

          if (currentRouteData) {
            const currentPolyline =
              currentRouteData?.polyline?.encodedPolyline;
            setCurrentRoutePolyline(
              currentPolyline || null
            );
          } else {
            setCurrentRoutePolyline(null);
          }
        } catch (currentRouteError) {
          console.warn(
            "Current location → delivery route unavailable:",
            currentRouteError
          );
          setCurrentRoutePolyline(null);
        }
      } catch (latestLocationError) {
        console.warn(
          "Current shipment location not available yet:",
          latestLocationError
        );
        setLiveLocation(null);
      }

      if (!locationData) {
        setShipmentLocation(null);
        setRoute(null);
        setEncodedPolyline(null);
        setEta(null);
        return;
      }

      setShipmentLocation(locationData);

      if (
        locationData.pickupLatitude != null &&
        locationData.pickupLongitude != null &&
        locationData.deliveryLatitude != null &&
        locationData.deliveryLongitude != null
      ) {
        try {
          const routeOrigin =
            `${locationData.pickupLatitude},${locationData.pickupLongitude}`;
          const routeDestination =
            `${locationData.deliveryLatitude},${locationData.deliveryLongitude}`;
          const routeResponse =
            await getShipmentRoute(
              routeOrigin,
              routeDestination
            );
          const routeData =
            routeResponse.data?.data?.routes?.[0];

          if (routeData) {
            setRoute(routeData);
            const polyline =
              routeData?.polyline?.encodedPolyline;

            if (polyline) {
              setEncodedPolyline(polyline);
            } else {
              setEncodedPolyline(null);
            }
          } else {
            setRoute(null);
            setEncodedPolyline(null);
          }
        } catch (routeError) {
          console.error(
            "Error fetching shipment route:",
            routeError
          );
          setRoute(null);
          setEncodedPolyline(null);
        } finally {
          setRouteLoading(false);
        }
      } else {
        setRoute(null);
        setEncodedPolyline(null);
        setRouteLoading(false);
      }

      fetchShipmentEta(
        locationData,
        shipmentData,
        latestLocation
      );
    } catch (error) {
      console.error(
        "Error fetching shipment location:",
        error
      );
      setShipmentLocation(null);
      setRoute(null);
      setEncodedPolyline(null);
      setEta(null);
    } finally {
      setLocationLoading(false);
    }
  };

  const fetchShipmentRouteHistory = async (
    trackingNumber
  ) => {
    try {
      setHistoryLoading(true);
      const response =
        await getShipmentRouteHistory(
          trackingNumber
        );
      setLocationHistory(
        response.data || []
      );
    } catch (error) {
      console.error(
        "Error fetching shipment route history:",
        error
      );
      setLocationHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchRoadFollowingRouteHistory = async (
    trackingNumber
  ) => {
    try {
      setHistoryRouteLoading(true);
      const response =
        await getRoadFollowingRouteHistory(
          trackingNumber
        );
      const routeData =
        response.data?.routes?.[0];
      setHistoryRoute(
        routeData || null
      );
    } catch (error) {
      console.error(
        "Error fetching road-following route history:",
        error
      );
      setHistoryRoute(null);
    } finally {
      setHistoryRouteLoading(false);
    }
  };

  const fetchShipmentEta = async (
    locationData,
    shipmentData,
    latestLocation
  ) => {
    try {
      setEtaLoading(true);
      const originLatitude =
        latestLocation?.latitude ??
        locationData?.pickupLatitude;
      const originLongitude =
        latestLocation?.longitude ??
        locationData?.pickupLongitude;

      if (
        originLatitude == null ||
        originLongitude == null
      ) {
        setEta(null);
        return;
      }

      const destination = [
        shipmentData.deliveryAddress,
        shipmentData.deliveryCity,
        shipmentData.deliveryState,
        shipmentData.deliveryPincode,
      ]
        .filter(Boolean)
        .join(", ");

      if (!destination) {
        setEta(null);
        return;
      }

      const response =
        await getShipmentEta(
          originLatitude,
          originLongitude,
          destination
        );

      if (response.data) {
        setEta(response.data);
      } else {
        setEta(null);
      }
    } catch (error) {
      console.error(
        "Error fetching shipment ETA:",
        error
      );
      setEta(null);
    } finally {
      setEtaLoading(false);
    }
  };

  const fetchDeliveryForecast = async (trackingNumber) => {
    if (!trackingNumber) {
      setDeliveryForecast(null);
      setForecastLoading(false);
      return;
    }

    try {
      setForecastLoading(true);
      const response = await getShipmentDeliveryForecast(trackingNumber);
      // Supports either a direct DTO response or a wrapped { data: ... } response.
      const forecastData = response.data?.data ?? response.data;
      setDeliveryForecast(forecastData || null);
    } catch (error) {
      console.error("Error fetching delivery forecast:", error);
      setDeliveryForecast(null);
    } finally {
      setForecastLoading(false);
    }
  };

  const getNextStatus = () => {
    if (!shipment) {
      return null;
    }

    const currentIndex =
      shipmentStatusFlow.indexOf(
        shipment.status
      );

    if (
      currentIndex === -1 ||
      currentIndex ===
        shipmentStatusFlow.length - 1
    ) {
      return null;
    }

    return shipmentStatusFlow[
      currentIndex + 1
    ];
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus) {
      return;
    }

    try {
      setUpdating(true);
      const response = await updateOperatorShipmentStatus(
        id,
        selectedStatus
      );

      if ( response.data.success === true ) {
        toast.success("Shipment status updated");
        const updatedShipment = response.data.data;

        setShipment( updatedShipment );
        setSelectedStatus("");

        if (updatedShipment.status === "DELIVERED") {
          setShipmentLocation(null);
          setLiveLocation(null);
          setRoute(null);
          setEncodedPolyline(null);
          setCurrentRoutePolyline(null);
          setEta(null);
          setLocationLoading(false);
          setRouteLoading(false);
          setEtaLoading(false);
          setDeliveryForecast({
            forecast: "DELIVERED",
            message: "Shipment has already been delivered.",
          });
          setForecastLoading(false);
          return;
        }

        fetchShipmentLocation(
          updatedShipment.trackingNumber,
          updatedShipment
        );
        fetchDeliveryForecast(updatedShipment.trackingNumber);
      }
    } catch (error) {
      console.error(
        "Error updating shipment status:",
        error
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleDeliveryImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be 10 MB or less.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedDeliveryImage(file);
      setDeliveryImagePreview(String(reader.result || ""));
      setDeliveryImageSaved(false);
    };
    reader.onerror = () => toast.error("Unable to preview this image.");
    reader.readAsDataURL(file);
  };

  const handleSaveDeliveryImage = async () => {
    if (!deliveryImagePreview || !shipment?.trackingNumber) {
      toast.error("Please select or capture a delivery image first.");
      return false;
    }

    try {
      setSavingDeliveryImage(true);
      const response = await saveDeliveryImageApi(
        shipment.trackingNumber,
        deliveryImagePreview
      );

      if (response?.data?.success === false) {
        throw new Error(response.data.message || "Unable to save delivery image.");
      }

      setDeliveryImageSaved(true);
      toast.success(response?.data?.message || "Delivery image saved successfully.");
      return true;
    } catch (error) {
      console.error("Error saving delivery image:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to save delivery image."
      );
      return false;
    } finally {
      setSavingDeliveryImage(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (shipment?.status !== "OUT_FOR_DELIVERY") {
      toast.error("Delivery can only be confirmed when the shipment is out for delivery.");
      return;
    }

    if (!deliveryImageSaved) {
      toast.error("Please save the delivery image before confirming delivery.");
      return;
    }

    try {
      setConfirmingDelivery(true);
      const response = await confirmDeliveryApi(shipment.trackingNumber);

      if (response?.data?.success !== true) {
        throw new Error(response?.data?.message || "Unable to confirm delivery.");
      }

      setShipment(response.data.data);
      setSelectedStatus("");
      setShipmentLocation(null);
      setLiveLocation(null);
      setRoute(null);
      setEncodedPolyline(null);
      setCurrentRoutePolyline(null);
      setEta(null);
      setLocationLoading(false);
      setRouteLoading(false);
      setEtaLoading(false);
      setDeliveryForecast({
        forecast: "DELIVERED",
        message: "Shipment has been delivered.",
      });
      setForecastLoading(false);

      toast.success("Delivery confirmed successfully.");
      // The backend must generate the POD when this operator confirmation succeeds.
      // The existing downloadPodApi is retained for downloading that generated PDF.
    } catch (error) {
      console.error("Error confirming delivery:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to confirm delivery."
      );
    } finally {
      setConfirmingDelivery(false);
    }
  };

  // Preserve the original workflow: request/open the customer's delivery confirmation.
  const handleOpenDeliveryConfirmation = async () => {
    if (!shipment?.trackingNumber) {
      toast.error("Tracking number is unavailable.");
      return;
    }

    try {
      const apiResponse = await openDeliveryConfirmation(shipment.trackingNumber);

      if (apiResponse?.data?.success === true) {
        toast.success("Delivery Confirmation Request sent to Customer.");
      } else {
        toast.error(
          apiResponse?.data?.message || "Unable to open delivery confirmation."
        );
      }
    } catch (error) {
      console.error("Error opening delivery confirmation:", error);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to open delivery confirmation."
      );
    }
  };

  const handleDownloadPod = async () => {
    if (!shipment?.trackingNumber) {
      toast.error("Tracking number is unavailable.");
      return;
    }

    try {
      setDownloadingPod(true);
      const response = await downloadPodApi(shipment.trackingNumber);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `POD-${shipment.trackingNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("POD downloaded successfully.");
    } catch (error) {
      console.error("Error downloading POD:", error);
      toast.error(error.response?.data?.message || "Unable to download POD.");
    } finally {
      setDownloadingPod(false);
    }
  };

  const handleLocationUpdate = async () => {
    const newLocation =
      locationInput.trim();

    if (!newLocation) {
      toast.error(
        "Please enter a location."
      );
      return;
    }

    try {
      setLocationUpdating(true);
      const response =
        await updateShipmentLocation(
          shipment.trackingNumber,
          newLocation
        );

      if (
        response.data?.success === true
      ) {
        toast.success(
          "Shipment location updated successfully."
        );
        setLocationInput("");
        await fetchShipmentLocation(
          shipment.trackingNumber,
          shipment
        );
      }
    } catch (error) {
      console.error(
        "Error updating shipment location:",
        error
      );
      toast.error(
        error.response?.data?.message ||
        "Unable to update shipment location."
      );
    } finally {
      setLocationUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="op-center">
        <div className="op-bigspin" />
        <p>
          Loading shipment details...
        </p>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="op-notfound">
        <span className="op-notfound__icon">
          <ShieldAlert size={28} />
        </span>

        <h2>
          Shipment Not Found
        </h2>

        <p>
          We could not locate this shipment.
        </p>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="op-btn op-btn--auto"
        >
          <ArrowLeft size={17} />
          Back to Shipments
        </button>
      </div>
    );
  }

  const nextStatus = getNextStatus();
  const isCompleted = shipment.status === "DELIVERED";
  const isCancelled = shipment.status === "CANCELLED";
  const estimatedArrival = eta?.estimatedArrival;

  return (
    <div className="op-trackpage">

      {/* Header */}
      <div className="op-trackhead op-trackhead--row">
        <div className="op-trackhead__left">
          <button
            onClick={() => navigate(-1)}
            className="op-backbtn"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div>
            <div className="op-trackhead__title">
              <h1>Shipment Details</h1>

              <span className="op-mono op-tag">
                #{shipment.trackingNumber}
              </span>
            </div>

            <p>Operator shipment management</p>
          </div>
        </div>

        <span className={`op-chip ${getStatusStyle(shipment.status)}`}>
          {formatStatus(shipment.status)}
        </span>
      </div>

      {/* Shipment summary */}
      <section className="op-card op-card--embed">
        <div className="op-card__head">
          <h2>Shipment Information</h2>
        </div>

        <div className="op-info-grid op-info-grid--4">

          <div className="op-info">
            <div className="op-info__head">
              <User size={17} />
              <h3>Sender</h3>
            </div>

            <p className="op-info__value">{shipment.senderName || "N/A"}</p>
          </div>

          <div className="op-info">
            <div className="op-info__head">
              <User size={17} />
              <h3>Receiver</h3>
            </div>

            <p className="op-info__value">{shipment.receiverName || "N/A"}</p>

            <div className="op-info__meta">
              <Phone size={14} />
              <span>{shipment.receiverPhone || "N/A"}</span>
            </div>
          </div>

          <div className="op-info">
            <div className="op-info__head op-info__head--purple">
              <MapPin size={17} />
              <h3>Pickup</h3>
            </div>

            <p className="op-info__value">{shipment.pickupAddress || "N/A"}</p>

            <p className="op-info__text">
              {[shipment.pickupCity, shipment.pickupState].filter(Boolean).join(", ") || "N/A"}
            </p>

            <p className="op-info__pin">PIN: {shipment.pickupPincode || "N/A"}</p>
          </div>

          <div className="op-info">
            <div className="op-info__head op-info__head--orange">
              <MapPin size={17} />
              <h3>Delivery</h3>
            </div>

            <p className="op-info__value">{shipment.deliveryAddress || "N/A"}</p>

            <p className="op-info__text">
              {[shipment.deliveryCity, shipment.deliveryState].filter(Boolean).join(", ") || "N/A"}
            </p>

            <p className="op-info__pin">PIN: {shipment.deliveryPincode || "N/A"}</p>
          </div>

        </div>
      </section>

      {/* Controls */}
      <section className="op-card op-card--embed op-ctrl">

        {/* Update Shipment Location */}
        {!isCompleted && !isCancelled && (
          <div className="op-ctrl__panel">
            <p className="op-ctrl__label">
              Update Shipment Location
            </p>

            <div className="op-inputrow">
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleLocationUpdate()
                }
                placeholder="Enter current location"
                className="op-input"
              />

              <button
                type="button"
                onClick={handleLocationUpdate}
                disabled={locationUpdating}
                className={`op-btn op-btn--auto op-btn--sm ${
                  locationInput.trim() ? "" : "op-btn--ghost"
                }`}
              >
                <MapPin size={16} />

                {locationUpdating
                  ? "Updating..."
                  : "Update Location"}
              </button>
            </div>
          </div>
        )}

        {/* Delivery Image — handled by the logistics operator */}
        {shipment.status === "OUT_FOR_DELIVERY" && !isCompleted && !isCancelled && (
          <div className="op-ctrl__panel">
            <p className="op-ctrl__label">Delivery Image</p>
            <p className="op-ctrl__hint">
              Select a delivery photo or take a picture. An image is required before confirming delivery.
            </p>

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleDeliveryImageSelect}
              hidden
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleDeliveryImageSelect}
              hidden
            />

            <div className="op-inputrow">
              <button
                type="button"
                className="op-btn op-btn--outline op-btn--sm"
                onClick={() => galleryInputRef.current?.click()}
                disabled={savingDeliveryImage || confirmingDelivery}
              >
                Select Image
              </button>
              <button
                type="button"
                className="op-btn op-btn--outline op-btn--sm"
                onClick={() => cameraInputRef.current?.click()}
                disabled={savingDeliveryImage || confirmingDelivery}
              >
                Take / Add Image
              </button>
              {deliveryImagePreview && !deliveryImageSaved && (
                <button
                  type="button"
                  className="op-btn op-btn--auto op-btn--sm"
                  onClick={handleSaveDeliveryImage}
                  disabled={savingDeliveryImage || confirmingDelivery}
                >
                  {savingDeliveryImage ? "Saving Image..." : "Save Delivery Image"}
                </button>
              )}
            </div>

            {deliveryImagePreview && (
              <div className="op-delivery-image-preview">
                <img
                  src={deliveryImagePreview}
                  alt="Selected delivery evidence"
                  style={{
                    display: "block",
                    width: "100%",
                    maxWidth: "360px",
                    maxHeight: "260px",
                    objectFit: "contain",
                    marginTop: "14px",
                    borderRadius: "12px",
                    border: "1px solid #dbeafe",
                    background: "#f8fafc",
                  }}
                />
                <p className="op-ctrl__hint">
                  {deliveryImageSaved
                    ? "✓ Delivery image saved."
                    : selectedDeliveryImage?.name || "Image selected — save it before confirming."}
                </p>
                {deliveryImageSaved && (
                  <button
                    type="button"
                    className="op-btn op-btn--outline op-btn--sm"
                    onClick={() => {
                      setSelectedDeliveryImage(null);
                      setDeliveryImagePreview("");
                      setDeliveryImageSaved(false);
                      if (galleryInputRef.current) galleryInputRef.current.value = "";
                      if (cameraInputRef.current) cameraInputRef.current.value = "";
                    }}
                    disabled={confirmingDelivery}
                  >
                    Replace Image
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Shipment Actions */}
        {!isCompleted && !isCancelled && (
          <div className="op-ctrl__panel op-ctrl__panel--actions">
            <p className="op-ctrl__label">
              Shipment Actions
            </p>

            {/* Original delivery-confirmation request button is retained. */}
            {shipment.status === "OUT_FOR_DELIVERY" && (
              <button
                type="button"
                onClick={handleOpenDeliveryConfirmation}
                className="op-btn op-btn--outline op-ctrl__confirm"
              >
                <CheckCircle2 size={17} />
                Open Delivery Confirmation
              </button>
            )}

            {/* Final status requires delivery evidence and explicit confirmation */}
            {shipment.status === "OUT_FOR_DELIVERY" ? (
              <button
                type="button"
                onClick={handleConfirmDelivery}
                disabled={!deliveryImageSaved || confirmingDelivery || savingDeliveryImage}
                className="op-btn op-btn--auto op-ctrl__confirm"
              >
                <CheckCircle2 size={17} />
                {confirmingDelivery ? "Confirming Delivery..." : "Confirm Delivery"}
              </button>
            ) : nextStatus ? (
              <div className="op-inputrow">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="op-input"
                >
                  <option value="">Select next status</option>
                  <option value={nextStatus}>{formatStatus(nextStatus)}</option>
                </select>

                <button
                  type="button"
                  onClick={handleStatusUpdate}
                  disabled={!selectedStatus || updating}
                  className="op-btn op-btn--auto op-btn--sm"
                >
                  {updating ? "Updating..." : "Update Status"}
                </button>
              </div>
            ) : (
              <p className="op-ctrl__locked">This shipment status is locked.</p>
            )}
          </div>
        )}
      </section>

      {isCompleted ? (

        <section className="op-delivered op-delivered--center">
          <span className="op-delivered__icon">
            <CheckCircle2 size={26} />
          </span>

          <h2>Shipment Delivered</h2>

          <p>
            Live tracking is no longer required. Download the generated Proof of Delivery document when needed.
          </p>

          <button
            type="button"
            onClick={handleDownloadPod}
            disabled={downloadingPod}
            className="op-btn op-btn--auto"
          >
            <Download size={17} />
            {downloadingPod ? "Downloading..." : "Download POD"}
          </button>
        </section>

      ) : !isCancelled && (

        <div className="op-trackgrid">

          {/* Tracking */}
          <div className="op-trackgrid__main">

            <section className="op-card op-card--embed op-card--clip">

              <div className="op-card__head op-card__head--tint">
                <div className="op-card__headrow">
                  <span className="op-card__badge">
                    <Navigation size={18} />
                  </span>

                  <div>
                    <h2>Live Route Map</h2>
                    <p>Pickup to delivery tracking</p>
                  </div>
                </div>

                {shipmentLocation && (
                  <span className="op-live">
                    <span className="op-live__dot" />
                    Signal Active
                  </span>
                )}
              </div>

              {shipmentLocation && !locationLoading && (
                <div className="op-metrics">

                  <div className="op-metric">
                    <span className="op-metric__icon">
                      <MapPin size={20} />
                    </span>

                    <div>
                      <span className="op-metric__label">Distance</span>

                      <strong>
                        {routeLoading ? "Calculating..." : route?.distanceMeters != null ? formatDistance(route.distanceMeters) : eta?.distanceKm != null ? `${Number(eta.distanceKm).toFixed(2)} km` : "N/A"}
                      </strong>
                    </div>
                  </div>

                  <div className="op-metric">
                    <span className="op-metric__icon">
                      <Clock size={20} />
                    </span>

                    <div>
                      <span className="op-metric__label">Transit Time</span>

                      <strong>
                        {routeLoading ? "Calculating..." : route?.duration ? formatDuration(route.duration) : eta?.durationSeconds ? formatTravelTime(eta.durationSeconds) : eta?.travelTime || "N/A"}
                      </strong>
                    </div>
                  </div>

                  <div className="op-metric op-metric--accent">
                    <span className="op-metric__icon">
                      <TrendingUp size={20} />
                    </span>

                    <div>
                      <span className="op-metric__label">Estimated Arrival</span>

                      <strong>
                        {etaLoading ? "Calculating..." : estimatedArrival || "N/A"}
                      </strong>
                    </div>
                  </div>

                </div>
              )}

              <div className="op-mapbox">
                {locationLoading ? (

                  <div className="op-map-state">
                    <div className="op-bigspin" />
                    <p>Loading map...</p>
                  </div>

                ) : shipmentLocation ? (

                  <div className="op-map-frame">
                    <GoogleShipmentMap
                      pickupLatitude={shipmentLocation.pickupLatitude}
                      pickupLongitude={shipmentLocation.pickupLongitude}
                      deliveryLatitude={shipmentLocation.deliveryLatitude}
                      deliveryLongitude={shipmentLocation.deliveryLongitude}
                      currentLatitude={liveLocation?.latitude}
                      currentLongitude={liveLocation?.longitude}
                      encodedPolyline={encodedPolyline}
                      currentRoutePolyline={currentRoutePolyline}
                    />
                  </div>

                ) : (

                  <div className="op-map-state op-map-state--solid">
                    <MapPin size={32} />

                    <strong>Current Location Unavailable</strong>

                    <p>No active GPS location is available for this shipment yet.</p>
                  </div>

                )}
              </div>
            </section>

            <section className="op-card op-card--embed">

              <div className="op-card__head">
                <div className="op-card__headrow">
                  <span className="op-card__badge">
                    <TrendingUp size={18} />
                  </span>

                  <h2>Delivery Forecast</h2>
                </div>

                <span className="op-chip op-chip--blue">
                  {forecastLoading
                    ? "Calculating"
                    : deliveryForecast?.forecast === "DELIVERED"
                    ? "Delivered"
                    : deliveryForecast?.forecast === "EXPECTED"
                    ? "Expected"
                    : "Forecast"}
                </span>
              </div>

              <div className="op-delay__body">

                <div className="op-note">
                  {forecastLoading ? (
                    <div className="op-inline">
                      <div className="op-minispin" />

                      <p>
                        Calculating delivery forecast...
                      </p>
                    </div>
                  ) : deliveryForecast?.message ? (
                    <p className="op-note__strong">
                      {deliveryForecast.message}
                    </p>
                  ) : (
                    <p>
                      Delivery forecast is currently unavailable.
                    </p>
                  )}

                  {deliveryForecast?.forecastedDeliveryTime && (
                    <p className="op-note__foot">
                      Estimated arrival:{" "}
                      <span>
                        {new Date(
                          Number(deliveryForecast.forecastedDeliveryTime)
                        ).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </p>
                  )}
                </div>

              </div>
            </section>

          </div>

          {/* Progress */}
          <aside className="op-card op-card--embed op-card--clip op-sticky">

            <div className="op-card__head op-card__head--tint">
              <div>
                <h2>Tracking Progress</h2>
                <p>Shipment status flow</p>
              </div>
            </div>

            <div className="op-sidepad">

              <div className="op-tp__steps">
                {shipmentStatusFlow.map((status, index) => {
                  const currentIndex = shipmentStatusFlow.indexOf(shipment.status);
                  const isCompletedStep = !isCancelled && index <= currentIndex;
                  const isCurrentStep = !isCancelled && index === currentIndex;
                  const isLastStep = index === shipmentStatusFlow.length - 1;

                  return (
                    <div
                      key={status}
                      className={`op-tp__step ${isCompletedStep ? "is-done" : ""} ${isCurrentStep ? "is-current" : ""}`}
                    >
                      {!isLastStep && (
                        <div
                          className={`op-tp__line ${
                            !isCancelled && index < currentIndex ? "is-done" : ""
                          }`}
                        />
                      )}

                      <div className="op-tp__node">
                        {isCompletedStep ? (
                          <Check size={15} strokeWidth={3} />
                        ) : (
                          <span className="op-tp__dot" />
                        )}
                      </div>

                      <div className="op-tp__body op-tp__body--tight">
                        <div className="op-tp__title">
                          <h3>{formatStatus(status)}</h3>

                          {isCurrentStep && (
                            <span className="op-tp__active">Current Stage</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="op-expect">
                <span>Delivery Expectation</span>

                <p className={deliveryForecast?.forecast === "EXPECTED" ? "is-good" : ""}>
                  {forecastLoading
                    ? "Calculating delivery forecast..."
                    : deliveryForecast?.message || "Delivery forecast unavailable."}
                </p>
              </div>

            </div>
          </aside>

        </div>

      )}

    </div>
  );
};

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
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
};

export default OperatorShipmentDetails;
