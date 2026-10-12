import { useEffect, useState } from "react";
import { updateCategory } from "../services/categoryService";

interface Category {
  id: number;
  name: string;
  parent_id: number | null;
}

interface EditCategoryFormProps {
  category: Category;
  categories: Category[];
  onUpdated: (category: Category) => void;
  onCancel: () => void;
}

function EditCategoryForm({
  category,
  categories,
  onUpdated,
  onCancel,
}: EditCategoryFormProps) {
  const [name, setName] = useState(category.name);
  const [parentId, setParentId] = useState<number | null>(category.parent_id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(category.name);
    setParentId(category.parent_id);
    setError("");
  }, [category]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Category name is required");
      return;
    }

    if (parentId === category.id) {
      setError("A category cannot be its own parent");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const updatedCategory = await updateCategory(
        category.id,
        trimmedName,
        parentId,
      );

      onUpdated(updatedCategory);
    } catch (err) {
      console.error("Failed to update category:", err);

      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        err.code === "23505"
      ) {
        setError("มี Category ชื่อนี้อยู่แล้ว");
      } else {
        setError("Failed to update category");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm"
    >
      <div className="mb-5">
        <h2 className="text-base font-semibold text-[var(--color-text)]">
          Edit Category
        </h2>

        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Update the category name or parent
        </p>
      </div>

      {/* Name */}
      <div className="mb-4">
        <label
          htmlFor="edit-category-name"
          className="mb-2 block text-sm font-medium text-[var(--color-text)]"
        >
          Name
        </label>

        <input
          id="edit-category-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-light)]"
        />
      </div>

      {/* Parent */}
      <div className="mb-4">
        <label
          htmlFor="edit-category-parent"
          className="mb-2 block text-sm font-medium text-[var(--color-text)]"
        >
          Parent Category
        </label>

        <select
          id="edit-category-parent"
          value={parentId ?? ""}
          onChange={(event) =>
            setParentId(
              event.target.value === "" ? null : Number(event.target.value),
            )
          }
          className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-light)]"
        >
          <option value="">No Parent (Root)</option>

          {categories
            .filter((categoryItem) => categoryItem.id !== category.id)
            .map((categoryItem) => (
              <option key={categoryItem.id} value={categoryItem.id}>
                {categoryItem.name}
              </option>
            ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-light)] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-background)] sm:flex-1"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default EditCategoryForm;
