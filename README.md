# 逻辑推理助手前端

一个基于React的逻辑推理问题处理前端应用，支持输入逻辑题目，调用后端推理接口，并展示推理结果。

## 功能特性

### 核心功能
- **问题输入**: 多行文本输入框，支持长文本输入
- **推理处理**: 调用后端agent接口进行逻辑推理
- **结果展示**: 分步骤展示推理过程和结果（5个工作流节点）
- **历史记录**: 本地存储和管理推理历史（当前已隐藏）

### 工作流结果展示
- **问题分析**: 显示问题类型、前提、结论等
- **ASP代码**: 代码高亮显示
- **ASP执行结果**: 显示执行输出
- **结果解释**: 显示推理过程解释
- **最终答案**: 显示最终推理结果

### 用户界面
- **现代化UI**: 基于Ant Design组件库
- **响应式设计**: 支持不同屏幕尺寸
- **中文界面**: 完整的中文用户界面
- **直观操作**: 简洁易用的操作流程

## 技术栈

- **前端框架**: React 18 + TypeScript
- **UI组件库**: Ant Design 5.x
- **状态管理**: Zustand
- **HTTP客户端**: Axios
- **文件导出**: 原生Blob API
- **样式**: CSS3 + Ant Design主题

## 项目结构

```
src/
├── components/          # 组件目录
│   ├── QuestionInput.tsx        # 问题输入组件
│   ├── WorkflowResult.tsx       # 工作流结果展示组件
│   ├── ReasoningResult.tsx      # 推理结果展示组件（兼容）
│   └── HistoryList.tsx          # 历史记录列表组件（已隐藏）
├── store/              # 状态管理
│   └── index.ts        # Zustand store
├── services/           # 服务层
│   └── api.ts          # API服务
├── types/              # 类型定义
│   └── index.ts        # TypeScript接口定义
├── utils/              # 工具函数
│   └── index.ts        # 通用工具函数
├── App.tsx             # 主应用组件
└── index.tsx           # 应用入口
```

## 安装和运行

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm start
```

应用将在 http://localhost:3000 启动

### 构建生产版本
```bash
npm run build
```

## 服务端部署配置

### Docker部署

#### 环境要求
- Docker >= 20.0.0
- Docker Compose >= 2.0.0 (可选)

#### 快速部署

1. **构建镜像**
```bash
# 使用提供的部署脚本
./deploy.sh
```

2. **传输到服务器**
```bash
# 将生成的镜像文件传输到服务器
scp questions-reason-interface.tar root@your-server-ip:/root/
```

3. **服务器部署**
```bash
# SSH登录服务器
ssh root@your-server-ip

# 清理旧镜像（可选）
docker stop $(docker ps -q) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true
docker rmi $(docker images -q) -f

# 加载新镜像
docker load -i questions-reason-interface.tar

# 运行容器
docker run -d --name questions-reason-interface \
  -p 80:80 \
  -e REACT_APP_API_URL=http://your-server-ip:8000 \
  --restart unless-stopped \
  questions-reason-interface:latest
```

#### Docker Compose部署（推荐）

1. **使用Docker Compose**
```bash
# 在服务器上运行
docker-compose up -d
```

2. **Docker Compose配置说明**
```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - REACT_APP_API_URL=http://your-server-ip:8000
    restart: unless-stopped
    networks:
      - app-network
```

#### 环境变量配置

| 变量名 | 说明 | 默认值 | 示例 |
|--------|------|--------|------|
| `REACT_APP_API_URL` | 后端API服务地址 | `http://localhost:8000` | `http://139.196.254.168:8000` |

#### 部署架构

```
┌─────────────────┐    ┌─────────────────┐
│   前端服务       │    │   后端服务       │
│   (Nginx)       │    │   (API Server)  │
│   Port: 80      │◄──►│   Port: 8000    │
│   Docker        │    │   Docker        │
└─────────────────┘    └─────────────────┘
```

#### 服务管理命令

```bash
# 查看容器状态
docker ps

# 查看容器日志
docker logs questions-reason-interface

# 重启服务
docker restart questions-reason-interface

# 停止服务
docker stop questions-reason-interface

# 更新服务
docker pull questions-reason-interface:latest
docker stop questions-reason-interface
docker rm questions-reason-interface
docker run -d --name questions-reason-interface \
  -p 80:80 \
  -e REACT_APP_API_URL=http://your-server-ip:8000 \
  --restart unless-stopped \
  questions-reason-interface:latest
```

