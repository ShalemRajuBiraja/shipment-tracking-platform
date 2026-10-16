import { ShieldCheck } from "lucide-react";

const AdminHeader = () => {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Admin Dashboard
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Manage shipments and monitor operations.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">

        <div className="w-9 h-9 rounded-full border-2 border-blue-200 flex items-center justify-center">
          <ShieldCheck
            size={19}
            className="text-blue-600"
          />
        </div>

        <span className="font-semibold text-sm text-slate-700 whitespace-nowrap">
          Administrator
        </span>

      </div>

    </header>
  );
};

export default AdminHeader;