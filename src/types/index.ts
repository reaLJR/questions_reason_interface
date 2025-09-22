// 推理结果接口
export interface ReasoningResult {
  id: string;
  question: string;
  result: string;
  timestamp: string;
  steps?: ReasoningStep[];
}

// 推理步骤接口
export interface ReasoningStep {
  step: string;
  content: string;
  status: 'success' | 'error' | 'pending';
}

// 问题请求接口
export interface QuestionRequest {
  question: string;
  question_id: string;
  max_models: number;
}

// 问题响应接口
export interface QuestionResponse {
  question_id: string;
  question: string;
  status: string;
  result: WorkflowResult;
  error?: string;
  timestamp: string;
}

// 工作流结果接口
export interface WorkflowResult {
  entities: string;
  relations: string;
  search_space: string;
  arguments: string;
  targets: string;
  asp_program: string;
  asp_result: any;
  interpretation: string;
  final_answer: string;
  current_step: string;
}

// 解析后的工作流结果接口
export interface ParsedWorkflowResult {
  entities: string;
  relations: string;
  searchSpace: string;
  arguments: string;
  targets: string;
  aspProgram: string;
  aspResult: any;
  interpretation: any;
  finalAnswer: any;
  currentStep: string;
}

// API响应接口
export interface ApiResponse {
  status: string;
  data?: any;
  error?: string;
}

// 历史记录存储接口
export interface HistoryStorage {
  id: string;
  question: string;
  result: ParsedWorkflowResult;
  timestamp: string;
  questionId: string;
}

// 批量推理请求接口
export interface BatchQuestionRequest {
  questions: Array<{
    question: string;
    question_id: string;
  }>;
  max_models: number;
}

// 批量推理响应接口
export interface BatchQuestionResponse {
  status: string;
  results: QuestionResponse[];
  timestamp: string;
}

// 工作流信息接口
export interface WorkflowInfo {
  nodes: string[];
  workflow: string;
  description: string;
}

// 健康检查响应接口
export interface HealthResponse {
  status: string;
  timestamp: string;
  workflow_ready: boolean;
  version: string;
  services: {
    asp_solver: string;
    llm_service: string;
  };
}

// ASP验证请求接口
export interface AspValidateRequest {
  asp_code: string;
}

// ASP验证响应接口
export interface AspValidateResponse {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ASP运行请求接口
export interface AspRunRequest {
  asp_code: string;
  max_models: number;
}

// ASP运行响应接口
export interface AspRunResponse {
  success: boolean;
  models: string[];
  model_count: number;
  asp_code: string;
}

// 历史记录相关接口
export interface HistoryRecord {
  id: string;
  question_id: string;
  question: string;
  status: 'success' | 'error' | 'timeout' | 'cancelled';
  input_data: {
    question: string;
    max_models: number;
    timestamp: string;
  };
  result?: {
    result: string;
    asp_code: string;
    models: string[];
  };
  error_message?: string;
  execution_time_ms: number;
  agent_version: string;
  workflow_version: string;
  created_at: string;
  updated_at: string;
}

// 历史记录查询请求接口
export interface HistoryQueryRequest {
  question_id?: string;
  status?: 'success' | 'error' | 'timeout' | 'cancelled';
  start_date?: string;
  end_date?: string;
  search_text?: string;
  limit?: number;
  offset?: number;
}

// 历史记录查询响应接口
export interface HistoryQueryResponse {
  records: HistoryRecord[];
  total_count: number;
  limit: number;
  offset: number;
}

// 历史记录统计信息接口
export interface HistoryStats {
  total_records: number;
  success_count: number;
  error_count: number;
  avg_execution_time_ms: number;
  recent_activity: Array<{
    question_id: string;
    status: string;
    created_at: string;
  }>;
}



