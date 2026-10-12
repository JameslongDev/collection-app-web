import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import {
  createCurrency,
  deleteCurrency,
  getCurrencies,
  updateCurrency,
  type Currency,
} from "../services/currencyService";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

function SettingsPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [deleteCurrencyTarget, setDeleteCurrencyTarget] =
    useState<Currency | null>(null);

  const [deleteCurrencyError, setDeleteCurrencyError] = useState("");

  const loadCurrencies = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCurrencies();
      setCurrencies(data);
    } catch (err) {
      console.error("Failed to load currencies:", err);
      setError("Failed to load currencies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrencies();
  }, []);

  const resetForm = () => {
    setCode("");
    setName("");
    setSymbol("");
    setEditingCurrency(null);
    setShowForm(false);
    setError("");
  };

  const handleEdit = (currency: Currency) => {
    setEditingCurrency(currency);
    setCode(currency.code);
    setName(currency.name);
    setSymbol(currency.symbol);
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedCode = code.trim().toUpperCase();
    const trimmedName = name.trim();
    const trimmedSymbol = symbol.trim();

    if (trimmedCode.length !== 3) {
      setError("Currency code must be exactly 3 characters");
      return;
    }

    if (!trimmedCode) {
      setError("Currency code is required");
      return;
    }

    if (!trimmedName) {
      setError("Currency name is required");
      return;
    }

    if (!trimmedSymbol) {
      setError("Currency symbol is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (editingCurrency) {
        const updatedCurrency = await updateCurrency(
          editingCurrency.id,
          trimmedCode,
          trimmedName,
          trimmedSymbol,
        );

        setCurrencies((current) =>
          current.map((currency) =>
            currency.id === updatedCurrency.id ? updatedCurrency : currency,
          ),
        );
      } else {
        const newCurrency = await createCurrency(
          trimmedCode,
          trimmedName,
          trimmedSymbol,
        );

        setCurrencies((current) =>
          [...current, newCurrency].sort((a, b) =>
            a.code.localeCompare(b.code),
          ),
        );
      }

      resetForm();
    } catch (err) {
      console.error("Failed to save currency:", err);

      if (typeof err === "object" && err !== null && "code" in err) {
        if (err.code === "23505") {
          setError("Currency code already exists");
          return;
        }

        if (err.code === "23503") {
          setError("This currency is currently being used by an item");
          return;
        }
      }

      setError(
        editingCurrency
          ? "Failed to update currency"
          : "Failed to create currency",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (currency: Currency) => {
    setDeleteCurrencyError("");
    setDeleteCurrencyTarget(currency);
  };

  const confirmDeleteCurrency = async () => {
    if (!deleteCurrencyTarget) {
      return;
    }

    try {
      setDeleteCurrencyError("");

      await deleteCurrency(deleteCurrencyTarget.id);

      setCurrencies((current) =>
        current.filter((currency) => currency.id !== deleteCurrencyTarget.id),
      );

      setDeleteCurrencyTarget(null);
    } catch (err) {
      console.error("Failed to delete currency:", err);

      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        err.code === "23503"
      ) {
        setDeleteCurrencyError(
          "This currency is currently being used by one or more items and cannot be deleted.",
        );
      } else {
        setDeleteCurrencyError("Failed to delete currency. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">
            Settings
          </h1>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mt-4 rounded-xl border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-background)]"
          >
            ← Back to Dashboard
          </button>

          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Manage your collection settings
          </p>
        </div>

        <section className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                Currencies
              </h2>

              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Manage the currencies available when adding items.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (showForm) {
                  resetForm();
                } else {
                  setShowForm(true);
                }
              }}
              className="w-full rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-light)] sm:w-auto"
            >
              {showForm ? "Close" : "+ Add Currency"}
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="mb-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 sm:p-5"
            >
              <h3 className="mb-4 text-base font-semibold text-[var(--color-text)]">
                {editingCurrency ? "Edit Currency" : "Add Currency"}
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="currency-code"
                    className="mb-2 block text-sm font-medium text-[var(--color-text)]"
                  >
                    Code
                  </label>

                  <input
                    id="currency-code"
                    type="text"
                    maxLength={3}
                    value={code}
                    onChange={(event) =>
                      setCode(event.target.value.toUpperCase())
                    }
                    placeholder="THB"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm uppercase outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-light)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="currency-name"
                    className="mb-2 block text-sm font-medium text-[var(--color-text)]"
                  >
                    Name
                  </label>

                  <input
                    id="currency-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Thai Baht"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-light)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="currency-symbol"
                    className="mb-2 block text-sm font-medium text-[var(--color-text)]"
                  >
                    Symbol
                  </label>

                  <input
                    id="currency-symbol"
                    type="text"
                    value={symbol}
                    onChange={(event) => setSymbol(event.target.value)}
                    placeholder="฿"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-light)]"
                  />
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-background)] sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {saving
                    ? "Saving..."
                    : editingCurrency
                      ? "Save Changes"
                      : "Create Currency"}
                </button>
              </div>
            </form>
          )}

          {error && !showForm && (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-xl border border-[var(--color-border)] p-6 text-center text-sm text-[var(--color-text-muted)]">
              Loading currencies...
            </div>
          ) : currencies.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--color-border)] p-8 text-center">
              <p className="font-medium text-[var(--color-text)]">
                No currencies found
              </p>

              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Add a currency to use it when creating items.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
              <div className="hidden grid-cols-[1fr_2fr_1fr_auto] gap-4 bg-[var(--color-background)] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] sm:grid">
                <span>Code</span>
                <span>Name</span>
                <span>Symbol</span>
                <span>Actions</span>
              </div>

              <div className="divide-y divide-[var(--color-border)]">
                {currencies.map((currency) => (
                  <div
                    key={currency.id}
                    className="grid grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-[1fr_2fr_1fr_auto] sm:items-center sm:gap-4"
                  >
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)] sm:hidden">
                        Code
                      </p>

                      <p className="font-semibold text-[var(--color-primary)]">
                        {currency.code}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--color-text-muted)] sm:hidden">
                        Name
                      </p>

                      <p className="text-sm text-[var(--color-text)]">
                        {currency.name}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--color-text-muted)] sm:hidden">
                        Symbol
                      </p>

                      <p className="text-sm font-medium text-[var(--color-text)]">
                        {currency.symbol}
                      </p>
                    </div>

                    <div className="flex gap-2 sm:justify-end">
                      <button
                        type="button"
                        onClick={() => handleEdit(currency)}
                        className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(currency)}
                        className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
      {deleteCurrencyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-currency-title"
            className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-2xl sm:p-6"
          >
            <div className="mb-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-xl text-red-600">
                !
              </div>

              <h2
                id="delete-currency-title"
                className="text-lg font-semibold text-[var(--color-text)]"
              >
                Delete Currency?
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-[var(--color-text)]">
                  "{deleteCurrencyTarget.code}"
                </span>
                ?
              </p>

              <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
                This action cannot be undone.
              </p>

              {deleteCurrencyError && (
                <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
                  {deleteCurrencyError}
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteCurrencyTarget(null)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-background)] sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteCurrency}
                className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 sm:w-auto"
              >
                Delete Currency
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
