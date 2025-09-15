#!/bin/bash

# 部署脚本 - 逻辑推理助手前端
# 使用方法: ./deploy.sh

echo "开始构建和部署逻辑推理助手前端..."

# 1. 构建Docker镜像
echo "步骤1: 构建Docker镜像..."
docker build -t questions-reason-interface:latest .

if [ $? -eq 0 ]; then
    echo "✅ Docker镜像构建成功"
else
    echo "❌ Docker镜像构建失败"
    exit 1
fi

# 2. 保存镜像为tar文件
echo "步骤2: 保存镜像为tar文件..."
docker save -o questions-reason-interface.tar questions-reason-interface:latest

if [ $? -eq 0 ]; then
    echo "✅ 镜像保存成功: questions-reason-interface.tar"
else
    echo "❌ 镜像保存失败"
    exit 1
fi

# 3. 显示文件大小
echo "步骤3: 检查文件大小..."
ls -lh questions-reason-interface.tar

echo ""
echo "🎉 部署准备完成！"
echo ""
echo "下一步操作："
echo "1. 将 questions-reason-interface.tar 文件传输到服务器"
echo "2. 在服务器上执行以下命令："
echo ""
echo "   # 加载镜像"
echo "   docker load -i questions-reason-interface.tar"
echo ""
echo "   # 停止并删除旧容器（如果存在）"
echo "   docker stop questions-reason-interface 2>/dev/null || true"
echo "   docker rm questions-reason-interface 2>/dev/null || true"
echo ""
echo "   # 运行新容器"
echo "   docker run -d --name questions-reason-interface \\"
echo "     -p 80:80 \\"
echo "     -e REACT_APP_API_URL=http://139.196.254.168:8000 \\"
echo "     --restart unless-stopped \\"
echo "     questions-reason-interface:latest"
echo ""
echo "   # 或者使用docker-compose（推荐）"
echo "   docker-compose up -d"
echo ""
echo "3. 访问 http://139.196.254.168 查看应用"
