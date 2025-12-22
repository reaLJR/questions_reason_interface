import React, { useState, useEffect } from 'react';
import { 
  List, 
  Card, 
  Input, 
  Button, 
  Space, 
  Typography, 
  Tag, 
  Popconfirm, 
  Empty,
  Tooltip,
  message,
  Select,
  DatePicker,
  Row,
  Col,
  Statistic,
  Spin,
  Alert
} from 'antd';
import { 
  SearchOutlined, 
  DeleteOutlined, 
  HistoryOutlined,
  ReloadOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { HistoryRecord, HistoryQueryRequest, HistoryStats, ReasoningResult } from '../types';
import { reasoningAPI } from '../services/api';
import { formatTime, truncateText } from '../utils';
import { useAppStore } from '../store';
import WorkflowResultComponent from './WorkflowResult';

const { Search } = Input;
const { Text, Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const HistoryListNew: React.FC = () => {
  const { historyRecords: localRecords, deleteHistoryRecord } = useAppStore();
  const [selectedRecord, setSelectedRecord] = useState<ReasoningResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [filteredRecords, setFilteredRecords] = useState<ReasoningResult[]>([]);
  
  // 搜索和过滤状态
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'success' | 'error' | 'timeout' | 'cancelled' | ''>('');
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  // 过滤历史记录
  const filterRecords = React.useCallback(() => {
    let filtered = [...localRecords];
    
    // 搜索过滤
    if (searchText) {
      filtered = filtered.filter(record => 
        record.question.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // 状态过滤（本地记录没有status字段，暂时跳过）
    // if (statusFilter) {
    //   filtered = filtered.filter(record => record.status === statusFilter);
    // }
    
    // 日期过滤
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.timestamp);
        return recordDate >= startDate && recordDate <= endDate;
      });
    }
    
    setFilteredRecords(filtered);
  }, [localRecords, searchText, statusFilter, dateRange]);

  // 初始化过滤
  useEffect(() => {
    filterRecords();
  }, [filterRecords]);

  // 处理搜索
  const handleSearch = React.useCallback((value: string) => {
    setSearchText(value);
  }, []);

  // 处理状态过滤
  const handleStatusFilter = React.useCallback((value: 'success' | 'error' | 'timeout' | 'cancelled' | '') => {
    setStatusFilter(value);
  }, []);

  // 处理日期范围过滤
  const handleDateRangeChange = React.useCallback((dates: any, dateStrings: [string, string]) => {
    if (dates && dates[0] && dates[1]) {
      // 转换为ISO格式
      const startDate = dates[0].toISOString();
      const endDate = dates[1].toISOString();
      setDateRange([startDate, endDate]);
    } else {
      setDateRange(null);
    }
  }, []);

  // 处理删除记录
  const handleDeleteRecord = React.useCallback((recordId: string) => {
    try {
      deleteHistoryRecord(recordId);
      message.success('记录已删除');
      if (selectedRecord?.id === recordId) {
        setSelectedRecord(null);
      }
    } catch (error: any) {
      console.error('删除记录失败:', error);
      message.error('删除记录失败: ' + error.message);
    }
  }, [deleteHistoryRecord, selectedRecord]);

  // 处理刷新
  const handleRefresh = React.useCallback(() => {
    filterRecords();
  }, [filterRecords]);

  // 渲染状态标签
  const renderStatusTag = React.useCallback((status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      success: { color: 'green', text: '成功' },
      error: { color: 'red', text: '错误' },
      timeout: { color: 'orange', text: '超时' },
      cancelled: { color: 'gray', text: '取消' }
    };
    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  }, []);

  // 渲染列表项
  const renderListItem = React.useCallback((record: ReasoningResult) => (
    <List.Item
      actions={[
        <Tooltip title="查看详情">
          <Button 
            type="link" 
            onClick={() => setSelectedRecord(record)}
            size="small"
          >
            查看
          </Button>
        </Tooltip>,
        <Popconfirm
          title="确定要删除这条记录吗？"
          onConfirm={() => handleDeleteRecord(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Tooltip title="删除记录">
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
              size="small"
            >
              删除
            </Button>
          </Tooltip>
        </Popconfirm>
      ]}
    >
      <List.Item.Meta
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text strong>{truncateText(record.question, 50)}</Text>
            <Tag color="green">成功</Tag>
          </div>
        }
        description={
          <div>
            <div style={{ marginBottom: 4 }}>
              <Text type="secondary">
                记录ID: {record.id}
              </Text>
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {formatTime(record.timestamp)}
            </Text>
          </div>
        }
      />
    </List.Item>
  ), [renderStatusTag, handleDeleteRecord]);

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {/* 左侧历史记录列表 */}
      <div style={{ flex: 1 }}>
        <Card 
          title={
            <Space>
              <HistoryOutlined />
              历史记录 ({filteredRecords.length})
            </Space>
          }
          extra={
            <Space>
              <Tooltip title="刷新数据">
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={handleRefresh}
                  size="small"
                />
              </Tooltip>
            </Space>
          }
        >

          {/* 搜索和过滤 */}
          <div style={{ marginBottom: 16 }}>
            <Row gutter={8}>
              <Col span={12}>
                <Search
                  placeholder="搜索问题内容..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={handleSearch}
                  allowClear
                  enterButton={<SearchOutlined />}
                />
              </Col>
              <Col span={6}>
                <Select
                  placeholder="状态过滤"
                  value={statusFilter}
                  onChange={handleStatusFilter}
                  allowClear
                  style={{ width: '100%' }}
                >
                  <Option value="success">成功</Option>
                  <Option value="error">错误</Option>
                  <Option value="timeout">超时</Option>
                  <Option value="cancelled">取消</Option>
                </Select>
              </Col>
              <Col span={6}>
                <RangePicker
                  placeholder={['开始时间', '结束时间']}
                  onChange={handleDateRangeChange}
                  style={{ width: '100%' }}
                />
              </Col>
            </Row>
          </div>

          {/* 记录列表 */}
          <Spin spinning={loading}>
            {filteredRecords.length > 0 ? (
              <List
                dataSource={filteredRecords}
                renderItem={renderListItem}
                style={{ maxHeight: '600px', overflow: 'auto' }}
              />
            ) : (
              <Empty 
                description={
                  loading ? "加载中..." : 
                  searchText || statusFilter || dateRange
                    ? "没有找到符合条件的记录" 
                    : "暂无历史记录"
                }
              />
            )}
          </Spin>
        </Card>
      </div>

      {/* 右侧详情展示 */}
      {selectedRecord && (
        <div style={{ flex: 1 }}>
          <WorkflowResultComponent
            result={{
              answer: selectedRecord.result || '',
              explanation: '',
              reasoningSteps: [],
              entities: selectedRecord.result || '',
              relations: '',
              searchSpace: '',
              arguments: '',
              targets: '',
              aspProgram: '',
              aspResult: {},
              interpretation: {},
              finalAnswer: selectedRecord.result || '',
              currentStep: 'completed'
            }}
            question={selectedRecord.question}
            timestamp={selectedRecord.timestamp}
            questionId={selectedRecord.id}
          />
        </div>
      )}
    </div>
  );
};

export default HistoryListNew;