#### 故障排除

1. **端口冲突**
```bash
# 检查端口占用
netstat -tlnp | grep :80
# 或
lsof -i :80
```

2. **容器无法启动**
```bash
# 查看详细日志
docker logs questions-reason-interface

# 检查镜像是否存在
docker images | grep questions-reason-interface
```

3. **API连接失败**
```bash
# 测试后端API连接
curl http://your-server-ip:8000/api/health

# 检查网络连通性
ping your-backend-server-ip
```

## 后端API配置

### 当前状态
- 使用模拟API进行开发和测试
- 已准备好与真实后端API对接

### 切换到真实后端API

#### 1. 修改API配置
在 `src/services/api.ts` 中：

```typescript
// 将模拟API调用改为真实API调用
const response = await reasoningAPI.sendReasoningRequest(inputValue);
```

#### 2. 配置后端地址
创建 `.env` 文件：

```env
REACT_APP_API_URL=http://localhost:8000
```

#### 3. 确保后端服务运行
后端需要提供以下接口：
- `POST /api/reason` - 推理接口
- `GET /api/health` - 健康检查接口

## API接口说明

### 推理接口
- **URL**: `POST /api/reason`
- **请求体**:
  ```json
  {
    "question": "逻辑推理题目",
    "question_id": "q_1234567890",
    "max_models": 10
  }
  ```
- **响应体**:
  ```json
  {
    "question_id": "q_1234567890",
    "question": "原始问题",
    "status": "success",
    "result": {
      "problem_analysis": "问题分析JSON字符串",
      "asp_code": "ASP代码",
      "asp_result": "ASP执行结果",
      "interpretation": "结果解释JSON字符串",
      "final_answer": "最终答案JSON字符串"
    },
    "timestamp": "2024-01-01T00:00:00Z"
  }
  ```

### 工作流结果结构
后端返回的工作流结果包含5个节点：
1. **问题分析** (`problem_analysis`): JSON字符串，包含问题类型、前提、结论等
2. **ASP代码** (`asp_code`): 生成的ASP逻辑程序代码
3. **ASP执行结果** (`asp_result`): ASP程序的执行输出
4. **结果解释** (`interpretation`): JSON字符串，解释推理过程
5. **最终答案** (`final_answer`): JSON字符串，包含最终答案和置信度

## 使用说明

### 1. 输入问题
- 在问题输入框中输入逻辑推理问题
- 支持多行文本输入，最大2000字符
- 按"开始推理"按钮或Ctrl+Enter提交

### 2. 查看结果
- 推理完成后自动显示工作流结果
- 可以展开/收起各个工作流节点查看详细信息
- 支持导出结果为JSON或TXT格式

### 3. 功能说明
- **当前版本**: 仅显示问题输入和推理结果
- **历史记录**: 功能已实现但界面已隐藏，数据仍会保存到本地存储
- **导出功能**: 支持导出单个推理结果

## 开发说明

### 状态管理
使用Zustand进行状态管理，主要状态包括：
- `currentQuestion`: 当前问题
- `isLoading`: 加载状态
- `historyRecords`: 历史记录列表（后台保存）
- `searchKeyword`: 搜索关键词

### 本地存储
历史记录使用localStorage存储，键名为`reasoning_history`，存储格式：
```json
{
  "records": [...],
  "lastUpdated": timestamp
}
```

### 组件通信
- 组件间通过Zustand store进行状态共享
- 使用React hooks进行状态管理
- 支持响应式更新

## 扩展功能

### 预留接口
项目已预留后端存储接口，可在以下位置扩展：
- `src/services/api.ts`: 添加后端存储API
- `src/store/index.ts`: 添加远程存储逻辑

### 可扩展功能
- 用户登录认证
- 云端数据同步
- 主题切换
- 多语言支持
- 分享功能
- 历史记录界面恢复

## 注意事项

1. **API配置**: 确保后端API接口正确配置
2. **跨域问题**: 开发时注意处理跨域请求
3. **数据安全**: 生产环境建议添加数据加密
4. **性能优化**: 大量历史记录时考虑分页加载
5. **错误处理**: 已实现统一的错误处理机制

## 许可证

MIT License
