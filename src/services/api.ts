import axios from 'axios';
import { 
  QuestionRequest, 
  QuestionResponse, 
  ParsedWorkflowResult, 
  BatchQuestionRequest,
  BatchQuestionResponse,
  WorkflowInfo,
  HealthResponse,
  AspValidateRequest,
  AspValidateResponse,
  AspRunRequest,
  AspRunResponse
} from '../types';

// API基础配置
const API_BASE_URL = 'http://localhost:8000';
const API_ENDPOINTS = {
  REASON: '/api/reason',
  BATCH_REASON: '/api/reason/batch',
  HEALTH: '/api/health',
  WORKFLOW_INFO: '/api/workflow/info',
  ASP_VALIDATE: '/api/asp/validate',
  ASP_RUN: '/api/asp/run'
};

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5分钟超时
  headers: {
    'Content-Type': 'application/json',
  },
});

// 统一错误处理
const handleApiError = (error: any) => {
  if (error.response) {
    // 服务器响应了错误状态码
    console.error('API错误响应:', error.response.status, error.response.data);
    throw new Error(`服务器错误: ${error.response.status} - ${error.response.data?.error || '未知错误'}`);
  } else if (error.request) {
    // 请求已发出但没有收到响应
    console.error('网络连接失败:', error.request);
    throw new Error('网络连接失败，请检查网络连接');
  } else {
    // 其他错误
    console.error('请求配置错误:', error.message);
    throw new Error(`请求失败: ${error.message}`);
  }
};

// 清理JSON字符串，移除Markdown代码块标记
const cleanJsonString = (str: string): string => {
  if (!str) return '{}';
  // 移除 ```json 和 ``` 标记
  return str.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
};

// 解析工作流结果
export const parseWorkflowResult = (result: any): ParsedWorkflowResult => {
  try {
    // 处理 asp_result，它可能是一个对象或字符串
    let aspResult = result.asp_result;
    if (typeof result.asp_result === 'string') {
      try {
        aspResult = JSON.parse(result.asp_result);
      } catch {
        aspResult = result.asp_result;
      }
    }

    return {
      entities: result.entities || '',
      relations: result.relations || '',
      searchSpace: result.search_space || '',
      arguments: result.arguments || '',
      targets: result.targets || '',
      aspProgram: result.asp_program || '',
      aspResult: aspResult,
      interpretation: JSON.parse(cleanJsonString(result.interpretation || '{}')),
      finalAnswer: JSON.parse(cleanJsonString(result.final_answer || '{}')),
      currentStep: result.current_step || 'unknown'
    };
  } catch (error) {
    console.error('解析工作流结果失败:', error);
    console.error('原始数据:', result);
    
    return {
      entities: result.entities || '',
      relations: result.relations || '',
      searchSpace: result.search_space || '',
      arguments: result.arguments || '',
      targets: result.targets || '',
      aspProgram: result.asp_program || '',
      aspResult: result.asp_result || {},
      interpretation: result.interpretation ? cleanJsonString(result.interpretation) : '{}',
      finalAnswer: result.final_answer ? cleanJsonString(result.final_answer) : '{}',
      currentStep: result.current_step || 'unknown'
    };
  }
};

// API服务对象
export const reasoningAPI = {
  // 发送推理请求
  async sendReasoningRequest(question: string, questionId?: string): Promise<QuestionResponse> {
    try {
      console.log('开始发送推理请求...');
      console.log('API_BASE_URL:', API_BASE_URL);
      console.log('API_ENDPOINTS.REASON:', API_ENDPOINTS.REASON);

      const requestData: QuestionRequest = {
        question: question,
        question_id: questionId || `q_${Date.now()}`,
        max_models: 10
      };

      console.log('请求数据:', requestData);
      console.log('完整URL:', `${API_BASE_URL}${API_ENDPOINTS.REASON}`);

      const response = await apiClient.post(API_ENDPOINTS.REASON, requestData);
      console.log('API响应成功:', response.status);
      return response.data;
    } catch (error: any) {
      console.error('API请求失败，详细错误信息:');
      console.error('错误类型:', error.constructor.name);
      console.error('错误消息:', error.message);
      console.error('错误代码:', error.code);
      console.error('错误配置:', error.config);
      console.error('错误响应:', error.response);
      console.error('错误请求:', error.request);

      handleApiError(error);
      throw error;
    }
  },

  // 批量推理请求
  async sendBatchReasoningRequest(questions: Array<{question: string, question_id: string}>): Promise<BatchQuestionResponse> {
    try {
      const requestData: BatchQuestionRequest = {
        questions: questions,
        max_models: 10
      };

      const response = await apiClient.post(API_ENDPOINTS.BATCH_REASON, requestData);
      return response.data;
    } catch (error: any) {
      handleApiError(error);
      throw error;
    }
  },

  // 测试连接
  async testConnection(): Promise<HealthResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.HEALTH);
      console.log('连接测试成功:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('连接测试失败:', error);
      handleApiError(error);
      throw error;
    }
  },

  // 获取工作流信息
  async getWorkflowInfo(): Promise<WorkflowInfo> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WORKFLOW_INFO);
      return response.data;
    } catch (error: any) {
      handleApiError(error);
      throw error;
    }
  },

  // ASP语法验证
  async validateAspCode(aspCode: string): Promise<AspValidateResponse> {
    try {
      const requestData: AspValidateRequest = {
        asp_code: aspCode
      };
      const response = await apiClient.post(API_ENDPOINTS.ASP_VALIDATE, requestData);
      return response.data;
    } catch (error: any) {
      handleApiError(error);
      throw error;
    }
  },

  // ASP直接运行
  async runAspCode(aspCode: string, maxModels: number = 10): Promise<AspRunResponse> {
    try {
      const requestData: AspRunRequest = {
        asp_code: aspCode,
        max_models: maxModels
      };
      const response = await apiClient.post(API_ENDPOINTS.ASP_RUN, requestData);
      return response.data;
    } catch (error: any) {
      handleApiError(error);
      throw error;
    }
  },

  // Mock推理请求（用于测试）
  async mockReasoningRequest(question: string, questionId?: string): Promise<QuestionResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          question_id: questionId || `q_${Date.now()}`,
          question: question,
          status: 'success',
          result: {
            entities: "category(letter, type).",
            relations: "transitive_subset(letter, type).",
            search_space: "category(letter, type).\n{ transitive_subset(X, Y) } :- category(X, _), category(Y, _), X != Y.",
            arguments: "transitive_subset(a, b).\ntransitive_subset(b, c).",
            targets: "goal :- transitive_subset(a, c).\n:- not goal.",
            asp_program: "category(letter, type).\ntransitive_subset(a, b).\ntransitive_subset(b, c).\ngoal :- transitive_subset(a, c).\n:- not goal.\nanswer.\n2{options; rule}2 :- answer.",
            asp_result: {
              success: true,
              models: ["answer", "answer"],
              model_count: 2
            },
            interpretation: "{\"answer\": \"是的，所有的A都是C\", \"confidence\": 0.95}",
            final_answer: "{\"answer\": \"是的，所有的A都是C\", \"confidence\": 0.95}",
            current_step: "completed"
          },
          timestamp: new Date().toISOString()
        });
      }, 2000);
    });
  }
};

// 导出API客户端（用于其他服务）
export default apiClient;



