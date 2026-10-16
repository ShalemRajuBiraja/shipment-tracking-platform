import { useEffect, useState } from "react";

import {
  CheckCircle,
} from "lucide-react";
import { getResolvedRequestsApi } from "../../services/supportService";




const ResolvedRequests = () => {

  const [resolvedRequests, setResolvedRequests] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


  // FETCH RESOLVED REQUESTS

  const fetchResolvedRequests = async () => {

    try {

      setLoading(true);

      const response =
        await getResolvedRequestsApi();

      setResolvedRequests(
        response.data
      );

    } catch (error) {

      console.error(
        "Error fetching resolved requests:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  // INITIAL LOAD

  useEffect(() => {

    fetchResolvedRequests();

  }, []);


  // FORMAT DATE

  const formatDate = (date) => {

    if (!date) return "-";

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };


  return (

    <div className="space-y-5">

      {/* PAGE HEADER */}

      <div>

        <h1 className="text-xl font-bold text-slate-800">
          Resolved Requests
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View successfully resolved customer support requests.
        </p>

      </div>


      {/* RESOLVED REQUEST CARD */}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center gap-3 border-b border-slate-200 p-4">

          <div className="rounded-lg bg-green-50 p-2">

            <CheckCircle
              size={21}
              className="text-green-600"
            />

          </div>


          <div>

            <h2 className="font-semibold text-slate-800">
              Resolved Support Requests
            </h2>

            <p className="text-xs text-slate-500">
              Completed customer support cases.
            </p>

          </div>

        </div>


        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[700px]">

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
                  Submitted Date
                </th>

              </tr>

            </thead>


            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="5"
                    className="px-5 py-8 text-center text-sm text-slate-500"
                  >
                    Loading resolved requests...
                  </td>

                </tr>

              ) : resolvedRequests.length === 0 ? (

                <tr>

                  <td
                    colSpan="5"
                    className="px-5 py-8 text-center text-sm text-slate-500"
                  >
                    No resolved requests found.
                  </td>

                </tr>

              ) : (

                resolvedRequests.map(
                  (request) => (

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


                      <td className="px-5 py-4 text-sm text-slate-500">

                        {formatDate(
                          request.createdAt
                        )}

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

};


export default ResolvedRequests;