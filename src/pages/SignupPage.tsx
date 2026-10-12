import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function SignupPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email: trimmedEmail,
          password,
        });

      if (signUpError) {
        throw signUpError;
      }

      // Supabase จะไม่สร้าง session ทันที
      // ถ้าเปิด Email Confirmation
      if (data.session) {
        navigate("/dashboard");
        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error("Failed to create account:", err);

      if (
        typeof err === "object" &&
        err !== null &&
        "message" in err
      ) {
        setError(String(err.message));
      } else {
        setError("Failed to create account");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f5f1ff] via-[#f8f6fc] to-[#eee8ff] px-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)] shadow-lg">
            <div className="relative h-7 w-7">
              <div className="absolute left-1 top-0 h-5 w-5 rounded-md border-2 border-white opacity-60" />

              <div className="absolute bottom-0 right-0 h-5 w-5 rounded-md border-2 border-white bg-[var(--color-primary)]" />
            </div>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
            Collection App
          </h1>

          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Create your collection account
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm sm:p-8">
          {success ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                ✓
              </div>

              <h2 className="text-xl font-semibold text-[var(--color-text)]">
                Account created
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                Please check your email and confirm your account
                before signing in.
              </p>

              <Link
                to="/login"
                className="mt-6 inline-block rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-[var(--color-text)]">
                  Create Account
                </h2>

                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  Create an account to manage your collection.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* Email */}
                <div>
                  <label
                    htmlFor="signup-email"
                    className="mb-2 block text-sm font-medium text-[var(--color-text)]"
                  >
                    Email
                  </label>

                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    required
                    autoComplete="email"
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-light)]"
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="signup-password"
                    className="mb-2 block text-sm font-medium text-[var(--color-text)]"
                  >
                    Password
                  </label>

                  <input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    required
                    autoComplete="new-password"
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-light)]"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="signup-confirm-password"
                    className="mb-2 block text-sm font-medium text-[var(--color-text)]"
                  >
                    Confirm Password
                  </label>

                  <input
                    id="signup-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    required
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-light)]"
                  />
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-light)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Creating Account..."
                    : "Create Account"}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-[var(--color-primary)] hover:underline"
                >
                  Login
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-[var(--color-text-muted)]">
          Your personal collection manager
        </p>
      </div>
    </div>
  );
}

export default SignupPage;