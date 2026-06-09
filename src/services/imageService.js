// Servicio para subir y leer imágenes privadas desde Supabase Storage.
import { supabase } from "../lib/supabaseClient";

// Cache simple para no pedir la misma URL firmada muchas veces.
const signedImageUrlCache = new Map();

// Limpia el nombre del archivo para evitar errores por espacios o símbolos raros.
function cleanFileName(fileName) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

// Crea una llave única para guardar cada imagen en cache.
function createCacheKey(bucketName, imagePath) {
  return `${bucketName}:${imagePath}`;
}

// Lee una URL firmada desde cache si todavía no expiró.
export function getCachedSignedImageUrlSync(bucketName, imagePath) {
  if (!bucketName || !imagePath) return "";

  const cacheKey = createCacheKey(bucketName, imagePath);
  const cachedItem = signedImageUrlCache.get(cacheKey);

  if (!cachedItem) return "";

  if (Date.now() > cachedItem.expiresAt) {
    signedImageUrlCache.delete(cacheKey);
    return "";
  }

  return cachedItem.url;
}

// Limpia una URL específica del cache.
export function clearSignedImageUrlCache(bucketName, imagePath) {
  if (!bucketName || !imagePath) return;

  const cacheKey = createCacheKey(bucketName, imagePath);
  signedImageUrlCache.delete(cacheKey);
}

// Sube una imagen relacionada a una nota del cuaderno.
export async function uploadNoteImage({ file, userId, noteId, caption }) {
  const safeName = cleanFileName(file.name);
  const imagePath = `${userId}/${noteId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("note-images")
    .upload(imagePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data, error } = await supabase
    .from("notebook_images")
    .insert([
      {
        note_id: noteId,
        user_id: userId,
        image_path: imagePath,
        caption,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Sube una imagen relacionada a un trade.
export async function uploadTradeImage({
  file,
  userId,
  tradeId,
  caption,
  imageType,
}) {
  const safeName = cleanFileName(file.name);
  const imagePath = `${userId}/${tradeId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("trade-images")
    .upload(imagePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data, error } = await supabase
    .from("trade_images")
    .insert([
      {
        trade_id: tradeId,
        user_id: userId,
        image_path: imagePath,
        caption,
        image_type: imageType || "setup",
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Crea una URL temporal para poder ver imágenes privadas.
export async function getSignedImageUrl(bucketName, imagePath, options = {}) {
  const { forceRefresh = false } = options;

  if (!bucketName || !imagePath) return "";

  const cacheKey = createCacheKey(bucketName, imagePath);

  if (!forceRefresh) {
    const cachedUrl = getCachedSignedImageUrlSync(bucketName, imagePath);

    if (cachedUrl) {
      return cachedUrl;
    }
  }

  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(imagePath, 60 * 60);

  if (error) {
    throw error;
  }

  const signedUrl = data.signedUrl;

  // La URL dura 60 minutos. La guardamos por 55 para evitar usarla justo al expirar.
  signedImageUrlCache.set(cacheKey, {
    url: signedUrl,
    expiresAt: Date.now() + 55 * 60 * 1000,
  });

  return signedUrl;
}

// Sube una imagen de perfil circular para el usuario.
export async function uploadProfileImage({ file, userId, oldAvatarPath }) {
  const safeName = cleanFileName(file.name);
  const imagePath = `${userId}/avatar-${Date.now()}-${safeName}`;

  // Si ya existía una foto anterior, intentamos borrarla.
  if (oldAvatarPath) {
    await supabase.storage.from("profile-images").remove([oldAvatarPath]);
    clearSignedImageUrlCache("profile-images", oldAvatarPath);
  }

  const { error: uploadError } = await supabase.storage
    .from("profile-images")
    .upload(imagePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ avatar_path: imagePath })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}