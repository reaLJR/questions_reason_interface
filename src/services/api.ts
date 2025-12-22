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
  AspRunResponse,
  HistoryRecord,
  HistoryQueryRequest,
  HistoryQueryResponse,
  HistoryStats,
  ReasoningStrategy,
  StrategiesResponse
} from '../types';

// API基础配置
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_ENDPOINTS = {
  REASON: '/api/reason',
  BATCH_REASON: '/api/reason/batch',
  STRATEGIES: '/api/reason/strategies',
  HEALTH: '/api/health',
  WORKFLOW_INFO: '/api/workflow/info',
  ASP_VALIDATE: '/api/asp/validate',
  ASP_RUN: '/api/asp/run',
  HISTORY_RECORDS: '/api/history/records',
  HISTORY_STATS: '/api/history/stats'
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
    const { status, data } = error.response;
    const detail = data?.detail || data?.error || '未知错误';
    console.error('API错误响应:', status, data);
    
    switch (status) {
      case 400:
        throw new Error(`请求参数错误: ${detail}`);
      case 404:
        throw new Error(`资源未找到: ${detail}`);
      case 422:
        throw new Error(`数据验证失败: ${detail}`);
      case 500:
        throw new Error(`服务器内部错误: ${detail}`);
      default:
        throw new Error(`服务器错误 (${status}): ${detail}`);
    }
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

// 解析工作流结果（支持新旧两种格式）
export const parseWorkflowResult = (result: any): ParsedWorkflowResult => {
  try {
    // 检测是新格式还是旧格式
    const isNewFormat = result.answer !== undefined && result.reasoning_steps !== undefined;
    
    if (isNewFormat) {
      // 新API格式
      console.log('检测到新API格式');
      return {
        answer: result.answer || '',
        explanation: result.explanation || '',
        reasoningSteps: result.reasoning_steps || [],
        // 为了向后兼容，从reasoning_steps中提取旧字段
        currentStep: 'completed'
      };
    } else {
      // 旧API格式（向后兼容）
      console.log('检测到旧API格式');
      let aspResult = result.asp_result;
      if (typeof result.asp_result === 'string') {
        try {
          aspResult = JSON.parse(result.asp_result);
        } catch {
          aspResult = result.asp_result;
        }
      }

      return {
        answer: result.final_answer || '',
        explanation: result.interpretation || '',
        reasoningSteps: [],
        entities: result.entities || '',
        relations: result.relations || '',
        searchSpace: result.search_space || '',
        arguments: result.arguments || '',
        targets: result.targets || '',
        aspProgram: result.asp_program || '',
        aspResult: aspResult,
        interpretation: result.interpretation ? JSON.parse(cleanJsonString(result.interpretation)) : {},
        finalAnswer: result.final_answer ? JSON.parse(cleanJsonString(result.final_answer)) : {},
        currentStep: result.current_step || 'unknown'
      };
    }
  } catch (error) {
    console.error('解析工作流结果失败:', error);
    console.error('原始数据:', result);
    
    // 返回安全的默认值
    return {
      answer: '解析失败',
      explanation: '无法解析后端响应数据',
      reasoningSteps: [],
      currentStep: 'error'
    };
  }
};

// API服务对象
export const reasoningAPI = {
  // 获取可用的推理策略列表
  async getAvailableStrategies(): Promise<StrategiesResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.STRATEGIES);
      return response.data;
    } catch (error: any) {
      handleApiError(error);
      throw error;
    }
  },

  // 发送推理请求
  async sendReasoningRequest(
    question: string, 
    questionId?: string,
    strategy?: ReasoningStrategy
  ): Promise<QuestionResponse> {
    try {
      console.log('开始发送推理请求...');
      console.log('API_BASE_URL:', API_BASE_URL);
      console.log('API_ENDPOINTS.REASON:', API_ENDPOINTS.REASON);

      const requestData: QuestionRequest = {
        question: question,
        question_id: questionId || `q_${Date.now()}`,
        max_models: 10,
        ...(strategy && { strategy })
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
  async sendBatchReasoningRequest(
    questions: Array<{question: string, question_id?: string, max_models?: number, strategy?: ReasoningStrategy}>,
    parallel: boolean = true
  ): Promise<BatchQuestionResponse> {
    try {
      const requestData: BatchQuestionRequest = {
        questions: questions,
        parallel: parallel
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
            answer: "是的，所有的A都是C",
            explanation: "根据三段论推理规则，如果所有A都是B，且所有B都是C，那么可以推导出所有A都是C。",
            reasoning_steps: [
              {
                step_number: 1,
                step_name: "Entity Extraction",
                description: "提取实体：A, B, C",
                metadata: {},
                execution_time_ms: 100
              },
              {
                step_number: 2,
                step_name: "Relation Extraction",
                description: "提取关系：A→B, B→C",
                metadata: {},
                execution_time_ms: 150
              },
              {
                step_number: 3,
                step_name: "Reasoning",
                description: "应用三段论推理",
                metadata: {},
                execution_time_ms: 200
              }
            ]
          },
          timestamp: new Date().toISOString()
        });
      }, 2000);
    });
  },

  // 历史记录相关API方法
  // 查询历史记录
  async getHistoryRecords(params?: HistoryQueryRequest): Promise<HistoryQueryResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.question_id) queryParams.append('question_id', params.question_id);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.start_date) queryParams.append('start_date', params.start_date);
      if (params?.end_date) queryParams.append('end_date', params.end_date);
      if (params?.search_text) queryParams.append('search_text', params.search_text);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());

      const url = `${API_ENDPOINTS.HISTORY_RECORDS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      handleApiError(error);
      throw error;
    }
  },

  // 获取单个历史记录
  async getHistoryRecord(recordId: string): Promise<HistoryRecord> {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.HISTORY_RECORDS}/${recordId}`);
      return response.data;
    } catch (error: any) {
      handleApiError(error);
      throw error;
    }
  },

  // 根据问题ID获取历史记录
  async getHistoryRecordsByQuestionId(questionId: string, limit: number = 10): Promise<{question_id: string, records: HistoryRecord[], count: number}> {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.HISTORY_RECORDS}/question/${questionId}?limit=${limit}`);
      return response.data;
    } catch (error: any) {
      handleApiError(error);
      throw error;
    }
  },

  // 获取历史记录统计信息
  async getHistoryStats(): Promise<HistoryStats> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.HISTORY_STATS);
      return response.data;
    } catch (error: any) {
      handleApiError(error);
      throw error;
    }
  },

  // 删除历史记录
  async deleteHistoryRecord(recordId: string): Promise<{status: string, message: string, timestamp: string}> {
    try {
      const response = await apiClient.delete(`${API_ENDPOINTS.HISTORY_RECORDS}/${recordId}`);
      return response.data;
    } catch (error: any) {
      handleApiError(error);
      throw error;
    }
  }
};

// 导出API客户端（用于其他服务）
export default apiClient;



