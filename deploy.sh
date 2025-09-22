#!/bin/bash

# 部署脚本 - 逻辑推理助手前端
# 使用方法: ./deploy.sh
# 完整部署流程：本地构建 → 保存为tar → 传输到服务器 → 服务器部署

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

# 4. 传输到服务器
echo "步骤4: 传输镜像到服务器..."
scp questions-reason-interface.tar root@139.196.254.168:/root/

if [ $? -eq 0 ]; then
    echo "✅ 镜像传输成功"
else
    echo "❌ 镜像传输失败"
    exit 1
fi

# 5. 在服务器上部署
echo "步骤5: 在服务器上部署..."
ssh root@139.196.254.168 << 'EOF'
    echo "在服务器上开始部署..."
    
    # 加载镜像
    echo "加载Docker镜像..."
    docker load -i /root/questions-reason-interface.tar
    
    # 停止并删除旧容器（如果存在）
    echo "停止旧容器..."
    docker stop questions-reason-interface 2>/dev/null || true
    docker rm questions-reason-interface 2>/dev/null || true
    
    # 运行新容器
    echo "启动新容器..."
    docker run -d --name questions-reason-interface \
      -p 8080:80 \
      -e REACT_APP_API_URL=http://139.196.254.168:8000 \
      --restart unless-stopped \
      questions-reason-interface:latest
    
    # 清理临时文件
    rm -f /root/questions-reason-interface.tar
    
    echo "✅ 服务器部署完成"
    echo "应用已启动，可通过 http://139.196.254.168:8080/ 访问"
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 部署完成！"
    echo ""
    echo "应用已成功部署到服务器"
    echo "访问地址: http://139.196.254.168:8080/"
    echo ""
    echo "测试命令:"
    echo "curl http://139.196.254.168:8080/"
else
    echo "❌ 服务器部署失败"
    exit 1
fi

