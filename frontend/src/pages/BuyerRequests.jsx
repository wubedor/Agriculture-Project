import { useCallback, useEffect, useState } from "react";
import {
  ClipboardList,
  MapPin,
  Package,
  RefreshCw,
  XCircle,
  Loader2,
  Search,
  AlertCircle,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function BuyerRequests({ user, onNavigate }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  // ==========================================
  // GET AUTH TOKEN
  // ==========================================

  const getToken = () => {
    return localStorage.getItem("agriconnect_token");
  };

  // ==========================================
  // FETCH MY ACTIVE REQUESTS
  // ==========================================

  const fetchRequests = useCallback(
    async (showRefreshLoader = false) => {
      try {
        if (showRefreshLoader) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const token = getToken();

        if (!token) {
          setError("Your session has expired. Please sign in again.");
          return;
        }

        // IMPORTANT:
        // API_URL already contains /api
        //
        // Correct:
        // /api/buyer-requests/my
        //
        // NOT:
        // /api/api/buyer-requests/my

        const response = await fetch(
          `${API_URL}/buyer-requests/my`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data?.message || "Failed to load your requests."
          );
        }

        setRequests(data?.requests || data?.data || []);
      } catch (err) {
        console.error("Fetch buyer requests error:", err);

        setError(
          err.message ||
            "Something went wrong while loading your requests."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ==========================================
  // AUTO REFRESH
  //
  // Checks periodically whether a farmer
  // has been matched.
  // ==========================================

  useEffect(() => {
    const interval = setInterval(() => {
      fetchRequests(true);
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchRequests]);

  // ==========================================
  // CANCEL REQUEST
  // ==========================================

  const handleCancel = async (requestId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this request?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(requestId);
      setError("");

      const token = getToken();

      if (!token) {
        setError(
          "Your session has expired. Please sign in again."
        );
        return;
      }

      // API_URL already contains /api
      const response = await fetch(
        `${API_URL}/buyer-requests/${requestId}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message || "Failed to cancel request."
        );
      }

      // Remove cancelled request from active list
      setRequests((currentRequests) =>
        currentRequests.filter(
          (request) => request._id !== requestId
        )
      );
    } catch (err) {
      console.error("Cancel request error:", err);

      setError(
        err.message ||
          "Something went wrong while cancelling the request."
      );
    } finally {
      setCancellingId(null);
    }
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "Not specified";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not specified";
    }

    return parsedDate.toLocaleDateString("en-GH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            My Requests
          </h1>

          <p className="text-slate-500 mt-1">
            Track the produce you are looking to buy.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-10">
          <div className="flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />

            <p className="mt-4 text-slate-600 font-medium">
              Loading your requests...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <div className="max-w-7xl mx-auto">
      {/* ======================================
          HEADER
      ======================================= */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            My Requests
          </h1>

          <p className="text-slate-500 mt-1">
            Track the produce you are looking to buy.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchRequests(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition disabled:opacity-60"
        >
          <RefreshCw
            className={`w-4 h-4 ${
              refreshing ? "animate-spin" : ""
            }`}
          />

          {refreshing ? "Checking..." : "Refresh"}
        </button>
      </div>

      {/* ======================================
          ERROR
      ======================================= */}

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />

            <div>
              <p className="font-semibold text-red-800">
                Something went wrong
              </p>

              <p className="text-sm text-red-700 mt-1">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================
          EMPTY STATE
      ======================================= */}

      {!error && requests.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-5">
              <ClipboardList className="w-8 h-8 text-green-600" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              No Active Requests
            </h2>

            <p className="text-slate-500 mt-2 max-w-md">
              You don't have any active buying requests right now.
              Post a request and we'll look for farmers who can
              supply your produce.
            </p>

            <button
              type="button"
              onClick={() => onNavigate("marketplace")}
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
            >
              <Search className="w-4 h-4" />
              Find Produce
            </button>
          </div>
        </div>
      )}

      {/* ======================================
          REQUEST LIST
      ======================================= */}

      {requests.length > 0 && (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm"
            >
              {/* ==============================
                  TOP
              =============================== */}

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>

                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 capitalize">
                      {request.crop || "Produce"}
                    </h2>

                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                      <span>
                        {request.quantity || 0}{" "}
                        {request.unit || "kg"}
                      </span>

                      <span>•</span>

                      <span>
                        Up to GHS{" "}
                        {Number(request.maxPrice || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* STATUS */}

                <div className="inline-flex items-center gap-2 self-start px-3 py-2 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-sm font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Finding a farmer
                </div>
              </div>

              {/* ==============================
                  DETAILS
              =============================== */}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                    Quantity
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {request.quantity || 0}{" "}
                    {request.unit || "kg"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                    Max Price
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    GHS{" "}
                    {Number(request.maxPrice || 0).toFixed(2)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                    Pickup Radius
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {request.pickupRadius || 0} km
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                    Required By
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {formatDate(request.requiredBy)}
                  </p>
                </div>
              </div>

              {/* ==============================
                  LOCATION
              =============================== */}

              {request.location && (
                <div className="flex items-start gap-2 mt-5 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />

                  <span>
                    {request.location.town || "Town not specified"}
                    {request.location.region
                      ? `, ${request.location.region}`
                      : ""}
                  </span>
                </div>
              )}

              {/* ==============================
                  DESCRIPTION
              =============================== */}

              {request.description && (
                <div className="mt-4">
                  <p className="text-sm text-slate-600">
                    {request.description}
                  </p>
                </div>
              )}

              {/* ==============================
                  FOOTER
              =============================== */}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-5 border-t border-slate-100">
                <p className="text-xs text-slate-400">
                  Posted {formatDate(request.createdAt)}
                </p>

                <button
                  type="button"
                  onClick={() => handleCancel(request._id)}
                  disabled={cancellingId === request._id}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition disabled:opacity-60"
                >
                  {cancellingId === request._id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Cancel Request
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}