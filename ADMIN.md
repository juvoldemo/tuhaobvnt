# Quản trị nội dung

1. Sao chép `.env.example` thành `.env.local` và đặt `ADMIN_PASSWORD` thành mật khẩu riêng, đủ dài.
2. Khởi động lại ứng dụng rồi truy cập `/admin` trên tên miền của website.
3. Đăng nhập, chọn tư vấn viên và chỉnh sửa phần **Về tôi**, ảnh chân dung hoặc tải ảnh vào bộ **Bảo Việt Nhân Thọ** / **Hành trình của tôi**.

Ảnh xuất hiện theo thứ tự tải lên; có thể gỡ ảnh khỏi bộ trong trang quản trị. Mỗi lần tải tối đa 10 ảnh, mỗi ảnh tối đa 10 MB. Ảnh được kiểm tra, tự xoay theo thông tin hướng ảnh và chuyển sang WebP (cạnh dài tối đa 2400 px). Mỗi tư vấn viên có dữ liệu và bộ ảnh độc lập.

Trên trang công khai, bấm vào một trong hai khối dưới **Về tôi** để mở slideshow. Dùng nút trước/sau hoặc phím mũi tên để chuyển ảnh, Esc hoặc nút đóng để thoát. Ảnh giữ nguyên tỷ lệ, không bị cắt; cửa sổ co theo ảnh trong giới hạn màn hình.

## Lưu trữ khi triển khai

Ứng dụng lưu hồ sơ JSON và ảnh trong `storage/` (không đưa vào Git). Có thể đặt `CONTENT_DIR` tới một thư mục có quyền ghi trên ổ đĩa bền vững. Cần sao lưu cả thư mục này. Máy chủ chạy một instance Node.js có thể dùng trực tiếp; nếu chạy nhiều instance cần chuyển sang cơ sở dữ liệu và kho ảnh dùng chung.

Filesystem của Vercel không phù hợp cho cách lưu này. Trước khi dùng quản trị trên Vercel, cần tích hợp kho ảnh và cơ sở dữ liệu bền vững (ví dụ Blob/S3 và Postgres), thay thế phần lưu trong `lib/content.js` và API tải ảnh. Chỉ thiết lập biến môi trường không làm filesystem của Vercel trở nên bền vững.

Cookie đăng nhập hết hạn sau 8 giờ. Khi triển khai production, dùng HTTPS. Đổi `ADMIN_PASSWORD` sẽ vô hiệu hóa các phiên đăng nhập cũ. Nếu chưa cấu hình mật khẩu, API không cho đăng nhập hoặc thay đổi dữ liệu.
