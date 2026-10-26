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
