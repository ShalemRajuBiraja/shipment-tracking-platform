import { Package, Users,} from "lucide-react";

import { useEffect, useState,} from "react";

import { useNavigate,} from "react-router-dom";

import {getAdminDashboardStatsApi,getAdminShipmentsApi} from "../../services/adminService";


const DashboardStats = () => {

  const navigate = useNavigate();


  const [stats, setStats] = useState({
    totalShipments: 0,
    totalUsers: 0,
  });


  const [loading, setLoading] = useState(true);


  useEffect(() => {

    const fetchDashboardStats = async () => {

      try {

        const response = await getAdminDashboardStatsApi();
        console.log( "Dashboard Stats:", response.data.data );


        if (response.data.success === true) {
          setStats(
           response.data.data
          );

        }

      } catch (error) {

        console.error(
          "Error fetching dashboard statistics:",
          error
        );

      } finally {

        setLoading(false);

      }

    };


    fetchDashboardStats();

  }, []);


  return (

    <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">


      {/* Total Shipments */}

      <div
        onClick={() =>
          navigate("/admin/shipments")
        }
        className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 cursor-pointer hover:border-blue-400 hover:shadow-md transition"
      >

        <div className="flex items-center justify-between">

          <div>

            <p className="text-sm text-slate-500">
              Total Shipments
            </p>

            <h2 className="text-2xl font-bold text-slate-800 mt-1">

              {loading
                ? "Loading..."
                : stats.totalShipments}

            </h2>

          </div>


          <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center">

            <Package
              size={22}
              className="text-blue-600"
            />

          </div>

        </div>

      </div>


      {/* Total Users */}

      <div
        onClick={() =>
          navigate("/admin/users")
        }
        className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 cursor-pointer hover:border-blue-400 hover:shadow-md transition"
      >

        <div className="flex items-center justify-between">

          <div>

            <p className="text-sm text-slate-500">
              Total Users
            </p>

            <h2 className="text-2xl font-bold text-slate-800 mt-1">

              {loading
                ? "Loading..."
                : stats.totalUsers}

            </h2>

          </div>


          <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center">

            <Users
              size={22}
              className="text-blue-600"
            />

          </div>

        </div>

      </div>


    </section>

  );

};


export default DashboardStats;