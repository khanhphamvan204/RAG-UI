# Stage 1: Build ứng dụng React với Vite
FROM node:18-alpine AS builder

# Thiết lập thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package.json package-lock.json ./

# Cài đặt dependencies
RUN npm ci

# Sao chép toàn bộ mã nguồn
COPY . .

# Build ứng dụng React cho sản xuất (Vite tạo ra thư mục dist)
RUN npm run build

# Stage 2: Serve ứng dụng với Nginx
FROM nginx:alpine

# Sao chép output build từ giai đoạn builder (dùng dist thay vì build)
COPY --from=builder /app/dist /usr/share/nginx/html

# Sao chép cấu hình Nginx tùy chỉnh
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Mở cổng 80
EXPOSE 80

# Khởi động Nginx
CMD ["nginx", "-g", "daemon off;"]