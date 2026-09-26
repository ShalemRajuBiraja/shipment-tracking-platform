
import { useState, useEffect } from "react";
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


  return (

    <>

      <DashboardHeader />


      {/* Tracking Search */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-5 mb-4">

        <h2 className="text-lg font-bold text-slate-800 mb-4">
          Track Your Shipment
        </h2>


        <div className="flex flex-col sm:flex-row gap-3">

          <input
            type="text"
            value={trackingNumber}
            onChange={(e) =>
              setTrackingNumber(e.target.value)
            }
            placeholder="Enter Tracking Number (e.g., TRK1234567890)"
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />


          <button
            onClick={() => handleTrackShipment()}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold px-6 py-2.5 rounded-lg transition"
          >

            {loading
              ? "Tracking..."
              : "Track Shipment"
            }

          </button>

        </div>

      </section>


      {/* Recent Shipments */}
      <RecentShipments
        recentShipments={recentShipments}
      />


      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-5">

        © 2026 QuickShip. All rights reserved.

      </footer>

    </>

  );

};


export default CustomerDashboard;