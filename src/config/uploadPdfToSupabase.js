import { supabase } from "./clientSupabase";

// Función para limpiar el nombre del archivo y evitar caracteres inválidos en Supabase
const sanitizeFileName = (name) => {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^\w.-]/g, "");
};

const uploadPdfToSupabase = async (pdfFile, fileName) => {
  try {
    const sanitizedFileName = sanitizeFileName(fileName);

    const { data, error } = await supabase.storage
      .from("pdfs")
      .upload(sanitizedFileName, pdfFile, {
        upsert: true,
        contentType: "application/pdf",
      });

    if (error) {
      console.error("Error al subir el PDF:", error);
      return null;
    }

    const { data: publicUrl } = supabase.storage
      .from("pdfs")
      .getPublicUrl(sanitizedFileName);

    console.log("✅ PDF subido correctamente. URL pública:", publicUrl);
    return publicUrl.publicUrl;
  } catch (error) {
    console.error("❌ Error en uploadPdfToSupabase:", error);
    return null;
  }
};

export default uploadPdfToSupabase;
