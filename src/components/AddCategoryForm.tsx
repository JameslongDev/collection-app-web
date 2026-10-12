import { useState } from "react";
import { createCategory } from "../services/categoryService";

interface Category {
  id: number;
  name: string;
  parent_id: number | null;
}

interface AddCategoryFormProps {
  categories: Category[];
  onCreated: (category: Category) => void;
}

function AddCategoryForm({ categories, onCreated }: AddCategoryFormProps) {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Category name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const category = await createCategory(trimmedName, parentId);

      onCreated(category);

      setName("");
      setParentId(null);
    } catch (err) {
      console.error("Failed to create category:", err);
      setError("Failed to create category");
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
          Add Category
        </h2>

        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Create a new category for your collection
        </p>
      </div>

      {/* Name */}
      <div className="mb-4">
        <label
          htmlFor="category-name"
          className="mb-2 block text-sm font-medium text-[var(--color-text)]"
        >
          Name
        </label>

        <input
          id="category-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Category name"
          className="w-full rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-light)]"
        />
      </div>

      {/* Parent */}
      <div className="mb-4">
        <label
          htmlFor="category-parent"
          className="mb-2 block text-sm font-medium text-[var(--color-text)]"
        >
          Parent Category
        </label>

        <select
          id="category-parent"
          value={parentId ?? ""}
          onChange={(event) =>
            setParentId(
              event.target.value === "" ? null : Number(event.target.value),
            )
          }
          className="w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary-light)]"
        >
          <option value="">No Parent (Root)</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
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
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-light)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Category"}
      </button>
    </form>
  );
}

export default AddCategoryForm;
