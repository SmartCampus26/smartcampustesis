// app/Camera/context/SavedContext.tsx
// CONTEXTO PARA GUARDAR FOTOS DE LA CÁMARA

// Importa React y herramientas para crear contexto y manejar estado
import React, { createContext, ReactNode, useContext, useState } from 'react';
// Herramienta para comprimir y modificar imágenes
import * as ImageManipulator from 'expo-image-manipulator';
// Conexión a Supabase
import { supabase } from '../lib/Supabase';
// Utilidad para convertir base64 a binario
import { decode } from 'base64-arraybuffer';

// INTERFAZ: FOTO GUARDADA
// Define cómo se almacena una foto en memoria
interface SavedPhoto {
  id: number;  // Identificador único
  uri: string; // Ruta local de la imagen
  timestamp: number; // Fecha en milisegundos
  supabaseUrl?: string; // URL de Supabase después de subir
  size?: number; // Tamaño en bytes después de comprimir
}

// INTERFAZ: CONTEXTO
// Define qué datos y funciones expone el contexto
type SavedContextType = {
  savedPhotos: SavedPhoto[]; // Lista de fotos guardadas
  addSavedPhoto: (uri: string) => Promise<void>; // Agregar una nueva foto
  clearSavedPhotos: () => void; // Borrar todas las fotos
  uploadPhotosToSupabase: (idReporte: number) => Promise<string[]>; // Subir fotos
  getPhotosSummary: () => { count: number; totalSizeKB: number }; // Resumen
};

// CREACIÓN DEL CONTEXTO
/**
 * 🔧 chore(context): creación del contexto con valor inicial undefined
 */
const SavedContext = createContext<SavedContextType | undefined>(undefined);

// PROVIDER DEL CONTEXTO
// Envuelve la app y maneja las fotos guardadas
/**
 * ✨ feat(context): provider del contexto con compresión y subida a Supabase
 */
export function SavedProvider({ children }: { children: ReactNode }) {
  // Estado donde se almacenan las fotos
  const [savedPhotos, setSavedPhotos] = useState<SavedPhoto[]>([]);

  // FUNCIÓN: agregar y comprimir foto
  /**
   * ✨ feat(actions): agrega y comprime una nueva foto
   * 
   * @param uri - URI de la foto a guardar
   */
  const addSavedPhoto = async (uri: string) => {
    try {
      // 🗜️ Comprimir imagen a 1024px máximo y calidad 70%
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1024 } }], // Mantiene aspecto
        { 
          compress: 0.7, // Calidad 70%
          format: ImageManipulator.SaveFormat.JPEG 
        }
      );

      // Obtener tamaño del archivo comprimido
      const response = await fetch(manipulatedImage.uri);
      const blob = await response.blob();
      const size = blob.size;
      
      // Crear objeto de la foto
      const newPhoto: SavedPhoto = {
        id: Date.now(),
        uri: manipulatedImage.uri, // URI de imagen comprimida
        timestamp: Date.now(),
        size,
      };
      
      // Guardar foto en el estado
      setSavedPhotos((prev) => [...prev, newPhoto]);
      console.log(`✅ Foto comprimida: ${(size / 1024).toFixed(1)} KB`);
    } catch (error) {
      console.error('❌ Error al comprimir foto:', error);
      throw error;
    }
  };

  // FUNCIÓN: subir fotos a Supabase
  /**
   * 📤 feat(supabase): sube todas las fotos a Supabase Storage
   * 
   * @param idReporte - ID del reporte asociado
   * @returns Array de URLs públicas de Supabase
   */
  const uploadPhotosToSupabase = async (idReporte: number): Promise<string[]> => {
    const urls: string[] = [];
  
    for (const foto of savedPhotos) {
      try {
        // Leer imagen como blob
        const response = await fetch(foto.uri);
        const blob = await response.blob();
        
        // Convertir imagen a base64
        const reader = new FileReader();
        const base64Data = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            const base64 = reader.result as string;
            const base64Clean = base64.split(',')[1];
            resolve(base64Clean);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
  
        // Generar nombre único para el archivo
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const fileName = `reporte_${idReporte}_${timestamp}_${random}.jpg`;
        const filePath = `reportes/${fileName}`;
  
        // Subir imagen a Supabase Storage
        const { data, error } = await supabase.storage
          .from('imgReporte')
          .upload(filePath, decode(base64Data), {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: false,
          });
  
        if (error) throw error;
  
        // Obtener URL pública
        const { data: urlData } = supabase.storage
          .from('imgReporte')
          .getPublicUrl(filePath);
  
        urls.push(urlData.publicUrl);
  
        // Actualizar foto local con URL de Supabase
        setSavedPhotos((prev) =>
          prev.map((p) =>
            p.id === foto.id ? { ...p, supabaseUrl: urlData.publicUrl } : p
          )
        );
  
        console.log(`✅ Foto subida a Supabase: ${fileName}`);
      } catch (error) {
        console.error('❌ Error al subir foto a Supabase:', error);
        throw error;
      }
    }
  
    // 🆕 AQUÍ VA LA ACTUALIZACIÓN A LA BASE DE DATOS
    // Después de subir TODAS las fotos
    if (urls.length > 0) {
      const { error } = await supabase
        .from('reporte')
        .update({ imgReporte: urls })
        .eq('idReporte', idReporte);
  
        if (error) {
          console.error('❌ Error al guardar URLs en BD:', error);
          throw error;
        }
        
        console.log(`✅ ${urls.length} URLs guardadas en BD para reporte ${idReporte}`);
      }
  
    return urls;
  };
  // FUNCIÓN: limpiar fotos guardadas
  /**
   * 🔥 chore(cleanup): limpia todas las fotos guardadas (reset)
   */
  const clearSavedPhotos = () => {
    setSavedPhotos([]);
  };

  // FUNCIÓN: resumen de fotos guardadas
  /**
   * 📊 feat(stats): obtiene resumen de fotos guardadas
   */
  const getPhotosSummary = () => {
    const totalSizeKB = savedPhotos.reduce((sum, photo) => {
      return sum + (photo.size || 0);
    }, 0) / 1024;

    return {
      count: savedPhotos.length,
      totalSizeKB: Math.round(totalSizeKB),
    };
  };

  // PROVIDER
  return (
    <SavedContext.Provider
      value={{
        savedPhotos,
        addSavedPhoto,
        clearSavedPhotos,
        uploadPhotosToSupabase,
        getPhotosSummary,
      }}
    >
      {children}
    </SavedContext.Provider>
  );
}

/**
 * ✨ feat(hooks): hook personalizado para acceder al contexto
 */
// HOOK PERSONALIZADO
// Facilita el uso del contexto
export function useSaved() {
  const context = useContext(SavedContext);
  
  if (!context) {
    throw new Error('❌ useSaved debe usarse dentro de SavedProvider');
  }
  
  return context;
}
// Exportar tipos
export type { SavedContextType, SavedPhoto };

