
import { useState } from "react";
import { toast } from "react-toastify";
import {
  Search,
  MapPin,
  Package,
  CheckCircle2,
  Download,
} from "lucide-react";

import { supportShipmentLookupApi } from "../../services/shipmentService";

import {
  getShipmentEta,
  getShipmentDelayPrediction,
  getShipmentDeliveryForecast,
  getShipmentRoute,
  getShipmentLocation,
} from "../../services/operatorService";

import { downloadPodApi } from "../../services/deliveryConfirmationService";

import GoogleShipmentMap from "../../components/GoogleShipmentMap";


const ShipmentLookup = () => {
  // =========================================================
  // STATES
  // =========================================================

  const [trackingNumber, setTrackingNumber] = useState("");
  const [shipment, setShipment] = useState(null);

  const [loading, setLoading] = useState(false);
  const [podDownloading, setPodDownloading] = useState(false);

  const [location, setLocation] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [encodedPolyline, setEncodedPolyline] = useState(null);
  const [etaInfo, setEtaInfo] = useState(null);

  const [deliveryForecast, setDeliveryForecast] =
    useState(null);

  const [delayPrediction, setDelayPrediction] =
    useState(null);


  // =========================================================
  // BUILD FULL ADDRESS
  // =========================================================

  const buildAddress = (
    address,
    city,
    state,
    pincode
  ) => {
    return [
      address,
      city,
      state,
      pincode,
    ]
      .filter(Boolean)
      .join(", ");
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
  // SEARCH SHIPMENT
  // =========================================================

  const handleSearch = async (event) => {
    event.preventDefault();

    const number =
      trackingNumber.trim();

    if (!number) {
      toast.error(
        "Please enter a tracking number."
      );
      return;
    }

    try {
      setLoading(true);

      // Clear previous shipment data
      setShipment(null);
      setLocation(null);
      setRouteInfo(null);
      setEncodedPolyline(null);
      setEtaInfo(null);
      setDeliveryForecast(null);
      setDelayPrediction(null);

      // =====================================================
      // GET SHIPMENT
      // =====================================================

      const response =
        await supportShipmentLookupApi(
          number
        );

      const data =
        response?.data?.data ||
        response?.data;

      if (!data) {
        toast.error(
          "Shipment not found."
        );
        return;
      }

      setShipment(data);

      // =====================================================
      // IF DELIVERED
      // =====================================================

      if (
        data.status === "DELIVERED"
      ) {
        return;
      }

      // =====================================================
      // GET CURRENT LOCATION
      // =====================================================

      try {
        const locationResponse =
          await getShipmentLocation(
            number
          );

        const locationData =
          locationResponse?.data?.data;

        if (locationData) {
          setLocation(
            locationData
          );

          // =================================================
          // GET ROUTE
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

              const route =
                routeResponse?.data?.data
                  ?.routes?.[0];

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

                const polyline =
                  route?.polyline
                    ?.encodedPolyline;

                if (polyline) {
                  setEncodedPolyline(
                    polyline
                  );
                }
              }
            } catch (routeError) {
              console.error(
                "Route error:",
                routeError
              );
            }

            // ===============================================
            // GET ETA
            // ===============================================

            try {
              const destinationAddress =
                buildAddress(
                  data.deliveryAddress,
                  data.deliveryCity,
                  data.deliveryState,
                  data.deliveryPincode
                );

              if (
                destinationAddress
              ) {
                const etaResponse =
                  await getShipmentEta(
                    locationData.pickupLatitude,
                    locationData.pickupLongitude,
                    destinationAddress
                  );

                if (
                  etaResponse?.data
                ) {
                  setEtaInfo(
                    etaResponse.data
                  );
                }
              }
            } catch (etaError) {
              console.error(
                "ETA error:",
                etaError
              );
            }
          }
        }
      } catch (locationError) {
        console.error(
          "Location error:",
          locationError
        );
      }

      // =====================================================
      // GET DELIVERY FORECAST
      // =====================================================

      try {
        const forecastResponse =
          await getShipmentDeliveryForecast(
            number
          );

        if (
          forecastResponse?.data
        ) {
          setDeliveryForecast(
            forecastResponse.data
          );
        }
      } catch (forecastError) {
        console.error(
          "Forecast error:",
          forecastError
        );
      }

      // =====================================================
      // GET DELAY PREDICTION
      // =====================================================

      try {
        const delayResponse =
          await getShipmentDelayPrediction(
            number
          );

        if (
          delayResponse?.data
        ) {
          setDelayPrediction(
            delayResponse.data
          );
        }
      } catch (delayError) {
        console.error(
          "Delay prediction error:",
          delayError
        );
      }

    } catch (error) {
      console.error(
        "Shipment lookup error:",
        error
      );

      setShipment(null);

      toast.error(
        error?.response?.data?.message ||
          "Unable to find shipment."
      );
    } finally {
      setLoading(false);
    }
  };


  // =========================================================
  // DOWNLOAD POD
  // =========================================================

  const handleDownloadPod = async () => {
    if (!shipment?.trackingNumber) {
      toast.error(
        "Tracking number is missing."
      );
      return;
    }

    try {
      setPodDownloading(true);

      const response =
        await downloadPodApi(
          shipment.trackingNumber
        );

      const blob = new Blob(
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
        "POD downloaded successfully."
      );

    } catch (error) {
      console.error(
        "POD download failed:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to download POD."
      );
    } finally {
      setPodDownloading(false);
    }
  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <p className="text-sm text-slate-600">
          Searching shipment...
        </p>
      </div>
    );
  }


  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="w-full px-3 py-4 sm:px-5 lg:px-6">

      <div className="mx-auto w-full max-w-6xl">

        {/* ===================================================
            SEARCH
        =================================================== */}

        <form
          onSubmit={handleSearch}
          className="flex w-full flex-col gap-2 sm:flex-row"
        >

          <div className="relative min-w-0 flex-1">

            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={trackingNumber}
              onChange={(e) =>
                setTrackingNumber(
                  e.target.value
                )
              }
              placeholder="Enter tracking number"
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Search
          </button>

        </form>


        {/* ===================================================
            NO RESULT
        =================================================== */}

        {!shipment && (
          <div className="mt-8 text-center">

            <Package className="mx-auto h-8 w-8 text-slate-300" />

            <p className="mt-2 text-sm text-slate-500">
              Search for a shipment using its tracking number.
            </p>

          </div>
        )}


        {/* ===================================================
            SHIPMENT RESULT
        =================================================== */}

        {shipment && (
          <div className="mt-5 space-y-4">

            {/* ===============================================
                BASIC SHIPMENT INFORMATION
            =============================================== */}

            <section className="rounded-lg border border-slate-200 bg-white p-4">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div className="min-w-0">

                  <p className="text-xs text-slate-500">
                    Tracking Number
                  </p>

                  <p className="mt-1 break-all text-sm font-bold text-slate-800">
                    {shipment.trackingNumber}
                  </p>

                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                    shipment.status === "DELIVERED"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {shipment.status}
                </span>

              </div>


              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

                <div>
                  <p className="text-xs text-slate-500">
                    Customer
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {shipment.customer || "N/A"}
                  </p>
                </div>


                <div>
                  <p className="text-xs text-slate-500">
                    Receiver
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {shipment.receiver || "N/A"}
                  </p>
                </div>


                <div>
                  <p className="text-xs text-slate-500">
                    Package
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {shipment.packageDescription || "N/A"}
                  </p>
                </div>


                <div>
                  <p className="text-xs text-slate-500">
                    Weight
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {shipment.weight
                      ? `${shipment.weight} kg`
                      : "N/A"}
                  </p>
                </div>

              </div>

            </section>


            {/* ===============================================
                FULL ADDRESSES
            =============================================== */}

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">

              {/* PICKUP */}

              <div className="rounded-lg border border-slate-200 bg-white p-4">

                <div className="flex items-center gap-2">

                  <MapPin className="h-4 w-4 text-blue-600" />

                  <h2 className="text-sm font-semibold text-slate-800">
                    Pickup Address
                  </h2>

                </div>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {buildAddress(
                    shipment.pickupAddress,
                    shipment.pickupCity,
                    shipment.pickupState,
                    shipment.pickupPincode
                  ) || "N/A"}
                </p>

              </div>


              {/* DELIVERY */}

              <div className="rounded-lg border border-slate-200 bg-white p-4">

                <div className="flex items-center gap-2">

                  <MapPin className="h-4 w-4 text-blue-600" />

                  <h2 className="text-sm font-semibold text-slate-800">
                    Delivery Address
                  </h2>

                </div>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {buildAddress(
                    shipment.deliveryAddress,
                    shipment.deliveryCity,
                    shipment.deliveryState,
                    shipment.deliveryPincode
                  ) || "N/A"}
                </p>

              </div>

            </section>


            {/* ===============================================
                POD — DELIVERED ONLY
            =============================================== */}

            {shipment.status ===
              "DELIVERED" && (

              <section className="rounded-lg border border-blue-200 bg-blue-50 p-4">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-start gap-3">

                    <div className="mt-0.5">

                      <CheckCircle2
                        className="h-5 w-5 text-blue-600"
                      />

                    </div>

                    <div>

                      <h2 className="text-sm font-semibold text-blue-800">
                        Proof of Delivery
                      </h2>

                      <p className="mt-1 text-xs leading-5 text-blue-700">
                        Delivery has been completed and the Proof of Delivery PDF is available.
                      </p>

                    </div>

                  </div>


                  <button
                    type="button"
                    onClick={
                      handleDownloadPod
                    }
                    disabled={
                      podDownloading
                    }
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >

                    <Download className="h-4 w-4" />

                    {podDownloading
                      ? "Downloading..."
                      : "Download POD"}

                  </button>

                </div>

              </section>
            )}


            {/* ===============================================
                ACTIVE SHIPMENT TRACKING
            =============================================== */}

            {shipment.status !==
              "DELIVERED" && (

              <>
                {/* MAP */}

                {location &&
                  location.pickupLatitude !=
                    null &&
                  location.pickupLongitude !=
                    null &&
                  location.deliveryLatitude !=
                    null &&
                  location.deliveryLongitude !=
                    null && (

                    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">

                      <div className="border-b border-slate-200 px-4 py-3">

                        <h2 className="text-sm font-semibold text-slate-800">
                          Live Shipment Route
                        </h2>

                      </div>

                      <div className="h-[280px] w-full sm:h-[340px]">

                        <GoogleShipmentMap
                          pickup={{
                            lat: Number(
                              location.pickupLatitude
                            ),
                            lng: Number(
                              location.pickupLongitude
                            ),
                          }}
                          delivery={{
                            lat: Number(
                              location.deliveryLatitude
                            ),
                            lng: Number(
                              location.deliveryLongitude
                            ),
                          }}
                          currentLocation={
                            location.currentLatitude !=
                              null &&
                            location.currentLongitude !=
                              null
                              ? {
                                  lat: Number(
                                    location.currentLatitude
                                  ),
                                  lng: Number(
                                    location.currentLongitude
                                  ),
                                }
                              : null
                          }
                          encodedPolyline={
                            encodedPolyline
                          }
                        />

                      </div>


                      {/* MAP METRICS */}

                      <div className="grid grid-cols-1 divide-y border-t border-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">

                        <div className="px-4 py-3 text-center">

                          <p className="text-xs text-slate-500">
                            Distance
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {formatDistance(
                              routeInfo?.distanceMeters
                            )}
                          </p>

                        </div>


                        <div className="px-4 py-3 text-center">

                          <p className="text-xs text-slate-500">
                            Transit Time
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {formatTravelTime(
                              routeInfo?.durationSeconds
                            )}
                          </p>

                        </div>


                        <div className="px-4 py-3 text-center">

                          <p className="text-xs text-slate-500">
                            ETA
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {etaInfo?.duration ||
                              etaInfo?.eta ||
                              "N/A"}
                          </p>

                        </div>

                      </div>

                    </section>
                  )}


                {/* CURRENT LOCATION */}

                <section className="rounded-lg border border-slate-200 bg-white p-4">

                  <div className="flex items-center gap-2">

                    <MapPin className="h-4 w-4 text-blue-600" />

                    <h2 className="text-sm font-semibold text-slate-800">
                      Current Location
                    </h2>

                  </div>

                  <p className="mt-2 text-sm text-slate-600">
                    {location?.currentLocation ||
                      shipment.currentLocation ||
                      "Location not available"}
                  </p>

                </section>


                {/* FORECAST + DELAY */}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                  <section className="rounded-lg border border-slate-200 bg-white p-4">

                    <h2 className="text-sm font-semibold text-slate-800">
                      Delivery Forecast
                    </h2>

                    {deliveryForecast ? (
                      <div className="mt-3 space-y-2 text-sm text-slate-600">

                        <p>
                          Expected Delivery:{" "}
                          <span className="font-medium text-slate-800">
                            {deliveryForecast.expectedDeliveryDate ||
                              deliveryForecast.estimatedDeliveryDate ||
                              "N/A"}
                          </span>
                        </p>

                        <p>
                          Status:{" "}
                          <span className="font-medium text-slate-800">
                            {deliveryForecast.status ||
                              "N/A"}
                          </span>
                        </p>

                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-slate-500">
                        Forecast not available.
                      </p>
                    )}

                  </section>


                  <section className="rounded-lg border border-slate-200 bg-white p-4">

                    <h2 className="text-sm font-semibold text-slate-800">
                      Delay Assessment
                    </h2>

                    {delayPrediction ? (
                      <div className="mt-3 space-y-2 text-sm text-slate-600">

                        <p>
                          Prediction:{" "}
                          <span className="font-medium text-slate-800">
                            {delayPrediction.prediction ||
                              delayPrediction.status ||
                              "N/A"}
                          </span>
                        </p>

                        <p>
                          Reason:{" "}
                          <span className="font-medium text-slate-800">
                            {delayPrediction.reason ||
                              "N/A"}
                          </span>
                        </p>

                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-slate-500">
                        Delay assessment not available.
                      </p>
                    )}

                  </section>

                </div>

              </>
            )}


            {/* ===============================================
                DELIVERED MESSAGE
            =============================================== */}

            {shipment.status ===
              "DELIVERED" && (

              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">

                <CheckCircle2
                  className="h-5 w-5 shrink-0 text-blue-600"
                />

                <p className="text-sm text-blue-700">
                  This shipment has been delivered. Live tracking and location updates are no longer active.
                </p>

              </div>

            )}

          </div>
        )}

      </div>

    </div>
  );
};

export default ShipmentLookup;
