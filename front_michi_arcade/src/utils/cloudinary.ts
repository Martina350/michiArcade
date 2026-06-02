interface CloudinaryResponse {
  secure_url: string
}

/**
 * Sube un archivo de imagen o Blob a Cloudinary usando un Upload Preset no firmado.
 * @param file Archivo de imagen o Blob
 * @returns La URL segura de la imagen subida
 */
export async function uploadImageToCloudinary(file: File | Blob): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  const formData = new FormData()
  formData.append('file', file, 'upload.jpg')
  formData.append('upload_preset', uploadPreset)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    throw new Error('Error al subir la imagen a Cloudinary')
  }

  const data: CloudinaryResponse = await response.json()
  return data.secure_url
}
