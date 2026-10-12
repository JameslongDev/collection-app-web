import { useState } from "react";
import type { Item } from "../services/itemService";
import type { Category } from "../services/categoryService";

interface CategoryTreeProps {
  categories: Category[];
  items: Item[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
  onMoveCategory: (category: Category) => void;
}

function CategoryTree({
  items,
  categories,
  selectedCategoryId,
  onSelectCategory,
  onEditCategory,
  onDeleteCategory,
  onMoveCategory,
}: CategoryTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const toggleExpanded = (categoryId: number) => {
    setExpandedIds((current) => {
      const next = new Set(current);

      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }

      return next;
    });
  };

  const getDescendantCategoryIds = (categoryId: number): number[] => {
    const childIds = categories
      .filter((category) => category.parent_id === categoryId)
      .map((category) => category.id);

    return childIds.flatMap((childId) => [
      childId,
      ...getDescendantCategoryIds(childId),
    ]);
  };

  const renderCategories = (parentId: number | null, level = 0) => {
    const children = categories.filter(
      (category) => category.parent_id === parentId,
    );

    if (children.length === 0) {
      return null;
    }

    return (
      <ul
        className={
          level > 0
            ? "ml-4 border-l border-[var(--color-border)] pl-3 sm:ml-5"
            : ""
        }
      >
        {children.map((category) => {
          const hasChildren = categories.some(
            (child) => child.parent_id === category.id,
          );

          const isExpanded = expandedIds.has(category.id);
          const isSelected = selectedCategoryId === category.id;

          const descendantIds = getDescendantCategoryIds(category.id);

          const itemCount = items.filter(
            (item) =>
              item.category_id === category.id ||
              descendantIds.includes(item.category_id),
          ).length;

          return (
            <li key={category.id} className="py-1">
              <div className="group rounded-lg py-1">
                <div className="flex items-center gap-1">
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(category.id)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition hover:bg-[var(--color-background)] hover:text-[var(--color-primary)]"
                      aria-label={
                        isExpanded ? "Collapse category" : "Expand category"
                      }
                    >
                      {isExpanded ? "▾" : "▸"}
                    </button>
                  ) : (
                    <span
                      title={
                        itemCount === 0
                          ? "No items in this category or its subcategories"
                          : `${itemCount} items`
                      }
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        itemCount > 0
                          ? isSelected
                            ? "bg-white text-[var(--color-primary)]"
                            : "bg-[var(--color-background)] text-[var(--color-text-muted)]"
                          : "bg-gray-50 text-gray-300"
                      }`}
                    >
                      {itemCount}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => onSelectCategory(category.id)}
                    className={`flex min-w-0 flex-1 items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      isSelected
                        ? "bg-[var(--color-primary-light)] font-semibold text-[var(--color-primary)]"
                        : "text-[var(--color-text)] hover:bg-[var(--color-background)]"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2 truncate">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className={`h-4 w-4 shrink-0 ${
                          isSelected
                            ? "text-[var(--color-primary)]"
                            : "text-[var(--color-text-muted)]"
                        }`}
                        aria-hidden="true"
                      >
                        <path
                          d="M3 6.5A2.5 2.5 0 0 1 5.5 4H10l2 2h6.5A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-10Z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      <span className="truncate">{category.name}</span>
                    </span>

                    <span
                      title={
                        itemCount === 0
                          ? "No items in this category or its subcategories"
                          : `${itemCount} items`
                      }
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        itemCount > 0
                          ? isSelected
                            ? "bg-white text-[var(--color-primary)]"
                            : "bg-[var(--color-background)] text-[var(--color-text-muted)]"
                          : "bg-gray-50 text-gray-300"
                      }`}
                    >
                      {itemCount}
                    </span>
                  </button>
                </div>

                {/* Mobile actions */}
                <div className="ml-8 mt-1 flex gap-1 sm:hidden">
                  <button
                    type="button"
                    onClick={() => onEditCategory(category)}
                    className="rounded-lg border border-[var(--color-border)] bg-white px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => onMoveCategory(category)}
                    className="rounded-lg border border-[var(--color-border)] bg-white px-2.5 py-1.5 text-xs font-medium text-blue-600 transition hover:border-blue-200 hover:bg-blue-50"
                  >
                    Move
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteCategory(category)}
                    className="rounded-lg border border-red-100 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:border-red-200 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>

                {/* Desktop actions */}
                <div className="ml-8 mt-1 hidden gap-1 sm:group-hover:flex">
                  <button
                    type="button"
                    onClick={() => onEditCategory(category)}
                    className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => onMoveCategory(category)}
                    className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                  >
                    Move
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteCategory(category)}
                    className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {hasChildren &&
                isExpanded &&
                renderCategories(category.id, level + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  return renderCategories(null);
}

export default CategoryTree;
