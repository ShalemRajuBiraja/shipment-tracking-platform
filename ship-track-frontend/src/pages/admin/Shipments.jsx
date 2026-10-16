import { useState, useEffect } from "react";

import {
  Search,
  Trash2,
  Plus,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Eye,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  deleteShipmentApi,
  getAdminShipmentsApi,
} from "../../services/adminService";


const Shipments = () => {

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [shipments, setShipments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [selectedShipmentId, setSelectedShipmentId] =
    useState(null);


  // ================= FETCH SHIPMENTS =================

  useEffect(() => {

    const fetchShipments = async () => {

      try {

        const response =
          await getAdminShipmentsApi();

        console.log(
          "Admin Shipments Response:",
          response.data
        );

        if (response.data.success) {

          setShipments(
            response.data.data || []
          );

        } else {

          toast.error(
            response.data.message ||
            "Failed to fetch shipments"
          );

        }

      } catch (error) {

        console.error(
          "Error fetching admin shipments:",
          error
        );

        toast.error(
          "Failed to fetch shipments"
        );

      } finally {

        setLoading(false);

      }

    };

    fetchShipments();

  }, []);


  // ================= STATUS LABEL =================

  const getStatusLabel = (status) => {

    const labels = {

      CREATED: "Created",

      PICKED_UP: "Picked Up",

      IN_TRANSIT: "In Transit",

      OUT_FOR_DELIVERY: "Out for Delivery",

      DELIVERED: "Delivered",

      CANCELLED: "Cancelled",

    };

    return labels[status] || status;

  };


  // ================= STATUS STYLE =================

  const getStatusStyle = (status) => {

    const styles = {

      CREATED:
        "bg-purple-50 text-purple-700",

      PICKED_UP:
        "bg-blue-50 text-blue-700",

      IN_TRANSIT:
        "bg-indigo-50 text-indigo-700",

      OUT_FOR_DELIVERY:
        "bg-orange-50 text-orange-700",

      DELIVERED:
        "bg-blue-50 text-blue-700",

      CANCELLED:
        "bg-red-50 text-red-700",

    };

    return (
      styles[status] ||
      "bg-slate-100 text-slate-700"
    );

  };


  // ================= FILTER =================

  const filteredShipments =
    shipments.filter((shipment) => {

      const search =
        searchTerm.toLowerCase();

      const matchesSearch =

        shipment.trackingNumber
          ?.toLowerCase()
          .includes(search) ||

        shipment.senderName
          ?.toLowerCase()
          .includes(search) ||

        shipment.receiverName
          ?.toLowerCase()
          .includes(search);


      const matchesStatus =

        statusFilter === "ALL" ||

        shipment.status ===
        statusFilter;


      return (
        matchesSearch &&
        matchesStatus
      );

    });


  // ================= SUMMARY =================

  const totalShipments =
    shipments.length;


  const activeShipments =
    shipments.filter(

      (shipment) =>

        shipment.status ===
        "IN_TRANSIT" ||

        shipment.status ===
        "OUT_FOR_DELIVERY"

    ).length;


  const deliveredShipments =
    shipments.filter(

      (shipment) =>

        shipment.status ===
        "DELIVERED"

    ).length;


  const pendingShipments =
    shipments.filter(

      (shipment) =>

        shipment.status ===
        "CREATED"

    ).length;


  // ================= VIEW DETAILS =================

  const handleViewDetails = (id) => {

    navigate(
      `/admin/shipments/${id}`
    );

  };


  // ================= DELETE =================

  const handleDelete = async () => {

    if (!selectedShipmentId) {
      return;
    }


    try {

      const response =
        await deleteShipmentApi(
          selectedShipmentId
        );


      if (
        response.data.success === true
      ) {

        toast.success(
          "Shipment deleted successfully"
        );


        setShipments((previous) =>

          previous.filter(
            (shipment) =>
              shipment.id !==
              selectedShipmentId
          )

        );


        setShowDeleteModal(false);

        setSelectedShipmentId(null);

      } else {

        toast.error(
          response.data.message ||
          "Failed to delete shipment"
        );

      }

    } catch (error) {

      console.error(
        "Error deleting shipment:",
        error
      );


      toast.error(
        error.response?.data?.message ||
        "Failed to delete shipment"
      );

    }

  };


  return (

    <div className="w-full">


      {/* ================= PAGE HEADER ================= */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">

        <div>

          <h1 className="text-xl md:text-2xl font-bold text-slate-800">

            Shipment Management

          </h1>


          <p className="text-sm text-slate-500 mt-1">

            View and manage all shipments.

          </p>

        </div>


        <button

          onClick={() =>
            navigate(
              "/admin/create-shipment"
            )
          }

          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition"

        >

          <Plus size={18} />

          Create Shipment

        </button>

      </div>


      {/* ================= SUMMARY CARDS ================= */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">


        {/* TOTAL */}

        <div className="bg-white border border-slate-200 rounded-lg p-4">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs text-slate-500">
                Total
              </p>

              <h3 className="text-xl font-bold text-slate-800 mt-1">
                {totalShipments}
              </h3>

            </div>


            <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">

              <Package
                size={19}
                className="text-slate-600"
              />

            </div>

          </div>

        </div>


        {/* ACTIVE */}

        <div className="bg-white border border-slate-200 rounded-lg p-4">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs text-slate-500">
                Active
              </p>

              <h3 className="text-xl font-bold text-blue-600 mt-1">
                {activeShipments}
              </h3>

            </div>


            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">

              <Truck
                size={19}
                className="text-blue-600"
              />

            </div>

          </div>

        </div>


        {/* DELIVERED */}

        <div className="bg-white border border-slate-200 rounded-lg p-4">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs text-slate-500">
                Delivered
              </p>

              <h3 className="text-xl font-bold text-blue-600 mt-1">
                {deliveredShipments}
              </h3>

            </div>


            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">

              <CheckCircle2
                size={19}
                className="text-blue-600"
              />

            </div>

          </div>

        </div>


        {/* PENDING */}

        <div className="bg-white border border-slate-200 rounded-lg p-4">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs text-slate-500">
                Pending
              </p>

              <h3 className="text-xl font-bold text-orange-600 mt-1">
                {pendingShipments}
              </h3>

            </div>


            <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">

              <Clock
                size={19}
                className="text-orange-600"
              />

            </div>

          </div>

        </div>

      </div>


      {/* ================= SHIPMENT TABLE ================= */}

      <section className="bg-white border border-slate-200 rounded-xl shadow-sm">


        {/* SEARCH + FILTER */}

        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">


          <div className="relative w-full md:max-w-md">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />


            <input

              type="text"

              placeholder="Search tracking number, sender or receiver..."

              value={searchTerm}

              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }

              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"

            />

          </div>


          <select

            value={statusFilter}

            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }

            className="w-full md:w-52 px-3 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"

          >

            <option value="ALL">
              All Status
            </option>

            <option value="CREATED">
              Created
            </option>

            <option value="PICKED_UP">
              Picked Up
            </option>

            <option value="IN_TRANSIT">
              In Transit
            </option>

            <option value="OUT_FOR_DELIVERY">
              Out for Delivery
            </option>

            <option value="DELIVERED">
              Delivered
            </option>

            <option value="CANCELLED">
              Cancelled
            </option>

          </select>

        </div>


        {/* ================= TABLE ================= */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[950px]">


            <thead className="bg-slate-50 border-b border-slate-200">

              <tr>

                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">
                  Tracking Number
                </th>

                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">
                  Sender
                </th>

                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">
                  Receiver
                </th>

                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">
                  Package
                </th>

                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">
                  Status
                </th>

                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500">
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="6"
                    className="py-10 text-center text-sm text-slate-500"
                  >

                    Loading shipments...

                  </td>

                </tr>

              ) : filteredShipments.length > 0 ? (

                filteredShipments.map(
                  (shipment) => (

                    <tr
                      key={shipment.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition"
                    >


                      {/* TRACKING */}

                      <td className="px-5 py-4 text-sm font-semibold text-blue-600">

                        {shipment.trackingNumber}

                      </td>


                      {/* SENDER */}

                      <td className="px-5 py-4 text-sm text-slate-700">

                        {shipment.senderName}

                      </td>


                      {/* RECEIVER */}

                      <td className="px-5 py-4 text-sm text-slate-700">

                        {shipment.receiverName}

                      </td>


                      {/* PACKAGE */}

                      <td className="px-5 py-4 text-sm text-slate-600 max-w-xs">

                        <p className="truncate">

                          {shipment.packageDescription}

                        </p>

                      </td>


                      {/* STATUS */}

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                            shipment.status
                          )}`}
                        >

                          {getStatusLabel(
                            shipment.status
                          )}

                        </span>

                      </td>


                      {/* ACTIONS */}

                      <td className="px-5 py-4">

                        <div className="flex items-center justify-center gap-2">


                          {/* VIEW DETAILS */}

                          <button

                            onClick={() =>
                              handleViewDetails(
                                shipment.id
                              )
                            }

                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition"

                          >

                            <Eye size={16} />

                            View Details

                          </button>


                          {/* DELETE */}

                          <button

                            onClick={() => {

                              setSelectedShipmentId(
                                shipment.id
                              );

                              setShowDeleteModal(
                                true
                              );

                            }}

                            title="Delete Shipment"

                            className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition"

                          >

                            <Trash2 size={18} />

                          </button>

                        </div>

                      </td>

                    </tr>

                  )

                )

              ) : (

                <tr>

                  <td
                    colSpan="6"
                    className="py-10 text-center text-sm text-slate-500"
                  >

                    No shipments found.

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>


        {/* FOOTER */}

        <div className="px-5 py-3 border-t border-slate-200 text-sm text-slate-500">

          Showing {filteredShipments.length} of{" "}
          {shipments.length} shipments

        </div>

      </section>


      {/* ================= DELETE MODAL ================= */}

      {showDeleteModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

          <div className="w-full max-w-md bg-white rounded-xl shadow-xl">


            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200">

              <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center">

                <Trash2
                  size={22}
                  className="text-red-600"
                />

              </div>


              <div>

                <h2 className="text-lg font-bold text-slate-800">
                  Delete Shipment
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  This action cannot be undone.
                </p>

              </div>

            </div>


            <div className="px-6 py-5">

              <p className="text-sm text-slate-600">

                Are you sure you want to permanently
                delete this shipment?

              </p>

            </div>


            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200">

              <button

                type="button"

                onClick={() => {

                  setShowDeleteModal(false);

                  setSelectedShipmentId(null);

                }}

                className="px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition"

              >

                Cancel

              </button>


              <button

                type="button"

                onClick={handleDelete}

                className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"

              >

                Delete Shipment

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};


export default Shipments;