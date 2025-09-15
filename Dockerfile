# 使用官方Node.js镜像作为构建环境
FROM node:18-alpine as build

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 设置环境变量（构建时）
ARG REACT_APP_API_URL=http://139.196.254.168:8000
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# 构建应用
RUN npm run build

# 使用nginx镜像作为生产环境
FROM nginx:alpine

# 复制构建的文件到nginx目录
COPY --from=build /app/build /usr/share/nginx/html

# 复制nginx配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
