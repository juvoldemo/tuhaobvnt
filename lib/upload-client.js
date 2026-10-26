export async function prepareUploadImage(file) {
  // Keep each request below the serverless payload limit, even for large photos.
  const image = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 2400 / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.9, 0.8, 0.65]) {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', quality));
      if (blob && blob.size < 3.5 * 1024 * 1024) return new File([blob], file.name, { type: blob.type });
    }
    throw new Error('Ảnh quá lớn sau khi tối ưu. Hãy chọn ảnh có kích thước nhỏ hơn.');
  } finally { image.close(); }
}
export function uploadWithProgress(url, form, onProgress) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', url);
    request.responseType = 'json';
    request.upload.onprogress = event => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    request.upload.onload = () => onProgress(1);
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) resolve(request.response);
      else reject(new Error(request.response?.error || 'Không tải được ảnh. Vui lòng thử lại.'));
    };
    request.onerror = () => reject(new Error('Mất kết nối khi tải ảnh. Hãy kiểm tra bộ ảnh trước khi tải lại.'));
    request.onabort = () => reject(new Error('Đã dừng tải ảnh.'));
    request.send(form);
  });
}
