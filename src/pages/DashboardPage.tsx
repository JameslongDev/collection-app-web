import { useEffect, useState } from "react";
import { getCategories } from "../services/categoryService";
import { getItems, type Item } from "../services/itemService";
import CategoryTree from "../components/CategoryTree";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import ItemCard from "../components/ItemCard";
import AddCategoryForm from "../components/AddCategoryForm";
import AddItemForm from "../components/AddItemForm";
import { getCurrencies, type Currency } from "../services/currencyService";
import EditCategoryForm from "../components/EditCategoryForm";
import { deleteCategory } from "../services/categoryService";
import MoveCategoryForm from "../components/MoveCategoryForm";
import type { Category } from "../services/categoryService";

function DashboardPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [searchText, setSearchText] = useState("");
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [movingCategory, setMovingCategory] = useState<Category | null>(null);
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [deleteCategoryTarget, setDeleteCategoryTarget] =
    useState<Category | null>(null);
  const [deleteCategoryError, setDeleteCategoryError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoryData, itemData, currencyData] = await Promise.all([
          getCategories(),
          getItems(),
          getCurrencies(),
        ]);

        setCurrencies(currencyData);
        setCategories(categoryData);
        setItems(itemData);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getDescendantCategoryIds = (categoryId: number): number[] => {
    const result: number[] = [];
    const queue = [categoryId];

    while (queue.length > 0) {
      const currentId = queue.shift();

      if (currentId === undefined) {
        continue;
      }

      const childIds = categories
        .filter((category) => category.parent_id === currentId)
        .map((category) => category.id);

      result.push(...childIds);
      queue.push(...childIds);
    }

    return result;
  };

  const filteredItems = items.filter((item) => {
    let matchesCategory = true;

    if (selectedCategoryId !== null) {
      const categoryIds = [
        selectedCategoryId,
        ...getDescendantCategoryIds(selectedCategoryId),
      ];

      matchesCategory = categoryIds.includes(item.category_id);
    }

    const matchesSearch =
      searchText.trim() === "" ||
      item.name.toLowerCase().includes(searchText.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleDeleteCategory = (category: Category) => {
    setDeleteCategoryError("");
    setDeleteCategoryTarget(category);
  };

  const confirmDeleteCategory = async () => {
    if (!deleteCategoryTarget) {
      return;
    }

    try {
      setDeleteCategoryError("");

      await deleteCategory(deleteCategoryTarget.id);

      setCategories((current) =>
        current.filter((item) => item.id !== deleteCategoryTarget.id),
      );

      if (selectedCategoryId === deleteCategoryTarget.id) {
        setSelectedCategoryId(null);
      }

      setDeleteCategoryTarget(null);
    } catch (err) {
      console.error("Failed to delete category:", err);

      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        err.code === "23503"
      ) {
        const hasChildren = categories.some(
          (category) => category.parent_id === deleteCategoryTarget.id,
        );

        const hasItems = items.some(
          (item) => item.category_id === deleteCategoryTarget.id,
        );

        if (hasChildren && hasItems) {
          setDeleteCategoryError(
            "ลบไม่ได้ เพราะ Category นี้มีทั้ง Item และ Category ย่อยอยู่",
          );
        } else if (hasChildren) {
          setDeleteCategoryError(
            "ลบไม่ได้ เพราะ Category นี้ยังมี Category ย่อยอยู่",
          );
        } else if (hasItems) {
          setDeleteCategoryError("ลบไม่ได้ เพราะ Category นี้ยังมี Item อยู่");
        } else {
          setDeleteCategoryError("ไม่สามารถลบ Category นี้ได้");
        }

        return;
      }

      setDeleteCategoryError("ไม่สามารถลบ Category นี้ได้ กรุณาลองใหม่");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Dashboard Header + Search */}
        <div className="mb-8">
          <div className="mb-5">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">
              My Collection
            </h2>

            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Browse and manage your collection
            </p>
          </div>

          <SearchBar value={searchText} onChange={setSearchText} />
        </div>

        {loading && (
          <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 text-sm text-[var(--color-text-muted)]">
            Loading dashboard...
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            {/* Categories */}
            <aside className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-[var(--color-text)]">
                    Categories
                  </h2>

                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    Organize your collection
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddCategoryForm((current) => !current)}
                  className="shrink-0 rounded-xl bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-light)]"
                >
                  {showAddCategoryForm ? "Close" : "+ Add"}
                </button>
              </div>

              {/* Add Category */}
              {showAddCategoryForm && (
                <AddCategoryForm
                  categories={categories}
                  onCreated={(category) => {
                    setCategories((current) => [...current, category]);
                    setShowAddCategoryForm(false);
                  }}
                />
              )}

              {/* Edit Category */}
              {editingCategory && (
                <EditCategoryForm
                  category={editingCategory}
                  categories={categories}
                  onUpdated={(updatedCategory) => {
                    setCategories((current) =>
                      current.map((category) =>
                        category.id === updatedCategory.id
                          ? updatedCategory
                          : category,
                      ),
                    );

                    setEditingCategory(null);
                  }}
                  onCancel={() => setEditingCategory(null)}
                />
              )}

              {/* Move Category */}
              {movingCategory && (
                <MoveCategoryForm
                  category={movingCategory}
                  categories={categories}
                  onMoved={(movedCategory) => {
                    setCategories((current) =>
                      current.map((category) =>
                        category.id === movedCategory.id
                          ? movedCategory
                          : category,
                      ),
                    );

                    setMovingCategory(null);
                  }}
                  onCancel={() => setMovingCategory(null)}
                />
              )}

              {/* Category Tree */}
              <div className="border-t border-[var(--color-border)] pt-4">
                <CategoryTree
                  items={items}
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  onSelectCategory={setSelectedCategoryId}
                  onEditCategory={setEditingCategory}
                  onDeleteCategory={handleDeleteCategory}
                  onMoveCategory={setMovingCategory}
                />
              </div>
            </aside>

            {/* Items */}
            <section className="min-w-0">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold text-[var(--color-text)]">
                      Items
                    </h2>

                    {selectedCategoryId !== null && (
                      <span className="max-w-full truncate rounded-full bg-[var(--color-primary-light)] px-3 py-1 text-xs font-medium text-[var(--color-primary)]">
                        {categories.find(
                          (category) => category.id === selectedCategoryId,
                        )?.name ?? "Category"}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {filteredItems.length}{" "}
                    {filteredItems.length === 1 ? "item" : "items"}
                  </p>
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  {selectedCategoryId !== null && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategoryId(null)}
                      className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-background)] sm:w-auto"
                    >
                      All Items
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowAddItemForm((current) => !current)}
                    className="w-full rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-light)] sm:w-auto"
                  >
                    {showAddItemForm ? "Close" : "+ Add Item"}
                  </button>
                </div>
              </div>

              {/* Add Item */}
              {showAddItemForm && (
                <AddItemForm
                  categories={categories}
                  currencies={currencies}
                  onCreated={async () => {
                    const data = await getItems();

                    setItems(data);
                    setShowAddItemForm(false);
                  }}
                />
              )}

              {/* Items */}
              {filteredItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-white px-6 py-12 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary-light)] text-2xl">
                    📦
                  </div>

                  <h3 className="font-semibold text-[var(--color-text)]">
                    No items found
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
                    {searchText.trim()
                      ? "Try a different search term."
                      : selectedCategoryId !== null
                        ? "This category does not contain any items."
                        : "Your collection does not have any items yet."}
                  </p>

                  {selectedCategoryId !== null && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategoryId(null)}
                      className="mt-5 rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-background)]"
                    >
                      View All Items
                    </button>
                  )}

                  {!searchText.trim() && selectedCategoryId === null && (
                    <button
                      type="button"
                      onClick={() => setShowAddItemForm(true)}
                      className="mt-5 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-primary-dark)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-light)]"
                    >
                      + Add Item
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-3">
                  {filteredItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onClick={(itemId) => navigate(`/items/${itemId}`)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Delete Category Modal */}
      {deleteCategoryTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-category-title"
            className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-2xl sm:p-6"
          >
            <div className="mb-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-xl text-red-600">
                !
              </div>

              <h2
                id="delete-category-title"
                className="text-lg font-semibold text-[var(--color-text)]"
              >
                Delete Category?
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-[var(--color-text)]">
                  "{deleteCategoryTarget.name}"
                </span>
                ?
              </p>

              <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
                Categories with items or child categories cannot be deleted.
              </p>

              {deleteCategoryError && (
                <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
                  {deleteCategoryError}
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteCategoryTarget(null)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-background)] sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteCategory}
                className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 sm:w-auto"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
