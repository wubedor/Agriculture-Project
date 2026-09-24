import { useState } from "react";

import {
  LockKeyhole,
  Sprout,
  UserRound,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";

// ==========================================
// API URL
// ==========================================
// The .env file should contain:
//
// VITE_API_URL=http://192.168.100.5:5000/api
//
// If .env is not available, it falls back
// to localhost for development on the computer.
// ==========================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export default function Login({
  onLogin,
  onSwitchToRegister,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // ==========================================
  // SUBMIT LOGIN
  // ==========================================

  const submit = async (e) => {
    e.preventDefault();

    setError("");
    setLoginSuccess(false);

    // ========================================
    // VALIDATE FORM
    // ========================================

    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      // ========================================
      // LOGIN REQUEST
      // ========================================

      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
          }),
        }
      );

      // ========================================
      // SAFELY READ SERVER RESPONSE
      // ========================================

      let data;

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      // ========================================
      // LOGIN FAILED
      // ========================================

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Invalid email or password."
        );

        return;
      }

      // ========================================
      // CHECK TOKEN
      // ========================================

      if (!data.token) {
        setError(
          "Login failed. No authentication token received."
        );

        return;
      }

      // ========================================
      // CHECK USER
      // ========================================

      if (!data.user) {
        setError(
          "Login failed. No user information was received."
        );

        return;
      }

      // ========================================
      // CHECK ROLE
      // ========================================
      // AgriConnect currently supports only:
      // farmer
      // buyer
      // ========================================

      if (
        data.user.role !== "farmer" &&
        data.user.role !== "buyer"
      ) {
        setError(
          "Invalid account role. Please contact support."
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
      // SHOW SUCCESS MESSAGE
      // ========================================

      setLoginSuccess(true);

      // ========================================
      // OPEN DASHBOARD
      // ========================================

      setTimeout(() => {
        if (onLogin) {
          onLogin(data.user);
        }
      }, 1200);
    } catch (err) {
      console.error(
        "Login error:",
        err
      );

      setError(
        "Unable to connect to the server. Make sure your computer and phone are connected to the same Wi-Fi network."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* =========================================
          LEFT SIDE - DESKTOP BRANDING
      ========================================== */}

      <div className="hidden lg:flex lg:w-1/2 bg-emerald-900 relative overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-800" />

        <div className="relative z-10 flex flex-col justify-between w-full p-12 text-white">

          {/* LOGO */}

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Sprout size={24} />
            </div>

            <div>
              <h1 className="font-bold text-xl">
                AgriConnect AI
              </h1>

              <p className="text-emerald-200 text-xs">
                Connecting farmers to real buyers
              </p>
            </div>

          </div>

          {/* MAIN MESSAGE */}

          <div className="max-w-xl">

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm mb-6">
              <Sprout size={15} />
              Smart Agriculture Marketplace
            </div>

            <h2 className="text-5xl font-bold leading-tight mb-6">
              Grow your business.
              <br />
              Connect with the right market.
            </h2>

            <p className="text-emerald-100 text-lg leading-relaxed max-w-lg">
              AgriConnect AI helps farmers and buyers connect,
              negotiate, and trade agricultural produce more
              efficiently.
            </p>

          </div>

          {/* SECURITY */}

          <div className="flex items-center gap-3 text-emerald-100">

            <ShieldCheck size={20} />

            <span className="text-sm">
              Secure authentication and protected accounts
            </span>

          </div>

        </div>
      </div>

      {/* =========================================
          RIGHT SIDE - LOGIN FORM
      ========================================== */}

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10">

        <div className="w-full max-w-md">

          {/* MOBILE LOGO */}

          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">

            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Sprout size={24} />
            </div>

            <div>

              <h1 className="font-bold text-xl text-slate-900">
                AgriConnect AI
              </h1>

              <p className="text-slate-500 text-xs">
                Smart Agriculture Marketplace
              </p>

            </div>

          </div>

          {/* HEADER */}

          <div className="mb-8">

            <h2 className="text-3xl font-bold text-slate-900">
              Welcome back
            </h2>

            <p className="text-slate-500 mt-2">
              Sign in to continue to your AgriConnect account.
            </p>

          </div>

          {/* LOGIN FORM */}

          <form
            onSubmit={submit}
            className="space-y-5"
          >

            {/* EMAIL */}

            <div>

              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email address
              </label>

              <div className="relative">

                <UserRound
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={
                    loading ||
                    loginSuccess
                  }
                  className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition disabled:bg-slate-100"
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div>

              <div className="flex items-center justify-between mb-2">

                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

              </div>

              <div className="relative">

                <LockKeyhole
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={
                    loading ||
                    loginSuccess
                  }
                  className="w-full h-12 pl-11 pr-12 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition disabled:bg-slate-100"
                />

                {/* SHOW / HIDE PASSWORD */}

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  disabled={
                    loading ||
                    loginSuccess
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  title={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-emerald-600 transition disabled:opacity-50"
                >

                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}

                </button>

              </div>

            </div>

            {/* ERROR */}

            {error && (

              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">

                <p className="text-sm text-red-600">
                  {error}
                </p>

              </div>

            )}

            {/* SUCCESS */}

            {loginSuccess && (

              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center gap-3">

                <CheckCircle2
                  size={20}
                  className="text-emerald-600"
                />

                <p className="text-sm text-emerald-700 font-medium">
                  Sign in successful! Opening your dashboard...
                </p>

              </div>

            )}

            {/* SIGN IN BUTTON */}

            <button
              type="submit"
              disabled={
                loading ||
                loginSuccess
              }
              className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >

              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : loginSuccess ? (
                <>
                  <CheckCircle2 size={19} />
                  Successful
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={18} />
                </>
              )}

            </button>

          </form>

          {/* REGISTER */}

          <div className="text-center mt-7">

            <p className="text-sm text-slate-500">

              Don't have an account?{" "}

              <button
                type="button"
                onClick={onSwitchToRegister}
                disabled={
                  loading ||
                  loginSuccess
                }
                className="font-semibold text-emerald-600 hover:text-emerald-700 transition disabled:opacity-50"
              >
                Create account
              </button>

            </p>

          </div>

          {/* SECURITY */}

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">

            <ShieldCheck size={15} />

            <span>
              Your account information is securely protected.
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}