
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
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import GoogleShipmentMap from "../../components/GoogleShipmentMap";
import { getShipmentByIdApi } from "../../services/shipmentService";

import {
  getShipmentLocation,
  getShipmentRoute,
} from "../../services/operatorService";


const AdminShipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);

  const [shipmentLocation, setShipmentLocation] =
    useState(null);

  const [locationLoading, setLocationLoading] =
    useState(true);

  const [route, setRoute] = useState(null);

  const [routeLoading, setRouteLoading] =
    useState(true);

  // Google's encoded road route
  const [encodedPolyline, setEncodedPolyline] =
    useState("");


  // =========================================================
  // FETCH SHIPMENT DETAILS
  // =========================================================

  useEffect(() => {
    const fetchShipmentDetails = async () => {
      try {
        const response =
          await getShipmentByIdApi(id);

        if (response.data.success === true) {

          const shipmentData =
            response.data.data;

          setShipment(shipmentData);

          /*
           * DELIVERED SHIPMENTS
           *
           * Do not fetch live location or route
           * after delivery.
           */

          const isDelivered =
            shipmentData?.status?.toUpperCase() ===
            "DELIVERED";

          if (!isDelivered) {
            await fetchShipmentLocationAndRoute(
              shipmentData.trackingNumber
            );
          } else {
            setShipmentLocation(null);
            setRoute(null);
            setEncodedPolyline("");
            setLocationLoading(false);
            setRouteLoading(false);
          }

        } else {

          toast.error(
            response.data.message ||
              "Failed to fetch shipment details"
          );
        }

      } catch (error) {

        console.error(
          "Error fetching shipment details:",
          error
        );

        toast.error(
          error.response?.data?.message ||
            "Failed to fetch shipment details"
        );

      } finally {
        setLoading(false);
      }
    };

    fetchShipmentDetails();
  }, [id]);


  // =========================================================
  // LIVE LOCATION POLLING
  // =========================================================

  useEffect(() => {

    if (!shipment?.trackingNumber) {
      return;
    }

    /*
     * IMPORTANT:
     * Do not poll location after shipment is delivered.
     */

    if (
      shipment.status?.toUpperCase() ===
      "DELIVERED"
    ) {
      return;
    }

    const interval = setInterval(() => {

      fetchShipmentLocationAndRoute(
        shipment.trackingNumber
      );

    }, 900000);

    return () => {
      clearInterval(interval);
    };

  }, [
    shipment?.trackingNumber,
    shipment?.status,
  ]);


  // =========================================================
  // FETCH LOCATION + ROUTE
  // =========================================================

  const fetchShipmentLocationAndRoute = async (
    trackingNumber
  ) => {

    try {

      /*
       * Safety check:
       * Never request live location for a delivered shipment.
       */

      if (
        shipment?.status?.toUpperCase() ===
        "DELIVERED"
      ) {
        setShipmentLocation(null);
        setRoute(null);
        setEncodedPolyline("");
        setLocationLoading(false);
        setRouteLoading(false);
        return;
      }

      setLocationLoading(true);
      setRouteLoading(true);

      // Clear old route while loading new data
      setRoute(null);
      setEncodedPolyline("");


      // =====================================================
      // STEP 1: GET SHIPMENT LOCATION / COORDINATES
      // =====================================================

      console.log(
        "Fetching shipment location:",
        trackingNumber
      );

      const locationResponse =
        await getShipmentLocation(
          trackingNumber
        );

      const locationData =
        locationResponse.data?.data;

      console.log(
        "SHIPMENT LOCATION DATA:",
        locationData
      );


      if (!locationData) {

        console.warn(
          "No shipment location data returned."
        );

        setShipmentLocation(null);

        return;
      }

      setShipmentLocation(
        locationData
      );


      // =====================================================
      // STEP 2: GET PICKUP / DELIVERY COORDINATES
      // =====================================================

      const pickupLatitude =
        locationData.pickupLatitude;

      const pickupLongitude =
        locationData.pickupLongitude;

      const deliveryLatitude =
        locationData.deliveryLatitude;

      const deliveryLongitude =
        locationData.deliveryLongitude;


      console.log(
        "PICKUP LATITUDE:",
        pickupLatitude
      );

      console.log(
        "PICKUP LONGITUDE:",
        pickupLongitude
      );

      console.log(
        "DELIVERY LATITUDE:",
        deliveryLatitude
      );

      console.log(
        "DELIVERY LONGITUDE:",
        deliveryLongitude
      );


      // =====================================================
      // STEP 3: CHECK COORDINATES
      // =====================================================

      if (
        pickupLatitude == null ||
        pickupLongitude == null ||
        deliveryLatitude == null ||
        deliveryLongitude == null
      ) {

        console.warn(
          "Shipment coordinates are missing."
        );

        return;
      }


      // =====================================================
      // STEP 4: CREATE COORDINATE STRINGS
      // =====================================================

      const origin =
        `${pickupLatitude},${pickupLongitude}`;

      const destination =
        `${deliveryLatitude},${deliveryLongitude}`;


      console.log(
        "ROUTE ORIGIN:",
        origin
      );

      console.log(
        "ROUTE DESTINATION:",
        destination
      );


      // =====================================================
      // STEP 5: CALL GOOGLE ROUTES BACKEND
      // =====================================================

      const routeResponse =
        await getShipmentRoute(
          origin,
          destination
        );


      console.log(
        "FULL ROUTE RESPONSE:",
        routeResponse.data
      );


      // =====================================================
      // STEP 6: GET ROUTES ARRAY
      // =====================================================

      const routes =
        routeResponse.data?.data?.routes;


      if (
        !routes ||
        routes.length === 0
      ) {

        console.warn(
          "No route returned from backend."
        );

        return;
      }


      // =====================================================
      // STEP 7: GET FIRST ROUTE
      // =====================================================

      const routeData =
        routes[0];


      console.log(
        "ROUTE DATA:",
        routeData
      );


      setRoute(
        routeData
      );


      // =====================================================
      // STEP 8: GET ENCODED POLYLINE
      // =====================================================

      const polyline =
        routeData?.polyline?.encodedPolyline;


      console.log(
        "ENCODED POLYLINE:",
        polyline
      );


      if (!polyline) {

        console.warn(
          "Google route returned without encoded polyline."
        );

        setEncodedPolyline("");

        return;
      }


      // =====================================================
      // STEP 9: STORE POLYLINE
      // =====================================================

      setEncodedPolyline(
        polyline
      );

      console.log(
        "BLUE ROUTE POLYLINE STORED SUCCESSFULLY"
      );

    } catch (error) {

      console.error(
        "Error fetching shipment location/route:",
        error
      );

      setRoute(null);
      setEncodedPolyline("");

    } finally {

      setLocationLoading(false);
      setRouteLoading(false);

    }
  };


  // =========================================================
  // STATUS
  // =========================================================

  const formatStatus = (status) => {

    if (!status) {
      return "-";
    }

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(
        /\b\w/g,
        (char) => char.toUpperCase()
      );
  };


  // =========================================================
  // STATUS STYLE
  // =========================================================

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
        return "bg-green-100 text-green-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };


  // =========================================================
  // DATE
  // =========================================================

  const formatDate = (date) => {

    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString();
  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div className="mx-auto max-w-7xl p-5 md:p-7">

        <div className="flex min-h-[300px] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

            <p className="text-sm text-slate-500">
              Loading shipment details...
            </p>

          </div>

        </div>

      </div>
    );
  }


  // =========================================================
  // NOT FOUND
  // =========================================================

  if (!shipment) {

    return (
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-5 sm:px-5 md:px-7">

        <button
          onClick={() =>
            navigate("/admin/shipments")
          }
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-emerald-600"
        >
          <ArrowLeft size={18} />
          Back to Shipments
        </button>


        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">

          <Package
            size={38}
            className="mx-auto mb-3 text-slate-300"
          />

          <h2 className="font-semibold text-slate-700">
            Shipment not found
          </h2>

        </div>

      </div>
    );
  }


  // =========================================================
  // STATUS STEPS
  // =========================================================

  const steps = [
    "CREATED",
    "PICKED_UP",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];


  const currentIndex =
    steps.indexOf(
      shipment.status
    );


  const isCancelled =
    shipment.status?.toUpperCase() ===
    "CANCELLED";


  // =========================================================
  // DELIVERED CHECK
  // =========================================================

  const isDelivered =
    shipment.status?.toUpperCase() ===
    "DELIVERED";


  // =========================================================
  // RETURN
  // =========================================================

  return (

    <div className="mx-auto max-w-7xl space-y-5 px-4 pb-10 pt-5 sm:px-5 md:px-7">


      {/* =====================================================
          HEADER / TRACKING
      ===================================================== */}

      <section className="border-b border-slate-200 pb-4">

        <button
          onClick={() =>
            navigate("/admin/shipments")
          }
          className="mb-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          <ArrowLeft size={17} />
          Back to Shipments
        </button>


        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <div className="flex flex-wrap items-center gap-2">

              <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
                Shipment Details
              </h1>

              <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium text-slate-600">
                #{shipment.trackingNumber}
              </span>

            </div>


            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Shipment information, live route and tracking progress
            </p>

          </div>


          <span
            className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
              shipment.status
            )}`}
          >
            {formatStatus(
              shipment.status
            )}
          </span>

        </div>

      </section>


      {/* =====================================================
          SHIPMENT DETAILS — ONE COMPACT FULL-WIDTH CARD
      ===================================================== */}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* Header */}

        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-4 py-3">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">

            <Package
              size={17}
              className="text-emerald-600"
            />

          </div>


          <div>

            <h2 className="text-sm font-semibold text-slate-800">
              Shipment Information
            </h2>

            <p className="text-[11px] text-slate-400">
              Sender, receiver, package and route details
            </p>

          </div>

        </div>


        {/* Main Information */}

        <div className="p-4">

          {/* =================================================
              SENDER / RECEIVER / PACKAGE
          ================================================= */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {/* SENDER */}

            <div className="min-w-0">

              <div className="mb-2 flex items-center gap-1.5">

                <User
                  size={15}
                  className="text-emerald-600"
                />

                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Sender
                </p>

              </div>


              <p className="text-sm font-semibold text-slate-800">
                {shipment.senderName || "-"}
              </p>


              <div className="mt-1 flex items-start gap-1.5">

                <Mail
                  size={13}
                  className="mt-0.5 shrink-0 text-slate-400"
                />

                <p className="break-all text-xs text-slate-500">
                  {shipment.senderEmail || "-"}
                </p>

              </div>

            </div>


            {/* RECEIVER */}

            <div className="min-w-0 md:border-l md:border-slate-100 md:pl-4">

              <div className="mb-2 flex items-center gap-1.5">

                <User
                  size={15}
                  className="text-emerald-600"
                />

                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Receiver
                </p>

              </div>


              <p className="text-sm font-semibold text-slate-800">
                {shipment.receiverName || "-"}
              </p>


              <div className="mt-1 flex items-center gap-1.5">

                <Phone
                  size={13}
                  className="text-slate-400"
                />

                <p className="text-xs text-slate-500">
                  {shipment.receiverPhone || "-"}
                </p>

              </div>

            </div>


            {/* PACKAGE */}

            <div className="min-w-0 md:border-l md:border-slate-100 md:pl-4">

              <div className="mb-2 flex items-center gap-1.5">

                <Package
                  size={15}
                  className="text-emerald-600"
                />

                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Package
                </p>

              </div>


              <p className="text-sm font-semibold text-slate-800">
                {shipment.packageDescription || "-"}
              </p>


              <div className="mt-1 flex flex-wrap items-center gap-3">

                <div className="flex items-center gap-1">

                  <Weight
                    size={13}
                    className="text-slate-400"
                  />

                  <span className="text-xs text-slate-500">

                    {shipment.weight
                      ? `${shipment.weight} kg`
                      : "-"}

                  </span>

                </div>


                <span className="text-xs text-slate-300">
                  |
                </span>


                <span className="text-xs font-medium text-emerald-600">
                  {shipment.trackingNumber || "-"}
                </span>

              </div>

            </div>

          </div>


          {/* DIVIDER */}

          <div className="my-4 border-t border-slate-100" />


          {/* =================================================
              PICKUP + DELIVERY
          ================================================= */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {/* PICKUP */}

            <div className="min-w-0">

              <div className="mb-2 flex items-center gap-1.5">

                <MapPin
                  size={15}
                  className="text-emerald-600"
                />

                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Pickup Location
                </p>

              </div>


              <p className="text-sm font-medium leading-relaxed text-slate-700">
                {shipment.pickupAddress || "-"}
              </p>


              <p className="mt-0.5 text-xs text-slate-500">

                {shipment.pickupCity || "-"},{" "}
                {shipment.pickupState || "-"}
                {" · "}
                PIN: {shipment.pickupPincode || "-"}

              </p>

            </div>


            {/* DELIVERY */}

            <div className="min-w-0 md:border-l md:border-slate-100 md:pl-4">

              <div className="mb-2 flex items-center gap-1.5">

                <Truck
                  size={15}
                  className="text-orange-500"
                />

                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Delivery Location
                </p>

              </div>


              <p className="text-sm font-medium leading-relaxed text-slate-700">
                {shipment.deliveryAddress || "-"}
              </p>


              <p className="mt-0.5 text-xs text-slate-500">

                {shipment.deliveryCity || "-"},{" "}
                {shipment.deliveryState || "-"}
                {" · "}
                PIN: {shipment.deliveryPincode || "-"}

              </p>

            </div>

          </div>


          {/* CREATED / UPDATED */}

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-slate-100 pt-3">

            <div className="flex items-center gap-1.5">

              <Calendar
                size={13}
                className="text-slate-400"
              />

              <span className="text-[11px] text-slate-400">
                Created:
              </span>

              <span className="text-[11px] font-medium text-slate-600">
                {formatDate(
                  shipment.createdAt
                )}
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          MAIN TRACKING STRUCTURE
          LEFT 2/3  = MAP + LOWER INFORMATION
          RIGHT 1/3 = PROGRESSION LOG
      ===================================================== */}

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3">


        {/* ===================================================
            LEFT 2/3
        =================================================== */}

        <div className="space-y-5 lg:col-span-2">


          {/* =================================================
              LIVE ROUTE MAP
          ================================================= */}

          {!isDelivered ? (

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

              {/* MAP HEADER */}

              <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">

                    <Navigation
                      size={17}
                      className="text-emerald-600"
                    />

                  </div>


                  <div>

                    <h2 className="text-sm font-semibold text-slate-800">
                      Live Route Map
                    </h2>

                    <p className="text-[11px] text-slate-400">
                      Pickup to delivery route with current location
                    </p>

                  </div>

                </div>


                <div className="flex items-center gap-1.5 text-[11px]">

                  <span
                    className={`h-2 w-2 rounded-full ${
                      shipmentLocation
                        ? "bg-emerald-500"
                        : "bg-slate-300"
                    }`}
                  />

                  <span className="text-slate-500">

                    {shipmentLocation
                      ? "Location Available"
                      : "Location Unavailable"}

                  </span>

                </div>

              </div>


              {/* =================================================
                  DISTANCE / TRAVEL TIME / ETA
              ================================================= */}

              {shipmentLocation && (

                <div className="grid grid-cols-1 divide-y divide-slate-100 border-b border-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">


                  {/* DISTANCE */}

                  <div className="flex items-center gap-3 px-4 py-3">

                    <div className="rounded-lg bg-slate-100 p-2 text-slate-600">

                      <Route size={16} />

                    </div>


                    <div>

                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Distance
                      </span>

                      <span className="text-sm font-bold text-slate-900">

                        {routeLoading
                          ? "Loading..."
                          : route?.distanceMeters
                          ? `${(
                              route.distanceMeters /
                              1000
                            ).toFixed(1)} km`
                          : "-"}

                      </span>

                    </div>

                  </div>


                  {/* TRAVEL TIME */}

                  <div className="flex items-center gap-3 px-4 py-3">

                    <div className="rounded-lg bg-slate-100 p-2 text-slate-600">

                      <Clock size={16} />

                    </div>


                    <div>

                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Travel Time
                      </span>

                      <span className="text-sm font-bold text-slate-900">

                        {routeLoading
                          ? "Loading..."
                          : route?.duration
                          ? formatRouteDuration(
                              route.duration
                            )
                          : "-"}

                      </span>

                    </div>

                  </div>


                  {/* ETA / ROUTE STATUS */}

                  <div className="flex items-center gap-3 bg-emerald-50/40 px-4 py-3">

                    <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">

                      <TrendingUp size={16} />

                    </div>


                    <div>

                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                        Route Status
                      </span>

                      <span className="text-sm font-bold text-emerald-700">

                        {encodedPolyline
                          ? "Route Available"
                          : "Route Pending"}

                      </span>

                    </div>

                  </div>

                </div>

              )}


              {/* =================================================
                  GOOGLE MAP
              ================================================= */}

              <div className="bg-slate-50 p-3">

                {locationLoading ? (

                  <div className="flex h-[360px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white">

                    <div className="text-center">

                      <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

                      <p className="text-xs text-slate-500">
                        Loading shipment map...
                      </p>

                    </div>

                  </div>

                ) : shipmentLocation ? (

                  <div className="overflow-hidden rounded-lg border border-slate-200">

                    <GoogleShipmentMap
                      pickupLatitude={
                        shipmentLocation.pickupLatitude
                      }
                      pickupLongitude={
                        shipmentLocation.pickupLongitude
                      }
                      deliveryLatitude={
                        shipmentLocation.deliveryLatitude
                      }
                      deliveryLongitude={
                        shipmentLocation.deliveryLongitude
                      }
                      encodedPolyline={
                        encodedPolyline
                      }
                    />

                  </div>

                ) : (

                  <div className="flex h-[360px] items-center justify-center rounded-lg bg-white">

                    <div className="text-center">

                      <MapPin
                        size={32}
                        className="mx-auto mb-2 text-slate-300"
                      />

                      <p className="text-xs font-medium text-slate-600">
                        No live location data available
                      </p>

                      <p className="mt-1 text-[11px] text-slate-400">
                        Location information has not been received
                        for this shipment.
                      </p>

                    </div>

                  </div>

                )}

              </div>

            </section>

          ) : (

            /* =================================================
               DELIVERED SHIPMENT — NO MAP
            ================================================= */

            <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">

              <div className="flex items-start gap-3">

                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100">

                  <Package
                    size={17}
                    className="text-emerald-600"
                  />

                </div>


                <div>

                  <h2 className="text-sm font-semibold text-emerald-800">
                    Shipment Delivered
                  </h2>

                  <p className="mt-1 text-xs leading-relaxed text-emerald-700">
                    This shipment has been delivered. Live tracking,
                    route updates and location updates are no longer active.
                  </p>

                </div>

              </div>

            </section>

          )}


          {/* =================================================
              DELIVERY FORECAST + DELAY ASSESSMENT

              IMPORTANT:
              This Admin page does not currently call the
              forecast or delay-prediction APIs.

              Therefore no fake prediction values are shown.
          ================================================= */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">


            {/* DELIVERY FORECAST */}

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-4 py-3">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">

                  <TrendingUp
                    size={16}
                    className="text-emerald-600"
                  />

                </div>


                <div>

                  <h2 className="text-sm font-semibold text-slate-800">
                    Delivery Forecast
                  </h2>

                  <p className="text-[11px] text-slate-400">
                    Route-based delivery information
                  </p>

                </div>

              </div>


              <div className="p-4">

                <div className="grid grid-cols-2 gap-3">


                  <div className="rounded-lg bg-slate-50 px-3 py-2.5">

                    <p className="text-[10px] uppercase tracking-wide text-slate-400">
                      Route Distance
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-800">

                      {!isDelivered && routeLoading
                        ? "Loading..."
                        : route?.distanceMeters
                        ? `${(
                            route.distanceMeters /
                            1000
                          ).toFixed(1)} km`
                        : "-"}

                    </p>

                  </div>


                  <div className="rounded-lg bg-slate-50 px-3 py-2.5">

                    <p className="text-[10px] uppercase tracking-wide text-slate-400">
                      Route Time
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-800">

                      {!isDelivered && routeLoading
                        ? "Loading..."
                        : route?.duration
                        ? formatRouteDuration(
                            route.duration
                          )
                        : "-"}

                    </p>

                  </div>

                </div>


                <p className="mt-3 text-[11px] leading-relaxed text-slate-400">

                  This page currently provides route information only.
                  Delivery forecasting is not requested by this component.

                </p>

              </div>

            </section>


            {/* DELAY ASSESSMENT */}

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-4 py-3">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">

                  <ShieldAlert
                    size={16}
                    className="text-slate-600"
                  />

                </div>


                <div>

                  <h2 className="text-sm font-semibold text-slate-800">
                    Delay Assessment
                  </h2>

                  <p className="text-[11px] text-slate-400">
                    Prediction status
                  </p>

                </div>

              </div>


              <div className="flex min-h-[132px] items-center justify-center p-4 text-center">

                <div>

                  <ShieldAlert
                    size={27}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-2 text-xs font-semibold text-slate-600">
                    Delay prediction unavailable
                  </p>

                  <p className="mt-1 text-[10px] leading-relaxed text-slate-400">
                    This Admin Shipment Details page does not currently
                    request delay prediction data.
                  </p>

                </div>

              </div>

            </section>

          </div>

        </div>


        {/* ===================================================
            RIGHT 1/3 — PROGRESSION LOG

            Spans beside both map and lower cards.
        =================================================== */}

        <aside className="lg:col-span-1">

          <div className="sticky top-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">


            {/* HEADER */}

            <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3">

              <h2 className="text-sm font-semibold text-slate-800">
                Progression Log
              </h2>

              <p className="text-[11px] text-slate-400">
                Current shipment stage
              </p>

            </div>


            {/* TIMELINE */}

            <div className="p-4">

              {isCancelled ? (

                <div className="flex items-center gap-3 rounded-lg border border-red-100 bg-red-50 px-3 py-3">

                  <div className="rounded-lg bg-red-100 p-1.5 text-red-600">

                    <X
                      size={15}
                      className="stroke-[3]"
                    />

                  </div>


                  <div>

                    <p className="text-xs font-semibold text-red-700">
                      Shipment Cancelled
                    </p>

                    <p className="mt-1 text-[11px] text-red-500">
                      This shipment has been cancelled.
                    </p>

                  </div>

                </div>

              ) : (

                <div className="relative">

                  {/* VERTICAL LINE */}

                  <div className="absolute bottom-5 left-[11px] top-5 w-px bg-slate-200" />


                  <div className="space-y-4">

                    {steps.map(
                      (step, index) => {

                        const completed =
                          index <=
                          currentIndex;

                        const current =
                          index ===
                          currentIndex;


                        return (

                          <div
                            key={step}
                            className="relative flex items-center gap-3"
                          >

                            {/* CIRCLE */}

                            <div
                              className={`relative z-10 flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                                completed
                                  ? "bg-emerald-600 text-white ring-4 ring-emerald-50"
                                  : "bg-slate-100 text-slate-400 ring-4 ring-white"
                              }`}
                            >
                              {index + 1}
                            </div>


                            {/* TEXT */}

                            <div
                              className={`flex flex-1 items-center justify-between rounded-lg px-2.5 py-2 ${
                                current
                                  ? "bg-emerald-50"
                                  : ""
                              }`}
                            >

                              <span
                                className={`text-xs ${
                                  current
                                    ? "font-semibold text-emerald-700"
                                    : completed
                                    ? "font-medium text-slate-700"
                                    : "font-medium text-slate-400"
                                }`}
                              >
                                {formatStatus(
                                  step
                                )}
                              </span>


                              {current && (

                                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                                  CURRENT
                                </span>

                              )}

                            </div>

                          </div>

                        );
                      }
                    )}

                  </div>

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
// ROUTE DURATION FORMATTER
// =========================================================

const formatRouteDuration = (
  duration
) => {

  if (!duration) {
    return "-";
  }

  /*
   * Google Routes API duration can arrive as:
   * "1234s"
   */

  if (
    typeof duration === "string" &&
    duration.endsWith("s")
  ) {

    const totalSeconds =
      parseInt(
        duration.replace("s", ""),
        10
      );


    if (
      !Number.isNaN(
        totalSeconds
      )
    ) {

      const hours =
        Math.floor(
          totalSeconds / 3600
        );

      const minutes =
        Math.floor(
          (totalSeconds % 3600) / 60
        );


      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }

      return `${minutes} min`;
    }
  }

  return duration;
};


export default AdminShipmentDetails;