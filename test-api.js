// 测试API连接
const axios = require('axios');

async function testAPI() {
  try {
    console.log('测试API连接...');
    console.log('API URL: http://139.196.254.168:8000');
    
    // 测试健康检查
    const healthResponse = await axios.get('http://139.196.254.168:8000/api/health');
    console.log('✅ 健康检查成功:', healthResponse.data);
    
    // 测试推理接口
    const reasonResponse = await axios.post('http://139.196.254.168:8000/api/reason', {
      question: '测试问题',
      question_id: 'test_123',
      max_models: 10
    });
    console.log('✅ 推理接口成功:', reasonResponse.data);
    
  } catch (error) {
    console.error('❌ API连接失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

testAPI();
