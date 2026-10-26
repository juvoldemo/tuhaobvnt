# Quản trị nội dung

## Dùng Supabase trên Vercel

1. Trong Supabase SQL Editor, chạy toàn bộ `supabase/setup.sql`. Bảng `advisor_content` chỉ cho server đọc/ghi; bucket `advisor-media` cho phép xem ảnh công khai.
2. Trong `.env.local`, đặt `SUPABASE_URL` bằng địa chỉ API gốc (không phải đường dẫn Studio `/project/default`), `SUPABASE_SECRET_KEY` bằng Secret key hoặc legacy service_role, `SUPABASE_STORAGE_BUCKET=advisor-media`.
3. Chạy `npm run content:migrate` trên máy đang có dữ liệu cũ. Lệnh chuyển JSON và ảnh lên Supabase, giữ thứ tự/thumbnail và không ghi đè hồ sơ đã tồn tại trên Supabase.
4. Đặt cùng các biến `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_STORAGE_BUCKET` và `ADMIN_PASSWORD` trong Vercel Environment Variables rồi redeploy. Không thêm tiền tố `NEXT_PUBLIC_` cho khóa bí mật.
5. Sau khi kết nối, nội dung lưu và ảnh upload trong admin được ghi trực tiếp vào Supabase; không cần export hoặc deploy lại khi sửa nội dung.

Thiếu một trong hai biến kết nối sẽ báo lỗi cấu hình, tránh lưu nhầm sang máy cục bộ. Nếu Supabase trả lỗi, ứng dụng báo lỗi thay vì âm thầm ghi sang ổ đĩa. Cập nhật dùng version để tránh ghi đè nội dung từ phiên khác. Xóa ảnh khỏi bộ chỉ gỡ tham chiếu, không xóa vật lý file trong bucket.

Ảnh được tối ưu trong trình duyệt và gửi từng ảnh, rồi máy chủ kiểm tra/chuyển WebP trước khi đưa vào Storage. Cách này tránh gửi nhiều ảnh lớn trong một request tới Vercel. Tiến độ hiển thị theo toàn bộ số ảnh đã chọn.

## Đưa dữ liệu trên máy lên website

Chạy `npm run content:export` sau khi chỉnh nội dung hoặc ảnh trong admin trên máy. Lệnh tạo bản nội dung công khai tại `data/published-content.json` và sao chép các ảnh được tham chiếu vào `public/uploads/`. Commit và push cả hai đường dẫn cùng mã nguồn, rồi triển khai lại. Website sẽ đọc bản nội dung này khi không có dữ liệu trong `storage/`; mật khẩu và biến môi trường không nằm trong bản xuất.

Đây là bản dữ liệu đi kèm mỗi lần triển khai, không phải kho dữ liệu trực tuyến. Sửa/upload qua admin trực tiếp trên Vercel vẫn cần tích hợp cơ sở dữ liệu và kho ảnh bền vững. Sau mỗi lần sửa trên máy, cần xuất và triển khai lại để website nhận nội dung mới.

1. Sao chép `.env.example` thành `.env.local` và đặt `ADMIN_PASSWORD` thành mật khẩu riêng, đủ dài.
2. Khởi động lại ứng dụng rồi truy cập `/admin` trên tên miền của website.
3. Đăng nhập, chọn tư vấn viên và chỉnh sửa phần **Về tôi**, ảnh chân dung hoặc tải ảnh vào bộ **Bảo Việt Nhân Thọ** / **Hành trình của tôi**.

Ảnh xuất hiện theo thứ tự tải lên; có thể gỡ ảnh khỏi bộ trong trang quản trị. Mỗi lần tải tối đa 10 ảnh, mỗi ảnh tối đa 10 MB. Ảnh được kiểm tra, tự xoay theo thông tin hướng ảnh và chuyển sang WebP (cạnh dài tối đa 2400 px). Mỗi tư vấn viên có dữ liệu và bộ ảnh độc lập.

Trên trang công khai, bấm vào một trong hai khối dưới **Về tôi** để mở slideshow. Dùng nút trước/sau hoặc phím mũi tên để chuyển ảnh, Esc hoặc nút đóng để thoát. Ảnh giữ nguyên tỷ lệ, không bị cắt; cửa sổ co theo ảnh trong giới hạn màn hình.

## Lưu trữ khi triển khai

Ứng dụng lưu hồ sơ JSON và ảnh trong `storage/` (không đưa vào Git). Có thể đặt `CONTENT_DIR` tới một thư mục có quyền ghi trên ổ đĩa bền vững. Cần sao lưu cả thư mục này. Máy chủ chạy một instance Node.js có thể dùng trực tiếp; nếu chạy nhiều instance cần chuyển sang cơ sở dữ liệu và kho ảnh dùng chung.

Filesystem của Vercel không phù hợp cho cách lưu này. Trước khi dùng quản trị trên Vercel, cần tích hợp kho ảnh và cơ sở dữ liệu bền vững (ví dụ Blob/S3 và Postgres), thay thế phần lưu trong `lib/content.js` và API tải ảnh. Chỉ thiết lập biến môi trường không làm filesystem của Vercel trở nên bền vững.

Cookie đăng nhập hết hạn sau 8 giờ. Khi triển khai production, dùng HTTPS. Đổi `ADMIN_PASSWORD` sẽ vô hiệu hóa các phiên đăng nhập cũ. Nếu chưa cấu hình mật khẩu, API không cho đăng nhập hoặc thay đổi dữ liệu.
