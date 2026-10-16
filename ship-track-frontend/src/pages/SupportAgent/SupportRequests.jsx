import { useEffect, useState } from "react";

import {
  Search,
  MessageSquare,
  Eye,
  X,
} from "lucide-react";

import { toast } from "react-toastify";

import {
  getSupportRequestsApi,
  updateSupportRequestStatusApi,
} from "../../services/supportService";


const SupportRequests = () => {

  const [searchTerm, setSearchTerm] = useState("");

  const [requests, setRequests] = useState([]);

  const [selectedRequest, setSelectedRequest] = useState(null);

  const [loading, setLoading] = useState(true);


  // ================= FETCH SUPPORT REQUESTS =================

  const fetchSupportRequests = async () => {

    try {

      setLoading(true);

      const response = await getSupportRequestsApi();

      setRequests(response.data || []);

    } catch (error) {

      console.error(
        "Error fetching support requests:",
        error
      );

      toast.error("Failed to fetch support requests");

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchSupportRequests();

  }, []);


  // ================= UPDATE STATUS =================

  const handleStatusChange = async (id, status) => {

    try {

      await updateSupportRequestStatusApi(
        id,
        status
      );

      toast.success("Request status updated successfully");

      // Refresh latest data
      fetchSupportRequests();

    } catch (error) {

      console.error(
        "Error updating status:",
        error
      );

      toast.error("Failed to update request status");

    }

  };


  // ================= FILTER REQUESTS =================

  const filteredRequests = requests.filter((request) =>

    request.status !== "RESOLVED" &&

    (
      request.id?.toString()
        .includes(searchTerm) ||

      request.name?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||

      request.phoneNumber?.includes(searchTerm) ||

      request.issue?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    )

  );


  // ================= STATUS STYLE =================

  const getStatusStyle = (status) => {

    if (status === "OPEN") {
      return "bg-red-100 text-red-700";
    }

    if (status === "IN_PROGRESS") {
      return "bg-amber-100 text-amber-700";
    }

    return "bg-slate-100 text-slate-700";

  };


  // ================= FORMAT STATUS =================

  const formatStatus = (status) => {

    if (!status) return "";

    return status
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );

  };


  return (

    <div className="space-y-5">

      {/* PAGE HEADER */}

      <div>

        <h1 className="text-xl font-bold text-slate-800">
          Support Requests
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View and manage customer support requests.
        </p>

      </div>


      {/* REQUEST TABLE */}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* CARD HEADER */}

        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="rounded-lg bg-blue-50 p-2">

              <MessageSquare
                size={21}
                className="text-blue-600"
              />

            </div>

            <div>

              <h2 className="font-semibold text-slate-800">
                Customer Requests
              </h2>

              <p className="text-xs text-slate-500">
                Active support requests.
              </p>

            </div>

          </div>


          {/* SEARCH */}

          <div className="relative w-full sm:w-64">

            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
            />

          </div>

        </div>


        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[850px]">

            <thead className="bg-slate-50">

              <tr>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                  Request ID
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                  Customer
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                  Phone Number
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                  Issue
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                  Status
                </th>

                <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500">
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="6"
                    className="px-5 py-10 text-center text-sm text-slate-500"
                  >
                    Loading support requests...
                  </td>

                </tr>

              ) : filteredRequests.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="px-5 py-10 text-center text-sm text-slate-500"
                  >
                    No support requests found.
                  </td>

                </tr>

              ) : (

                filteredRequests.map((request) => (

                  <tr
                    key={request.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >

                    <td className="px-5 py-4 text-sm font-medium text-blue-600">
                      #{request.id}
                    </td>


                    <td className="px-5 py-4 text-sm text-slate-700">
                      {request.name}
                    </td>


                    <td className="px-5 py-4 text-sm text-slate-600">
                      {request.phoneNumber}
                    </td>


                    <td className="px-5 py-4 text-sm text-slate-600">
                      {request.issue}
                    </td>


                    {/* STATUS DROPDOWN */}

                    <td className="px-5 py-4">

                      <select
                        value={request.status}
                        onChange={(event) =>
                          handleStatusChange(
                            request.id,
                            event.target.value
                          )
                        }
                        className={`rounded-lg border px-3 py-2 text-xs font-medium outline-none focus:border-blue-500 ${getStatusStyle(
                          request.status
                        )}`}
                      >

                        <option value="OPEN">
                          Open
                        </option>

                        <option value="IN_PROGRESS">
                          In Progress
                        </option>

                        <option value="RESOLVED">
                          Resolved
                        </option>

                      </select>

                    </td>


                    {/* VIEW DETAILS */}

                    <td className="px-5 py-4 text-center">

                      <button
                        onClick={() =>
                          setSelectedRequest(request)
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50"
                      >

                        <Eye size={16} />

                        View Details

                      </button>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* ================= VIEW DETAILS MODAL ================= */}

      {selectedRequest && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5 sm:p-8 lg:p-12">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">


            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-slate-200 p-5">

              <div>

                <h2 className="text-lg font-bold text-slate-800">
                  Support Request Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Request #{selectedRequest.id}
                </p>

              </div>


              <button
                onClick={() => setSelectedRequest(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-red-500"
              >
                <X size={20} />
              </button>

            </div>


            {/* Modal Body */}

            <div className="space-y-5 p-5">


              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="rounded-lg bg-slate-50 p-4">

                  <p className="text-xs text-slate-500">
                    Customer Name
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {selectedRequest.name}
                  </p>

                </div>


                <div className="rounded-lg bg-slate-50 p-4">

                  <p className="text-xs text-slate-500">
                    Phone Number
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {selectedRequest.phoneNumber}
                  </p>

                </div>

              </div>


              <div>

                <p className="text-sm font-medium text-slate-700">
                  Issue
                </p>

                <div className="mt-2 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                  {selectedRequest.issue}
                </div>

              </div>


              <div>

                <p className="text-sm font-medium text-slate-700">
                  Description
                </p>

                <div className="mt-2 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  {selectedRequest.description ||
                    "No description provided."}
                </div>

              </div>


              <div>

                <p className="text-sm font-medium text-slate-700">
                  Status
                </p>

                <div className="mt-2">

                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                      selectedRequest.status
                    )}`}
                  >
                    {formatStatus(selectedRequest.status)}
                  </span>

                </div>

              </div>


              <div>

                <p className="text-sm font-medium text-slate-700">
                  Created Date
                </p>

                <p className="mt-2 text-sm text-slate-600">
                  {selectedRequest.createdAt
                    ? new Date(
                        selectedRequest.createdAt
                      ).toLocaleString()
                    : "N/A"}
                </p>

              </div>

            </div>


            {/* Modal Footer */}

            <div className="flex justify-end border-t border-slate-200 p-5">

              <button
                onClick={() => setSelectedRequest(null)}
                className="rounded-lg bg-slate-700 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};


export default SupportRequests;