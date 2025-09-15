import React from 'react';
import { Card, Collapse, Typography, Space, Button, Tag, Divider, Alert } from 'antd';
import { DownloadOutlined, CodeOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { ParsedWorkflowResult } from '../types';
import { exportToJson, exportToTxt } from '../utils';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface WorkflowResultComponentProps {
  result: ParsedWorkflowResult;
  question: string;
  timestamp: string;
  questionId: string;
}

const WorkflowResultComponent: React.FC<WorkflowResultComponentProps> = ({
  result,
  question,
  timestamp,
  questionId
}) => {
  // 工作流步骤配置
  const workflowSteps = [
    {
      key: 'entities',
      title: '实体提取',
      description: '从问题中提取实体和类别',
      icon: <InfoCircleOutlined />,
      content: result.entities,
      status: 'success'
    },
    {
      key: 'relations',
      title: '关系提取',
      description: '定义实体间的关系和谓词',
      icon: <InfoCircleOutlined />,
      content: result.relations,
      status: 'success'
    },
    {
      key: 'searchSpace',
      title: '搜索空间生成',
      description: '生成ASP搜索规则和约束',
      icon: <CodeOutlined />,
      content: result.searchSpace,
      status: 'success'
    },
    {
      key: 'arguments',
      title: '论证构建',
      description: '构建问题的论证和约束条件',
      icon: <CodeOutlined />,
      content: result.arguments,
      status: 'success'
    },
    {
      key: 'targets',
      title: '求解目标构建',
      description: '定义求解目标和验证条件',
      icon: <CodeOutlined />,
      content: result.targets,
      status: 'success'
    },
    {
      key: 'aspProgram',
      title: 'ASP程序拼接',
      description: '完整的ASP程序代码',
      icon: <CodeOutlined />,
      content: result.aspProgram,
      status: 'success'
    },
    {
      key: 'aspResult',
      title: 'ASP求解结果',
      description: 'ASP求解器的执行结果',
      icon: <CheckCircleOutlined />,
      content: typeof result.aspResult === 'object' 
        ? JSON.stringify(result.aspResult, null, 2)
        : result.aspResult,
      status: result.aspResult?.success ? 'success' : 'error'
    },
    {
      key: 'interpretation',
      title: '结果解释',
      description: '对求解结果的解释和分析',
      icon: <InfoCircleOutlined />,
      content: typeof result.interpretation === 'object'
        ? JSON.stringify(result.interpretation, null, 2)
        : result.interpretation,
      status: 'success'
    },
    {
      key: 'finalAnswer',
      title: '最终答案',
      description: '问题的最终答案和置信度',
      icon: <CheckCircleOutlined />,
      content: typeof result.finalAnswer === 'object'
        ? JSON.stringify(result.finalAnswer, null, 2)
        : result.finalAnswer,
      status: 'success'
    }
  ];

  // 导出完整结果
  const handleExportResult = () => {
    const exportData = {
      questionId,
      question,
      timestamp,
      workflowResult: result,
      currentStep: result.currentStep
    };
    exportToJson(exportData, `workflow_result_${questionId}`);
  };

  // 导出为文本
  const handleExportText = () => {
    let textContent = `问题: ${question}\n`;
    textContent += `问题ID: ${questionId}\n`;
    textContent += `时间: ${timestamp}\n`;
    textContent += `当前步骤: ${result.currentStep}\n\n`;
    
    workflowSteps.forEach(step => {
      textContent += `=== ${step.title} ===\n`;
      textContent += `${step.description}\n`;
      textContent += `${step.content}\n\n`;
    });
    
    exportToTxt(textContent, `workflow_result_${questionId}`);
  };

  // 获取状态标签颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'green';
      case 'error': return 'red';
      case 'pending': return 'orange';
      default: return 'default';
    }
  };

  return (
    <div style={{ marginTop: 24 }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              工作流推理结果
            </Title>
            <Text type="secondary">
              问题ID: {questionId} | 时间: {new Date(timestamp).toLocaleString()}
            </Text>
          </div>
          <Space>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleExportResult}
              size="small"
            >
              导出JSON
            </Button>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleExportText}
              size="small"
            >
              导出文本
            </Button>
          </Space>
        </div>

        {/* 当前步骤状态 */}
        <Alert
          message={`当前步骤: ${result.currentStep}`}
          type={result.currentStep === 'completed' ? 'success' : 'info'}
          showIcon
          style={{ marginBottom: 16 }}
        />

        {/* 问题内容 */}
        <Card size="small" style={{ marginBottom: 16, backgroundColor: '#fafafa' }}>
          <Title level={5} style={{ margin: 0, marginBottom: 8 }}>问题</Title>
          <Paragraph style={{ margin: 0 }}>{question}</Paragraph>
        </Card>

        {/* 工作流步骤 */}
        <Collapse 
          defaultActiveKey={['finalAnswer', 'aspResult']} 
          ghost
          size="large"
        >
          {workflowSteps.map((step) => (
            <Panel
              key={step.key}
              header={
                <Space>
                  {step.icon}
                  <span>{step.title}</span>
                  <Tag color={getStatusColor(step.status)}>
                    {step.status === 'success' ? '成功' : 
                     step.status === 'error' ? '错误' : '进行中'}
                  </Tag>
                </Space>
              }
              extra={
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {step.description}
                </Text>
              }
            >
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: 12, 
                borderRadius: 6,
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                fontSize: '13px',
                maxHeight: '400px',
                overflow: 'auto'
              }}>
                {step.content || '暂无内容'}
              </div>
            </Panel>
          ))}
        </Collapse>

        {/* 最终答案摘要 */}
        {result.finalAnswer && (
          <Card 
            size="small" 
            style={{ 
              marginTop: 16, 
              backgroundColor: '#f6ffed', 
              borderColor: '#b7eb8f' 
            }}
          >
            <Title level={5} style={{ margin: 0, marginBottom: 8, color: '#52c41a' }}>
              🎯 最终答案
            </Title>
            <div style={{ 
              backgroundColor: 'white', 
              padding: 12, 
              borderRadius: 4,
              border: '1px solid #d9d9d9'
            }}>
              {typeof result.finalAnswer === 'object' ? (
                <div>
                  {result.finalAnswer.answer && (
                    <Paragraph style={{ margin: 0, marginBottom: 8, fontWeight: 'bold' }}>
                      答案: {result.finalAnswer.answer}
                    </Paragraph>
                  )}
                  {result.finalAnswer.confidence && (
                    <Text type="secondary">
                      置信度: {(result.finalAnswer.confidence * 100).toFixed(1)}%
                    </Text>
                  )}
                  {result.finalAnswer.explanation && (
                    <Paragraph style={{ margin: '8px 0 0 0' }}>
                      解释: {result.finalAnswer.explanation}
                    </Paragraph>
                  )}
                </div>
              ) : (
                <Text>{result.finalAnswer}</Text>
              )}
            </div>
          </Card>
        )}
      </Card>
    </div>
  );
};

export default WorkflowResultComponent;
