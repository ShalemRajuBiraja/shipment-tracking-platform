// import {
//   Package,
//   CheckCircle,
//   Truck,
//   Clock,
// } from "lucide-react";

// const BusinessReports = () => {

//   const reports = [
//     {
//       title: "Total Shipments",
//       value: "0",
//       icon: Package,
//     },
//     {
//       title: "Delivered",
//       value: "0",
//       icon: CheckCircle,
//     },
//     {
//       title: "In Transit",
//       value: "0",
//       icon: Truck,
//     },
//     {
//       title: "Pending",
//       value: "0",
//       icon: Clock,
//     },
//   ];

//   return (
//     <div className="p-5 md:p-7">

//       {/* Header */}
//       <div className="mb-6">

//         <h1 className="text-2xl font-bold text-slate-800">
//           Business Reports
//         </h1>

//         <p className="text-sm text-slate-500 mt-1">
//           Overview of your shipment performance.
//         </p>

//       </div>


//       {/* Report Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

//         {reports.map((report) => {

//           const Icon = report.icon;

//           return (
//             <div
//               key={report.title}
//               className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
//             >

//               <div className="flex items-center justify-between">

//                 <div>

//                   <p className="text-sm text-slate-500">
//                     {report.title}
//                   </p>

//                   <h2 className="text-2xl font-bold text-slate-800 mt-2">
//                     {report.value}
//                   </h2>

//                 </div>


//                 <div className="p-3 bg-blue-50 rounded-lg">

//                   <Icon
//                     size={23}
//                     className="text-blue-600"
//                   />

//                 </div>

//               </div>

//             </div>
//           );
//         })}

//       </div>

//     </div>
//   );
// };

// export default BusinessReports;