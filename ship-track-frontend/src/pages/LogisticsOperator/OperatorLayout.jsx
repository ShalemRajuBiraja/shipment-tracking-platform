import { Outlet } from "react-router-dom";
import { UserRound } from "lucide-react";
import OperatorSidebar from "./OperatorSidebar";

const OperatorLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Persistent Sidebar */}
      <OperatorSidebar />


      {/* Main Content */}
      <main className="flex-1 ml-0 lg:ml-64">

        {/* Global Operator Header */}
        <header className="border-b border-slate-200 bg-white px-4 py-3 md:px-5">

          <div className="flex items-center justify-between gap-4">

            {/* Left - Title */}
            <div className="min-w-0">

              <h1 className="truncate text-lg font-bold text-slate-800 sm:text-xl">
                Operator Dashboard
              </h1>

              <p className="mt-0.5 truncate text-xs text-slate-500 sm:text-sm">
                Overview of your assigned shipments.
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
                Logistics Operator
              </span>

            </div>

          </div>

        </header>


        {/* Changing Content Area */}
        <main className="p-4 md:p-5">
          <Outlet />
        </main>

      </main>

    </div>
  );
};

export default OperatorLayout;