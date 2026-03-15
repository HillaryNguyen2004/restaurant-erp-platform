Mình muốn tạo 1 website để demo các màn hình cho các role khác nhau trong 1 hệ thống quản lí nhà hàng thông minh theo file `reuirements.md`. Yêu cầu:
- Sử dụng Next.js
- Sử dụng Tailwind CSS
- Sử dụng TypeScript
- Sử dụng shadcn/ui
(Tất cả đã init sẵn, chỉ việc xài)

Yêu cầu:
- UI đẹp, phân biệt tông màu chủ đạo cho screen của mỗi role
- Viết các module thành các features khác nhau trong folder `src/features`
- Mỗi feature có các folder sau:
  - `components`: Các component của feature
  - `config`: Cấu hình zod của các entity schema thuộc feature đó ([tên feature].config.ts)
  - `data-access`: Gồm api ([tên feature].api.ts) và queries ([tên feature].queries.ts) tạm để trống không viết gì

- Làm auth provider và các trang login, register, forgot password, reset password, verify email
- thêm tanstack provider và sonner vào layout