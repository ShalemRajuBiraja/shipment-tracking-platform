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
  AlertTriangle,
  CheckCircle2,
  Navigation,
  ShieldAlert,
  Download,
} from "lucide-react";
import * as operatorService from "../../services/operatorService";
import { updateShipmentLocation } from "../../services/shipmentService";
import {
  getLatestShipmentLocation,
  getCurrentLocationToDeliveryRoute,
} from "../../services/LocationService";
import {
  openDeliveryConfirmation,
  downloadPodApi,
} from "../../services/deliveryConfirmationService";

const {
  getOperatorShipmentById,
  updateOperatorShipmentStatus,
  getShipmentLocation,
  getShipmentRoute,
  getShipmentEta,
  getShipmentDelayPrediction,
  getShipmentRouteHistory,
  getRoadFollowingRouteHistory,
  getShipmentDeliveryForecast,
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
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [locationUpdating, setLocationUpdating] = useState(false);
  const [shipmentLocation, setShipmentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [route, setRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(true);
  const [encodedPolyline, setEncodedPolyline] = useState(null);
  const [currentRoutePolyline, setCurrentRoutePolyline] = useState(null);
  const [eta, setEta] = useState(null);
  const [etaLoading, setEtaLoading] = useState(true);
  const [delayPrediction, setDelayPrediction] = useState(null);
  const [delayLoading, setDelayLoading] = useState(true);
  const [locationHistory, setLocationHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyRoute, setHistoryRoute] = useState(null);
  const [historyRouteLoading, setHistoryRouteLoading] = useState(false);
  const [deliveryForecast, setDeliveryForecast] = useState(null);
  const [liveLocation, setLiveLocation] = useState(null);
  const [locationInput, setLocationInput] = useState("");
  const [downloadingPod, setDownloadingPod] = useState(false);
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
          setDelayPrediction(null);
          setDeliveryForecast(null);
          setDelayLoading(false);
          return;
        }

        fetchShipmentLocation(
          shipmentData.trackingNumber,
          shipmentData
        );
        fetchDelayPrediction(shipmentData.trackingNumber);
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

  const fetchDelayPrediction = async (
    trackingNumber
  ) => {
    try {
      setDelayLoading(true);
      const response =
        await getShipmentDelayPrediction(
          trackingNumber
        );
      const forecastResponse =
        await getShipmentDeliveryForecast(
          trackingNumber
        );
      setDeliveryForecast(
        forecastResponse.data
      );

      if (response.data) {
        setDelayPrediction(
          response.data
        );
      } else {
        setDelayPrediction(null);
      }
    } catch (error) {
      console.error(
        "Error fetching delay prediction:",
        error
      );
      setDelayPrediction(null);
    } finally {
      setDelayLoading(false);
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
          setDelayPrediction(null);
          setDeliveryForecast(null);
          setDelayLoading(false);
          return;
        }

        fetchShipmentLocation(
          updatedShipment.trackingNumber,
          updatedShipment
        );
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

  const handleOpenDeliveryConfirmation =
    async () => {
      try {
        const apiResponse =  await openDeliveryConfirmation( shipment.trackingNumber
          );

        if (
          apiResponse.data.success === true
        ) {
          toast.success(
            "Delivery Confirmation Request sent to Customer."
          );
        } else {
          toast.error( apiResponse.data.message ||  "Unable to open delivery confirmation." );
        }
      } catch (error) {
         console.error( "Error opening delivery confirmation:",  error );
          const errorMessage =
                             error.response?.data?.message ||
                             error.response?.data?.error ||
                            "Unable to open delivery confirmation.";

         toast.error(errorMessage);  
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
        <p className="mt-4 text-sm font-medium text-slate-600">
          Loading shipment details...
        </p>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <ShieldAlert className="h-6 w-6 text-slate-500" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-800">
          Shipment Not Found
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          We could not locate this shipment.
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shipments
        </button>
      </div>
    );
  }

  const nextStatus = getNextStatus();
  const isCompleted = shipment.status === "DELIVERED";
  const isCancelled = shipment.status === "CANCELLED";
  const estimatedArrival =
    eta?.estimatedArrival || deliveryForecast?.forecastedDeliveryTime;
  const isDelayed =
    delayPrediction?.prediction === "DELAYED" ||
    delayPrediction?.delayMinutes > 0;
  const isOnTime = delayPrediction?.prediction === "ON_TIME";

  return (
    <div className="mx-auto max-w-7xl space-y-4 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Shipment Details</h1>
              <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-600">
                #{shipment.trackingNumber}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">Operator shipment management</p>
          </div>
        </div>
        <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold uppercase ${getStatusStyle(shipment.status)}`}>
          {formatStatus(shipment.status)}
        </span>
      </div>

      {/* Shipment summary */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-900">Shipment Information</h2>
        </div>
        <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          <div className="p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
              <User className="h-4 w-4 text-emerald-600" /> Sender
            </div>
            <p className="text-sm font-semibold text-slate-800">{shipment.senderName || "N/A"}</p>
          </div>
          <div className="p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
              <User className="h-4 w-4 text-blue-600" /> Receiver
            </div>
            <p className="text-sm font-semibold text-slate-800">{shipment.receiverName || "N/A"}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Phone className="h-3.5 w-3.5" />{shipment.receiverPhone || "N/A"}</p>
          </div>
          <div className="p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
              <MapPin className="h-4 w-4 text-purple-600" /> Pickup
            </div>
            <p className="text-sm font-semibold text-slate-800">{shipment.pickupAddress || "N/A"}</p>
            <p className="mt-1 text-xs text-slate-500">{[shipment.pickupCity, shipment.pickupState].filter(Boolean).join(", ") || "N/A"}</p>
            <p className="mt-0.5 font-mono text-[11px] text-slate-400">PIN: {shipment.pickupPincode || "N/A"}</p>
          </div>
          <div className="p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
              <MapPin className="h-4 w-4 text-orange-600" /> Delivery
            </div>
            <p className="text-sm font-semibold text-slate-800">{shipment.deliveryAddress || "N/A"}</p>
            <p className="mt-1 text-xs text-slate-500">{[shipment.deliveryCity, shipment.deliveryState].filter(Boolean).join(", ") || "N/A"}</p>
            <p className="mt-0.5 font-mono text-[11px] text-slate-400">PIN: {shipment.deliveryPincode || "N/A"}</p>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-1 divide-y divide-slate-100 lg:grid-cols-[1fr_auto] lg:divide-x lg:divide-y-0">

          {/* Update Shipment Location */}
          {!isCompleted && !isCancelled && (
            <div className="p-4">
              <p className="mb-2 text-xs font-semibold text-slate-500">
                Update Shipment Location
              </p>

              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleLocationUpdate()
                  }
                  placeholder="Enter current location"
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

                <button
                  type="button"
                  onClick={handleLocationUpdate}
                  disabled={locationUpdating}
                  className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition disabled:opacity-60 ${
                    locationInput.trim()
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <MapPin
                    className={`h-4 w-4 ${
                      locationInput.trim()
                        ? "text-white"
                        : "text-emerald-600"
                    }`}
                  />

                  {locationUpdating
                    ? "Updating..."
                    : "Update Location"}
                </button>
              </div>
            </div>
          )}

          {/* Shipment Actions */}
          {!isCompleted && !isCancelled && (
            <div className="p-4 lg:min-w-[360px]">

              <p className="mb-2 text-xs font-semibold text-slate-500">
                Shipment Actions
              </p>

              {/* Update Shipment Status */}
              {nextStatus ? (
                <div className="flex flex-col gap-2 sm:flex-row">

                  <select
                    value={selectedStatus}
                    onChange={(e) =>
                      setSelectedStatus(e.target.value)
                    }
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="">
                      Select next status
                    </option>

                    <option value={nextStatus}>
                      {formatStatus(nextStatus)}
                    </option>
                  </select>

                  <button
                    type="button"
                    onClick={handleStatusUpdate}
                    disabled={!selectedStatus || updating}
                    className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {updating
                      ? "Updating..."
                      : "Update Status"}
                  </button>

                </div>
              ) : (
                <p className="py-2 text-xs font-medium text-slate-500">
                  This shipment status is locked.
                </p>
              )}

              {/* Open Delivery Confirmation */}
              {shipment.status === "OUT_FOR_DELIVERY" && (
                <button
                  type="button"
                  onClick={handleOpenDeliveryConfirmation}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-600 bg-white px-4 py-2.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Open Delivery Confirmation
                </button>
              )}

            </div>
          )}

        </div>
      </section>

      {isCompleted ? (
        <section className="rounded-xl border border-emerald-200 bg-white shadow-sm">
          <div className="flex flex-col items-center justify-center px-5 py-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            <h2 className="mt-3 text-lg font-bold text-slate-900">Shipment Delivered</h2>
            <p className="mt-1 max-w-md text-xs text-slate-500">Live tracking is no longer required. Download the Proof of Delivery document when needed.</p>
            <button
              type="button"
              onClick={handleDownloadPod}
              disabled={downloadingPod}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {downloadingPod ? "Downloading..." : "Download POD"}
            </button>
          </div>
        </section>
      ) : !isCancelled && (
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          {/* Tracking */}
          <div className="min-w-0 space-y-4">
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-emerald-600" />
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Live Route Map</h2>
                    <p className="text-[11px] text-slate-500">Pickup to delivery tracking</p>
                  </div>
                </div>
                {shipmentLocation && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Signal Active
                  </span>
                )}
              </div>

              {shipmentLocation && !locationLoading && (
                <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
                  <div className="px-3 py-3">
                    <span className="block text-[10px] uppercase tracking-wide text-slate-400">Distance</span>
                    <span className="text-sm font-bold text-slate-800">{routeLoading ? "Calculating..." : route?.distanceMeters != null ? formatDistance(route.distanceMeters) : eta?.distanceKm != null ? `${Number(eta.distanceKm).toFixed(2)} km` : "N/A"}</span>
                  </div>
                  <div className="px-3 py-3">
                    <span className="block text-[10px] uppercase tracking-wide text-slate-400">Transit Time</span>
                    <span className="text-sm font-bold text-slate-800">{routeLoading ? "Calculating..." : route?.duration ? formatDuration(route.duration) : eta?.durationSeconds ? formatTravelTime(eta.durationSeconds) : eta?.travelTime || "N/A"}</span>
                  </div>
                  <div className="bg-emerald-50/40 px-3 py-3">
                    <span className="block text-[10px] uppercase tracking-wide text-emerald-700">Estimated Arrival</span>
                    <span className="text-sm font-bold text-emerald-700">{etaLoading ? "Calculating..." : estimatedArrival || "N/A"}</span>
                  </div>
                </div>
              )}

              <div className="p-3">
                {locationLoading ? (
                  <div className="flex h-[360px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50">
                    <div className="text-center"><div className="mx-auto h-7 w-7 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" /><p className="mt-2 text-xs text-slate-500">Loading map...</p></div>
                  </div>
                ) : shipmentLocation ? (
                  <div className="overflow-hidden rounded-lg border border-slate-200">
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
                  <div className="flex h-[360px] flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-center">
                    <MapPin className="h-7 w-7 text-slate-300" />
                    <p className="mt-2 text-sm font-semibold text-slate-700">Current Location Unavailable</p>
                    <p className="mt-1 max-w-xs text-xs text-slate-500">No active GPS location is available for this shipment yet.</p>
                  </div>
                )}
              </div>
            </section>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-900">Delivery Forecast</h2>
                </div>
                {deliveryForecast ? (
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"><span className="text-xs text-slate-500">Status</span><span className="text-xs font-bold text-slate-800">{deliveryForecast.currentStatus || deliveryForecast.status || "N/A"}</span></div>
                    <div className="flex justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"><span className="text-xs text-slate-500">Forecast</span><span className="text-right text-xs font-bold text-emerald-600">{deliveryForecast.forecastedDelivery ? new Date(deliveryForecast.forecastedDelivery).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) : "N/A"}</span></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-slate-100 p-2 text-center"><span className="block text-[10px] text-slate-400">Distance</span><span className="text-xs font-bold text-slate-700">{deliveryForecast.distanceMeters != null ? formatDistance(deliveryForecast.distanceMeters) : "N/A"}</span></div>
                      <div className="rounded-lg border border-slate-100 p-2 text-center"><span className="block text-[10px] text-slate-400">Time</span><span className="text-xs font-bold text-slate-700">{deliveryForecast.travelTimeMinutes != null ? formatTravelTime(deliveryForecast.travelTimeMinutes * 60) : "N/A"}</span></div>
                    </div>
                  </div>
                ) : <p className="mt-5 text-center text-xs text-slate-400">Delivery forecast unavailable.</p>}
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2"><AlertTriangle className={`h-4 w-4 ${isDelayed ? "text-amber-600" : "text-emerald-600"}`} /><h2 className="text-sm font-bold text-slate-900">Delay Assessment</h2></div>
                  {delayPrediction && <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isDelayed ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{isDelayed ? "Risk Flagged" : "On Schedule"}</span>}
                </div>
                {delayPrediction ? (
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"><span className="text-xs text-slate-500">Prediction</span><span className="text-xs font-bold text-slate-800">{delayPrediction.prediction || "N/A"}</span></div>
                    <div className="flex justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"><span className="text-xs text-slate-500">Variance</span><span className={`text-xs font-bold ${isDelayed ? "text-amber-600" : "text-slate-800"}`}>{delayPrediction.delayMinutes != null ? `+${delayPrediction.delayMinutes} mins` : "0 mins"}</span></div>
                    <div className="rounded-lg bg-slate-50 px-3 py-2"><span className="block text-[10px] font-semibold uppercase text-slate-400">Analysis</span><p className="mt-1 text-xs leading-relaxed text-slate-600">{delayPrediction.message || "No operational warnings logged."}</p></div>
                  </div>
                ) : <p className="mt-5 text-center text-xs text-slate-400">Delay prediction unavailable.</p>}
              </section>
            </div>
          </div>

          {/* Progress */}
          <aside className="min-w-0 rounded-xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-4">
            <div className="border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-bold text-slate-900">Tracking Progress</h2>
              <p className="text-[11px] text-slate-500">Shipment status flow</p>
            </div>
            <div className="p-4">
              <div className="relative pl-6">
                <div className="absolute bottom-2 left-[8px] top-2 w-px bg-slate-200" />
                {shipmentStatusFlow.map((status, index) => {
                  const currentIndex = shipmentStatusFlow.indexOf(shipment.status);
                  const isCompletedStep = !isCancelled && index <= currentIndex;
                  const isCurrentStep = !isCancelled && index === currentIndex;
                  return (
                    <div key={status} className="relative mb-5 last:mb-0">
                      <div className={`absolute -left-[23px] top-0.5 h-4 w-4 rounded-full border-2 ${isCurrentStep ? "border-emerald-600 bg-emerald-600 ring-4 ring-emerald-100" : isCompletedStep ? "border-emerald-600 bg-emerald-600" : "border-slate-300 bg-white"}`} />
                      <p className={`text-xs font-semibold ${isCurrentStep ? "text-emerald-700" : isCompletedStep ? "text-slate-800" : "text-slate-400"}`}>{formatStatus(status)}</p>
                      {isCurrentStep && <span className="mt-1 inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600">Current Stage</span>}
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 border-t border-slate-100 pt-3">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Delivery Expectation</span>
                <p className={`mt-1 text-xs font-bold ${isDelayed ? "text-red-600" : isOnTime ? "text-emerald-600" : "text-slate-700"}`}>
                  {delayLoading ? "Calculating..." : isDelayed ? "Shipment may arrive late" : isOnTime ? "Shipment is on schedule" : deliveryForecast?.forecast === "DELIVERED" ? "Shipment has been delivered" : "Prediction unavailable"}
                </p>
                {isDelayed && delayPrediction?.delayMinutes != null && <p className="mt-2 rounded-md bg-red-50 px-2 py-1.5 text-[11px] text-red-600">Estimated delay: <strong>{delayPrediction.delayMinutes} min</strong></p>}
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
      return "bg-green-100 text-green-700 border border-green-200";
    case "IN_TRANSIT":
      return "bg-blue-100 text-blue-700 border border-blue-200";
    case "CREATED":
      return "bg-amber-100 text-amber-700 border border-amber-200";
    case "PICKED_UP":
      return "bg-purple-100 text-purple-700 border border-purple-200";
    case "OUT_FOR_DELIVERY":
      return "bg-orange-100 text-orange-700 border border-orange-200";
    case "CANCELLED":
      return "bg-red-100 text-red-700 border border-red-200";
    default:
      return "bg-slate-100 text-slate-700 border border-slate-200";
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