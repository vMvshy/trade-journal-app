// Servicio para crear y leer notas del cuaderno.
import { supabase } from "../lib/supabaseClient";

// Crear una nota nueva.
export async function createNote(noteData) {
  const { data, error } = await supabase
    .from("notebook_notes")
    .insert([noteData])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Obtener todas las notas del usuario actual.
export async function getUserNotes(userId) {
  const { data, error } = await supabase
    .from("notebook_notes")
    .select("*, notebook_images(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

// Borrar una nota y sus imágenes.
export async function deleteNote(noteId, userId) {
  // Buscamos las imágenes de la nota.
  const { data: images, error: imageFetchError } = await supabase
    .from("notebook_images")
    .select("image_path")
    .eq("note_id", noteId)
    .eq("user_id", userId);

  if (imageFetchError) {
    throw imageFetchError;
  }

  // Si hay imágenes, las borramos del storage.
  if (images?.length > 0) {
    const imagePaths = images.map((image) => image.image_path);

    const { error: storageError } = await supabase.storage
      .from("note-images")
      .remove(imagePaths);

    if (storageError) {
      throw storageError;
    }
  }

  // Borramos la nota de la base de datos.
  // Las imágenes relacionadas se borran por ON DELETE CASCADE.
  const { error } = await supabase
    .from("notebook_notes")
    .delete()
    .eq("id", noteId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return true;
}