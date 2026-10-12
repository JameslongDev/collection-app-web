import { supabase } from "../lib/supabase";

function getRelatedObject<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export interface Item {
  id: number;
  category_id: number;
  currency_id: number;
  name: string;
  purchase_price: number | null;
  purchase_date: string | null;
  details: string | null;
  status: string;
  image_path: string | null;
  created_at: string;
  updated_at: string;

  category: {
    id: number;
    name: string;
  } | null;

  currency: {
    id: number;
    code: string;
    name: string;
    symbol: string;
  } | null;
}

export async function getItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from("items")
    .select(
      `
      id,
      category_id,
      currency_id,
      name,
      purchase_price,
      purchase_date,
      details,
      status,
      image_path,
      created_at,
      updated_at,
      category:categories!items_category_id_fkey (
        id,
        name
      ),
      currency:currencies!items_currency_id_fkey (
        id,
        code,
        name,
        symbol
      )
    `,
    )
    .order("name");

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => {
    const category = getRelatedObject(item.category);
    const currency = getRelatedObject(item.currency);

    if (!category || !currency) {
      throw new Error("Item category or currency data is missing");
    }

    return {
      ...item,
      category,
      currency,
    };
  });
}

export async function getItemById(id: number): Promise<Item> {
  const { data, error } = await supabase
    .from("items")
    .select(
      `
      id,
      category_id,
      currency_id,
      name,
      purchase_price,
      purchase_date,
      details,
      status,
      image_path,
      created_at,
      updated_at,
      category:categories!items_category_id_fkey (
        id,
        name
      ),
      currency:currencies!items_currency_id_fkey (
        id,
        code,
        name,
        symbol
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  const category = getRelatedObject(data.category);
  const currency = getRelatedObject(data.currency);

  if (!category || !currency) {
    throw new Error("Item category or currency data is missing");
  }

  return {
    ...data,
    category,
    currency,
  };
}

export async function getItemImageUrl(imagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("collection-images")
    .createSignedUrl(imagePath, 60 * 60);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}

export async function createItem(input: {
  categoryId: number;
  currencyId: number;
  name: string;
  purchasePrice: number | null;
  purchaseDate: string | null;
  details: string | null;
  status: string;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User is not authenticated");
  }

  const { data, error } = await supabase
    .from("items")
    .insert({
      user_id: user.id,
      category_id: input.categoryId,
      currency_id: input.currencyId,
      name: input.name,
      purchase_price: input.purchasePrice,
      purchase_date: input.purchaseDate,
      details: input.details,
      status: input.status,
    })
    .select(
      `
      id,
      category_id,
      currency_id,
      name,
      purchase_price,
      purchase_date,
      details,
      status,
      image_path,
      created_at,
      updated_at,
      category:categories!items_category_id_fkey (
        id,
        name
      ),
      currency:currencies!items_currency_id_fkey (
        id,
        code,
        name,
        symbol
      )
    `,
    )
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function uploadItemImage(
  itemId: number,
  file: File,
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User is not authenticated");
  }

  const fileExtension = file.name.split(".").pop()?.toLowerCase();

  if (!fileExtension) {
    throw new Error("Invalid file name");
  }

  const filePath = `${user.id}/${itemId}/${crypto.randomUUID()}.${fileExtension}`;

  const { error: uploadError } = await supabase.storage
    .from("collection-images")
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { error: updateError } = await supabase
    .from("items")
    .update({
      image_path: filePath,
    })
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (updateError) {
    await supabase.storage.from("collection-images").remove([filePath]);

    throw updateError;
  }

  return filePath;
}

export async function updateItem(input: {
  id: number;
  categoryId: number;
  currencyId: number;
  name: string;
  purchasePrice: number | null;
  purchaseDate: string | null;
  details: string | null;
  status: string;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User is not authenticated");
  }

  const { data, error } = await supabase
    .from("items")
    .update({
      category_id: input.categoryId,
      currency_id: input.currencyId,
      name: input.name,
      purchase_price: input.purchasePrice,
      purchase_date: input.purchaseDate,
      details: input.details,
      status: input.status,
    })
    .eq("id", input.id)
    .eq("user_id", user.id)
    .select(
      `
      id,
      category_id,
      currency_id,
      name,
      purchase_price,
      purchase_date,
      details,
      status,
      image_path,
      created_at,
      updated_at,
      category:categories!items_category_id_fkey (
        id,
        name
      ),
      currency:currencies!items_currency_id_fkey (
        id,
        code,
        name,
        symbol
      )
    `,
    )
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteItem(id: number): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User is not authenticated");
  }

  // ดึง image_path ก่อน เพราะหลังลบ Item แล้วจะไม่มีข้อมูลนี้ให้ใช้
  const { data: item, error: fetchError } = await supabase
    .from("items")
    .select("image_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  const { error: deleteError } = await supabase
    .from("items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (deleteError) {
    throw deleteError;
  }

  // ลบรูปจาก Storage หลังจากลบ Item สำเร็จ
  if (item.image_path) {
    const { error: storageError } = await supabase.storage
      .from("collection-images")
      .remove([item.image_path]);

    if (storageError) {
      console.error("Item deleted, but image deletion failed:", storageError);
    }
  }
}

export async function updateItemImage(
  itemId: number,
  file: File,
  oldImagePath: string | null,
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User is not authenticated");
  }

  const fileExtension = file.name.split(".").pop()?.toLowerCase();

  if (!fileExtension) {
    throw new Error("Invalid file name");
  }

  const newFilePath = `${user.id}/${itemId}/${crypto.randomUUID()}.${fileExtension}`;

  const { error: uploadError } = await supabase.storage
    .from("collection-images")
    .upload(newFilePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { error: updateError } = await supabase
    .from("items")
    .update({
      image_path: newFilePath,
    })
    .eq("id", itemId)
    .eq("user_id", user.id);

  if (updateError) {
    await supabase.storage.from("collection-images").remove([newFilePath]);

    throw updateError;
  }

  if (oldImagePath) {
    const { error: deleteOldError } = await supabase.storage
      .from("collection-images")
      .remove([oldImagePath]);

    if (deleteOldError) {
      console.error(
        "New image uploaded, but old image deletion failed:",
        deleteOldError,
      );
    }
  }

  return newFilePath;
}
