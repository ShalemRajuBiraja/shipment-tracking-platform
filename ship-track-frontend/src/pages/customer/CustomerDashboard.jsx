
import { useState, useEffect } from "react";
import {
  Search,
  Package,
  Truck,
  CircleCheck,
  Loader2,
  Inbox,
} from "lucide-react";
import { toast } from "react-toastify";
import DashboardHeader from "./DashboardHeader";
import RecentShipments from "./RecentShipments";
import { trackShipmentApi } from "../../services/shipmentService";
import GoogleShipmentMap from "../../components/GoogleShipmentMap";
import {
  getShipmentLocation,
  getShipmentRoute,
} from "../../services/operatorService";

const CustomerDashboard = () => {

  const [trackingNumber, setTrackingNumber] = useState("");
  const [shipmentLocation, setShipmentLocation] = useState(null);
  const [recentShipments, setRecentShipments] = useState([]);
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState(null);


  // Load recent shipments and remove expired records
  useEffect(() => {

    const loadRecentShipments = async () => {

      const storedShipments =
        JSON.parse(localStorage.getItem("recentShipments")) || [];

      const now = new Date().getTime();

      // Keep only shipments tracked within last 24 hours
      const validShipments = storedShipments.filter((item) => {

        const trackedTime =
          new Date(item.trackedAt).getTime();

        const timeDifference =
          now - trackedTime;

        return timeDifference < 24 * 60 * 60 * 1000;

      });


      // Fetch latest shipment status from backend
      const updatedShipments = await Promise.all(
        validShipments.map(async (item) => {

          try {

            const response =
              await trackShipmentApi(item.trackingNumber);

            if (response.data.success === true) {

              const shipmentData =
                response.data.data;

              return {
                ...item,
                currentStatus:
                  shipmentData.currentStatus,
                senderName:
                  shipmentData.senderName,
                receiverName:
                  shipmentData.receiverName,
              };

            }

            return item;

          } catch (error) {

            console.error(
              `Error updating shipment ${item.trackingNumber}:`,
              error
            );

            // Keep existing localStorage data
            // if backend request fails
            return item;

          }

        })
      );


      // Update localStorage with latest shipment statuses
      localStorage.setItem(
        "recentShipments",
        JSON.stringify(updatedShipments)
      );


      // Update React state
      setRecentShipments(updatedShipments);

    };


    loadRecentShipments();

  }, []);


  // Save shipment to recent shipments
  const saveRecentShipment = (shipmentData) => {

    const newShipment = {
      trackingNumber: shipmentData.trackingNumber,
      currentStatus: shipmentData.currentStatus,
      senderName: shipmentData.senderName,
      receiverName: shipmentData.receiverName,
      trackedAt: new Date().toISOString(),
    };


    // Remove duplicate tracking number
    const filteredShipments = recentShipments.filter(
      (item) =>
        item.trackingNumber !== shipmentData.trackingNumber
    );


    // Add newest shipment first and keep maximum 5
    const updatedShipments = [
      newShipment,
      ...filteredShipments,
    ].slice(0, 5);


    // Save in browser localStorage
    localStorage.setItem(
      "recentShipments",
      JSON.stringify(updatedShipments)
    );


    // Update React state
    setRecentShipments(updatedShipments);

  };


  // Track shipment
  const handleTrackShipment = async (
    trackingNo = trackingNumber
  ) => {

    const trimmedTrackingNumber =
      trackingNo.trim();


    // Validation
    if (!trimmedTrackingNumber) {

      toast.error(
        "Please enter a tracking number."
      );

      return;
    }


    try {

      setLoading(true);


      // Call tracking API
      const response =
        await trackShipmentApi(
          trimmedTrackingNumber
        );


      if (response.data.success === true) {

        const shipmentData =
          response.data.data;


        setShipment(shipmentData);

        saveRecentShipment(shipmentData);


        // Fetch latest shipment location
        try {

          const locationResponse =
            await getShipmentLocation(
              shipmentData.trackingNumber
            );

          console.log(
            "CUSTOMER SHIPMENT LOCATION:",
            locationResponse.data
          );

          setShipmentLocation(
            locationResponse.data
          );

        } catch (locationError) {

          console.error(
            "Error fetching shipment location:",
            locationError
          );

          setShipmentLocation(null);

        }


        // Fetch planned shipment route
        try {

          const routeResponse =
            await getShipmentRoute(
              shipmentData.pickupAddress,
              shipmentData.deliveryAddress
            );

          setRoute(
            routeResponse.data
          );

        } catch (routeError) {

          console.error(
            "Error fetching shipment route:",
            routeError
          );

          setRoute(null);

        }


        toast.success(
          "Shipment found successfully!"
        );

      } else {

        setShipment(null);
        setShipmentLocation(null);

        toast.error(
          response.data.message ||
          "Shipment not found."
        );

      }

    } catch (error) {

      console.error(
        "Error tracking shipment:",
        error
      );

      setShipment(null);
      setShipmentLocation(null);

      toast.error(
        error.response?.data?.message ||
        "Shipment not found. Please check the tracking number."
      );

    } finally {

      setLoading(false);

    }

  };


  // Display-only counts for the stat cards
  const inTransitCount = recentShipments.filter(
    (item) => item.currentStatus === "IN_TRANSIT"
  ).length;

  const deliveredCount = recentShipments.filter(
    (item) => item.currentStatus === "DELIVERED"
  ).length;


  return (

    <>

      {/* Tracking Search */}
      <section className="cd-hero">

        <div className="cd-hero__text">

          <p className="cd-eyebrow">Shipment tracking</p>

          <h2>Track Your Shipment</h2>

          <p>
            Enter your tracking number to see the latest status of your package.
          </p>

        </div>


        <div className="cd-search">

          <span className="cd-search__icon">
            <Search size={18} />
          </span>

          <input
            type="text"
            value={trackingNumber}
            onChange={(e) =>
              setTrackingNumber(e.target.value)
            }
            placeholder="Enter Tracking Number (e.g., TRK1234567890)"
            className="cd-search__input"
          />


          <button
            onClick={() => handleTrackShipment()}
            disabled={loading}
            className="cd-search__btn"
          >

            {loading ? (
              <>
                <Loader2 size={17} className="cd-spin" />
                Tracking...
              </>
            ) : (
              "Track Shipment"
            )}

          </button>

        </div>

      </section>


      {/* Quick Stats */}
      <section className="cd-stats">

        <div className="cd-stat">
          <span className="cd-stat__icon cd-stat__icon--indigo">
            <Package size={20} />
          </span>
          <div>
            <p>Recently tracked</p>
            <strong>{recentShipments.length}</strong>
          </div>
        </div>

        <div className="cd-stat">
          <span className="cd-stat__icon cd-stat__icon--amber">
            <Truck size={20} />
          </span>
          <div>
            <p>In transit</p>
            <strong>{inTransitCount}</strong>
          </div>
        </div>

        <div className="cd-stat">
          <span className="cd-stat__icon cd-stat__icon--green">
            <CircleCheck size={20} />
          </span>
          <div>
            <p>Delivered</p>
            <strong>{deliveredCount}</strong>
          </div>
        </div>

      </section>


      {/* Empty state */}
      {recentShipments.length === 0 && (
        <section className="cd-empty">
          <span className="cd-empty__icon">
            <Inbox size={26} />
          </span>
          <h3>No recent shipments yet</h3>
          <p>Track a shipment above and it will show up here for 24 hours.</p>
        </section>
      )}


      {/* Recent Shipments */}
      <RecentShipments
        recentShipments={recentShipments}
      />


      {/* Footer */}
      <footer className="cd-footer">

        © 2026 QuickShip. All rights reserved.

      </footer>

    </>

  );

};


export default CustomerDashboard;
