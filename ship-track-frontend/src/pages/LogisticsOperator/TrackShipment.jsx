import { useState } from "react";
import {
  Search,
  Package,
  MapPin,
  Truck,
  Loader2,
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
    <div className="op-wide">

      {/* =====================================================
          PAGE HEADER + SEARCH
      ===================================================== */}
      <section className="op-hero">

        <div className="op-hero__text">

          <p className="op-eyebrow">Shipment tracking</p>

          <h2>
            Track Shipment
          </h2>

          <p>
            Enter a shipment tracking number to view its
            current tracking details.
          </p>

        </div>

        {/* =================================================
            INPUT
        ================================================= */}
        <div className="op-search">

          <span className="op-search__icon">
            <Search size={18} />
          </span>

          <input
            type="text"
            placeholder="Enter Tracking Number (Example: SHP001)"
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
            className="op-search__input"
          />

          <button
            onClick={handleTrack}
            disabled={loading}
            className="op-search__btn"
          >
            {loading ? (
              <>
                <Loader2 size={17} className="op-spin" />
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
          <p className="op-hero__error">
            {error}
          </p>
        )}

      </section>


      {/* =====================================================
          TRACKING RESULT
      ===================================================== */}
      {trackingResult && (
        <div className="op-card op-card--embed">

          {/* =================================================
              RESULT HEADER
          ================================================= */}
          <div className="op-card__head op-card__head--tint">

            <div className="op-card__headrow">

              <span className="op-card__badge op-card__badge--solid">
                <Package size={20} />
              </span>

              <div>
                <h2>
                  Shipment Details
                </h2>

                <p>
                  Tracking ID:{" "}
                  <span className="op-mono op-strong">
                    {trackingResult.id}
                  </span>
                </p>
              </div>

            </div>

            <span className="op-chip op-chip--blue">
              {formatStatus(
                trackingResult.status
              )}
            </span>

          </div>


          {/* =================================================
              TRACKING INFORMATION
          ================================================= */}
          <div className="op-info-grid op-info-grid--2">

            {/* ORIGIN */}
            <div className="op-info">
              <div className="op-info__head op-info__head--purple">
                <MapPin size={18} />
                <h3>Origin</h3>
              </div>

              <p className="op-info__value">
                {trackingResult.origin}
              </p>
            </div>

            {/* DESTINATION */}
            <div className="op-info">
              <div className="op-info__head op-info__head--red">
                <MapPin size={18} />
                <h3>Destination</h3>
              </div>

              <p className="op-info__value">
                {trackingResult.destination}
              </p>
            </div>

            {/* CURRENT LOCATION */}
            <div className="op-info">
              <div className="op-info__head">
                <Truck size={18} />
                <h3>Current Location</h3>
              </div>

              <p className="op-info__value">
                {trackingResult.currentLocation}
              </p>
            </div>

            {/* ESTIMATED DELIVERY */}
            <div className="op-info">
              <div className="op-info__head op-info__head--amber">
                <Package size={18} />
                <h3>Estimated Delivery</h3>
              </div>

              <p className="op-info__value">
                {trackingResult.estimatedDelivery}
              </p>
            </div>

            {/* DISTANCE */}
            <div className="op-info">
              <div className="op-info__head">
                <MapPin size={18} />
                <h3>Distance</h3>
              </div>

              <p className="op-info__value">
                {trackingResult.distance !==
                null
                  ? formatDistance(
                      trackingResult.distance
                    )
                  : "Not available"}
              </p>
            </div>

            {/* TRAVEL TIME */}
            <div className="op-info">
              <div className="op-info__head">
                <Truck size={18} />
                <h3>Travel Time</h3>
              </div>

              <p className="op-info__value">
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
