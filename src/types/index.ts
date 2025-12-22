// 推理策略类型
export type ReasoningStrategy = 'asp' | 'single_llm' | 'simple_llm';

// 策略列表响应接口
export interface StrategiesResponse {
  available_strategies: ReasoningStrategy[];
}

// 推理结果接口
export interface ReasoningResult {
  id: string;
  question: string;
  result: string;
  timestamp: string;
  steps?: ReasoningStep[];
}

// 推理步骤接口（旧格式，保留用于历史记录）
export interface ReasoningStep {
  step: string;
  content: string;
  status: 'success' | 'error' | 'pending';
}

// 新增：推理步骤详情（新API格式）
export interface ReasoningStepDetail {
  step_number: number;
  step_name: string;
  description: string;
  metadata: any;
  execution_time_ms: number | null;
}

// 问题请求接口
export interface QuestionRequest {
  question: string;
  question_id?: string;
  max_models?: number;
  strategy?: ReasoningStrategy;
}

// 问题响应接口
export interface QuestionResponse {
  question_id: string;
  question: string;
  status: string;
  result: WorkflowResult;
  error_message?: string;
  execution_time_ms?: number;
  timestamp: string;
}

// 工作流结果接口（旧格式，保留用于兼容）
export interface WorkflowResultOld {
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

// 新的工作流结果接口（新API格式）
export interface WorkflowResult {
  answer: string;
  explanation?: string;
  reasoning_steps: ReasoningStepDetail[];
}

// 解析后的工作流结果接口（统一格式）
export interface ParsedWorkflowResult {
  answer: string;
  explanation?: string;
  reasoningSteps: ReasoningStepDetail[];
  // 保留旧字段用于向后兼容（可选）
  entities?: string;
  relations?: string;
  searchSpace?: string;
  arguments?: string;
  targets?: string;
  aspProgram?: string;
  aspResult?: any;
  interpretation?: any;
  finalAnswer?: any;
  currentStep?: string;
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
    question_id?: string;
    max_models?: number;
    strategy?: ReasoningStrategy;
  }>;
  parallel?: boolean;
}

// 批量推理响应接口
export interface BatchQuestionResponse {
  total: number;
  successful: number;
  failed: number;
  results: QuestionResponse[];
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
  version: string;
  engine_info: {
    engine_type: string;
    version: string;
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
  record_id: string;
  question_id: string;
  question: string;
  status: 'success' | 'error';
  result?: {
    answer: string;
    confidence?: number;
  };
  error_message?: string;
  execution_time_ms: number;
  agent_version: string;
  workflow_version: string;
  created_at: string;
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
  total: number;
  records: HistoryRecord[];
  limit: number;
  offset: number;
}

// 历史记录统计信息接口
export interface HistoryStats {
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  success_rate: number;
  average_execution_time_ms: number;
}



