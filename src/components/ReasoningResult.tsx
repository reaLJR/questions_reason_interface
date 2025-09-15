import React from 'react';
import { Card, Typography, Tag, Steps, Button, Space } from 'antd';
import { 
  BookOutlined, 
  CodeOutlined, 
  PlayCircleOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { ReasoningResult } from '../types';
import { formatTime, exportSingleResult, exportSingleResultAsTxt } from '../utils';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

interface ReasoningResultProps {
  result: ReasoningResult;
}

const ReasoningResultComponent: React.FC<ReasoningResultProps> = ({ result }) => {
  // 处理导出JSON
  const handleExportJson = () => {
    exportSingleResult(result);
  };

  // 处理导出TXT
  const handleExportTxt = () => {
    exportSingleResultAsTxt(result);
  };

  return (
    <Card 
      title={
        <Space>
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
          推理结果
        </Space>
      }
      style={{ marginBottom: 16 }}
      extra={
        <Space>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={handleExportJson}
            size="small"
          >
            导出JSON
          </Button>
          <Button 
            icon={<FileTextOutlined />} 
            onClick={handleExportTxt}
            size="small"
          >
            导出TXT
          </Button>
        </Space>
      }
    >
      {/* 问题 */}
      <div style={{ marginBottom: 16 }}>
        <Title level={5}>
          <Text strong>问题：</Text>
        </Title>
        <Paragraph style={{ marginBottom: 0 }}>
          {result.question}
        </Paragraph>
      </div>

      {/* 推理步骤 */}
      {result.steps && result.steps.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Title level={5}>
            <BulbOutlined style={{ marginRight: 8 }} />
            推理步骤
          </Title>
          <Steps
            direction="vertical"
            size="small"
            items={result.steps.map((step) => ({
              title: step.content,
              description: step.status,
              status: step.status === 'success' ? 'finish' : 
                      step.status === 'error' ? 'error' : 'process'
            }))}
          />
        </div>
      )}

      {/* 结果 */}
      <div style={{ marginBottom: 16 }}>
        <Title level={5}>
          <CheckCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          推理结果
        </Title>
        <Paragraph style={{
          backgroundColor: '#f0f9ff',
          padding: '12px',
          borderRadius: '6px',
          border: '1px solid #91d5ff',
          margin: 0
        }}>
          {result.result}
        </Paragraph>
      </div>

      {/* 时间信息 */}
      <div style={{ textAlign: 'right' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          生成时间：{formatTime(result.timestamp)}
        </Text>
      </div>
    </Card>
  );
};

export default ReasoningResultComponent;



