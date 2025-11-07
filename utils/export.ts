import { writeAsStringAsync } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Alert, Platform } from "react-native";
import { Task } from "../types";

/**
 * Exporta las tareas como archivo JSON (compatible con web y móvil).
 * En móvil usa expo-file-system (SAF) y expo-sharing para guardar/compartir.
 * En web crea una descarga directa vía Blob.
 */
export async function exportTasksAsJSON(tasks: Task[]) {
  try {
    if (!tasks?.length) {
      Alert.alert("Error", "No hay tareas para exportar.");
      return;
    }

    const fileName = "tareas.json";
    const json = JSON.stringify(tasks, null, 2);

    // 📱 Móvil: guardar y compartir
    if (Platform.OS !== "web") {
      // En móvil, creamos un archivo temporal
      const tempDir = `${Platform.OS === 'ios' ? '' : 'file://'}${Platform.OS === 'android' ? '/data/user/0/com.example.app/cache/' : '/tmp/'}`; 
      const fileUri = `${tempDir}${fileName}`;
      
      // Guardar el archivo
      await writeAsStringAsync(fileUri, json);

      // Intentar compartir
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: `Exportar ${fileName}`,
          UTI: "public.json", // para iOS
        });
      } else {
        throw new Error("Compartir no está disponible en este dispositivo.");
      }

      console.log("✅ Archivo exportado y compartido:", fileUri);
      return;
    }

    // 💻 Web: descarga vía Blob
    const blob = new Blob([json], { 
      type: "application/json;charset=utf-8"
    });
    
    // Crear y activar enlace de descarga
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log("✅ Archivo preparado para descarga web");

  } catch (err: any) {
    console.error("❌ Error exportando tareas:", err);
    alert("Error al exportar tareas. Revisa la consola para más detalles.");
  }
}
