import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MapPin,
  Package,
  Sprout,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "/api";

export default function SellProduce({ user, onNavigate }) {
  const [form, setForm] = useState({
    crop: "",
    quantity: "",
    unit: "kg",
    minPrice: "",
    town: user?.location?.town || "",
    region: user?.location?.region || "",
    harvestDate: "",
    availableUntil: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // HANDLE INPUT CHANGES
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // ==========================================
  // SUBMIT LISTING
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Basic validation
    if (
      !form.crop.trim() ||
      !form.quantity ||
      !form.minPrice ||
      !form.town.trim() ||
      !form.region.trim()
    ) {
      setError(
        "Please fill in all required fields."
      );
      return;
    }

    if (Number(form.quantity) <= 0) {
      setError(
        "Quantity must be greater than 0."
      );
      return;
    }

    if (Number(form.minPrice) < 0) {
      setError(
        "Minimum price cannot be negative."
      );
      return;
    }

    try {
      setLoading(true);

      const token =
        localStorage.getItem(
          "agriconnect_token"
        );

      if (!token) {
        setError(
          "Your session has expired. Please login again."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/listings`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            crop: form.crop.trim(),

            quantity: Number(form.quantity),

            unit: form.unit,

            minPrice: Number(form.minPrice),

            location: {
              town: form.town.trim(),
              region: form.region.trim(),
            },

            harvestDate:
              form.harvestDate || undefined,

            availableUntil:
              form.availableUntil || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Unable to create your listing."
        );
        return;
      }

      setSuccess(
        "Your produce has been listed successfully!"
      );

      // Reset the form
      setForm({
        crop: "",
        quantity: "",
        unit: "kg",
        minPrice: "",
        town: user?.location?.town || "",
        region: user?.location?.region || "",
        harvestDate: "",
        availableUntil: "",
      });
    } catch (err) {
      console.error(
        "Create listing error:",
        err
      );

      setError(
        "Unable to connect to the server. Make sure the backend is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            onClick={() =>
              onNavigate("dashboard")
            }
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </button>

          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Sprout size={24} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
                Sell your produce
              </p>

              <h1 className="text-3xl font-black tracking-tight text-slate-950">
                List your harvest
              </h1>
            </div>
          </div>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Tell buyers what you have available.
            AgriConnect will make your produce
            visible to potential buyers.
          </p>
        </div>
      </div>

      {/* ==========================================
          FORM CARD
      ========================================== */}

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
      >
        {/* ==========================================
            PRODUCE INFORMATION
        ========================================== */}

        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <Package size={19} />
          </div>

          <div>
            <h2 className="font-extrabold text-slate-900">
              Produce information
            </h2>

            <p className="text-xs text-slate-500">
              Tell buyers what you are selling.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {/* Crop */}

          <label className="block">
            <span className="text-xs font-bold text-slate-600">
              Crop *
            </span>

            <input
              name="crop"
              value={form.crop}
              onChange={handleChange}
              placeholder="e.g. Maize"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          {/* Quantity */}

          <label className="block">
            <span className="text-xs font-bold text-slate-600">
              Quantity *
            </span>

            <div className="mt-2 flex">
              <input
                type="number"
                min="1"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                placeholder="e.g. 500"
                className="w-full rounded-l-2xl border border-r-0 border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />

              <select
                name="unit"
                value={form.unit}
                onChange={handleChange}
                className="rounded-r-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none"
              >
                <option value="kg">
                  kg
                </option>

                <option value="tonnes">
                  tonnes
                </option>

                <option value="bags">
                  bags
                </option>

                <option value="crates">
                  crates
                </option>
              </select>
            </div>
          </label>

          {/* Minimum Price */}

          <label className="block">
            <span className="text-xs font-bold text-slate-600">
              Minimum price *
            </span>

            <div className="mt-2 flex items-center rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-emerald-500">
              <span className="mr-2 text-sm font-bold text-slate-400">
                GH₵
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                name="minPrice"
                value={form.minPrice}
                onChange={handleChange}
                placeholder="3.60"
                className="w-full bg-transparent text-sm outline-none"
              />

              <span className="text-xs text-slate-400">
                /{form.unit}
              </span>
            </div>

            <p className="mt-1 text-[11px] text-slate-400">
              Buyers should not offer below this
              amount.
            </p>
          </label>

          {/* Harvest Date */}

          <label className="block">
            <span className="text-xs font-bold text-slate-600">
              Harvest date
            </span>

            <input
              type="date"
              name="harvestDate"
              value={form.harvestDate}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />
          </label>
        </div>

        {/* ==========================================
            LOCATION
        ========================================== */}

        <div className="mt-8 border-t border-slate-100 pt-7">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
              <MapPin size={19} />
            </div>

            <div>
              <h2 className="font-extrabold text-slate-900">
                Pickup location
              </h2>

              <p className="text-xs text-slate-500">
                Where can the buyer collect the
                produce?
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {/* Town */}

            <label className="block">
              <span className="text-xs font-bold text-slate-600">
                Town / City *
              </span>

              <input
                name="town"
                value={form.town}
                onChange={handleChange}
                placeholder="e.g. Koforidua"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
            </label>

            {/* Region */}

            <label className="block">
              <span className="text-xs font-bold text-slate-600">
                Region *
              </span>

              <input
                name="region"
                value={form.region}
                onChange={handleChange}
                placeholder="e.g. Eastern Region"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
            </label>
          </div>
        </div>

        {/* ==========================================
            AVAILABILITY
        ========================================== */}

        <div className="mt-8 border-t border-slate-100 pt-7">
          <h2 className="font-extrabold text-slate-900">
            Availability
          </h2>

          <div className="mt-5">
            <label className="block max-w-md">
              <span className="text-xs font-bold text-slate-600">
                Available until
              </span>

              <input
                type="date"
                name="availableUntil"
                value={form.availableUntil}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              />
            </label>
          </div>
        </div>

        {/* ==========================================
            ERROR
        ========================================== */}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* ==========================================
            SUCCESS
        ========================================== */}

        {success && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <CheckCircle2
              size={20}
              className="shrink-0"
            />

            <div>
              <p>{success}</p>

              <button
                type="button"
                onClick={() =>
                  onNavigate("marketplace")
                }
                className="mt-1 text-xs font-black underline"
              >
                View marketplace
              </button>
            </div>
          </div>
        )}

        {/* ==========================================
            SUBMIT
        ========================================== */}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() =>
              onNavigate("dashboard")
            }
            className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <Loader2
                size={17}
                className="animate-spin"
              />
            )}

            {loading
              ? "Listing produce..."
              : "List my produce"}
          </button>
        </div>
      </form>
    </div>
  );
}