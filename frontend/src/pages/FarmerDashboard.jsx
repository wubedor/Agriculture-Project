import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Package,
  RefreshCw,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import StatCard from "../components/ui/StatCard";
import Badge from "../components/ui/Badge";
import SectionHeader from "../components/ui/SectionHeader";

const API_URL = "/api";

export default function Dashboard({ user, onNavigate }) {
  // ==========================================
  // STATE
  // ==========================================

  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==========================================
  // FETCH DASHBOARD
  // ==========================================

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("agriconnect_token");

      if (!token) {
        setError("Your session has expired. Please login again.");
        return;
      }

      const response = await fetch(`${API_URL}/dashboard`, {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load dashboard"
        );
      }

      setDashboard(data);
    } catch (error) {
      console.error("Dashboard error:", error);

      setError(
        error.message ||
          "Unable to load dashboard. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD DASHBOARD
  // ==========================================

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading) {
    return (
      <div className="mx-auto max-w-[1500px]">

        <div className="flex min-h-[500px] items-center justify-center">

          <div className="text-center">

            <RefreshCw
              size={32}
              className="mx-auto animate-spin text-emerald-600"
            />

            <p className="mt-4 text-sm font-semibold text-slate-600">
              Loading your dashboard...
            </p>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="mx-auto max-w-[1500px]">

        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">

          <h2 className="text-xl font-black text-red-800">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={fetchDashboard}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
          >
            <RefreshCw size={16} />
            Try again
          </button>

        </div>

      </div>
    );
  }

  // ==========================================
  // SAFE DATA
  // ==========================================

  const stats = dashboard?.stats || {};

  const recentListings = dashboard?.recentListings || [];

  const buyerMatches = dashboard?.buyerMatches || [];

  const transactions = dashboard?.transactions || [];

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="mx-auto max-w-[1500px] space-y-7">

      {/* =====================================
          HERO
      ====================================== */}

      <section className="mesh overflow-hidden rounded-[2rem] border border-emerald-100 p-6 sm:p-8">

        <div className="max-w-3xl">

          <Badge>
            AI AGENT ONLINE
          </Badge>

          <p className="mt-5 text-sm font-bold text-emerald-600">
            Welcome back, {user?.name || "Farmer"} 
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">

            Turn your harvest into{" "}

            <span className="text-emerald-600">
              a real sale.
            </span>

          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">

            AgriConnect AI actively searches the buyer network,
            ranks offers, and helps you connect with serious
            buyers.

          </p>

          <div className="mt-6 flex flex-wrap gap-3">

            <button
              onClick={() => onNavigate("sell")}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-700"
            >
              <Package size={18} />

              Sell your produce
            </button>

            <button
              onClick={() => onNavigate("marketplace")}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              View marketplace
            </button>

          </div>

        </div>

      </section>

      {/* =====================================
          STATISTICS
      ====================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          label="Active listings"
          value={stats.activeListings ?? 0}
          change={`${stats.totalListings ?? 0} total listings`}
          icon={Package}
          tone="green"
        />

        <StatCard
          label="Buyer matches"
          value={stats.buyerMatches ?? 0}
          change={
            stats.buyerMatches > 0
              ? "Potential buyers found"
              : "No buyer matches yet"
          }
          icon={Users}
          tone="blue"
        />

        <StatCard
          label="Avg. price uplift"
          value={`${stats.averagePriceUplift ?? 0}%`}
          change="Buyers offering above your min. price"
          icon={TrendingUp}
          tone="purple"
        />

        <StatCard
          label="Deals completed"
          value={stats.completedDeals ?? 0}
          change={`${stats.soldListings ?? 0} produce listings sold`}
          icon={CheckCircle2}
          tone="orange"
        />

      </div>

      {/* =====================================
          MARKETPLACE + AI
      ====================================== */}

      <div className="grid gap-6 xl:grid-cols-[1.45fr_.85fr]">

        {/* ===================================
            RECENT LISTINGS
        ==================================== */}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <SectionHeader
            eyebrow="Your Produce"
            title="Recent listings"
            description="Your latest produce listings on AgriConnect."
            action={
              <button
                onClick={() => onNavigate("marketplace")}
                className="text-xs font-bold text-emerald-600"
              >
                View marketplace{" "}
                <ArrowUpRight
                  className="inline"
                  size={14}
                />
              </button>
            }
          />

          <div className="mt-6 space-y-3">

            {recentListings.length === 0 ? (

              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">

                <Package
                  size={30}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 font-bold text-slate-700">
                  No produce listings yet
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Add your first produce listing to start
                  connecting with buyers.
                </p>

                <button
                  onClick={() => onNavigate("sell")}
                  className="mt-5 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
                >
                  Sell Produce
                </button>

              </div>

            ) : (

              recentListings.map((listing) => (

                <div
                  key={listing._id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-100 p-4 sm:flex-row sm:items-center"
                >

                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">

                    <Package size={20} />

                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-2">

                      <p className="font-bold capitalize text-slate-900">
                        {listing.crop}
                      </p>

                      <Badge
                        tone={
                          listing.status === "active"
                            ? "green"
                            : "amber"
                        }
                      >
                        {listing.status}
                      </Badge>

                    </div>

                    <p className="mt-1 text-xs text-slate-500">

                      {listing.quantity}{" "}
                      {listing.unit} •{" "}
                      {listing.location?.town},{" "}
                      {listing.location?.region}

                    </p>

                  </div>

                  <div className="text-left sm:text-right">

                    <p className="text-lg font-extrabold text-slate-950">

                      GH₵{" "}
                      {Number(listing.minPrice || 0).toFixed(2)}

                      <span className="text-xs font-semibold text-slate-400">
                        /{listing.unit}
                      </span>

                    </p>

                    <p className="text-xs text-slate-400">
                      Minimum price
                    </p>

                  </div>

                </div>

              ))

            )}

          </div>

        </section>

        {/* ===================================
            AI AGENT
        ==================================== */}

        <section className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <Badge>
                Agent activity
              </Badge>

              <h3 className="mt-3 text-xl font-extrabold">
                Working for you
              </h3>

            </div>

            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10">

              <Zap
                size={20}
                className="text-emerald-300"
              />

            </span>

          </div>

          <div className="mt-7 space-y-5">

            <div className="flex gap-3">

              <div className="pt-1 text-[10px] font-bold text-slate-500">
                NOW
              </div>

              <div className="relative flex-1 border-l border-white/10 pl-4">

                <div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-emerald-400 ring-4 ring-slate-950" />

                <p className="text-sm font-bold">
                  Dashboard connected
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Your marketplace data is connected.
                </p>

              </div>

            </div>

            <div className="flex gap-3">

              <div className="pt-1 text-[10px] font-bold text-slate-500">
                READY
              </div>

              <div className="relative flex-1 border-l border-white/10 pl-4">

                <div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-emerald-400 ring-4 ring-slate-950" />

                <p className="text-sm font-bold">
                  Buyer matching
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Waiting for buyer offers.
                </p>

              </div>

            </div>

          </div>

          <button
            onClick={() => onNavigate("agent")}
            className="mt-7 w-full rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-50"
          >
            Open agent workspace
          </button>

        </section>

      </div>

      {/* =====================================
          BUYER MATCHES
      ====================================== */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

        <SectionHeader
          eyebrow="Buyer Network"
          title="Buyer matches"
          description="Open buyer requests that match your active listings."
        />

        <div className="mt-6">

          {buyerMatches.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">

              <Users
                size={30}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 font-bold text-slate-700">
                No buyer matches yet
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Buyers will appear here when they make offers
                on your produce.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {buyerMatches.map((buyer) => (
                <div
                  key={buyer.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-100 text-sm font-black text-blue-700">
                      {buyer.buyer
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{buyer.buyer}</p>
                      <p className="text-xs text-slate-500">
                        {buyer.crop}{buyer.quantity ? ` • ${buyer.quantity}${buyer.unit || ""}` : ""}
                        {buyer.town ? ` • ${buyer.town}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-emerald-600">
                      GH₵ {Number(buyer.offer || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {Number(buyer.listingMinPrice || 0).toFixed(2)} min price
                    </p>
                  </div>
                </div>
              ))}

            </div>

          )}

        </div>

      </section>

      {/* =====================================
          TRANSACTIONS
      ====================================== */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

        <SectionHeader
          eyebrow="History"
          title="Recent transactions"
          description="Your completed produce sales will appear here."
        />

        <div className="mt-5 overflow-x-auto">

          {transactions.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">

              <CheckCircle2
                size={30}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 font-bold text-slate-700">
                No transactions yet
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Once you sell your produce, your transaction
                history will appear here.
              </p>

            </div>

          ) : (

            <table className="w-full min-w-[700px] text-left">

              <thead>

                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wide text-slate-400">

                  <th className="px-3 py-3">
                    Produce
                  </th>

                  <th className="px-3 py-3">
                    Buyer
                  </th>

                  <th className="px-3 py-3">
                    Price
                  </th>

                  <th className="px-3 py-3">
                    Total
                  </th>

                  <th className="px-3 py-3">
                    Status
                  </th>

                  <th className="px-3 py-3">
                    Date
                  </th>

                </tr>

              </thead>

              <tbody>

                {transactions.map((row) => (

                  <tr
                    key={row.id}
                    className="border-b border-slate-50 text-sm last:border-0"
                  >

                    <td className="px-3 py-4 font-bold">
                      {row.crop}
                    </td>

                    <td className="px-3 py-4 text-slate-600">
                      {row.buyer}
                    </td>

                    <td className="px-3 py-4 font-semibold">
                      {row.price}
                    </td>

                    <td className="px-3 py-4 font-bold">
                      {row.total}
                    </td>

                    <td className="px-3 py-4">

                      <Badge
                        tone={
                          row.status === "Completed"
                            ? "green"
                            : "amber"
                        }
                      >
                        {row.status}
                      </Badge>

                    </td>

                    <td className="px-3 py-4 text-slate-400">
                      {row.date}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

      </section>

    </div>
  );
}