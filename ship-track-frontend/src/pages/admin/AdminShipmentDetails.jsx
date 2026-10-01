import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Package,
  User,
  Phone,
  Mail,
  MapPin,
  Truck,
  Weight,
  Calendar,
  Navigation,
  Route,
  Clock,
  TrendingUp,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  FileDown,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import GoogleShipmentMap from "../../components/GoogleShipmentMap";

import { getShipmentByIdApi } from "../../services/shipmentService";

import {
  getShipmentLocation,
  getShipmentRoute,
  getShipmentEta,
  getShipmentDelayPrediction,
  getShipmentDeliveryForecast,
} from "../../services/operatorService";

import { downloadPodApi } from "../../services/deliveryConfirmationService";

// =========================================================
// ADMIN SHIPMENT DETAILS
// =========================================================

const AdminShipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // =======================================================
  // STATE
  // =======================================================

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);

  const [shipmentLocation, setShipmentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const [route, setRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [encodedPolyline, setEncodedPolyline] = useState(null);

  const [etaInfo, setEtaInfo] = useState(null);
  const [etaLoading, setEtaLoading] = useState(false);

  const [deliveryForecast, setDeliveryForecast] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);

  const [delayPrediction, setDelayPrediction] = useState(null);
  const [delayLoading, setDelayLoading] = useState(false);

  const [podDownloading, setPodDownloading] = useState(false);

  // =======================================================
  // FORMAT TRAVEL TIME
  // =======================================================

  const formatTravelTime = (seconds) => {
    if (seconds === null || seconds === undefined) {
      return "N/A";
    }

    const totalMinutes = Math.round(Number(seconds) / 60);
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

  // =======================================================
  // FORMAT DISTANCE
  // =======================================================

  const formatDistance = (meters) => {
    if (meters === null || meters === undefined) {
      return "N/A";
    }

    return `${(Number(meters) / 1000).toFixed(2)} km`;
  };

  // =======================================================
  // FORMAT ROUTE DURATION
  // =======================================================

  const formatRouteDuration = (duration) => {
    if (!duration) {
      return "N/A";
    }

    if (typeof duration === "string" && duration.endsWith("s")) {
      const totalSeconds = parseInt(duration.replace("s", ""), 10);

      if (!Number.isNaN(totalSeconds)) {
        return formatTravelTime(totalSeconds);
      }
    }

    return duration;
  };

  // =======================================================
  // DELIVERY ADDRESS
  // =======================================================

  const getDeliveryAddress = (shipmentData) => {
    return [
      shipmentData?.deliveryAddress,
      shipmentData?.deliveryCity,
      shipmentData?.deliveryState,
      shipmentData?.deliveryPincode,
    ]
      .filter(Boolean)
      .join(", ");
  };

  // =======================================================
  // FETCH SHIPMENT
  // =======================================================

  useEffect(() => {
    const fetchShipmentDetails = async () => {
      try {
        setLoading(true);

        const response = await getShipmentByIdApi(id);

        if (response.data?.success !== true) {
          toast.error(
            response.data?.message || "Failed to fetch shipment details."
          );

          setShipment(null);
          return;
        }

        const shipmentData = response.data?.data;

        if (!shipmentData) {
          toast.error("Shipment details are unavailable.");

          setShipment(null);
          return;
        }

        setShipment(shipmentData);

        // Delivered shipment must NOT request:
        // location, route, ETA, forecast, delay prediction

        const isDelivered = shipmentData.status?.toUpperCase() === "DELIVERED";

        if (!isDelivered) {
          await fetchShipmentTrackingData(
            shipmentData.trackingNumber,
            shipmentData
          );
        } else {
          clearTrackingData();
        }
      } catch (error) {
        console.error("Error fetching shipment details:", error);

        toast.error(
          error.response?.data?.message || "Failed to fetch shipment details."
        );

        setShipment(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchShipmentDetails();
    }
  }, [id]);

  // =======================================================
  // LIVE LOCATION POLLING
  // =======================================================

  useEffect(() => {
    if (!shipment?.trackingNumber) {
      return;
    }

    const isDelivered = shipment.status?.toUpperCase() === "DELIVERED";

    if (isDelivered) {
      return;
    }

    const interval = setInterval(() => {
      fetchShipmentTrackingData(shipment.trackingNumber, shipment);
    }, 900000);

    return () => {
      clearInterval(interval);
    };
  }, [shipment?.trackingNumber, shipment?.status]);

  // =======================================================
  // CLEAR TRACKING DATA
  // =======================================================

  const clearTrackingData = () => {
    setShipmentLocation(null);
    setRoute(null);
    setEncodedPolyline(null);

    setEtaInfo(null);
    setDeliveryForecast(null);
    setDelayPrediction(null);

    setLocationLoading(false);
    setRouteLoading(false);
    setEtaLoading(false);
    setForecastLoading(false);
    setDelayLoading(false);
  };

  // =======================================================
  // FETCH LOCATION + ROUTE + ETA + FORECAST + DELAY
  // =======================================================

  const fetchShipmentTrackingData = async (trackingNumber, shipmentData) => {
    // Safety check
    if (shipmentData?.status?.toUpperCase() === "DELIVERED") {
      clearTrackingData();
      return;
    }

    try {
      // RESET TRACKING DATA

      setLocationLoading(true);
      setRouteLoading(true);
      setEtaLoading(true);
      setForecastLoading(true);
      setDelayLoading(true);

      setRoute(null);
      setEncodedPolyline(null);
      setEtaInfo(null);
      setDeliveryForecast(null);
      setDelayPrediction(null);

      // 1. GET SHIPMENT LOCATION

      const locationResponse = await getShipmentLocation(trackingNumber);

      const locationData = locationResponse.data?.data;

      if (!locationData) {
        console.warn("No shipment location data returned.");

        setShipmentLocation(null);
        setRoute(null);
        setEncodedPolyline(null);
        setEtaInfo(null);

        return;
      }

      setShipmentLocation(locationData);

      // 2. GET COORDINATES

      const pickupLatitude = locationData.pickupLatitude;
      const pickupLongitude = locationData.pickupLongitude;
      const deliveryLatitude = locationData.deliveryLatitude;
      const deliveryLongitude = locationData.deliveryLongitude;

      if (
        pickupLatitude == null ||
        pickupLongitude == null ||
        deliveryLatitude == null ||
        deliveryLongitude == null
      ) {
        console.warn("Pickup or delivery coordinates are missing.");

        setRoute(null);
        setEncodedPolyline(null);
        setEtaInfo(null);

        return;
      }

      // 3. GET PLANNED ROUTE

      const origin = `${pickupLatitude},${pickupLongitude}`;
      const destination = `${deliveryLatitude},${deliveryLongitude}`;

      try {
        const routeResponse = await getShipmentRoute(origin, destination);

        const routeData = routeResponse.data?.data?.routes?.[0];

        if (routeData) {
          setRoute(routeData);

          const polyline = routeData?.polyline?.encodedPolyline;

          setEncodedPolyline(polyline || null);
        } else {
          setRoute(null);
          setEncodedPolyline(null);
        }
      } catch (routeError) {
        console.error("Error fetching shipment route:", routeError);

        setRoute(null);
        setEncodedPolyline(null);
      } finally {
        setRouteLoading(false);
      }

      // 4. GET ETA

      try {
        const deliveryAddress = getDeliveryAddress(shipmentData);

        if (
          deliveryAddress &&
          pickupLatitude != null &&
          pickupLongitude != null
        ) {
          const etaResponse = await getShipmentEta(
            pickupLatitude,
            pickupLongitude,
            deliveryAddress
          );

          if (etaResponse.data) {
            setEtaInfo(etaResponse.data);
          } else {
            setEtaInfo(null);
          }
        } else {
          setEtaInfo(null);
        }
      } catch (etaError) {
        console.error("Error fetching shipment ETA:", etaError);

        setEtaInfo(null);
      } finally {
        setEtaLoading(false);
      }

      // 5. GET DELIVERY FORECAST

      try {
        const forecastResponse = await getShipmentDeliveryForecast(
          trackingNumber
        );

        if (forecastResponse.data) {
          setDeliveryForecast(forecastResponse.data);
        } else {
          setDeliveryForecast(null);
        }
      } catch (forecastError) {
        console.error("Error fetching delivery forecast:", forecastError);

        setDeliveryForecast(null);
      } finally {
        setForecastLoading(false);
      }

      // 6. GET DELAY PREDICTION

      try {
        const delayResponse = await getShipmentDelayPrediction(trackingNumber);

        if (delayResponse.data) {
          setDelayPrediction(delayResponse.data);
        } else {
          setDelayPrediction(null);
        }
      } catch (delayError) {
        console.error("Error fetching delay prediction:", delayError);

        setDelayPrediction(null);
      } finally {
        setDelayLoading(false);
      }
    } catch (error) {
      console.error("Error fetching shipment tracking data:", error);

      setShipmentLocation(null);
      setRoute(null);
      setEncodedPolyline(null);
      setEtaInfo(null);
      setDeliveryForecast(null);
      setDelayPrediction(null);
    } finally {
      setLocationLoading(false);
      setRouteLoading(false);
      setEtaLoading(false);
      setForecastLoading(false);
      setDelayLoading(false);
    }
  };

  // =======================================================
  // DOWNLOAD POD
  // =======================================================

  const handleDownloadPod = async () => {
    if (!shipment?.trackingNumber) {
      toast.error("Tracking number is unavailable.");
      return;
    }

    try {
      setPodDownloading(true);

      const response = await downloadPodApi(shipment.trackingNumber);

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

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
      setPodDownloading(false);
    }
  };

  // =======================================================
  // STATUS FORMAT
  // =======================================================

  const formatStatus = (status) => {
    if (!status) {
      return "-";
    }

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // =======================================================
  // STATUS STYLE
  // =======================================================

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case "CREATED":
        return "bg-purple-100 text-purple-700";

      case "PICKED_UP":
        return "bg-orange-100 text-orange-700";

      case "IN_TRANSIT":
        return "bg-blue-100 text-blue-700";

      case "OUT_FOR_DELIVERY":
        return "bg-yellow-100 text-yellow-700";

      case "DELIVERED":
        return "bg-emerald-100 text-emerald-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // =======================================================
  // DATE FORMAT
  // =======================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString();
  };

  // =======================================================
  // FORECAST DATE
  // =======================================================

  const formatForecastDate = (value) => {
    if (!value) {
      return "N/A";
    }

    try {
      return new Date(value).toLocaleString([], {
        dateStyle: "short",
        timeStyle: "short",
      });
    } catch {
      return value;
    }
  };

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

          <p className="text-sm text-slate-500">Loading shipment details...</p>
        </div>
      </div>
    );
  }

  // =======================================================
  // NOT FOUND
  // =======================================================

  if (!shipment) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <ShieldAlert size={32} className="mx-auto mb-2 text-slate-300" />

          <h2 className="text-base font-semibold text-slate-800">
            Shipment not found
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Shipment details could not be loaded.
          </p>

          <button
            onClick={() => navigate("/admin/shipments")}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <ArrowLeft size={16} />
            Back to Shipments
          </button>
        </div>
      </div>
    );
  }

  // =======================================================
  // DERIVED VALUES
  // =======================================================

  const isDelivered = shipment.status?.toUpperCase() === "DELIVERED";

  const isCancelled = shipment.status?.toUpperCase() === "CANCELLED";

  const shipmentStatusFlow = [
    "CREATED",
    "PICKED_UP",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];

  const currentIndex = shipmentStatusFlow.indexOf(shipment.status);

  const isDelayed =
    delayPrediction?.prediction === "DELAYED" ||
    Number(delayPrediction?.delayMinutes) > 0;

  const isOnTime = delayPrediction?.prediction === "ON_TIME";

  const estimatedArrival =
    etaInfo?.estimatedArrival || deliveryForecast?.forecastedDelivery || "N/A";

  // =======================================================
  // TRACKING PROGRESS (HORIZONTAL STEPPER)
  // =======================================================

  const trackingProgressPanel = (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      {isCancelled ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
          <ShieldAlert size={14} className="text-red-500" />

          <p className="text-xs font-semibold text-red-700">
            Shipment Cancelled
          </p>

          <span className="text-[11px] text-red-500">
            This shipment has been cancelled.
          </span>
        </div>
      ) : (
        <div className="relative">
          {/* FULL CONTINUOUS TRACK (first dot center -> last dot center) */}
          <div className="absolute left-[10%] right-[10%] top-2.5 h-0.5 -translate-y-1/2 rounded-full bg-slate-200" />

          {/* COMPLETED PROGRESS FILL */}
          <div
            className="absolute left-[10%] top-2.5 h-0.5 -translate-y-1/2 rounded-full bg-emerald-600 transition-all"
            style={{
              width: `${
                currentIndex > 0
                  ? (currentIndex / (shipmentStatusFlow.length - 1)) * 80
                  : 0
              }%`,
            }}
          />

          <ol className="relative grid grid-cols-5">
            {shipmentStatusFlow.map((status, index) => {
              const isCompletedStep = index <= currentIndex;
              const isCurrentStep = index === currentIndex;

              return (
                <li
                  key={status}
                  className="flex flex-col items-center text-center"
                >
                  <span
                    className={`z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      isCurrentStep
                        ? "border-emerald-600 bg-emerald-600 ring-4 ring-emerald-100"
                        : isCompletedStep
                        ? "border-emerald-600 bg-emerald-600"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isCompletedStep && !isCurrentStep && (
                      <CheckCircle2 size={10} className="text-white" />
                    )}
                  </span>

                  <p
                    className={`mt-1.5 px-0.5 text-[10px] font-semibold leading-tight sm:text-xs ${
                      isCurrentStep
                        ? "text-emerald-700"
                        : isCompletedStep
                        ? "text-slate-800"
                        : "text-slate-400"
                    }`}
                  >
                    {formatStatus(status)}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );

  // =======================================================
  // MAIN UI
  // =======================================================

  return (
    <div className="mx-auto max-w-7xl space-y-3 px-3 pb-6 pt-3 sm:px-4 lg:px-5">
      {/* ===================================================
          HEADER
      =================================================== */}

      <section className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={() => navigate("/admin/shipments")}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-emerald-700"
          >
            <ArrowLeft size={14} />
            Back
          </button>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base font-bold text-slate-800 sm:text-lg">
                Shipment Details
              </h1>

              <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-600">
                #{shipment.trackingNumber}
              </span>
            </div>

            <p className="flex items-center gap-1 text-[11px] text-slate-500">
              <Calendar size={11} className="text-slate-400" />
              Created {formatDate(shipment.createdAt)}
            </p>
          </div>
        </div>

        <span
          className={`w-fit rounded-full px-3 py-1 text-[11px] font-semibold ${getStatusStyle(
            shipment.status
          )}`}
        >
          {formatStatus(shipment.status)}
        </span>
      </section>

      {/* ===================================================
          TRACKING PROGRESS
      =================================================== */}

      {trackingProgressPanel}

      {/* ===================================================
          SHIPMENT INFORMATION
      =================================================== */}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* SENDER / RECEIVER / PACKAGE */}

        <div className="grid grid-cols-1 divide-y divide-slate-100 md:grid-cols-3 md:divide-x md:divide-y-0">
          {/* SENDER */}

          <div className="min-w-0 px-4 py-3">
            <div className="mb-1 flex items-center gap-1.5">
              <User size={13} className="text-emerald-600" />

              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Sender
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-800">
              {shipment.senderName || "-"}
            </p>

            <div className="mt-0.5 flex items-start gap-1.5">
              <Mail size={12} className="mt-0.5 shrink-0 text-slate-400" />

              <p className="break-all text-xs text-slate-500">
                {shipment.senderEmail || "-"}
              </p>
            </div>
          </div>

          {/* RECEIVER */}

          <div className="min-w-0 px-4 py-3">
            <div className="mb-1 flex items-center gap-1.5">
              <User size={13} className="text-emerald-600" />

              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Receiver
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-800">
              {shipment.receiverName || "-"}
            </p>

            <div className="mt-0.5 flex items-center gap-1.5">
              <Phone size={12} className="text-slate-400" />

              <p className="text-xs text-slate-500">
                {shipment.receiverPhone || "-"}
              </p>
            </div>
          </div>

          {/* PACKAGE */}

          <div className="min-w-0 px-4 py-3">
            <div className="mb-1 flex items-center gap-1.5">
              <Package size={13} className="text-emerald-600" />

              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Package
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-800">
              {shipment.packageDescription || "-"}
            </p>

            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <div className="flex items-center gap-1">
                <Weight size={12} className="text-slate-400" />

                <span className="text-xs text-slate-500">
                  {shipment.weight ? `${shipment.weight} kg` : "-"}
                </span>
              </div>

              <span className="text-xs font-medium text-emerald-600">
                {shipment.trackingNumber || "-"}
              </span>
            </div>
          </div>
        </div>

        {/* ADDRESSES */}

        <div className="grid grid-cols-1 divide-y divide-slate-100 border-t border-slate-100 bg-slate-50/40 md:grid-cols-2 md:divide-x md:divide-y-0">
          {/* PICKUP */}

          <div className="min-w-0 px-4 py-3">
            <div className="mb-1 flex items-center gap-1.5">
              <MapPin size={13} className="text-emerald-600" />

              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Pickup Address
              </span>
            </div>

            <p className="text-sm font-medium leading-snug text-slate-700">
              {shipment.pickupAddress || "-"}
            </p>

            <p className="mt-0.5 text-[11px] text-slate-500">
              {shipment.pickupCity || "-"}, {shipment.pickupState || "-"}
              {" · "}
              PIN: {shipment.pickupPincode || "-"}
            </p>
          </div>

          {/* DELIVERY */}

          <div className="min-w-0 px-4 py-3">
            <div className="mb-1 flex items-center gap-1.5">
              <Truck size={13} className="text-orange-500" />

              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Delivery Address
              </span>
            </div>

            <p className="text-sm font-medium leading-snug text-slate-700">
              {shipment.deliveryAddress || "-"}
            </p>

            <p className="mt-0.5 text-[11px] text-slate-500">
              {shipment.deliveryCity || "-"}, {shipment.deliveryState || "-"}
              {" · "}
              PIN: {shipment.deliveryPincode || "-"}
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================
          DELIVERED: POD DOWNLOAD ONLY
      =================================================== */}

      {isDelivered ? (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                <CheckCircle2 size={18} className="text-emerald-600" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-emerald-800">
                  Shipment Delivered
                </h2>

                <p className="text-xs text-emerald-700">
                  Delivery is complete. Live tracking and prediction data are
                  no longer active.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadPod}
              disabled={podDownloading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <FileDown size={15} />

              {podDownloading ? "Downloading..." : "Download POD PDF"}
            </button>
          </div>
        </section>
      ) : (
        /* =================================================
           ACTIVE SHIPMENT: MAP (2/3) + FORECAST & DELAY (1/3)
        ================================================= */

        <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-3">
          {/* =================================================
              LIVE DELIVERY MAP
          ================================================= */}

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
            {/* MAP HEADER */}

            <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/50 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
                  <Navigation size={15} className="text-emerald-600" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-slate-800">
                    Live Delivery Map
                  </h2>

                  <p className="text-[10px] text-slate-400">
                    Current shipment route
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px]">
                <span
                  className={`h-2 w-2 rounded-full ${
                    shipmentLocation ? "bg-emerald-500" : "bg-slate-300"
                  }`}
                />

                <span className="text-slate-500">
                  {shipmentLocation
                    ? "Location Available"
                    : "Location Unavailable"}
                </span>
              </div>
            </div>

            {/* MAP METRICS */}

            {shipmentLocation && (
              <div className="grid grid-cols-1 divide-y divide-slate-100 border-b border-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {/* DISTANCE */}

                <div className="flex items-center gap-2.5 px-4 py-2.5">
                  <div className="rounded-lg bg-slate-100 p-1.5 text-slate-600">
                    <Route size={14} />
                  </div>

                  <div>
                    <span className="block text-[10px] uppercase tracking-wide text-slate-400">
                      Distance
                    </span>

                    <span className="text-sm font-bold text-slate-800">
                      {routeLoading
                        ? "Calculating..."
                        : route?.distanceMeters != null
                        ? formatDistance(route.distanceMeters)
                        : etaInfo?.distanceKm != null
                        ? `${Number(etaInfo.distanceKm).toFixed(2)} km`
                        : "N/A"}
                    </span>
                  </div>
                </div>

                {/* TRANSIT TIME */}

                <div className="flex items-center gap-2.5 px-4 py-2.5">
                  <div className="rounded-lg bg-slate-100 p-1.5 text-slate-600">
                    <Clock size={14} />
                  </div>

                  <div>
                    <span className="block text-[10px] uppercase tracking-wide text-slate-400">
                      Est. Transit Time
                    </span>

                    <span className="text-sm font-bold text-slate-800">
                      {routeLoading
                        ? "Calculating..."
                        : route?.duration
                        ? formatRouteDuration(route.duration)
                        : etaInfo?.durationSeconds != null
                        ? formatTravelTime(etaInfo.durationSeconds)
                        : etaInfo?.travelTime || "N/A"}
                    </span>
                  </div>
                </div>

                {/* ETA */}

                <div className="flex items-center gap-2.5 bg-emerald-50/40 px-4 py-2.5">
                  <div className="rounded-lg bg-emerald-100 p-1.5 text-emerald-700">
                    <TrendingUp size={14} />
                  </div>

                  <div className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-wide text-emerald-700">
                      Estimated Arrival
                    </span>

                    <span className="block truncate text-sm font-bold text-emerald-700">
                      {etaLoading ? "Calculating..." : estimatedArrival}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* GOOGLE MAP */}

            <div className="p-3">
              {locationLoading ? (
                <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50">
                  <div className="text-center">
                    <div className="mx-auto mb-2 h-7 w-7 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

                    <p className="text-xs text-slate-500">
                      Loading delivery map...
                    </p>
                  </div>
                </div>
              ) : shipmentLocation ? (
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <GoogleShipmentMap
                    pickupLatitude={shipmentLocation.pickupLatitude}
                    pickupLongitude={shipmentLocation.pickupLongitude}
                    deliveryLatitude={shipmentLocation.deliveryLatitude}
                    deliveryLongitude={shipmentLocation.deliveryLongitude}
                    encodedPolyline={encodedPolyline}
                  />
                </div>
              ) : (
                <div className="flex h-[180px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50">
                  <div className="text-center">
                    <MapPin size={26} className="mx-auto mb-1.5 text-slate-300" />

                    <p className="text-xs font-semibold text-slate-600">
                      Current Location Unavailable
                    </p>

                    <p className="mx-auto mt-0.5 max-w-xs text-[10px] leading-relaxed text-slate-400">
                      No active location data is available for this shipment.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* =================================================
              RIGHT COLUMN: FORECAST + DELAY
          ================================================= */}

          <div className="space-y-3">
            {/* DELIVERY FORECAST */}

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-4 py-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-slate-800">
                    Delivery Forecast
                  </h2>

                  <p className="text-[10px] text-slate-400">
                    Predicted delivery information
                  </p>
                </div>
              </div>

              <div className="p-3">
                {forecastLoading ? (
                  <div className="py-3 text-center">
                    <div className="mx-auto mb-1.5 h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />

                    <p className="text-[11px] text-slate-400">
                      Loading forecast...
                    </p>
                  </div>
                ) : deliveryForecast ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                      <span className="text-[11px] text-slate-500">Status</span>

                      <span className="text-[11px] font-semibold text-slate-700">
                        {deliveryForecast.currentStatus ||
                          deliveryForecast.status ||
                          "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 rounded-lg bg-emerald-50 px-3 py-2">
                      <span className="shrink-0 text-[11px] text-emerald-700">
                        Forecast
                      </span>

                      <span className="text-right text-[11px] font-semibold text-emerald-700">
                        {formatForecastDate(deliveryForecast.forecastedDelivery)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-slate-100 px-2 py-2 text-center">
                        <span className="block text-[10px] text-slate-400">
                          Est. Distance
                        </span>

                        <span className="text-xs font-bold text-slate-700">
                          {deliveryForecast.distanceMeters != null
                            ? formatDistance(deliveryForecast.distanceMeters)
                            : "N/A"}
                        </span>
                      </div>

                      <div className="rounded-lg border border-slate-100 px-2 py-2 text-center">
                        <span className="block text-[10px] text-slate-400">
                          Est. Time
                        </span>

                        <span className="text-xs font-bold text-slate-700">
                          {deliveryForecast.travelTimeMinutes != null
                            ? formatTravelTime(
                                deliveryForecast.travelTimeMinutes * 60
                              )
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="py-3 text-center text-[11px] text-slate-400">
                    Delivery forecast unavailable.
                  </p>
                )}
              </div>
            </section>

            {/* DELAY ASSESSMENT */}

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                      isDelayed ? "bg-amber-50" : "bg-emerald-50"
                    }`}
                  >
                    <AlertTriangle
                      size={15}
                      className={
                        isDelayed ? "text-amber-600" : "text-emerald-600"
                      }
                    />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-slate-800">
                      Delay Assessment
                    </h2>

                    <p className="text-[10px] text-slate-400">
                      Current delivery risk
                    </p>
                  </div>
                </div>

                {delayPrediction && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                      isDelayed
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {isDelayed ? "DELAYED" : isOnTime ? "ON TIME" : "CHECKED"}
                  </span>
                )}
              </div>

              <div className="p-3">
                {delayLoading ? (
                  <div className="py-3 text-center">
                    <div className="mx-auto mb-1.5 h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />

                    <p className="text-[11px] text-slate-400">
                      Checking delay...
                    </p>
                  </div>
                ) : delayPrediction ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                      <span className="text-[11px] text-slate-500">
                        Prediction
                      </span>

                      <span className="text-[11px] font-semibold text-slate-700">
                        {delayPrediction.prediction || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                      <span className="text-[11px] text-slate-500">
                        Estimated Delay
                      </span>

                      <span
                        className={`text-[11px] font-semibold ${
                          isDelayed ? "text-amber-600" : "text-emerald-600"
                        }`}
                      >
                        {delayPrediction.delayMinutes != null
                          ? `${delayPrediction.delayMinutes} min`
                          : "0 min"}
                      </span>
                    </div>

                    <div className="rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2">
                      <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Analysis
                      </span>

                      <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
                        {delayPrediction.message ||
                          "No operational warning available."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="py-3 text-center text-[11px] text-slate-400">
                    Delay prediction unavailable.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShipmentDetails;
