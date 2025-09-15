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



