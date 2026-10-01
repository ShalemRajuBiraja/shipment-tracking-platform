import { useEffect, useState } from "react";

import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Package,
  Truck,
  XCircle,
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { downloadAdminAnalyticsReportApi} from "../../services/adminService";
import {getAdminAnalyticsApi} from "../../services/analyticsService";

// =========================================================
// CHART COLORS
// =========================================================

const STATUS_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#ef4444",
];

const DELIVERY_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#ef4444",
];

const AdminAnalytics = () => {
  // =========================================================
  // STATE
  // =========================================================

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  // =========================================================
  // LOAD ANALYTICS
  // =========================================================

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAdminAnalyticsApi();

        console.log(
          "ADMIN ANALYTICS RESPONSE:",
          response.data
        );

        setAnalytics(response.data);
      } catch (error) {
        console.error(
          "Failed to load admin analytics:",
          error
        );

        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  // =========================================================
  // DOWNLOAD REPORT
  // =========================================================

  const handleDownloadReport = async () => {
    try {
      setDownloading(true);

      const response =
        await downloadAdminAnalyticsReportApi();

      const blob = new Blob(
        [response.data],
        {
          type: "application/pdf",
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download =
        "shipment-analytics-report.pdf";

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Failed to download analytics report:",
        error
      );
    } finally {
      setDownloading(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

          <p className="mt-3 text-sm text-slate-500">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-red-200 bg-red-50 p-5 text-center">
          <XCircle className="mx-auto h-8 w-8 text-red-500" />

          <h2 className="mt-3 text-sm font-bold text-red-700">
            Analytics Error
          </h2>

          <p className="mt-1 text-xs text-red-600">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // SAFE DATA
  // =========================================================

  const statusData =
    analytics?.statusDistribution || [];

  const activityData =
    analytics?.shipmentActivity || [];

  const deliveryPerformanceData =
    analytics?.deliveryPerformance || [];

  // =========================================================
  // STATISTIC CARDS
  // =========================================================

  const statCards = [
    {
      title: "Total Shipments",
      value: analytics?.totalShipments ?? 0,
      icon: Package,
      iconStyle:
        "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Delivered",
      value: analytics?.delivered ?? 0,
      icon: CheckCircle2,
      iconStyle:
        "bg-green-50 text-green-600",
    },
    {
      title: "In Transit",
      value: analytics?.inTransit ?? 0,
      icon: Truck,
      iconStyle:
        "bg-blue-50 text-blue-600",
    },
    {
      title: "Pending",
      value: analytics?.pending ?? 0,
      icon: Clock3,
      iconStyle:
        "bg-amber-50 text-amber-600",
    },
    {
      title: "Cancelled",
      value: analytics?.cancelled ?? 0,
      icon: XCircle,
      iconStyle:
        "bg-red-50 text-red-600",
    },
    {
      title: "Delivery Rate",
      value: `${analytics?.deliveryRate ?? 0}%`,
      icon: BarChart3,
      iconStyle:
        "bg-purple-50 text-purple-600",
    },
  ];

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 px-3 pb-8 sm:px-4 lg:px-6">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="flex flex-col gap-2 border-b border-slate-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Analytics
          </h1>

          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Shipment and delivery performance overview
          </p>
        </div>

        <div className="w-fit rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          Admin Analytics
        </div>
      </div>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium text-slate-500">
                    {card.title}
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {card.value}
                  </p>
                </div>

                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${card.iconStyle}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* =====================================================
          CHART ROW
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* ===================================================
            STATUS PIE CHART
        =================================================== */}

        <section className="min-w-0 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-bold text-slate-900">
              Shipment Status
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Current distribution of shipments
            </p>
          </div>

          <div className="h-[300px] w-full p-3 sm:h-[330px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius="65%"
                  innerRadius="35%"
                  paddingAngle={2}
                >
                  {statusData.map(
                    (entry, index) => (
                      <Cell
                        key={`status-cell-${index}`}
                        fill={
                          STATUS_COLORS[
                            index %
                              STATUS_COLORS.length
                          ]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip />

                <Legend
                  verticalAlign="bottom"
                  height={45}
                  wrapperStyle={{
                    fontSize: "11px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ===================================================
            SHIPMENT ACTIVITY
        =================================================== */}

        <section className="min-w-0 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-bold text-slate-900">
              Shipment Activity
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Shipment volume over time
            </p>
          </div>

          <div className="h-[300px] w-full p-3 sm:h-[330px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={activityData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -15,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11 }}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                />

                <Tooltip />

                <Bar
                  dataKey="shipments"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* =====================================================
          DELIVERY PERFORMANCE
      ===================================================== */}

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-900">
            Delivery Performance
          </h2>

          <p className="mt-0.5 text-xs text-slate-500">
            Delivery completion and delay overview
          </p>
        </div>

        <div className="h-[300px] w-full p-3 sm:h-[340px]">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={deliveryPerformanceData}
              margin={{
                top: 10,
                right: 15,
                left: -10,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="type"
                tick={{ fontSize: 11 }}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11 }}
              />

              <Tooltip />

              <Bar
                dataKey="count"
                radius={[4, 4, 0, 0]}
              >
                {deliveryPerformanceData.map(
                  (entry, index) => (
                    <Cell
                      key={`delivery-cell-${index}`}
                      fill={
                        DELIVERY_COLORS[
                          index %
                            DELIVERY_COLORS.length
                        ]
                      }
                    />
                  )
                )}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* =====================================================
          COMBINED ANALYTICS REPORT
      ===================================================== */}

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Analytics Report
            </h2>

            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Download the complete shipment analytics report.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadReport}
            disabled={downloading}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {downloading
              ? "Generating..."
              : "Download Report"}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">

          {/* =================================================
              DELIVERY PERFORMANCE
          ================================================= */}

          <div className="rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-800">
              Delivery Performance
            </h3>

            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">
                  Delivered
                </span>

                <span className="font-medium text-slate-800">
                  {analytics?.delivered ?? 0}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-slate-500">
                  On Time
                </span>

                <span className="font-medium text-slate-800">
                  {
                    deliveryPerformanceData.find(
                      (item) =>
                        item.type === "On Time"
                    )?.count ?? 0
                  }
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-slate-500">
                  Delayed
                </span>

                <span className="font-medium text-slate-800">
                  {
                    deliveryPerformanceData.find(
                      (item) =>
                        item.type === "Delayed"
                    )?.count ?? 0
                  }
                </span>
              </div>
            </div>
          </div>

          {/* =================================================
              SHIPMENT SUMMARY
          ================================================= */}

          <div className="rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-800">
              Shipment Summary
            </h3>

            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">
                  Total Shipments
                </span>

                <span className="font-medium text-slate-800">
                  {analytics?.totalShipments ?? 0}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-slate-500">
                  In Transit
                </span>

                <span className="font-medium text-slate-800">
                  {analytics?.inTransit ?? 0}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-slate-500">
                  Pending
                </span>

                <span className="font-medium text-slate-800">
                  {analytics?.pending ?? 0}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-slate-500">
                  Cancelled
                </span>

                <span className="font-medium text-slate-800">
                  {analytics?.cancelled ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* =================================================
              DELIVERY RATE
          ================================================= */}

          <div className="rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-800">
              Delivery Rate
            </h3>

            <div className="mt-4">
              <p className="text-3xl font-bold text-emerald-600">
                {analytics?.deliveryRate ?? 0}%
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Overall shipment delivery rate
              </p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default AdminAnalytics;