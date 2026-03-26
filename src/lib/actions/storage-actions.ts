'use server'

import { revalidatePath } from 'next/cache';

/**
 * SIGAI Storage Actions
 * Handles file uploads to the external storage API.
 */
export async function uploadFile(formData: FormData) {
  try {
    const STORAGE_API_URL = process.env.NEXT_PUBLIC_STORAGE_API_URL;
    const STORAGE_API_KEY = process.env.STORAGE_API_KEY;
    const STORAGE_S3_URL = process.env.NEXT_PUBLIC_STORAGE_S3_URL || "https://s3.licitacionesefectivas.com";

    if (!STORAGE_API_URL) {
      throw new Error('NEXT_PUBLIC_STORAGE_API_URL is not defined in environment variables.');
    }

    // Construction of the API URL with query parameters as seen in the licitacionesefectivas template
    let apiURL = `${STORAGE_API_URL}/files/upload?app=SIGAI&visibility=public&tenantId=default&folder=SIGAI/perfiles`;

    // Returning to 'file' (singular) as confirmed by the API health check
    const file = formData.get('file') as File;
    if (!file) {
      throw new Error('No se encontró el archivo en la petición.');
    }

    const externalFormData = new FormData();
    externalFormData.append('file', file, file.name);

    const response = await fetch(apiURL, {
      method: 'POST',
      headers: {
        'x-api-key': STORAGE_API_KEY || '',
      },
      body: externalFormData,
    });

    const data = await response.json();
    console.log('Storage API Response Data Switched:', data);

    if (!response.ok) {
      console.error('Storage API Error Response:', data);
      throw new Error(data.message || `Error ${response.status}: ${JSON.stringify(data)}`);
    }

    // Reconstruction of the final public URL as seen in the template
    let finalUrl = "";
    if (data.bucket && data.objectKey) {
      const baseUrl = STORAGE_S3_URL.replace(/\/$/, ""); 
      finalUrl = `${baseUrl}/${data.bucket}/${data.objectKey}`;
    } else if (data.url) {
      finalUrl = data.url;
    }

    // Revalidate paths as needed after a successful upload
    revalidatePath('/dashboard');
    
    return {
      success: true,
      url: finalUrl, 
      filename: data.filename || file.name
    };

  } catch (error: any) {
    console.error('Storage Upload Error:', error);
    return {
      success: false,
      error: error.message || 'Internal server error during upload'
    };
  }
}
