# Guía de Integración de Cloudinary en el Frontend (React + Vite)

Esta guía explica paso a paso cómo subir imágenes directamente desde el frontend a Cloudinary (mediante **Unsigned Uploads**) y enviar la URL resultante al backend de MichiArcade.

\---

## 1\. Configuración de Cloudinary (Consola de Cloudinary)

Para permitir que el frontend suba imágenes de forma segura sin requerir claves API secretas, utilizaremos un **Upload Preset No Firmado (Unsigned)**.

1. Inicia sesión o regístrate de forma gratuita en [Cloudinary](https://cloudinary.com/).
2. Ve a **Settings** (icono de engranaje abajo a la izquierda) y navega a la sección **Upload**.
3. Desplázate hacia abajo hasta la sección **Upload presets** y haz clic en **Add upload preset**.
4. Realiza la siguiente configuración:

   * **Upload preset name:** Puedes usar uno generado o escribir uno personalizado (ej. `michiarcade\_preset`). *Anótalo.*
   * **Signing Mode:** Cambia este valor de *Signed* a **Unsigned** (Obligatorio).
   * **Folder (Opcional):** Puedes poner una carpeta donde se guardarán las imágenes (ej. `michiarcade`).
5. Haz clic en **Save** (Guardar).
6. Copia tu **Cloud Name** desde tu Dashboard principal de Cloudinary.

\---

## 2\. Implementación del Helper de Subida en React

Puedes crear un helper en JS/TS para subir la imagen a la API REST de Cloudinary:

```typescript
// src/utils/cloudinary.ts

interface CloudinaryResponse {
  secure\_url: string;
}

/\*\*
 \* Sube un archivo de imagen a Cloudinary usando un Upload Preset no firmado.
 \* @param file Archivo de imagen seleccionado desde un input
 \* @returns La URL segura de la imagen subida
 \*/
export async function uploadImageToCloudinary(file: File): Promise<string> {
  const cloudName = "TU\_CLOUD\_NAME"; // Reemplaza con tu Cloud Name de Cloudinary
  const uploadPreset = "TU\_UPLOAD\_PRESET"; // Reemplaza con tu Upload Preset (Unsigned)

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload\_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1\_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Error al subir la imagen a Cloudinary");
  }

  const data: CloudinaryResponse = await response.json();
  return data.secure\_url; // Esta es la URL que guardaremos en la base de datos
}
```

\---

## 3\. Ejemplo de Componente de Formulario (React)

Este componente maneja el formulario para ingresar un nuevo videojuego, realiza la subida a Cloudinary en el submit, y luego guarda el juego en el backend enviando la URL obtenida.

```tsx
import React, { useState } from "react";
import { uploadImageToCloudinary } from "./utils/cloudinary";

export function AddGameForm() {
  const \[title, setTitle] = useState("");
  const \[description, setDescription] = useState("");
  const \[link, setLink] = useState("");
  const \[imageFile, setImageFile] = useState<File | null>(null);
  const \[previewUrl, setPreviewUrl] = useState<string | null>(null);
  const \[loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files \&\& e.target.files\[0]) {
      const file = e.target.files\[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Vista previa local
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageFile) {
      alert("El título y la imagen son obligatorios");
      return;
    }

    setLoading(true);
    try {
      // Paso 1: Subir imagen a Cloudinary y obtener la URL
      const imageUrl = await uploadImageToCloudinary(imageFile);

      // Paso 2: Enviar los datos del juego al Backend
      const gamePayload = {
        title,
        description,
        link,
        imageUrl,
      };

      const backendResponse = await fetch("http://localhost:3000/games", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(gamePayload),
      });

      if (!backendResponse.ok) {
        throw new Error("Error al guardar el videojuego en el backend");
      }

      alert("Videojuego guardado con éxito!");
      
      // Limpiar formulario
      setTitle("");
      setDescription("");
      setLink("");
      setImageFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error(error);
      alert("Hubo un error en el proceso de registro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}>
      <h2>Agregar Nuevo Reto / Videojuego</h2>
      
      <label>Título:</label>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />

      <label>Descripción:</label>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

      <label>Enlace del Videojuego (URL):</label>
      <input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://example.com/mi-juego" />

      <label>Imagen del Juego:</label>
      <input type="file" accept="image/\*" onChange={handleImageChange} required />

      {previewUrl \&\& (
        <div style={{ marginTop: "10px" }}>
          <p>Vista previa:</p>
          <img src={previewUrl} alt="Vista previa" style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "8px" }} />
        </div>
      )}

      <button type="submit" disabled={loading} style={{ marginTop: "15px", padding: "10px", cursor: "pointer" }}>
        {loading ? "Subiendo e ingresando..." : "Guardar Videojuego"}
      </button>
    </form>
  );
}
```

\---

## 4\. Prompt Copiable para un Asistente de IA (Copilot / ChatGPT)

Si tu compañero está utilizando un asistente de codificación, puede copiar y pegar este prompt para generar la interfaz exacta:

> \*\*PROMPT PARA COMPAÑERO / ASISTENTE DE IA:\*\*
> "Estoy construyendo el frontend en React (Vite) para una plataforma arcade de retos llamada MichiArcade. Necesito implementar un componente de formulario para agregar nuevos juegos.
> El formulario debe capturar:
> 1. `title` (Título del juego - input de texto)
> 2. `description` (Descripción - textarea)
> 3. `link` (Enlace de juego - input de url)
> 4. `image` (Imagen del juego - input de tipo archivo con previsualización en vivo).
> 
> Al presionar el botón de enviar, el componente debe:
> 1. Subir la imagen mediante una petición POST multipart/form-data a la API de Cloudinary (`https://api.cloudinary.com/v1\_1/<TU\_CLOUD\_NAME>/image/upload`) usando el preset no firmado (`upload\_preset`) de mi cuenta.
> 2. Obtener el `secure\_url` del JSON retornado por Cloudinary.
> 3. Hacer una petición POST JSON al endpoint de mi backend `http://localhost:3000/games` enviando el payload: `{ title, description, link, imageUrl }`.
> 
> Por favor, genera el código de React con Typescript incluyendo los estados de carga (`loading`), errores, y usa clases de CSS correspondientes al estilo y disenio implementado ya en la plataforma."

