import { ArrowUpRight } from "lucide-react";

const RecentShipments = () => {
  const shipments = [
    {
      trackingNumber: "TRK1234567890",
      sender: "ABC Company",
      receiver: "Ramesh Kumar",
      status: "On Going",
    },
    {
      trackingNumber: "TRK9876543210",
      sender: "Tech Solutions",
      receiver: "Suresh Kumar",
      status: "Packed",
    },
    {
      trackingNumber: "TRK4567891230",
      sender: "Global Traders",
      receiver: "Anil Kumar",
      status: "Delivered",
    },
    {
      trackingNumber: "TRK7418529630",
      sender: "Express Logistics",
      receiver: "Rahul Sharma",
      status: "Pending",
    },
  ];

  return (
    <section className="bg-white border border-slate-200 rounded-xl shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-200">

        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Recent Shipments
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Latest shipment activities
          </p>
        </div>

        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition">
          View All
        </button>

      </div>


      {/* Table */}
      <div className="overflow-x-auto">

        <table className="w-full text-sm">

          <thead className="bg-slate-50 text-slate-500">

            <tr>
              <th className="text-left font-medium px-5 py-3">
                Tracking Number
              </th>

              <th className="text-left font-medium px-5 py-3">
                Sender
              </th>

              <th className="text-left font-medium px-5 py-3">
                Receiver
              </th>

              <th className="text-left font-medium px-5 py-3">
                Status
              </th>

              <th className="px-5 py-3">
                Action
              </th>
            </tr>

          </thead>


          <tbody>

            {shipments.map((shipment) => (
              <tr
                key={shipment.trackingNumber}
                className="border-t border-slate-100 hover:bg-slate-50 transition"
              >

                <td className="px-5 py-4 font-semibold text-blue-600">
                  {shipment.trackingNumber}
                </td>

                <td className="px-5 py-4 text-slate-700">
                  {shipment.sender}
                </td>

                <td className="px-5 py-4 text-slate-700">
                  {shipment.receiver}
                </td>

                <td className="px-5 py-4">

                  <span className="inline-flex bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                    {shipment.status}
                  </span>

                </td>

                <td className="px-5 py-4 text-center">

                  <button className="text-blue-600 hover:text-blue-700 transition">
                    <ArrowUpRight size={18} />
                  </button>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </section>
  );
};

export default RecentShipments;