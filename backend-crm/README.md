# Backend CRM API Documentation

Tài liệu hướng dẫn kết nối và tích hợp API cho đội ngũ Frontend.

## 1. Thông tin cấu hình chung
*   **Base URL (Môi trường Local)**: `http://localhost:8080` (Mặc định nếu không đổi PORT)
*   **Global Prefix**: Các API đều có tiền tố là `/api` (ngoại trừ các endpoint lấy file tĩnh như ảnh).
*   **Định dạng dữ liệu mặc định**: `application/json` (ngoại trừ API upload file).

## 2. Xác thực (Authentication / JWT)
Hệ thống sử dụng JWT Token để xác thực và phân quyền người dùng. 
Sau khi gọi API đăng nhập thành công (`/api/auth/login`), Backend sẽ trả về một chuỗi `token`.

Với các API yêu cầu quyền truy cập (được gắn mác `[Auth]` ở dưới), Frontend **bắt buộc** đính kèm Token này vào Header của mỗi HTTP Request:

```http
Authorization: Bearer <chuỗi_token_của_bạn_ở_đây>
```

> **Lưu ý**: Nếu token không hợp lệ hoặc hết hạn, server sẽ trả về lỗi `401 Unauthorized` hoặc `403 Forbidden`. Frontend cần bắt lỗi này để điều hướng người dùng quay lại trang Đăng nhập.

---

## 3. Danh sách API Endpoints

### 3.1. Authentication (Xác thực và Tài khoản)

| Phương thức | Endpoint | Yêu cầu Token | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Không | Đăng nhập hệ thống, nhận token xác thực. |
| `POST` | `/api/auth/register` | Có `[Auth]` | Đăng ký tài khoản Admin mới (Chỉ dành cho những ai đã đăng nhập). |

### 3.2. Products (Quản lý sản phẩm)

| Phương thức | Endpoint | Yêu cầu Token | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Không | Lấy danh sách tất cả sản phẩm đang có. |
| `POST` | `/api/products` | Có `[Auth]` | Thêm một sản phẩm mới. |
| `PUT` | `/api/products/:id` | Có `[Auth]` | Cập nhật toàn bộ thông tin sản phẩm dựa theo ID. |
| `DELETE` | `/api/products/:id` | Có `[Auth]` | Xóa một sản phẩm dựa theo ID. |

### 3.3. Customers (Quản lý khách hàng)

| Phương thức | Endpoint | Yêu cầu Token | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/customers` | Có `[Auth]` | Lấy danh sách toàn bộ khách hàng. |
| `GET` | `/api/customers/:id` | Có `[Auth]` | Lấy thông tin chi tiết một khách hàng cụ thể theo ID. |
| `POST` | `/api/customers` | Có `[Auth]` | Thêm thông tin khách hàng mới. |
| `PUT` | `/api/customers/:id` | Có `[Auth]` | Cập nhật toàn bộ thông tin khách hàng. |
| `PATCH` | `/api/customers/:id/status`| Có `[Auth]` | Chỉ cập nhật **trạng thái** của khách hàng (Ví dụ: Đã tư vấn, Chưa gọi...). |
| `DELETE` | `/api/customers/:id` | Có `[Auth]` | Xóa một khách hàng khỏi hệ thống. |

### 3.4. Uploads (Upload tệp và Hình ảnh)

*   **API Upload một hình ảnh** `[Auth]`
    *   **URL**: `POST /api/uploads/image`
    *   **Header Type**: Bắt buộc là `multipart/form-data`
    *   **Body Request**: Sử dụng key tên là **`image`** để chứa dữ liệu file ảnh cần tải lên.
    *   **Giới hạn**: File tải lên tối đa 5MB, và chỉ hỗ trợ định dạng ảnh (.png, .jpg, .jpeg,...).
    *   **Response thành công**: Trả về `path` (đường dẫn lưu trữ) và `filename`.
      ```json
      {
        "success": true,
        "data": {
          "path": "/uploads/my-image.jpg",
          "filename": "my-image.jpg"
        }
      }
      ```

*   **API Lấy/Hiển thị hình ảnh** `[Public]`
    *   **URL**: `GET /uploads/<tên_file_ảnh>` (Ví dụ: `http://localhost:8080/uploads/my-image.jpg`).
    *   **Mô tả**: Sử dụng đường dẫn trả về từ API Upload để gắn trực tiếp thẻ `<img src="..." />` hiển thị ra giao diện.

### 3.5. System Test
| Phương thức | Endpoint | Yêu cầu Token | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/test` | Không | API Public dùng để kiểm tra thử ping tới server Backend xem có hoạt động không. |

---

## 4. Xử lý Lỗi thường gặp (Error Handling)

Dưới đây là một số HTTP Status Code thường trả về, Frontend nên catch để xử lý hiển thị Toast/Alert Error cho người dùng:

*   **`200 OK` / `201 Created`**: Xử lý HTTP Request thành công.
*   **`400 Bad Request`**: Dữ liệu Frontend gửi lên không hợp lệ (Ví dụ: Payload bị thiếu thông tin hoặc sai định dạng như "Chỉ hỗ trợ file ảnh").
*   **`401 Unauthorized`**: Yêu cầu bị từ chối do không có Header `Authorization` (hoặc token cung cấp bị sai, hết hạn). Vui lòng đăng nhập lại.
*   **`403 Forbidden`**: Token có sẵn nhưng người dùng không có quyền truy cập vào endpoint này (phân quyền tài khoản).
*   **`413 Payload Too Large`**: Phát sinh ở tính năng upload khi file ảnh gửi lên lớn hơn mức trần cho phép `(> 5MB)`.
*   **`404 Not Found`**: Gọi nhầm URL hoặc ID truyền lên không tồn tại trong Database.
*   **`500 Internal Server Error`**: Lỗi xuất phát từ code của Backend Server hoặc Database. Báo backend check server logs.

---
*Vui lòng chú ý bám sát cách đặt tên các field trong Postman collection hoặc Model khai báo trong cơ sở dữ liệu khi ghép API thực.*
