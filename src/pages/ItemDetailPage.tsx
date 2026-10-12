import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getItemById,
  getItemImageUrl,
  type Item,
} from "../services/itemService";
import { deleteItem } from "../services/itemService";
import {
  getItemStatusClassName,
  getItemStatusLabel,
} from "../utils/itemStatus";

function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const loadItem = async () => {
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
        const data = await getItemById(itemId);
        setItem(data);

        if (data.image_path) {
          const url = await getItemImageUrl(data.image_path);
          setImageUrl(url);
        }
      } catch (err) {
        console.error("Failed to load item:", err);
        setError("Failed to load item");
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [id]);

  if (loading) {
    return <p>Loading item...</p>;
  }

  if (error) {
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
    return (
      <div>
        <p>Item not found</p>

        <button type="button" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    if (!item) {
      return;
    }

    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!item) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await deleteItem(item.id);
      navigate("/dashboard");
    } catch (err) {
      console.error("Failed to delete item:", err);
      setError("Failed to delete item");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const statusLabel = getItemStatusLabel(item.status);
  const statusClassName = getItemStatusClassName(item.status);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Top Actions */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-text)] shadow-sm transition hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
          >
            ← Back
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate(`/items/${item.id}/edit`)}
              className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-text)] shadow-sm transition hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
            >
              Edit
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-white shadow-sm">
          <div className="grid md:grid-cols-2">
            {/* Image */}
            <div className="flex min-h-[320px] items-center justify-center bg-[var(--color-background)] p-4 sm:p-6 md:min-h-[520px]">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={item.name}
                  className="max-h-[500px] w-full rounded-2xl object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-[var(--color-text-muted)]">
                  <span className="text-5xl">📦</span>
                  <span className="text-sm">No Image</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-5 sm:p-8">
              <div className="mb-6">
                <p className="mb-2 text-sm font-medium text-[var(--color-primary)]">
                  {item.category?.name ?? "Uncategorized"}
                </p>

                <h1 className="break-words text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">
                  {item.name}
                </h1>
              </div>

              {/* Basic Information */}
              <div className="space-y-3">
                <div className="rounded-2xl bg-[var(--color-background)] p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                    Purchase Price
                  </p>

                  <p className="mt-1 break-words text-lg font-semibold text-[var(--color-text)]">
                    {item.purchase_price ?? "-"} {item.currency?.code ?? ""}
                  </p>
                </div>

                <div className="rounded-2xl bg-[var(--color-background)] p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                    Purchase Date
                  </p>

                  <p className="mt-1 text-base font-medium text-[var(--color-text)]">
                    {item.purchase_date ?? "-"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[var(--color-background)] p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                    Status
                  </p>

                  <div className="mt-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${statusClassName}`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-[var(--color-text)]">
                  Details
                </h2>

                <div className="mt-2 rounded-2xl border border-[var(--color-border)] bg-white p-4">
                  <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--color-text-muted)]">
                    {item.details || "-"}
                  </p>
                </div>
              </div>

              {/* Item ID */}
              <div className="mt-6 border-t border-[var(--color-border)] pt-4">
                <p className="break-all text-xs text-[var(--color-text-muted)]">
                  Item ID: {item.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-item-title"
            className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-2xl sm:p-6"
          >
            <div className="mb-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-xl text-red-600">
                !
              </div>

              <h2
                id="delete-item-title"
                className="text-lg font-semibold text-[var(--color-text)]"
              >
                Delete Item?
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-[var(--color-text)]">
                  "{item.name}"
                </span>
                ?
              </p>

              <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-background)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {deleting ? "Deleting..." : "Delete Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemDetailPage;
