import { useState } from "react";
import {
  Search,
  Package,
  MapPin,
  Truck,
} from "lucide-react";
import { toast } from "react-toastify";

import { trackShipmentApi } from "../../services/shipmentService";

import {
  getShipmentLocation,
  getShipmentRoute,
  getShipmentEta,
} from "../../services/operatorService";


const TrackShipment = () => {

  const [shipmentId, setShipmentId] =
    useState("");

  const [trackingResult, setTrackingResult] =
    useState(null);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  // =========================================================
  // FORMAT STATUS
  // =========================================================

  const formatStatus = (status) => {

    if (!status) {
      return "Unknown";
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
  // FORMAT DISTANCE
  // =========================================================

  const formatDistance = (meters) => {

    if (
      meters === null ||
      meters === undefined
    ) {
      return "Not available";
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
      return "Not available";
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
      return `${hours} hours ${minutes} minutes`;
    }


    if (hours > 0) {
      return `${hours} hours`;
    }


    return `${minutes} minutes`;

  };


  // =========================================================
  // BUILD ADDRESS
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
  // HANDLE TRACK
  // =========================================================

  const handleTrack = async () => {

    if (!shipmentId.trim()) {

      setError(
        "Please enter a shipment tracking number."
      );

      setTrackingResult(null);

      return;

    }


    try {

      setLoading(true);

      setError("");

      setTrackingResult(null);


      const trackingNumber =
        shipmentId.trim();


      // =====================================================
      // 1. GET SHIPMENT DETAILS
      // =====================================================

      const shipmentResponse =
        await trackShipmentApi(
          trackingNumber
        );


      if (
        shipmentResponse.data?.success !== true
      ) {

        const message =
          shipmentResponse.data?.message ||
          "Shipment not found.";

        setError(message);

        setTrackingResult(null);

        toast.error(message);

        return;

      }


      const shipment =
        shipmentResponse.data.data;


      // =====================================================
      // DEFAULT SHIPMENT INFORMATION
      // =====================================================

      let origin =
        buildAddress(
          shipment.pickupAddress,
          shipment.pickupCity,
          shipment.pickupState,
          shipment.pickupPincode
        );


      let destination =
        buildAddress(
          shipment.deliveryAddress,
          shipment.deliveryCity,
          shipment.deliveryState,
          shipment.deliveryPincode
        );


      let currentLocation =
        "Location unavailable";


      let distance =
        null;

      let travelTime =
        null;

      let estimatedArrival =
        null;

      let locationData =
        null;

      let polyline =
        null;


      // =====================================================
      // 2. GET SHIPMENT LOCATION
      // =====================================================

      try {

        const locationResponse =
          await getShipmentLocation(
            trackingNumber
          );


        locationData =
          locationResponse.data?.data;


        if (locationData) {

          // =================================================
          // CURRENT LOCATION
          //
          // The location API currently provides coordinates.
          // We keep the actual current-location text fallback
          // from shipment data if available.
          // =================================================

          currentLocation =
            shipment.currentLocation ||
            shipment.location ||
            shipment.currentLocationName ||
            "Location coordinates available";


          // =================================================
          // CHECK COORDINATES
          // =================================================

          const hasCoordinates =
            locationData.pickupLatitude != null &&
            locationData.pickupLongitude != null &&
            locationData.deliveryLatitude != null &&
            locationData.deliveryLongitude != null;


          if (hasCoordinates) {

            // ===============================================
            // 3. GET ROUTE
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
                  ?.routes
                  ?. [0];


              if (route) {

                distance =
                  route.distanceMeters;


                travelTime =
                  route.duration
                    ? parseInt(
                        route.duration.replace(
                          "s",
                          ""
                        ),
                        10
                      )
                    : null;


                polyline =
                  route
                    ?.polyline
                    ?.encodedPolyline ||
                  null;

              }

            } catch (routeError) {

              console.error(
                "Error fetching tracking route:",
                routeError
              );

            }


            // ===============================================
            // 4. GET ETA
            // ===============================================

            try {

              if (destination) {

                const etaResponse =
                  await getShipmentEta(
                    locationData.pickupLatitude,
                    locationData.pickupLongitude,
                    destination
                  );


                const etaData =
                  etaResponse.data;


                if (etaData) {

                  estimatedArrival =
                    etaData.estimatedArrival;


                  // If route API didn't return values,
                  // use ETA API values as fallback.

                  if (
                    distance === null &&
                    etaData.distanceKm != null
                  ) {

                    distance =
                      Number(
                        etaData.distanceKm
                      ) * 1000;

                  }


                  if (
                    travelTime === null &&
                    etaData.durationSeconds != null
                  ) {

                    travelTime =
                      etaData.durationSeconds;

                  }

                }

              }

            } catch (etaError) {

              console.error(
                "Error fetching tracking ETA:",
                etaError
              );

            }

          }

        }

      } catch (locationError) {

        console.error(
          "Error fetching tracking location:",
          locationError
        );

      }


      // =====================================================
      // 5. CREATE TRACKING RESULT
      // =====================================================

      setTrackingResult({

        id:
          shipment.trackingNumber ||
          trackingNumber.toUpperCase(),

        status:
          shipment.currentStatus ||
          shipment.status ||
          "UNKNOWN",

        origin:
          origin ||
          "Not available",

        destination:
          destination ||
          "Not available",

        currentLocation,

        estimatedDelivery:
          estimatedArrival ||
          shipment.estimatedDelivery ||
          shipment.expectedDeliveryDate ||
          "Not available",

        distance,

        travelTime,

        polyline,

      });


    } catch (error) {

      console.error(
        "Error tracking shipment:",
        error
      );


      const message =
        error.response?.data?.message ||
        "Unable to track shipment. Please check the tracking number.";


      setError(message);

      setTrackingResult(null);

      toast.error(message);

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="space-y-5">


      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div>

        <h1
          className="
            text-xl
            font-bold
            text-slate-800
          "
        >
          Track Shipment
        </h1>


        <p
          className="
            mt-1
            text-sm
            text-slate-500
          "
        >
          Enter a shipment tracking number to view its
          current tracking details.
        </p>

      </div>


      {/* =====================================================
          SEARCH CARD
      ===================================================== */}

      <div
        className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <div
            className="
              rounded-lg
              bg-emerald-50
              p-2
            "
          >

            <Search
              size={22}
              className="text-emerald-600"
            />

          </div>


          <div>

            <h2
              className="
                font-semibold
                text-slate-800
              "
            >
              Search Shipment
            </h2>


            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              Use the shipment tracking number to find details.
            </p>

          </div>

        </div>


        {/* =================================================
            INPUT
        ================================================= */}

        <div
          className="
            mt-5
            flex
            flex-col
            gap-3
            sm:flex-row
          "
        >

          <input
            type="text"
            placeholder="
              Enter Tracking Number (Example: SHP001)
            "
            value={shipmentId}
            onChange={(event) => {

              setShipmentId(
                event.target.value
              );

              setError("");

            }}
            onKeyDown={(event) => {

              if (
                event.key === "Enter"
              ) {

                handleTrack();

              }

            }}
            className="
              flex-1
              rounded-lg
              border
              border-slate-300
              px-4
              py-2.5
              text-sm
              outline-none
              transition
              focus:border-emerald-500
            "
          />


          <button
            onClick={handleTrack}
            disabled={loading}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-emerald-600
              px-5
              py-2.5
              text-sm
              font-medium
              text-white
              transition
              hover:bg-emerald-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >

            {loading ? (

              <>
                <span
                  className="
                    h-4
                    w-4
                    animate-spin
                    rounded-full
                    border-2
                    border-white
                    border-t-transparent
                  "
                />

                Searching...

              </>

            ) : (

              <>
                <Search size={18} />
                Track
              </>

            )}

          </button>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <p
            className="
              mt-3
              text-sm
              text-red-500
            "
          >
            {error}
          </p>

        )}

      </div>


      {/* =====================================================
          TRACKING RESULT
      ===================================================== */}

      {trackingResult && (

        <div
          className="
            rounded-xl
            border
            border-slate-200
            bg-white
            shadow-sm
          "
        >


          {/* =================================================
              RESULT HEADER
          ================================================= */}

          <div
            className="
              flex
              flex-col
              gap-3
              border-b
              border-slate-200
              p-5
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  rounded-lg
                  bg-emerald-50
                  p-2
                "
              >

                <Package
                  size={22}
                  className="text-emerald-600"
                />

              </div>


              <div>

                <h2
                  className="
                    font-semibold
                    text-slate-800
                  "
                >
                  Shipment Details
                </h2>


                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-500
                  "
                >
                  Tracking ID:{" "}

                  {trackingResult.id}

                </p>

              </div>

            </div>


            <span
              className="
                w-fit
                rounded-full
                bg-blue-100
                px-3
                py-1
                text-xs
                font-medium
                text-blue-700
              "
            >

              {formatStatus(
                trackingResult.status
              )}

            </span>

          </div>


          {/* =================================================
              TRACKING INFORMATION
          ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              gap-4
              p-5
              sm:grid-cols-2
            "
          >


            {/* =================================================
                ORIGIN
            ================================================= */}

            <div
              className="
                rounded-lg
                border
                border-slate-100
                bg-slate-50
                p-4
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <MapPin
                  size={18}
                  className="text-emerald-600"
                />


                <p
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  Origin
                </p>

              </div>


              <p
                className="
                  mt-2
                  text-sm
                  font-semibold
                  text-slate-800
                "
              >
                {trackingResult.origin}
              </p>

            </div>


            {/* =================================================
                DESTINATION
            ================================================= */}

            <div
              className="
                rounded-lg
                border
                border-slate-100
                bg-slate-50
                p-4
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <MapPin
                  size={18}
                  className="text-red-500"
                />


                <p
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  Destination
                </p>

              </div>


              <p
                className="
                  mt-2
                  text-sm
                  font-semibold
                  text-slate-800
                "
              >
                {trackingResult.destination}
              </p>

            </div>


            {/* =================================================
                CURRENT LOCATION
            ================================================= */}

            <div
              className="
                rounded-lg
                border
                border-slate-100
                bg-slate-50
                p-4
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <Truck
                  size={18}
                  className="text-blue-600"
                />


                <p
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  Current Location
                </p>

              </div>


              <p
                className="
                  mt-2
                  text-sm
                  font-semibold
                  text-slate-800
                "
              >
                {trackingResult.currentLocation}
              </p>

            </div>


            {/* =================================================
                ESTIMATED DELIVERY
            ================================================= */}

            <div
              className="
                rounded-lg
                border
                border-slate-100
                bg-slate-50
                p-4
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <Package
                  size={18}
                  className="text-amber-600"
                />


                <p
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  Estimated Delivery
                </p>

              </div>


              <p
                className="
                  mt-2
                  text-sm
                  font-semibold
                  text-slate-800
                "
              >
                {trackingResult.estimatedDelivery}
              </p>

            </div>


            {/* =================================================
                DISTANCE
            ================================================= */}

            <div
              className="
                rounded-lg
                border
                border-slate-100
                bg-slate-50
                p-4
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <MapPin
                  size={18}
                  className="text-emerald-600"
                />


                <p
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  Distance
                </p>

              </div>


              <p
                className="
                  mt-2
                  text-sm
                  font-semibold
                  text-slate-800
                "
              >

                {trackingResult.distance !==
                null
                  ? formatDistance(
                      trackingResult.distance
                    )
                  : "Not available"}

              </p>

            </div>


            {/* =================================================
                TRAVEL TIME
            ================================================= */}

            <div
              className="
                rounded-lg
                border
                border-slate-100
                bg-slate-50
                p-4
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <Truck
                  size={18}
                  className="text-blue-600"
                />


                <p
                  className="
                    text-xs
                    text-slate-500
                  "
                >
                  Travel Time
                </p>

              </div>


              <p
                className="
                  mt-2
                  text-sm
                  font-semibold
                  text-slate-800
                "
              >

                {trackingResult.travelTime !==
                null
                  ? formatTravelTime(
                      trackingResult.travelTime
                    )
                  : "Not available"}

              </p>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};

export default TrackShipment;