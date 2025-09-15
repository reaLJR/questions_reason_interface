import React, { useState } from 'react';
import { Input, Button, Card, message } from 'antd';
import { SendOutlined, ClearOutlined } from '@ant-design/icons';
import { useAppStore } from '../store';
import { reasoningAPI, parseWorkflowResult } from '../services/api';
import { ReasoningResult, ParsedWorkflowResult } from '../types';
import WorkflowResultComponent from './WorkflowResult';

const { TextArea } = Input;

const QuestionInput: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
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
      // 调用真实的后端API接口
      const response = await reasoningAPI.sendReasoningRequest(inputValue);
      
      // 添加调试信息
      console.log('API Response:', response);
      
      if (response.status === 'success') {
        // 解析工作流结果
        const parsedResult = parseWorkflowResult(response.result);
        
        // 添加调试信息
        console.log('Parsed Result:', parsedResult);
        
        // 设置工作流结果用于显示
        setWorkflowResult({
          result: parsedResult,
          question: inputValue,
          timestamp: response.timestamp,
          questionId: response.question_id
        });
        
        // 添加调试信息
        console.log('Setting workflowResult:', {
          result: parsedResult,
          question: inputValue,
          timestamp: response.timestamp,
          questionId: response.question_id
        });
        
        // 转换为兼容的历史记录格式（保留历史记录功能但不显示）
        const result: ReasoningResult = {
          id: response.question_id,
          question: inputValue,
          result: typeof parsedResult.finalAnswer === 'object' 
            ? parsedResult.finalAnswer.answer || '推理完成'
            : parsedResult.finalAnswer || '推理完成',
          timestamp: response.timestamp,
          steps: [
            {
              step: '1',
              content: '实体提取',
              status: 'success'
            },
            {
              step: '2',
              content: '关系提取',
              status: 'success'
            },
            {
              step: '3',
              content: '搜索空间生成',
              status: 'success'
            },
            {
              step: '4',
              content: '论证构建',
              status: 'success'
            },
            {
              step: '5',
              content: '求解目标构建',
              status: 'success'
            },
            {
              step: '6',
              content: 'ASP程序拼接',
              status: 'success'
            },
            {
              step: '7',
              content: 'ASP求解',
              status: parsedResult.aspResult?.success ? 'success' : 'error'
            },
            {
              step: '8',
              content: '结果解释',
              status: 'success'
            }
          ]
        };

        addHistoryRecord(result);
        message.success('推理完成！');
        setInputValue(''); // 清空输入框
      } else {
        message.error('推理失败');
      }
    } catch (error: any) {
      console.error('Error:', error);
      message.error(error.message || '请求失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理清空
  const handleClear = () => {
    setInputValue('');
    setCurrentQuestion('');
    setWorkflowResult(null);
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
        
        <div style={{ textAlign: 'right' }}>
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
            style={{ marginLeft: 8 }}
            onClick={() => {
              console.log('Current workflowResult:', workflowResult);
              console.log('Current inputValue:', inputValue);
            }}
            size="large"
          >
            调试状态
          </Button>
          
          {/* 连接测试按钮 */}
          <Button
            style={{ marginLeft: 8 }}
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
