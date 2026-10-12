import { useEffect, useState } from "react";
import {
  createItem,
  deleteItem,
  uploadItemImage,
} from "../services/itemService";

interface Category {
  id: number;
  name: string;
  parent_id: number | null;
}

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
}

interface AddItemFormProps {
  categories: Category[];
  currencies: Currency[];
  onCreated: () => void;
}

const STATUS_OPTIONS = [
  { value: "have", label: "มีแล้ว" },
  { value: "want", label: "อยากได้" },
  { value: "searching", label: "กำลังหา" },
  { value: "reserved", label: "จองแล้ว" },
  { value: "for_sale", label: "ขายต่อ" },
];

function AddItemForm({ categories, currencies, onCreated }: AddItemFormProps) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [currencyId, setCurrencyId] = useState<number | null>(null);
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState("have");

  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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

    setLoading(true);
    setError("");

    try {
      const item = await createItem({
        categoryId,
        currencyId,
        name: trimmedName,
        purchasePrice: price,
        purchaseDate: purchaseDate || null,
        details: details.trim() || null,
        status,
      });

      try {
        if (imageFile) {
          await uploadItemImage(item.id, imageFile);
        }
      } catch (uploadError) {
        console.error("Failed to upload item image:", uploadError);

        await deleteItem(item.id);

        throw uploadError;
      }

      setName("");
      setCategoryId(null);
      setCurrencyId(null);
      setPurchasePrice("");
      setPurchaseDate("");
      setDetails("");
      setStatus("have");
      setImageFile(null);

      onCreated();
    } catch (err) {
      console.error("Failed to create item:", err);

      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        err.code === "23505"
      ) {
        setError("มี Item ชื่อนี้อยู่แล้วใน Category นี้");
      } else {
        setError("Failed to create item");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm sm:p-6"
    >
      <h2 className="mb-6 text-lg font-semibold text-[var(--color-text)]">
        Add Item
      </h2>

      {/* Name */}
      <div className="mb-4">
        <label
          htmlFor="item-name"
          className="mb-2 block text-sm font-medium text-[var(--color-text)]"
        >
          Name
        </label>

        <input
          id="item-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Item name"
          className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5 outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-light)]"
        />
      </div>

      {/* Category */}
      <div className="mb-4">
        <label
          htmlFor="item-category"
          className="mb-2 block text-sm font-medium text-[var(--color-text)]"
        >
          Category
        </label>

        <select
          id="item-category"
          value={categoryId ?? ""}
          onChange={(event) =>
            setCategoryId(
              event.target.value === "" ? null : Number(event.target.value),
            )
          }
          className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-light)]"
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
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="item-price"
            className="mb-2 block text-sm font-medium text-[var(--color-text)]"
          >
            Purchase Price
          </label>

          <input
            id="item-price"
            type="number"
            min="0"
            step="0.01"
            value={purchasePrice}
            onChange={(event) => setPurchasePrice(event.target.value)}
            placeholder="0.00"
            className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5 outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-light)]"
          />
        </div>

        <div>
          <label
            htmlFor="item-currency"
            className="mb-2 block text-sm font-medium text-[var(--color-text)]"
          >
            Currency
          </label>

          <select
            id="item-currency"
            value={currencyId ?? ""}
            onChange={(event) =>
              setCurrencyId(
                event.target.value === "" ? null : Number(event.target.value),
              )
            }
            className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-light)]"
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
      <div className="mb-4">
        <label
          htmlFor="item-purchase-date"
          className="mb-2 block text-sm font-medium text-[var(--color-text)]"
        >
          Purchase Date
        </label>

        <input
          id="item-purchase-date"
          type="date"
          value={purchaseDate}
          onChange={(event) => setPurchaseDate(event.target.value)}
          className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5 outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-light)]"
        />
      </div>

      {/* Status */}
      <div className="mb-4">
        <label
          htmlFor="item-status"
          className="mb-2 block text-sm font-medium text-[var(--color-text)]"
        >
          Status
        </label>

        <select
          id="item-status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-light)]"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Details */}
      <div className="mb-4">
        <label
          htmlFor="item-details"
          className="mb-2 block text-sm font-medium text-[var(--color-text)]"
        >
          Details
        </label>

        <textarea
          id="item-details"
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          placeholder="Details"
          rows={4}
          className="w-full resize-y rounded-xl border border-[var(--color-border)] px-3 py-2.5 outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-light)]"
        />
      </div>

      {/* Image */}
      <div className="mb-5">
        <label
          htmlFor="item-image"
          className="mb-2 block text-sm font-medium text-[var(--color-text)]"
        >
          Image
        </label>

        <input
          id="item-image"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            setImageFile(file);
          }}
          className="block w-full rounded-xl border border-[var(--color-border)] bg-white text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--color-primary-light)] file:px-4 file:py-2 file:font-medium file:text-[var(--color-primary)] hover:file:bg-[var(--color-primary)] hover:file:text-white"
        />

        {imageFile && (
          <p className="mt-2 break-all text-sm text-[var(--color-text-muted)]">
            Selected: {imageFile.name}
          </p>
        )}

        {imagePreviewUrl && (
          <div className="mt-4 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-3">
            <img
              src={imagePreviewUrl}
              alt="Preview"
              className="h-48 w-48 max-w-full rounded-lg object-cover"
            />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[var(--color-primary)] px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-light)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {loading ? "Creating..." : "Create Item"}
      </button>
    </form>
  );
}

export default AddItemForm;
