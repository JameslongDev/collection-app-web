import { supabase } from "../lib/supabase";

export interface Category {
  id: number;
  name: string;
  parent_id: number | null;
}

export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, parent_id, created_at, updated_at")
    .order("name");

  if (error) {
    throw error;
  }

  return data;
}

export async function createCategory(name: string, parentId: number | null) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User is not authenticated");
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({
      user_id: user.id,
      parent_id: parentId,
      name,
    })
    .select("id, name, parent_id, created_at, updated_at")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateCategory(
  id: number,
  name: string,
  parentId: number | null,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User is not authenticated");
  }

  const { data, error } = await supabase
    .from("categories")
    .update({
      name: name.trim(),
      parent_id: parentId,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, name, parent_id, created_at, updated_at")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteCategory(id: number): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User is not authenticated");
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }
}

export async function moveCategory(id: number, parentId: number | null) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User is not authenticated");
  }

  const { data, error } = await supabase
    .from("categories")
    .update({
      parent_id: parentId,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, name, parent_id, created_at, updated_at")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function canMoveCategory(
  categoryId: number,
  newParentId: number | null,
): Promise<boolean> {
  if (newParentId === null) {
    return true;
  }

  if (categoryId === newParentId) {
    return false;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User is not authenticated');
  }

  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, parent_id')
    .eq('user_id', user.id);

  if (error) {
    throw error;
  }

  const categoryMap = new Map(
    (categories ?? []).map((category) => [
      category.id,
      category.parent_id,
    ]),
  );

  let currentParentId: number | null = newParentId;

  while (currentParentId !== null) {
    if (currentParentId === categoryId) {
      return false;
    }

    currentParentId = categoryMap.get(currentParentId) ?? null;
  }

  return true;
}