import { supabase } from "../lib/supabase";

export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
}

export async function getCurrencies(): Promise<Currency[]> {
  const { data, error } = await supabase
    .from("currencies")
    .select("id, code, name, symbol")
    .order("code");

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function createCurrency(
  code: string,
  name: string,
  symbol: string,
): Promise<Currency> {
  const { data, error } = await supabase
    .from("currencies")
    .insert({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      symbol: symbol.trim(),
    })
    .select("id, code, name, symbol")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateCurrency(
  id: number,
  code: string,
  name: string,
  symbol: string,
): Promise<Currency> {
  const { data, error } = await supabase
    .from("currencies")
    .update({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      symbol: symbol.trim(),
    })
    .eq("id", id)
    .select("id, code, name, symbol")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteCurrency(id: number): Promise<void> {
  const { error } = await supabase.from("currencies").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
