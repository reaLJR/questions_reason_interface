#!/bin/bash

# 前后端集成测试脚本
# 用于验证前后端连接性和功能

echo "🔍 前后端集成测试"
echo "=================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数
PASSED=0
FAILED=0

# 测试函数
test_endpoint() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    local data=$4
    
    echo -n "测试 $name ... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$url" 2>&1)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ 通过${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ 失败${NC} (HTTP $http_code)"
        echo "  响应: $body"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# 1. 测试后端健康检查
echo "1️⃣  后端服务测试"
echo "-------------------"
test_endpoint "健康检查" "http://localhost:8000/api/health"
echo ""

# 2. 测试策略列表
echo "2️⃣  策略接口测试"
echo "-------------------"
test_endpoint "策略列表" "http://localhost:8000/api/reason/strategies"
echo ""

# 3. 测试推理接口（简短问题）
echo "3️⃣  推理接口测试"
echo "-------------------"
echo "⚠️  注意：推理请求可能需要30-60秒"
test_endpoint "推理接口（不带策略）" "http://localhost:8000/api/reason" "POST" \
    '{"question":"测试问题","question_id":"test_'$(date +%s)'","max_models":1}'
echo ""

# 4. 测试前端服务
echo "4️⃣  前端服务测试"
echo "-------------------"
echo -n "测试前端可访问性 ... "
frontend_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>&1)
if [ "$frontend_response" = "200" ]; then
    echo -e "${GREEN}✓ 通过${NC} (HTTP $frontend_response)"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ 失败${NC} (HTTP $frontend_response)"
    FAILED=$((FAILED + 1))
fi
echo ""

# 5. 测试CORS（预检请求）
echo "5️⃣  CORS配置测试"
echo "-------------------"
echo -n "测试CORS预检请求 ... "
cors_response=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS \
    -H "Origin: http://localhost:3000" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" \
    http://localhost:8000/api/reason 2>&1)

if [ "$cors_response" = "200" ] || [ "$cors_response" = "204" ]; then
    echo -e "${GREEN}✓ 通过${NC} (HTTP $cors_response)"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠ 警告${NC} (HTTP $cors_response)"
    echo "  CORS可能未配置，但这在开发环境中可能不是问题"
fi
echo ""

# 总结
echo "=================="
echo "📊 测试总结"
echo "=================="
echo -e "通过: ${GREEN}$PASSED${NC}"
echo -e "失败: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ 所有测试通过！前后端集成正常。${NC}"
    echo ""
    echo "🎉 现在可以在浏览器中测试："
    echo "   1. 访问 http://localhost:3000"
    echo "   2. 输入问题并点击'开始推理'"
    echo "   3. 打开浏览器开发者工具（F12）查看详细日志"
    exit 0
else
    echo -e "${RED}❌ 有 $FAILED 个测试失败。${NC}"
    echo ""
    echo "🔧 故障排查建议："
    echo "   1. 确认后端服务运行在 http://localhost:8000"
    echo "   2. 确认前端服务运行在 http://localhost:3000"
    echo "   3. 查看 CONNECTIVITY_AUDIT_REPORT.md 了解详情"
    echo "   4. 使用 debug-frontend.html 进行独立测试"
    exit 1
fi

