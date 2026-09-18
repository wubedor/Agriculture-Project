import { useState } from "react";

import {
  LockKeyhole,
  Sprout,
  UserRound,
  ArrowRight,
  ShieldCheck,
  Phone,
  MapPin,
  CheckCircle2,
} from "lucide-react";

// ==========================================
// API URL
// ==========================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
).replace(/\/$/, "");

export default function Register({
  onRegister,
  onSwitchToLogin,
}) {
  // ==========================================
  // FORM STATES
  // ==========================================

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [role, setRole] = useState("farmer");

  const [town, setTown] = useState("");
  const [region, setRegion] = useState("");

  // ==========================================
  // UI STATES
  // ==========================================

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [registrationSuccess, setRegistrationSuccess] =
    useState(false);

  // ==========================================
  // SUBMIT
  // ==========================================

  const submit = async (e) => {
    e.preventDefault();

    setError("");
    setRegistrationSuccess(false);

    // ========================================
    // CHECK REQUIRED FIELDS
    // ========================================

    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword ||
      !town.trim() ||
      !region.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    // ========================================
    // CHECK PASSWORD LENGTH
    // ========================================

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    // ========================================
    // CHECK PASSWORD MATCH
    // ========================================

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // ========================================
      // REGISTER USER
      // ========================================
      // IMPORTANT:
      // Do NOT use localhost directly here.
      // API_URL comes from VITE_API_URL.
      // ========================================

      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            password,
            role,

            location: {
              town: town.trim(),
              region: region.trim(),
            },
          }),
        }
      );

      // ========================================
      // SAFELY READ RESPONSE
      // ========================================

      let data;

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      // ========================================
      // REGISTRATION FAILED
      // ========================================

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            `Registration failed. Server returned ${response.status}.`
        );

        return;
      }

      // ========================================
      // CHECK USER
      // ========================================

      if (!data.user) {
        setError(
          "Registration failed. No user information was received."
        );

        return;
      }

      // ========================================
      // CHECK TOKEN
      // ========================================

      if (!data.token) {
        setError(
          "Registration failed. No authentication token received."
        );

        return;
      }

      // ========================================
      // SAVE TOKEN
      // ========================================

      localStorage.setItem(
        "agriconnect_token",
        data.token
      );

      // ========================================
      // SAVE USER
      // ========================================

      localStorage.setItem(
        "agriconnect_user",
        JSON.stringify(data.user)
      );

      // ========================================
      // SHOW SUCCESS
      // ========================================

      setRegistrationSuccess(true);

      // ========================================
      // OPEN HOME PAGE
      // ========================================

      setTimeout(() => {
        if (onRegister) {
          onRegister(data.user);
        }
      }, 1200);
    } catch (err) {
      console.error(
        "Registration error:",
        err
      );

      setError(
        "Unable to connect to the server. Please check your internet connection or try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CLEAR ERROR
  // ==========================================

  const clearError = () => {
    setError("");
    setRegistrationSuccess(false);
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <main className="min-h-screen bg-[#f7faf8] px-4 py-8 sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 lg:grid-cols-2">

        {/* =====================================
            LEFT SIDE
        ====================================== */}

        <section className="hidden lg:block">
          <div className="rounded-[2.5rem] border border-emerald-100 bg-emerald-50 p-10">

            {/* LOGO */}

            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-600 text-white shadow-lg">
                <Sprout size={25} />
              </div>

              <div>
                <h1 className="text-xl font-black text-slate-900">
                  AgriConnect
                </h1>

                <p className="text-xs font-bold text-emerald-600">
                  AI Marketplace
                </p>
              </div>
            </div>

            {/* HEADING */}

            <h2 className="mt-14 max-w-xl text-5xl font-black leading-tight tracking-tight text-slate-900">
              Join the marketplace where farmers meet{" "}
              <span className="text-emerald-600">
                real buyers.
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              Create your account, list your produce
              and let AgriConnect help you find
              serious buyers.
            </p>

            {/* FEATURES */}

            <div className="mt-8 grid gap-3">
              {[
                "Verified buyer network",
                "AI-assisted matching",
                "Farmer-controlled price limits",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
                >
                  <ShieldCheck
                    className="text-emerald-600"
                    size={18}
                  />

                  <span className="text-sm font-bold text-slate-800">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================
            REGISTRATION FORM
        ====================================== */}

        <section className="mx-auto w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">

          {/* MOBILE LOGO */}

          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">

              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-600 text-white">
                <Sprout size={23} />
              </div>

              <div>
                <h1 className="font-black text-slate-900">
                  AgriConnect
                </h1>

                <p className="text-xs font-bold text-emerald-600">
                  AI Marketplace
                </p>
              </div>

            </div>
          </div>

          {/* HEADER */}

          <p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-600">
            Get started
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            Create your account
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Join AgriConnect and connect directly
            with farmers and buyers.
          </p>

          {/* FORM */}

          <form
            onSubmit={submit}
            className="mt-7 space-y-4"
          >

            {/* FULL NAME */}

            <label className="block">
              <span className="text-xs font-bold text-slate-600">
                Full name
              </span>

              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-emerald-500">

                <UserRound
                  size={17}
                  className="text-slate-400"
                />

                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearError();
                  }}
                  placeholder="Kofi Mensah"
                  className="w-full bg-transparent text-sm outline-none"
                  autoComplete="name"
                  disabled={
                    loading ||
                    registrationSuccess
                  }
                />

              </div>
            </label>

            {/* EMAIL */}

            <label className="block">
              <span className="text-xs font-bold text-slate-600">
                Email
              </span>

              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-emerald-500">

                <UserRound
                  size={17}
                  className="text-slate-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError();
                  }}
                  placeholder="you@example.com"
                  className="w-full bg-transparent text-sm outline-none"
                  autoComplete="email"
                  disabled={
                    loading ||
                    registrationSuccess
                  }
                />

              </div>
            </label>

            {/* PHONE */}

            <label className="block">
              <span className="text-xs font-bold text-slate-600">
                Phone number
              </span>

              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-emerald-500">

                <Phone
                  size={17}
                  className="text-slate-400"
                />

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    clearError();
                  }}
                  placeholder="0241234567"
                  className="w-full bg-transparent text-sm outline-none"
                  autoComplete="tel"
                  disabled={
                    loading ||
                    registrationSuccess
                  }
                />

              </div>
            </label>

            {/* ACCOUNT TYPE */}

            <label className="block">
              <span className="text-xs font-bold text-slate-600">
                Account type
              </span>

              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  clearError();
                }}
                disabled={
                  loading ||
                  registrationSuccess
                }
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-50"
              >

                <option value="farmer">
                  Farmer
                </option>

                <option value="buyer">
                  Buyer
                </option>

              </select>
            </label>

            {/* TOWN */}

            <label className="block">
              <span className="text-xs font-bold text-slate-600">
                Town
              </span>

              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-emerald-500">

                <MapPin
                  size={17}
                  className="text-slate-400"
                />

                <input
                  type="text"
                  value={town}
                  onChange={(e) => {
                    setTown(e.target.value);
                    clearError();
                  }}
                  placeholder="Koforidua"
                  className="w-full bg-transparent text-sm outline-none"
                  disabled={
                    loading ||
                    registrationSuccess
                  }
                />

              </div>
            </label>

            {/* REGION */}

            <label className="block">
              <span className="text-xs font-bold text-slate-600">
                Region
              </span>

              <input
                type="text"
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value);
                  clearError();
                }}
                placeholder="Eastern Region"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                disabled={
                  loading ||
                  registrationSuccess
                }
              />
            </label>

            {/* PASSWORD */}

            <label className="block">
              <span className="text-xs font-bold text-slate-600">
                Password
              </span>

              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-emerald-500">

                <LockKeyhole
                  size={17}
                  className="text-slate-400"
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError();
                  }}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm outline-none"
                  autoComplete="new-password"
                  disabled={
                    loading ||
                    registrationSuccess
                  }
                />

              </div>
            </label>

            {/* CONFIRM PASSWORD */}

            <label className="block">
              <span className="text-xs font-bold text-slate-600">
                Confirm password
              </span>

              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-emerald-500">

                <LockKeyhole
                  size={17}
                  className="text-slate-400"
                />

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearError();
                  }}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm outline-none"
                  autoComplete="new-password"
                  disabled={
                    loading ||
                    registrationSuccess
                  }
                />

              </div>
            </label>

            {/* ERROR */}

            {error && !registrationSuccess && (
              <div className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                {error}
              </div>
            )}

            {/* SUCCESS */}

            {registrationSuccess && (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">

                <CheckCircle2
                  size={20}
                  className="shrink-0 text-emerald-600"
                />

                <div>
                  <p>
                    Registration successful!
                  </p>

                  <p className="mt-0.5 text-xs font-medium text-emerald-600">
                    Opening your home page...
                  </p>
                </div>

              </div>
            )}

            {/* CREATE ACCOUNT BUTTON */}

            <button
              type="submit"
              disabled={
                loading ||
                registrationSuccess
              }
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {registrationSuccess
                ? "Opening home..."
                : loading
                ? "Creating account..."
                : "Create account"}

              {!loading &&
                !registrationSuccess && (
                  <ArrowRight size={17} />
                )}

            </button>

          </form>

          {/* LOGIN BUTTON */}

          <button
            type="button"
            onClick={onSwitchToLogin}
            disabled={
              loading ||
              registrationSuccess
            }
            className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Already have an account? Sign in
          </button>

          {/* FOOTER */}

          <p className="mt-6 text-center text-[11px] leading-5 text-slate-400">
            Your password is securely encrypted
            before being stored in the AgriConnect
            database.
          </p>

        </section>
      </div>
    </main>
  );
}