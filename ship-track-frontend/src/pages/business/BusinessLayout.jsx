import { Outlet } from "react-router-dom";
import { UserRound } from "lucide-react";
import BusinessSidebar from "./BusinessSidebar";

const BusinessLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Sidebar */}
      <BusinessSidebar />


      {/* Main Content */}
      <main className="min-h-screen lg:ml-64">

        {/* Global Business Client Header */}
        <header className="border-b border-slate-200 bg-white px-4 py-3 md:px-5">

          <div className="flex items-center justify-between gap-4">

            {/* Left - Title */}
            <div className="min-w-0">

              <h1 className="truncate text-lg font-bold text-slate-800 sm:text-xl">
                Business Client Dashboard
              </h1>

              <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm">
                Overview of your company's shipments.
              </p>

            </div>


            {/* Right - Profile */}
            <div className="flex shrink-0 items-center gap-2.5">

              <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-emerald-300">

                <UserRound
                  size={22}
                  strokeWidth={1.8}
                  className="text-emerald-600"
                />

              </div>

              <span className="hidden text-sm font-medium text-slate-800 sm:block">
                Business Client
              </span>

            </div>

          </div>

        </header>


        {/* Page Content */}
        <Outlet />

      </main>

    </div>
  );
};

export default BusinessLayout;