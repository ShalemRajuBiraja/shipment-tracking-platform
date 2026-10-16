import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  User,
  Package,
  MapPin,
  Phone,
  Weight,
  Calendar,
  Navigation,
  Clock,
  TrendingUp,
  X,
  Download,
} from "lucide-react";

import { getShipmentByIdApi } from "../../services/shipmentService";
import GoogleShipmentMap from "../../components/GoogleShipmentMap";

import {
  getShipmentLocation,
  getShipmentRoute,
  getShipmentEta,
} from "../../services/operatorService";

import { downloadPodApi } from "../../services/deliveryConfirmationService";

const BusinessShipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);

  const [location, setLocation] = useState(null);
  const [encodedPolyline, setEncodedPolyline] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);

  const [eta, setEta] = useState(null);
  const [etaLoading, setEtaLoading] = useState(true);

  const [downloadingPod, setDownloadingPod] = useState(false);

  // =========================================================
  // FORMAT LOCATIONS
  // =========================================================

  const formatPickupLocation = (shipmentData = shipment) => {
    const locationParts = [
      shipmentData?.pickupAddress,
      shipmentData?.pickupCity,
      shipmentData?.pickupState,
      shipmentData?.pickupPincode,
    ].filter(Boolean);

    return locationParts.join(", ");
  };

  const formatDeliveryLocation = (shipmentData = shipment) => {
    const locationParts = [
      shipmentData?.deliveryAddress,
      shipmentData?.deliveryCity,
      shipmentData?.deliveryState,
      shipmentData?.deliveryPincode,
    ].filter(Boolean);

    return locationParts.join(", ");
  };

  // =========================================================
  // DOWNLOAD POD
  // =========================================================

  const handleDownloadPod = async () => {
    if (!shipment?.trackingNumber) {
      console.error("Tracking number is unavailable.");
      return;
    }

    try {
      setDownloadingPod(true);

      const response = await downloadPodApi(
        shipment.trackingNumber
      );

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
    } catch (error) {
      console.error("Error downloading POD:", error);
    } finally {
      setDownloadingPod(false);
    }
  };

  // =========================================================
  // FETCH SHIPMENT DETAILS
  // =========================================================

  useEffect(() => {
    const fetchShipmentDetails = async () => {
      try {
        setLoading(true);
        setMapLoading(true);
        setEtaLoading(true);

        const response = await getShipmentByIdApi(id);

        if (!response.data.success) {
          console.error(response.data.message);
          return;
        }

        const shipmentData = response.data.data;

        setShipment(shipmentData);

        // =====================================================
        // DELIVERED
        // DO NOT LOAD MAP / ETA / ROUTE
        // =====================================================

        if (shipmentData.status === "DELIVERED") {
          setLocation(null);
          setEncodedPolyline(null);
          setEta(null);

          setMapLoading(false);
          setEtaLoading(false);

          return;
        }

        // =====================================================
        // CURRENT LOCATION
        // =====================================================

        try {
          const locationResponse =
            await getShipmentLocation(
              shipmentData.trackingNumber
            );

          const locationData =
            locationResponse.data.data;

          setLocation(locationData);

          if (locationData) {
            // =================================================
            // ETA
            // =================================================

            try {
              const deliveryAddress =
                formatDeliveryLocation(shipmentData);

              const etaResponse =
                await getShipmentEta(
                  locationData.pickupLatitude,
                  locationData.pickupLongitude,
                  deliveryAddress
                );

              setEta(etaResponse.data);
            } catch (error) {
              console.error(
                "Error fetching shipment ETA:",
                error
              );

              setEta(null);
            }

            // =================================================
            // ROUTE
            // =================================================

            try {
              const origin =
                `${locationData.pickupLatitude},${locationData.pickupLongitude}`;

              const destination =
                `${locationData.deliveryLatitude},${locationData.deliveryLongitude}`;

              const routeResponse =
                await getShipmentRoute(
                  origin,
                  destination
                );

              const polyline =
                routeResponse.data?.data?.routes?.[0]
                  ?.polyline?.encodedPolyline;

              setEncodedPolyline(polyline || null);
            } catch (error) {
              console.error(
                "Error fetching shipment route:",
                error
              );

              setEncodedPolyline(null);
            }
          } else {
            setEncodedPolyline(null);
            setEta(null);
          }
        } catch (error) {
          console.error(
            "Error fetching shipment location:",
            error
          );

          setLocation(null);
          setEncodedPolyline(null);
          setEta(null);
        } finally {
          setEtaLoading(false);
        }
      } catch (error) {
        console.error(
          "Error fetching shipment details:",
          error
        );
      } finally {
        setLoading(false);
        setMapLoading(false);
      }
    };

    if (id) {
      fetchShipmentDetails();
    }
  }, [id]);

  // =========================================================
  // STATUS
  // =========================================================

  const shipmentSteps = [
    "CREATED",
    "PICKED_UP",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getCurrentStepIndex = () => {
    if (!shipment?.status) return 0;

    return shipmentSteps.indexOf(shipment.status);
  };

  const currentStepIndex = getCurrentStepIndex();

  // =========================================================
  // DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString();
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8">

        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

        <p className="mt-4 text-sm font-medium text-slate-600">
          Loading business shipment details...
        </p>

      </div>
    );
  }

  // =========================================================
  // NOT FOUND
  // =========================================================

  if (!shipment) {
    return (
      <div className="mx-auto my-12 max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <ShieldAlert className="h-7 w-7 text-slate-600" />
        </div>

        <h2 className="text-xl font-bold text-slate-800">
          Shipment Unreachable
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          We could not locate records for shipment ID:{" "}
          <span className="font-mono font-semibold text-slate-700">
            {id}
          </span>
          .
        </p>

        <button
          onClick={() =>
            navigate("/business/shipments")
          }
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shipments
        </button>

      </div>
    );
  }

  const isCancelled =
    shipment.status === "CANCELLED";

  const isDelivered =
    shipment.status === "DELIVERED";

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 pb-10 pt-5 sm:px-6 lg:px-8">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="border-b border-slate-200 pb-4">

        <button
          onClick={() =>
            navigate("/business/shipments")
          }
          className="mb-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shipments
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <div className="flex flex-wrap items-center gap-2.5">

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Shipment Details
              </h1>

              <span className="rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-700">
                #{shipment.trackingNumber}
              </span>

            </div>

            <p className="mt-1 text-sm text-slate-500">
              Shipment information, live route, ETA and tracking progress.
            </p>

          </div>

          <span
            className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${getStatusStyle(
              shipment.status
            )}`}
          >
            {formatStatus(shipment.status)}
          </span>

        </div>

      </section>


      {/* =====================================================
          COMPACT SHIPMENT INFORMATION
      ===================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* HEADER */}

        <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/50 px-5 py-3">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Package className="h-4 w-4" />
          </div>

          <div>

            <h2 className="text-sm font-bold text-slate-900">
              Shipment Information
            </h2>

            <p className="text-[10px] text-slate-500">
              Basic shipment details
            </p>

          </div>

        </div>


        {/* COMPACT DETAILS */}

        <div className="grid grid-cols-2 divide-x divide-slate-100 lg:grid-cols-5">

          {/* SENDER */}

          <div className="px-4 py-3">

            <div className="flex items-center gap-1.5">

              <User className="h-3.5 w-3.5 text-blue-600" />

              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Sender
              </span>

            </div>

            <p className="mt-1 truncate text-sm font-semibold text-slate-800">
              {shipment.senderName || "-"}
            </p>

          </div>


          {/* RECEIVER */}

          <div className="px-4 py-3">

            <div className="flex items-center gap-1.5">

              <User className="h-3.5 w-3.5 text-blue-600" />

              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Receiver
              </span>

            </div>

            <p className="mt-1 truncate text-sm font-semibold text-slate-800">
              {shipment.receiverName || "-"}
            </p>

          </div>


          {/* PACKAGE */}

          <div className="px-4 py-3">

            <div className="flex items-center gap-1.5">

              <Package className="h-3.5 w-3.5 text-purple-600" />

              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Package
              </span>

            </div>

            <p
              className="mt-1 truncate text-sm font-semibold text-slate-800"
              title={shipment.packageDescription || ""}
            >
              {shipment.packageDescription || "-"}
            </p>

          </div>


          {/* WEIGHT */}

          <div className="px-4 py-3">

            <div className="flex items-center gap-1.5">

              <Weight className="h-3.5 w-3.5 text-slate-500" />

              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Weight
              </span>

            </div>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              {shipment.weight
                ? `${shipment.weight} kg`
                : "-"}
            </p>

          </div>


          {/* CREATED */}

          <div className="border-t border-slate-100 px-4 py-3 lg:border-t-0">

            <div className="flex items-center gap-1.5">

              <Calendar className="h-3.5 w-3.5 text-slate-500" />

              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Created
              </span>

            </div>

            <p className="mt-1 truncate text-xs font-semibold text-slate-800">
              {formatDate(shipment.createdAt)}
            </p>

          </div>

        </div>


        {/* PICKUP / DELIVERY */}

        <div className="grid grid-cols-1 border-t border-slate-100 md:grid-cols-2">

          {/* PICKUP */}

          <div className="flex items-start gap-2.5 border-b border-slate-100 px-4 py-3 md:border-b-0 md:border-r">

            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <MapPin className="h-3.5 w-3.5" />
            </div>

            <div className="min-w-0">

              <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
                Pickup
              </p>

              <p className="mt-0.5 truncate text-xs font-medium text-slate-600">
                {formatPickupLocation() || "-"}
              </p>

            </div>

          </div>


          {/* DELIVERY */}

          <div className="flex items-start gap-2.5 px-4 py-3">

            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
              <MapPin className="h-3.5 w-3.5" />
            </div>

            <div className="min-w-0">

              <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                Delivery
              </p>

              <p className="mt-0.5 truncate text-xs font-medium text-slate-600">
                {formatDeliveryLocation() || "-"}
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          MAIN TRACKING GRID
      ===================================================== */}

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3">

        {/* ===================================================
            LEFT SIDE
        =================================================== */}

        <div className="space-y-5 lg:col-span-2">

          {/* =================================================
              DELIVERED
          ================================================= */}

          {isDelivered ? (

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50/50 px-5 py-3.5">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Package className="h-4 w-4" />
                </div>

                <div>

                  <h2 className="text-sm font-bold text-slate-900">
                    Delivery Completed
                  </h2>

                  <p className="text-[11px] text-slate-500">
                    Shipment has been successfully delivered.
                  </p>

                </div>

              </div>


              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">

                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-800">
                  Shipment Delivered
                </h3>

                <p className="mt-1 max-w-md text-sm leading-relaxed text-slate-500">
                  Live route tracking is no longer available for this shipment.
                  You can download the Proof of Delivery document below.
                </p>

                <button
                  type="button"
                  onClick={handleDownloadPod}
                  disabled={downloadingPod}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Download className="h-4 w-4" />

                  {downloadingPod
                    ? "Downloading..."
                    : "Download POD"}
                </button>

              </div>

            </section>

          ) : (

            <>
              {/* =================================================
                  LIVE ROUTE MAP
              ================================================== */}

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/50 px-5 py-3.5">

                  <div className="flex items-center gap-2.5">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Navigation className="h-4 w-4" />
                    </div>

                    <div>

                      <h2 className="text-sm font-bold text-slate-900">
                        Live Route Map
                      </h2>

                      <p className="text-[11px] text-slate-500">
                        Pickup to delivery route with current location
                      </p>

                    </div>

                  </div>

                  {location && (

                    <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">

                      <span className="relative flex h-2 w-2">

                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />

                        <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />

                      </span>

                      Signal Active

                    </div>

                  )}

                </div>


                {/* DISTANCE / TIME / ETA */}

                {!mapLoading && location && (

                  <div className="grid grid-cols-1 divide-y divide-slate-100 border-b border-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">

                    <div className="flex items-center gap-3 px-4 py-3">

                      <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                        <MapPin className="h-4 w-4" />
                      </div>

                      <div>

                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Distance
                        </span>

                        <span className="text-sm font-bold text-slate-900">
                          {etaLoading
                            ? "Loading..."
                            : eta
                            ? `${eta.distanceKm} km`
                            : "-"}
                        </span>

                      </div>

                    </div>


                    <div className="flex items-center gap-3 px-4 py-3">

                      <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                        <Clock className="h-4 w-4" />
                      </div>

                      <div>

                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Travel Time
                        </span>

                        <span className="text-sm font-bold text-slate-900">
                          {etaLoading
                            ? "Loading..."
                            : eta
                            ? eta.travelTime
                            : "-"}
                        </span>

                      </div>

                    </div>


                    <div className="flex items-center gap-3 bg-blue-50/40 px-4 py-3">

                      <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                        <TrendingUp className="h-4 w-4" />
                      </div>

                      <div>

                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-blue-700">
                          Estimated Arrival
                        </span>

                        <span className="text-sm font-bold text-blue-700">
                          {etaLoading
                            ? "Loading..."
                            : eta
                            ? eta.estimatedArrival
                            : "-"}
                        </span>

                      </div>

                    </div>

                  </div>

                )}


                {/* MAP */}

                <div className="bg-slate-50 p-3">

                  {mapLoading ? (

                    <div className="flex h-[360px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white">

                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                      <p className="mt-3 text-xs font-medium text-slate-500">
                        Loading Google Map view...
                      </p>

                    </div>

                  ) : location ? (

                    <div className="overflow-hidden rounded-xl border border-slate-200 shadow-inner">

                      <GoogleShipmentMap
                        pickupLatitude={location.pickupLatitude}
                        pickupLongitude={location.pickupLongitude}
                        deliveryLatitude={location.deliveryLatitude}
                        deliveryLongitude={location.deliveryLongitude}
                        encodedPolyline={encodedPolyline}
                      />

                    </div>

                  ) : (

                    <div className="flex h-[360px] w-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-center">

                      <MapPin className="h-8 w-8 text-slate-300" />

                      <p className="mt-2 text-sm font-semibold text-slate-700">
                        Current Location Unavailable
                      </p>

                      <p className="mt-1 max-w-xs text-xs text-slate-500">
                        No active GPS location is available for this shipment.
                      </p>

                    </div>

                  )}

                </div>

              </section>


              {/* =================================================
                  DELIVERY FORECAST
              ================================================== */}

              <div className="grid grid-cols-1 gap-5">
                <section className="rounded-2xl border border-blue-200 bg-gradient-to-br from-white via-white to-sky-50 shadow-sm">

                  <div className="flex items-center gap-2.5 border-b border-blue-100 px-4 py-3">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <TrendingUp className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-slate-900">
                        Delivery Forecast
                      </h2>
                      <p className="text-[10px] text-slate-500">
                        Estimated delivery information
                      </p>
                    </div>

                    <span className="ml-auto shrink-0 rounded-full bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-700">
                      {etaLoading ? "Calculating" : eta?.estimatedArrival ? "Estimated" : "Forecast"}
                    </span>
                  </div>

                  <div className="p-4">
                    {isDelivered ? (
                      <div className="rounded-xl border border-blue-100 bg-white/90 p-4 text-center">
                        <Package className="mx-auto h-7 w-7 text-blue-600" />
                        <p className="mt-2 text-xs font-semibold text-slate-800">
                          Shipment has been delivered.
                        </p>
                      </div>
                    ) : etaLoading ? (
                      <div className="flex min-h-[90px] items-center justify-center gap-2 rounded-xl border border-blue-100 bg-white/90 p-4">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-100 border-t-blue-600" />
                        <p className="text-xs font-medium text-slate-500">
                          Calculating delivery forecast...
                        </p>
                      </div>
                    ) : eta?.estimatedArrival ? (
                      <div className="rounded-xl border border-blue-100 bg-white/90 p-4">
                        <p className="text-xs leading-relaxed text-slate-600">
                          Estimated arrival based on the available route and ETA information.
                        </p>
                        <p className="mt-3 border-t border-slate-100 pt-3 text-sm font-bold text-blue-700">
                          {eta.estimatedArrival}
                        </p>
                        {eta.travelTime && (
                          <p className="mt-1 text-xs text-slate-500">
                            Expected travel time: {eta.travelTime}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-blue-100 bg-white/90 p-4 text-center">
                        <Clock className="mx-auto h-6 w-6 text-slate-300" />
                        <p className="mt-2 text-xs font-semibold text-slate-600">
                          Delivery forecast unavailable
                        </p>
                        <p className="mt-1 text-[10px] leading-relaxed text-slate-400">
                          Estimated delivery information is not currently available.
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </>
          )}

        </div>


        {/* =====================================================
            RIGHT SIDE — PROGRESSION LOG
        ===================================================== */}

        <aside className="lg:col-span-1">

          <div className="sticky top-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3.5">

              <h2 className="text-sm font-bold text-slate-900">
                Progression Log
              </h2>

              <p className="text-[11px] text-slate-500">
                Shipment checkpoint status
              </p>

            </div>


            <div className="p-5">

              {isCancelled ? (

                <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-red-700">

                  <div className="shrink-0 rounded-lg bg-red-100 p-1.5 text-red-600">

                    <X className="h-4 w-4 stroke-[3]" />

                  </div>

                  <div>

                    <p className="text-xs font-bold uppercase tracking-wider text-red-800">
                      Shipment Cancelled
                    </p>

                    <p className="mt-0.5 text-xs text-red-600">
                      This order has been terminated.
                    </p>

                  </div>

                </div>

              ) : (

                <div className="relative pl-7">

                  <div className="absolute bottom-2 left-[9px] top-2 w-[2px] bg-slate-200" />

                  {shipmentSteps.map((step, index) => {

                    const isCompleted =
                      index <= currentStepIndex;

                    const isCurrent =
                      index === currentStepIndex;

                    return (

                      <div
                        key={step}
                        className="relative mb-7 last:mb-0"
                      >

                        <div
                          className={`absolute -left-[25px] top-0.5 h-5 w-5 rounded-full border-2 ${
                            isCurrent
                              ? "border-blue-600 bg-blue-600 ring-4 ring-blue-100"
                              : isCompleted
                              ? "border-blue-600 bg-blue-600"
                              : "border-slate-300 bg-white"
                          }`}
                        />

                        <p
                          className={`text-sm font-semibold ${
                            isCurrent
                              ? "text-blue-700"
                              : isCompleted
                              ? "text-slate-800"
                              : "text-slate-400"
                          }`}
                        >
                          {formatStatus(step)}
                        </p>

                        {isCurrent && (

                          <span className="mt-1 inline-block rounded border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                            Active Checkpoint
                          </span>

                        )}

                      </div>

                    );
                  })}

                </div>

              )}

            </div>

          </div>

        </aside>

      </div>

    </div>
  );
};


// =========================================================
// STATUS STYLE
// =========================================================

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

export default BusinessShipmentDetails;