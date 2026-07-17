const cloudName = 'slsavbwe';
const uploadPreset = 'ml_default';
const maxFileSize = 10 * 1024 * 1024;

export async function uploadLogbookPhoto(file) {
  if (!file) return null;
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file.');
  }
  if (file.size > maxFileSize) {
    throw new Error('Image must be 10 MB or smaller.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'smartlogbook');

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'Cloudinary upload failed.');
  }

  return {
    name: file.name,
    url: result.secure_url,
    publicId: result.public_id,
  };
}
