import React, { useState, useEffect } from 'react';
import { Input, Button, Card, message, Select, Space } from 'antd';
import { SendOutlined, ClearOutlined } from '@ant-design/icons';
import { useAppStore } from '../store';
import { reasoningAPI, parseWorkflowResult } from '../services/api';
import { ReasoningResult, ParsedWorkflowResult, ReasoningStrategy } from '../types';
import WorkflowResultComponent from './WorkflowResult';

const { TextArea } = Input;

// 策略显示名称映射
const STRATEGY_LABELS: Record<ReasoningStrategy, string> = {
  'asp': 'ASP推理（默认）',
  'single_llm': '单次LLM',
  'simple_llm': '简单LLM'
};

const QuestionInput: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [strategies, setStrategies] = useState<ReasoningStrategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<ReasoningStrategy | undefined>(undefined);
  const [workflowResult, setWorkflowResult] = useState<{
    result: ParsedWorkflowResult;
    question: string;
    timestamp: string;
    questionId: string;
  } | null>(null);
  
  const { 
    setCurrentQuestion, 
    isLoading, 
    setLoading, 
    addHistoryRecord 
  } = useAppStore();

  // 获取可用的推理策略列表
  useEffect(() => {
    reasoningAPI.getAvailableStrategies()
      .then(res => {
        setStrategies(res.available_strategies);
        console.log('可用策略:', res.available_strategies);
      })
      .catch(error => {
        console.error('获取策略列表失败:', error);
      });
  }, []);

  // 处理提交
  const handleSubmit = async () => {
    if (!inputValue.trim()) {
      message.warning('请输入问题内容');
      return;
    }

    setLoading(true);
    setCurrentQuestion(inputValue);
    setWorkflowResult(null); // 清空之前的结果

    try {
      console.log('🚀 开始推理请求');
      console.log('📝 问题内容:', inputValue);
      console.log('🎯 选择的策略:', selectedStrategy || '默认');
      
      // 调用真实的后端API接口，传递选定的策略
      const response = await reasoningAPI.sendReasoningRequest(inputValue, undefined, selectedStrategy);
      
      console.log('✅ API响应成功');
      console.log('📦 原始响应:', response);
      
      if (response.status === 'success') {
        // 解析工作流结果
        const parsedResult = parseWorkflowResult(response.result);
        
        console.log('🔄 解析后的结果:', parsedResult);
        
        // 设置工作流结果用于显示
        setWorkflowResult({
          result: parsedResult,
          question: inputValue,
          timestamp: response.timestamp,
          questionId: response.question_id
        });
        
        console.log('✨ 工作流结果已设置，准备显示');
        
        // 转换为兼容的历史记录格式（保留历史记录功能但不显示）
        const result: ReasoningResult = {
          id: response.question_id,
          question: inputValue,
          result: parsedResult.answer || '推理完成',
          timestamp: response.timestamp,
          steps: parsedResult.reasoningSteps.map((step, index) => ({
            step: step.step_number.toString(),
            content: step.step_name,
            status: 'success' as const
          }))
        };

        addHistoryRecord(result);
        message.success('推理完成！');
        setInputValue(''); // 清空输入框
      } else {
        console.error('❌ 推理状态失败:', response.status);
        message.error(`推理失败: ${response.error_message || '未知错误'}`);
      }
    } catch (error: any) {
      console.error('❌ 推理请求异常');
      console.error('错误类型:', error.constructor.name);
      console.error('错误消息:', error.message);
      console.error('错误详情:', error);
      
      // 更详细的错误提示
      let errorMessage = '请求失败，请稍后重试';
      if (error.message.includes('网络连接失败')) {
        errorMessage = '无法连接到后端服务，请确认后端服务是否运行在 http://localhost:8000';
      } else if (error.message.includes('timeout')) {
        errorMessage = '请求超时，请检查网络连接或稍后重试';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage, 5); // 显示5秒
    } finally {
      setLoading(false);
    }
  };

  // 处理清空
  const handleClear = () => {
    setInputValue('');
    setCurrentQuestion('');
    setWorkflowResult(null);
    setSelectedStrategy(undefined);
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div>
      {/* 调试信息 */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ padding: '8px', backgroundColor: '#f0f0f0', marginBottom: '8px', fontSize: '12px' }}>
          Debug: workflowResult = {workflowResult ? '已设置' : 'null'}
        </div>
      )}
      
      <Card 
        title="逻辑推理问题输入" 
        style={{ marginBottom: 16 }}
        extra={
          <Button 
            icon={<ClearOutlined />} 
            onClick={handleClear}
            disabled={!inputValue.trim()}
          >
            清空
          </Button>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="请输入您的逻辑推理问题..."
            autoSize={{ minRows: 4, maxRows: 8 }}
            disabled={isLoading}
            showCount
            maxLength={2000}
          />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* 策略选择下拉框 */}
          <Space>
            <span style={{ fontSize: '14px', color: '#666' }}>推理策略：</span>
            <Select
              placeholder="选择推理策略（可选）"
              allowClear
              value={selectedStrategy}
              onChange={(value) => setSelectedStrategy(value)}
              style={{ width: 200 }}
              disabled={isLoading}
            >
              {strategies.map(s => (
                <Select.Option key={s} value={s}>
                  {STRATEGY_LABELS[s] || s}
                </Select.Option>
              ))}
            </Select>
          </Space>

          {/* 操作按钮 */}
          <Space>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSubmit}
              loading={isLoading}
              disabled={!inputValue.trim()}
              size="large"
            >
              {isLoading ? '推理中...' : '开始推理'}
            </Button>
            
            {/* 测试按钮 */}
            <Button
              onClick={() => {
                console.log('Current workflowResult:', workflowResult);
                console.log('Current inputValue:', inputValue);
                console.log('Current selectedStrategy:', selectedStrategy);
              }}
              size="large"
            >
              调试状态
            </Button>
            
            {/* 连接测试按钮 */}
            <Button
              onClick={async () => {
                try {
                  await reasoningAPI.testConnection();
                } catch (error) {
                  console.error('连接测试失败:', error);
                }
              }}
              size="large"
            >
              测试连接
            </Button>
          </Space>
        </div>
        
        <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
          提示：按 Ctrl + Enter 快速提交
        </div>
      </Card>

      {/* 显示工作流结果 */}
      {workflowResult && (
        <div>
          <div style={{ padding: '8px', backgroundColor: '#e6f7ff', marginBottom: '8px', fontSize: '12px' }}>
            测试显示: 工作流结果已设置，问题ID: {workflowResult.questionId}
          </div>
          <WorkflowResultComponent
            result={workflowResult.result}
            question={workflowResult.question}
            timestamp={workflowResult.timestamp}
            questionId={workflowResult.questionId}
          />
        </div>
      )}
    </div>
  );
};

export default QuestionInput;
