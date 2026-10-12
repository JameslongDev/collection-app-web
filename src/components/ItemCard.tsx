import { useEffect, useState } from "react";
import type { Item } from "../services/itemService";
import { getItemImageUrl } from "../services/itemService";
import {
  getItemStatusClassName,
  getItemStatusLabel,
} from "../utils/itemStatus";

interface ItemCardProps {
  item: Item;
  onClick: (itemId: number) => void;
}

function ItemCard({ item, onClick }: ItemCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadImage = async () => {
      if (!item.image_path) {
        setImageUrl(null);
        return;
      }

      try {
        const url = await getItemImageUrl(item.image_path);

        if (!cancelled) {
          setImageUrl(url);
        }
      } catch (error) {
        console.error(`Failed to load image for item ${item.id}:`, error);

        if (!cancelled) {
          setImageUrl(null);
        }
      }
    };

    loadImage();

    return () => {
      cancelled = true;
    };
  }, [item.id, item.image_path]);

  const statusLabel = getItemStatusLabel(item.status);

  const statusClassName = getItemStatusClassName(item.status);

  return (
    <button
      type="button"
      onClick={() => onClick(item.id)}
      className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[var(--color-primary-light)]"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[var(--color-background)]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-[var(--color-background)] to-[var(--color-primary-light)] text-[var(--color-text-muted)]">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
              📦
            </div>

            <span className="text-xs font-medium">No Image</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col p-4">
        {/* Category */}
        <p className="truncate text-xs font-medium text-[var(--color-primary)]">
          {item.category?.name ?? "Uncategorized"}
        </p>

        {/* Item Name */}
        <h3 className="mt-1 truncate text-sm font-semibold text-[var(--color-text)] sm:text-base">
          {item.name}
        </h3>

        {/* Bottom Info */}
        <div className="mt-4 flex min-w-0 items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] text-[var(--color-text-muted)] sm:text-xs">
              Purchase Price
            </p>

            <p className="mt-0.5 truncate text-sm font-semibold text-[var(--color-text)] sm:text-base">
              {item.purchase_price ?? "-"} {item.currency?.code ?? ""}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium sm:text-xs ${statusClassName}`}
          >
            {statusLabel}
          </span>
        </div>
      </div>
    </button>
  );
}

export default ItemCard;
