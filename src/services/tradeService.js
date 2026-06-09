// Importamos Supabase para comunicarnos con la base de datos.
import { supabase } from "../lib/supabaseClient";

// Crear un nuevo trade.
export async function createTrade(tradeData) {
  const { data, error } = await supabase
    .from("trades")
    .insert([tradeData])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Buscar todos los trades del usuario actual junto con sus imágenes.
export async function getUserTrades(userId) {
  const { data, error } = await supabase
    .from("trades")
    .select("*, trade_images(*)")
    .eq("user_id", userId)
    .order("trade_date", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

// Borrar un trade y sus imágenes si tiene.
export async function deleteTrade(tradeId, userId) {
  // Buscamos imágenes relacionadas al trade.
  const { data: images, error: imageFetchError } = await supabase
    .from("trade_images")
    .select("image_path")
    .eq("trade_id", tradeId)
    .eq("user_id", userId);

  if (imageFetchError) {
    throw imageFetchError;
  }

  // Si el trade tiene imágenes, las borramos del storage.
  if (images?.length > 0) {
    const imagePaths = images.map((image) => image.image_path);

    const { error: storageError } = await supabase.storage
      .from("trade-images")
      .remove(imagePaths);

    if (storageError) {
      throw storageError;
    }
  }

  // Borramos el trade de la base de datos.
  // Las filas de trade_images se borran solas por el ON DELETE CASCADE.
  const { error } = await supabase
    .from("trades")
    .delete()
    .eq("id", tradeId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return true;
}

// Buscar un solo trade por ID junto con sus imágenes.
export async function getTradeById(tradeId, userId) {
  const { data, error } = await supabase
    .from("trades")
    .select("*, trade_images(*)")
    .eq("id", tradeId)
    .eq("user_id", userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Actualizar un trade existente.
export async function updateTrade(tradeId, userId, tradeData) {
  const { data, error } = await supabase
    .from("trades")
    .update(tradeData)
    .eq("id", tradeId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}