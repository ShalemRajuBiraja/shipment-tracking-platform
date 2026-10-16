import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  ArrowLeft,
  MapPin,
  Clock,
  Navigation,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

import TrackingProgress from "./TrackingProgress";
import ShipmentDetails from "./ShipmentDetails";
import GoogleShipmentMap from "../../components/GoogleShipmentMap";

import { trackShipmentApi } from "../../services/shipmentService";

import {
  getShipmentLocation,
  getShipmentRoute,
  getShipmentEta,
  getShipmentDelayPrediction,
  getShipmentDeliveryForecast,
} from "../../services/operatorService";

const ShipmentTracking = () => {

  // URL PARAMETER
  const { trackingNumber } = useParams();

  const navigate = useNavigate();

  // STATES
  const [shipment, setShipment] = useState(null);
  const [location, setLocation] = useState(null);
  const [encodedPolyline, setEncodedPolyline] = useState(null);
const [routeInfo, setRouteInfo] = useState(null);

  const [etaInfo, setEtaInfo] =
    useState(null);

  const [delayPrediction, setDelayPrediction] =
    useState(null);

  const [deliveryForecast, setDeliveryForecast] =
    useState(null);

  const [forecastLoading, setForecastLoading] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [mapLoading, setMapLoading] =
    useState(false);

  // =========================================================
  // FORMAT TRAVEL TIME
  // =========================================================

  const formatTravelTime = (seconds) => {

    if (
      seconds === null ||
      seconds === undefined
    ) {
      return "N/A";
    }

    const totalMinutes =
      Math.round(seconds / 60);

    const hours =
      Math.floor(totalMinutes / 60);

    const minutes =
      totalMinutes % 60;

    if (
      hours > 0 &&
      minutes > 0
    ) {
      return `${hours}h ${minutes}m`;
    }

    if (hours > 0) {
      return `${hours}h`;
    }

    return `${minutes}m`;
  };

  // =========================================================
  // FORMAT DISTANCE
  // =========================================================

  const formatDistance = (meters) => {

    if (
      meters === null ||
      meters === undefined
    ) {
      return "N/A";
    }

    return `${(
      meters / 1000
    ).toFixed(2)} km`;
  };

  // =========================================================
  // GET DELIVERY ADDRESS
  // =========================================================

  const getDeliveryAddress = (
    shipmentData
  ) => {

    return (
      shipmentData?.deliveryAddress ||
      shipmentData?.deliveryFullAddress ||
      shipmentData?.deliveryLocation ||
      shipmentData?.destinationAddress ||
      ""
    );
  };

  // =========================================================
  // FETCH SHIPMENT DATA
  // =========================================================

  useEffect(() => {

    if (!trackingNumber) {

      console.warn(
        "ShipmentTracking: trackingNumber is missing."
      );

      setLoading(false);

      setShipment(null);

      return;
    }

    const fetchShipmentData =
      async () => {

        try {

          setLoading(true);

          setMapLoading(true);

          // Reset tracking information

          setLocation(null);

          setRouteInfo(null);

          setEtaInfo(null);

          setDelayPrediction(null);

          setEncodedPolyline(null);

          // =====================================================
          // 1. GET SHIPMENT DETAILS
          // =====================================================

          const shipmentResponse =
            await trackShipmentApi(
              trackingNumber
            );

          if (
            shipmentResponse.data?.success !==
            true
          ) {

            setShipment(null);

            toast.error(
              shipmentResponse.data?.message ||
                "Shipment not found."
            );

            return;
          }

          const shipmentData =
            shipmentResponse.data?.data;

          if (!shipmentData) {

            setShipment(null);

            toast.error(
              "Shipment details are unavailable."
            );

            return;
          }

          // =====================================================
          // SAVE SHIPMENT DATA
          // =====================================================

          setShipment(
            shipmentData
          );

          // =====================================================
          // CHECK DELIVERY STATUS
          // =====================================================

          /*
           * The backend/database is the source of truth.
           *
           * If backend returns DELIVERED,
           * live tracking is completely stopped.
           */

          const isDelivered =
            shipmentData?.currentStatus ===
              "DELIVERED" ||
            shipmentData?.status ===
              "DELIVERED";

          // =====================================================
          // DELIVERED SHIPMENT
          // =====================================================

          if (isDelivered) {

            /*
             * Do NOT fetch:
             *
             * - Live location
             * - Route
             * - ETA
             * - Delivery forecast
             * - Delay prediction
             */

            setLocation(null);

            setRouteInfo(null);

            setEtaInfo(null);

            setDelayPrediction(null);

            setEncodedPolyline(null);

            return;
          }

          // =====================================================
          // ACTIVE SHIPMENT
          // =====================================================

          // =====================================================
          // 2. GET SHIPMENT LOCATION
          // =====================================================

          try {

            const locationResponse =
              await getShipmentLocation(
                trackingNumber
              );

            const locationData =
              locationResponse.data?.data;

            if (!locationData) {

              setLocation(null);

              console.warn(
                "No shipment location data returned."
              );

            } else {

              setLocation(
                locationData
              );

              // =================================================
              // CHECK COORDINATES
              // =================================================

              if (
                locationData.pickupLatitude !=
                  null &&
                locationData.pickupLongitude !=
                  null &&
                locationData.deliveryLatitude !=
                  null &&
                locationData.deliveryLongitude !=
                  null
              ) {

                // ===============================================
                // 3. GET PLANNED ROUTE
                // ===============================================

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

                  const route =
                    routeResponse.data
                      ?.data
                      ?.routes?.[0];

                  // =============================================
                  // SAVE ROUTE INFORMATION
                  // =============================================

                  if (route) {

                    setRouteInfo({

                      distanceMeters:
                        route.distanceMeters,

                      durationSeconds:
                        route.duration
                          ? parseInt(
                              route.duration.replace(
                                "s",
                                ""
                              ),
                              10
                            )
                          : null,

                    });

                  } else {

                    setRouteInfo(null);

                  }

                  // =============================================
                  // GET BLUE POLYLINE
                  // =============================================

                  const polyline =
                    route
                      ?.polyline
                      ?.encodedPolyline;

                  if (polyline) {

                    setEncodedPolyline(
                      polyline
                    );

                  } else {

                    console.warn(
                      "No encoded polyline returned from route API."
                    );

                    setEncodedPolyline(
                      null
                    );

                  }

                  // =============================================
                  // 4. GET ETA
                  // =============================================

                  try {

                    const deliveryAddress =
                      getDeliveryAddress(
                        shipmentData
                      );

                    if (
                      deliveryAddress
                    ) {

                      const etaResponse =
                        await getShipmentEta(
                          locationData.pickupLatitude,
                          locationData.pickupLongitude,
                          deliveryAddress
                        );

                      if (
                        etaResponse.data
                      ) {

                        setEtaInfo(
                          etaResponse.data
                        );

                      } else {

                        setEtaInfo(
                          null
                        );

                      }

                    } else {

                      console.warn(
                        "Delivery address is missing. ETA cannot be calculated."
                      );

                      setEtaInfo(
                        null
                      );

                    }

                  } catch (
                    etaError
                  ) {

                    console.error(
                      "Error fetching shipment ETA:",
                      etaError
                    );

                    setEtaInfo(
                      null
                    );

                  }

                  // =============================================
                  // 5. GET DELIVERY FORECAST
                  // =============================================

                  try {
                    setForecastLoading(true);

                    const forecastResponse =
                      await getShipmentDeliveryForecast(
                        trackingNumber
                      );

                    // Supports either a direct DTO or a wrapped { data: ... } response.
                    const forecastData =
                      forecastResponse.data?.data ??
                      forecastResponse.data;

                    setDeliveryForecast(forecastData || null);
                  } catch (forecastError) {
                    console.error(
                      "Error fetching delivery forecast:",
                      forecastError
                    );
                    setDeliveryForecast(null);
                  } finally {
                    setForecastLoading(false);
                  }

                  // =============================================
                  // 6. GET DELAY PREDICTION
                  // =============================================

                  try {

                    const delayResponse =
                      await getShipmentDelayPrediction(
                        trackingNumber
                      );

                    if (
                      delayResponse.data
                    ) {

                      setDelayPrediction(
                        delayResponse.data
                      );

                    } else {

                      setDelayPrediction(
                        null
                      );

                    }

                  } catch (
                    delayError
                  ) {

                    console.error(
                      "Error fetching delay prediction:",
                      delayError
                    );

                    setDelayPrediction(
                      null
                    );

                  }

                } catch (
                  routeError
                ) {

                  console.error(
                    "Error fetching shipment route:",
                    routeError
                  );

                  setEncodedPolyline(
                    null
                  );

                  setRouteInfo(
                    null
                  );

                }

              } else {

                console.warn(
                  "Pickup or delivery coordinates are missing."
                );

                setEncodedPolyline(
                  null
                );

                setRouteInfo(
                  null
                );

                setEtaInfo(
                  null
                );

              }

            }

          } catch (
            locationError
          ) {

            console.error(
              "Error fetching shipment location:",
              locationError
            );

            setLocation(null);

            setEncodedPolyline(
              null
            );

            setRouteInfo(
              null
            );

            setEtaInfo(
              null
            );

            console.warn(
              "No current shipment location available."
            );

          }

        } catch (
          error
        ) {

          console.error(
            "Error fetching shipment:",
            error
          );

          setShipment(null);

          toast.error(
            error.response?.data?.message ||
              "Unable to load shipment details."
          );

        } finally {

          setLoading(false);

          setMapLoading(false);

        }

      };

    fetchShipmentData();

  }, [trackingNumber]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8">

        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

        <p className="mt-4 text-sm font-medium text-slate-600">
          Retrieving shipment information...
        </p>

      </div>

    );
  }

  // =========================================================
  // SHIPMENT NOT FOUND
  // =========================================================

  if (!shipment) {

    return (

      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">

          <ShieldAlert className="h-7 w-7 text-slate-600" />

        </div>

        <h2 className="text-xl font-bold text-slate-800">
          Shipment Unreachable
        </h2>

        <p className="mt-2 text-sm text-slate-500">

          We could not locate tracking records for{" "}

          <span className="font-mono font-semibold text-slate-700">
            {trackingNumber}
          </span>

          .

        </p>

        <button
          onClick={() =>
            navigate(-1)
          }
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow"
        >

          <ArrowLeft className="h-4 w-4" />

          Return to Console

        </button>

      </div>

    );

  }

  // =========================================================
  // NORMALIZE FOR TRACKING PROGRESS
  // =========================================================

  const trackingShipment = {

    ...shipment,

    currentStatus:
      shipment.currentStatus ||
      shipment.status,

  };

  // =========================================================
  // CHECK DELIVERY STATUS
  // =========================================================

  const isDelivered =
    shipment?.currentStatus ===
      "DELIVERED" ||
    shipment?.status ===
      "DELIVERED";

  // =========================================================
  // DELAY STATUS
  // =========================================================

  const isDelayed =
    delayPrediction?.delayMinutes > 0 ||
    delayPrediction?.prediction
      ?.toLowerCase()
      .includes("delay");

  // =========================================================
  // PAGE
  // =========================================================

  return (

    <div className="mx-auto max-w-7xl space-y-6 pb-12">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5">

        <div className="flex items-center gap-3">

          <button
            onClick={() =>
              navigate(-1)
            }
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow active:scale-[0.98]"
          >

            <ArrowLeft className="h-4 w-4" />

            Back to Overview

          </button>

        </div>

        <div>

          <div className="flex flex-wrap items-center gap-3">

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Shipment Tracking
            </h1>

            <span className="rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-700">

              #{trackingNumber}

            </span>

          </div>

          <p className="mt-1 text-sm text-slate-500">

            {isDelivered
              ? "Shipment delivery information and proof of delivery."
              : "Live telemetry monitoring & predictive ETA logistics controls."}

          </p>

        </div>

      </div>

      {/* =====================================================
          SHIPMENT DETAILS
      ====================================================== */}

      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">

        <ShipmentDetails
          shipment={shipment}
        />

      </div>

      {/* =====================================================
          DELIVERED SHIPMENT
      ====================================================== */}

      {isDelivered ? (

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">

              <CheckCircle2
                className="h-5 w-5 text-blue-600"
              />

            </div>

            <div>

              <h2 className="text-base font-bold text-blue-800">
                Shipment Delivered
              </h2>

              <p className="mt-1 text-sm text-blue-700">

                This shipment has been successfully delivered.
                Live route tracking is no longer active.

              </p>

            </div>

          </div>

        </div>

      ) : (

        /* ===================================================
           ACTIVE SHIPMENT TRACKING
        ==================================================== */

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">

          {/* =================================================
              MAP & ROUTE TELEMETRY
          ================================================== */}

          <div className="space-y-6 lg:col-span-2">

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              {/* MAP HEADER */}

              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/50 px-6 py-4">

                <div className="flex items-center gap-2.5">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">

                    <Navigation className="h-4 w-4" />

                  </div>

                  <div>

                    <h2 className="text-base font-bold text-slate-900">
                      Live Route Map
                    </h2>

                    <p className="text-xs text-slate-500">
                      Real-time GPS coordinate vector
                    </p>

                  </div>

                </div>

                {location && (

                  <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-700">

                    <span className="relative flex h-2 w-2">

                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />

                      <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />

                    </span>

                    Signal Active

                  </div>

                )}

              </div>

              {/* QUICK METRICS */}

              {!mapLoading &&
                location && (

                  <div className="grid grid-cols-1 divide-y divide-slate-100 border-b border-slate-100 bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">

                    {/* DISTANCE */}

                    <div className="flex items-center gap-3.5 p-4">

                      <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">

                        <MapPin className="h-5 w-5" />

                      </div>

                      <div>

                        <span className="block text-xs font-medium uppercase tracking-wider text-slate-500">
                          Distance
                        </span>

                        <span className="text-base font-bold text-slate-900">

                          {routeInfo
                            ? formatDistance(
                                routeInfo.distanceMeters
                              )
                            : "Calculating..."}

                        </span>

                      </div>

                    </div>

                    {/* TRANSIT TIME */}

                    <div className="flex items-center gap-3.5 p-4">

                      <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">

                        <Clock className="h-5 w-5" />

                      </div>

                      <div>

                        <span className="block text-xs font-medium uppercase tracking-wider text-slate-500">
                          Est. Transit Time
                        </span>

                        <span className="text-base font-bold text-slate-900">

                          {routeInfo?.durationSeconds !=
                          null
                            ? formatTravelTime(
                                routeInfo.durationSeconds
                              )
                            : "Calculating..."}

                        </span>

                      </div>

                    </div>

                    {/* ETA */}

                    <div className="flex items-center gap-3.5 bg-blue-50/30 p-4">

                      <div className="rounded-xl bg-blue-100 p-2.5 text-blue-700">

                        <TrendingUp className="h-5 w-5" />

                      </div>

                      <div>

                        <span className="block text-xs font-medium uppercase tracking-wider text-blue-800">
                          Estimated Arrival
                        </span>

                        <span className="text-base font-bold text-blue-700">

                          {etaInfo?.estimatedArrival ||
                            "Calculating..."}

                        </span>

                      </div>

                    </div>

                  </div>

                )}

              {/* MAP CANVAS */}

              <div className="bg-slate-50 p-4">

                {mapLoading ? (

                  <div className="flex h-[380px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white">

                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                    <p className="mt-3 text-xs font-medium text-slate-500">
                      Loading Google Map view...
                    </p>

                  </div>

                ) : location ? (

                  <div className="overflow-hidden rounded-xl border border-slate-200 shadow-inner">

                    <GoogleShipmentMap
                      pickupLatitude={
                        location.pickupLatitude
                      }

                      pickupLongitude={
                        location.pickupLongitude
                      }

                      deliveryLatitude={
                        location.deliveryLatitude
                      }

                      deliveryLongitude={
                        location.deliveryLongitude
                      }

                      encodedPolyline={
                        encodedPolyline
                      }
                    />

                  </div>

                ) : (

                  <div className="flex h-[380px] w-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-center">

                    <MapPin className="h-8 w-8 text-slate-300" />

                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      Current Location Unavailable
                    </p>

                    <p className="mt-1 max-w-xs text-xs text-slate-500">

                      No active GPS vector coordinate logs found for this tracking session yet.

                    </p>

                  </div>

                )}

              </div>

            </section>

            {/* =================================================
                PREDICTIVE INSIGHTS
            ================================================== */}

            <div className="grid grid-cols-1 gap-6">

              {/* DELAY ASSESSMENT */}


              {/* DELIVERY FORECAST */}
              <section className="w-full max-w-xl rounded-2xl border border-blue-200 bg-gradient-to-br from-white via-white to-sky-50 p-4 shadow-sm">
                <div className="flex items-center gap-3 border-b border-blue-100 pb-3">
                  <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Delivery Forecast
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Estimated delivery based on current route information
                    </p>
                  </div>
                  <span className="ml-auto rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                    {forecastLoading
                      ? "Calculating"
                      : deliveryForecast?.forecast === "DELIVERED"
                      ? "Delivered"
                      : deliveryForecast?.forecast === "EXPECTED"
                      ? "Expected"
                      : "Forecast"}
                  </span>
                </div>

                <div className="mt-4 rounded-xl border border-blue-100 bg-white/90 p-4">
                  {forecastLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-100 border-t-blue-600" />
                      <p className="text-sm font-medium text-slate-600">
                        Calculating delivery forecast...
                      </p>
                    </div>
                  ) : deliveryForecast?.message ? (
                    <p className="text-sm font-semibold leading-6 text-slate-800">
                      {deliveryForecast.message}
                    </p>
                  ) : (
                    <p className="text-sm leading-6 text-slate-500">
                      Delivery forecast is currently unavailable.
                    </p>
                  )}

                  {deliveryForecast?.forecastedDeliveryTime && (
                    <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                      Estimated arrival:{" "}
                      <span className="font-semibold text-blue-700">
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
              </section>

            </div>

          </div>

          {/* =================================================
              TRACKING TIMELINE
          ================================================== */}

          <div className="lg:col-span-1">

            <div className="sticky top-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">

                <h2 className="text-base font-bold text-slate-900">
                  Progression Log
                </h2>

              </div>

              <div className="p-5">

                <TrackingProgress
                  shipment={
                    trackingShipment
                  }
                />

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default ShipmentTracking;