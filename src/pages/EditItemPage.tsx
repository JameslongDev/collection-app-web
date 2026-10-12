import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCategories } from "../services/categoryService";
import { getCurrencies, type Currency } from "../services/currencyService";
import {
  getItemById,
  updateItem,
  updateItemImage,
  type Item,
} from "../services/itemService";

interface Category {
  id: number;
  name: string;
  parent_id: number | null;
}

const STATUS_OPTIONS = [
  { value: "have", label: "มีแล้ว" },
  { value: "want", label: "อยากได้" },
  { value: "searching", label: "กำลังหา" },
  { value: "reserved", label: "จองแล้ว" },
  { value: "for_sale", label: "ขายต่อ" },
];

function EditItemPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [item, setItem] = useState<Item | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [currencyId, setCurrencyId] = useState<number | null>(null);
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState("have");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(imageFile);
    setImagePreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError("Item ID is missing");
        setLoading(false);
        return;
      }

      const itemId = Number(id);

      if (Number.isNaN(itemId)) {
        setError("Invalid Item ID");
        setLoading(false);
        return;
      }

      try {
        const [itemData, categoryData, currencyData] = await Promise.all([
          getItemById(itemId),
          getCategories(),
          getCurrencies(),
        ]);

        setItem(itemData);
        setCategories(categoryData);
        setCurrencies(currencyData);

        setName(itemData.name);
        setCategoryId(itemData.category_id);
        setCurrencyId(itemData.currency_id);
        setPurchasePrice(itemData.purchase_price?.toString() ?? "");
        setPurchaseDate(itemData.purchase_date ?? "");
        setDetails(itemData.details ?? "");
        setStatus(itemData.status);
      } catch (err) {
        console.error("Failed to load edit data:", err);
        setError("Failed to load item");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!item) {
      return;
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Item name is required");
      return;
    }

    if (categoryId === null) {
      setError("Please select a category");
      return;
    }

    if (currencyId === null) {
      setError("Please select a currency");
      return;
    }

    let price: number | null = null;

    if (purchasePrice.trim() !== "") {
      price = Number(purchasePrice);

      if (!Number.isFinite(price) || price < 0) {
        setError("Purchase price is invalid");
        return;
      }
    }

    if (imageFile) {
      const allowedTypes = ["image/png", "image/jpeg", "image/webp"];

      if (!allowedTypes.includes(imageFile.type)) {
        setError("รองรับเฉพาะ PNG, JPG, JPEG และ WebP");
        return;
      }

      const maxFileSize = 10 * 1024 * 1024;

      if (imageFile.size > maxFileSize) {
        setError("ขนาดรูปต้องไม่เกิน 10 MB");
        return;
      }
    }

    setSaving(true);
    setError("");

    try {
      await updateItem({
        id: item.id,
        categoryId,
        currencyId,
        name: trimmedName,
        purchasePrice: price,
        purchaseDate: purchaseDate || null,
        details: details.trim() || null,
        status,
      });

      if (imageFile) {
        await updateItemImage(item.id, imageFile, item.image_path);
      }

      navigate(`/items/${item.id}`);

      navigate(`/items/${item.id}`);
    } catch (err) {
      console.error("Failed to update item:", err);

      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        err.code === "23505"
      ) {
        setError("มี Item ชื่อนี้อยู่แล้วในหมวดหมู่นี้");
      } else {
        setError("Failed to update item");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading item...</p>;
  }

  if (error && !item) {
    return (
      <div>
        <p>{error}</p>

        <button type="button" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!item) {
    return <p>Item not found</p>;
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(`/items/${item.id}`)}
            className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-text)] shadow-sm transition hover:bg-[var(--color-primary-light)]"
          >
            ← Back
          </button>

          <h1 className="text-xl font-bold text-[var(--color-text)] sm:text-2xl">
            Edit Item
          </h1>

          <div className="w-[72px]" />
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm sm:p-6"
        >
          {/* Name */}
          <div>
            <label
              htmlFor="edit-item-name"
              className="mb-2 block text-sm font-medium text-[var(--color-text)]"
            >
              Name
            </label>

            <input
              id="edit-item-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-light)]"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="edit-item-category"
              className="mb-2 block text-sm font-medium text-[var(--color-text)]"
            >
              Category
            </label>

            <select
              id="edit-item-category"
              value={categoryId ?? ""}
              onChange={(event) =>
                setCategoryId(
                  event.target.value === "" ? null : Number(event.target.value),
                )
              }
              className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-light)]"
            >
              <option value="">Select category</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price + Currency */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="edit-item-price"
                className="mb-2 block text-sm font-medium text-[var(--color-text)]"
              >
                Purchase Price
              </label>

              <input
                id="edit-item-price"
                type="number"
                min="0"
                step="0.01"
                value={purchasePrice}
                onChange={(event) => setPurchasePrice(event.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-light)]"
              />
            </div>

            <div>
              <label
                htmlFor="edit-item-currency"
                className="mb-2 block text-sm font-medium text-[var(--color-text)]"
              >
                Currency
              </label>

              <select
                id="edit-item-currency"
                value={currencyId ?? ""}
                onChange={(event) =>
                  setCurrencyId(
                    event.target.value === ""
                      ? null
                      : Number(event.target.value),
                  )
                }
                className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-light)]"
              >
                <option value="">Select currency</option>

                {currencies.map((currency) => (
                  <option key={currency.id} value={currency.id}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Purchase Date */}
          <div>
            <label
              htmlFor="edit-item-purchase-date"
              className="mb-2 block text-sm font-medium text-[var(--color-text)]"
            >
              Purchase Date
            </label>

            <input
              id="edit-item-purchase-date"
              type="date"
              value={purchaseDate}
              onChange={(event) => setPurchaseDate(event.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-light)]"
            />
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="edit-item-status"
              className="mb-2 block text-sm font-medium text-[var(--color-text)]"
            >
              Status
            </label>

            <select
              id="edit-item-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-light)]"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Details */}
          <div>
            <label
              htmlFor="edit-item-details"
              className="mb-2 block text-sm font-medium text-[var(--color-text)]"
            >
              Details
            </label>

            <textarea
              id="edit-item-details"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              rows={5}
              className="w-full resize-y rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-light)]"
            />
          </div>

          {/* Image */}
          <div>
            <label
              htmlFor="edit-item-image"
              className="mb-2 block text-sm font-medium text-[var(--color-text)]"
            >
              Replace Image
            </label>

            <input
              id="edit-item-image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setImageFile(file);
              }}
              className="block w-full rounded-xl border border-[var(--color-border)] bg-white text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--color-primary-light)] file:px-4 file:py-2 file:font-medium file:text-[var(--color-primary)] hover:file:bg-[var(--color-primary)] hover:file:text-white"
            />

            {item.image_path && (
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Current image exists
              </p>
            )}

            {imageFile && (
              <p className="mt-1 break-all text-sm text-[var(--color-text-muted)]">
                New image: {imageFile.name}
              </p>
            )}

            {imagePreviewUrl && (
              <div className="mt-4 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-3">
                <img
                  src={imagePreviewUrl}
                  alt="New image preview"
                  className="h-48 w-48 max-w-full rounded-lg object-cover"
                />
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(`/items/${item.id}`)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-white px-5 py-3 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-primary-light)] sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-light)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditItemPage;
