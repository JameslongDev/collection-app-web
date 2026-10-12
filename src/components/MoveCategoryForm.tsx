import { useEffect, useState } from "react";
import { canMoveCategory, moveCategory } from "../services/categoryService";

interface Category {
  id: number;
  name: string;
  parent_id: number | null;
}

interface MoveCategoryFormProps {
  category: Category;
  categories: Category[];
  onMoved: (category: Category) => void;
  onCancel: () => void;
}

function MoveCategoryForm({
  category,
  categories,
  onMoved,
  onCancel,
}: MoveCategoryFormProps) {
  const [parentId, setParentId] = useState<number | null>(category.parent_id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setParentId(category.parent_id);
    setError("");
  }, [category]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const allowed = await canMoveCategory(category.id, parentId);

      if (!allowed) {
        setError("ไม่สามารถย้าย Category ไปยังตำแหน่งนี้ได้");
        return;
      }

      const movedCategory = await moveCategory(category.id, parentId);

      onMoved(movedCategory);
    } catch (err) {
      console.error("Failed to move category:", err);
      setError("ไม่สามารถย้าย Category ได้");
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
          Move Category
        </h2>

        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Move "{category.name}" to another parent category
        </p>
      </div>

      {/* New Parent */}
      <div className="mb-4">
        <label
          htmlFor="move-category-parent"
          className="mb-2 block text-sm font-medium text-[var(--color-text)]"
        >
          New Parent
        </label>

        <select
          id="move-category-parent"
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
          {loading ? "Moving..." : "Move Category"}
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

export default MoveCategoryForm;
