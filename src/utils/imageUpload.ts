import { supabase } from './supabase';

const BUCKET_NAME = 'medicamentos-imagenes';

/**
 * Sube una imagen a Supabase Storage
 * @param file - Archivo de imagen a subir
 * @param medicamentoId - ID del medicamento para nombrar el archivo
 * @returns URL pública de la imagen o null si falla
 */
export const uploadMedicamentoImage = async (
  file: File,
  medicamentoId: string
): Promise<string | null> => {
  try {
    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      console.error('Tipo de archivo no permitido:', file.type);
      return null;
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error('Archivo muy grande. Máximo 5MB');
      return null;
    }

    // Generar nombre de archivo único
    const fileExt = file.name.split('.').pop();
    const fileName = `${medicamentoId}.${fileExt}`;
    const filePath = `${fileName}`;

    // Eliminar imagen anterior si existe
    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (deleteError && deleteError.message !== 'Object not found') {
      console.warn('Error al eliminar imagen anterior:', deleteError);
    }

    // Subir nueva imagen
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('Error al subir imagen:', error);
      return null;
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error en uploadMedicamentoImage:', error);
    return null;
  }
};

/**
 * Elimina una imagen de Supabase Storage
 * @param imageUrl - URL de la imagen a eliminar
 */
export const deleteMedicamentoImage = async (imageUrl: string): Promise<void> => {
  try {
    if (!imageUrl) return;

    // Extraer el path del archivo de la URL
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName]);

    if (error && error.message !== 'Object not found') {
      console.error('Error al eliminar imagen:', error);
    }
  } catch (error) {
    console.error('Error en deleteMedicamentoImage:', error);
  }
};

/**
 * Comprime una imagen antes de subirla (opcional)
 * @param file - Archivo de imagen original
 * @param maxWidth - Ancho máximo deseado
 * @param quality - Calidad de compresión (0-1)
 * @returns Promise con el archivo comprimido
 */
export const compressImage = (
  file: File,
  maxWidth: number = 800,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Redimensionar si es necesario
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo obtener contexto del canvas'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('No se pudo comprimir la imagen'));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Error al cargar la imagen'));
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo'));
  });
};
