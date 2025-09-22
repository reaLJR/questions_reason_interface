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
import { HistoryRecord, HistoryQueryRequest, HistoryStats } from '../types';
import { reasoningAPI } from '../services/api';
import { formatTime, truncateText } from '../utils';

const { Search } = Input;
const { Text, Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const HistoryListNew: React.FC = () => {
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [, setStatsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  
  // 查询参数
  const [queryParams, setQueryParams] = useState<HistoryQueryRequest>({
    limit: 50,
    offset: 0
  });
  
  // 搜索和过滤状态
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'success' | 'error' | 'timeout' | 'cancelled' | ''>('');
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  // 加载历史记录
  const loadHistoryRecords = React.useCallback(async () => {
    setLoading(true);
    try {
      const params: HistoryQueryRequest = {
        ...queryParams,
        search_text: searchText || undefined,
        status: statusFilter || undefined,
        start_date: dateRange?.[0] || undefined,
        end_date: dateRange?.[1] || undefined,
      };
      
      const response = await reasoningAPI.getHistoryRecords(params);
      setHistoryRecords(response.records);
      setTotalCount(response.total_count);
    } catch (error: any) {
      console.error('加载历史记录失败:', error);
      message.error('加载历史记录失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [queryParams, searchText, statusFilter, dateRange]);

  // 加载统计信息
  const loadStats = React.useCallback(async () => {
    setStatsLoading(true);
    try {
      const statsData = await reasoningAPI.getHistoryStats();
      setStats(statsData);
    } catch (error: any) {
      console.error('加载统计信息失败:', error);
      message.error('加载统计信息失败: ' + error.message);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    loadHistoryRecords();
    loadStats();
  }, [loadHistoryRecords, loadStats]);

  // 处理搜索
  const handleSearch = React.useCallback((value: string) => {
    setSearchText(value);
    setQueryParams(prev => ({ ...prev, offset: 0 }));
  }, []);

  // 处理状态过滤
  const handleStatusFilter = React.useCallback((value: 'success' | 'error' | 'timeout' | 'cancelled' | '') => {
    setStatusFilter(value);
    setQueryParams(prev => ({ ...prev, offset: 0 }));
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
    setQueryParams(prev => ({ ...prev, offset: 0 }));
  }, []);

  // 应用过滤条件
  useEffect(() => {
    loadHistoryRecords();
  }, [loadHistoryRecords]);

  // 处理删除记录
  const handleDeleteRecord = React.useCallback(async (recordId: string) => {
    try {
      await reasoningAPI.deleteHistoryRecord(recordId);
      message.success('记录已删除');
      loadHistoryRecords();
      loadStats();
      if (selectedRecord?.id === recordId) {
        setSelectedRecord(null);
      }
    } catch (error: any) {
      console.error('删除记录失败:', error);
      message.error('删除记录失败: ' + error.message);
    }
  }, [loadHistoryRecords, loadStats, selectedRecord]);

  // 处理分页
  const handlePageChange = React.useCallback((page: number, pageSize: number) => {
    setQueryParams(prev => ({
      ...prev,
      offset: (page - 1) * pageSize,
      limit: pageSize
    }));
  }, []);

  // 处理刷新
  const handleRefresh = React.useCallback(() => {
    loadHistoryRecords();
    loadStats();
  }, [loadHistoryRecords, loadStats]);

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
  const renderListItem = React.useCallback((record: HistoryRecord) => (
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
            {renderStatusTag(record.status)}
          </div>
        }
        description={
          <div>
            <div style={{ marginBottom: 4 }}>
              <Text type="secondary">
                问题ID: {record.question_id}
              </Text>
            </div>
            <div style={{ marginBottom: 4 }}>
              <Text type="secondary">
                执行时间: {record.execution_time_ms}ms
              </Text>
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {formatTime(record.created_at)}
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
              历史记录 ({historyRecords.length})
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
              <Tooltip title="查看统计信息">
                <Button 
                  icon={<BarChartOutlined />} 
                  onClick={loadStats}
                  size="small"
                />
              </Tooltip>
            </Space>
          }
        >
          {/* 统计信息 */}
          {stats && (
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Statistic title="总记录数" value={stats.total_records || 0} />
              </Col>
              <Col span={6}>
                <Statistic title="成功数" value={stats.success_count || 0} valueStyle={{ color: '#3f8600' }} />
              </Col>
              <Col span={6}>
                <Statistic title="错误数" value={stats.error_count || 0} valueStyle={{ color: '#cf1322' }} />
              </Col>
              <Col span={6}>
                <Statistic title="平均执行时间" value={Math.round(stats.avg_execution_time_ms || 0)} suffix="ms" />
              </Col>
            </Row>
          )}

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
            {historyRecords.length > 0 ? (
              <List
                dataSource={historyRecords}
                renderItem={renderListItem}
                pagination={{
                  current: Math.floor((queryParams.offset || 0) / (queryParams.limit || 50)) + 1,
                  pageSize: queryParams.limit || 50,
                  total: totalCount,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
                  onChange: handlePageChange
                }}
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
          <Card title="记录详情">
            <div style={{ marginBottom: 16 }}>
              <Title level={4}>问题</Title>
              <Text>{selectedRecord.question}</Text>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <Title level={4}>基本信息</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>问题ID: </Text>
                  <Text>{selectedRecord.question_id}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>状态: </Text>
                  {renderStatusTag(selectedRecord.status)}
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: 8 }}>
                <Col span={12}>
                  <Text strong>执行时间: </Text>
                  <Text>{selectedRecord.execution_time_ms}ms</Text>
                </Col>
                <Col span={12}>
                  <Text strong>创建时间: </Text>
                  <Text>{formatTime(selectedRecord.created_at)}</Text>
                </Col>
              </Row>
            </div>

            {selectedRecord.error_message && (
              <div style={{ marginBottom: 16 }}>
                <Title level={4}>错误信息</Title>
                <Alert message={selectedRecord.error_message} type="error" />
              </div>
            )}

            {selectedRecord.result && (
              <div>
                <Title level={4}>推理结果</Title>
                <div style={{
                  backgroundColor: '#f0f9ff',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #91d5ff',
                  marginBottom: 16
                }}>
                  <Text>{selectedRecord.result.result}</Text>
                </div>
                
                {selectedRecord.result.asp_code && (
                  <div style={{ marginBottom: 16 }}>
                    <Title level={5}>ASP代码</Title>
                    <pre style={{
                      backgroundColor: '#f5f5f5',
                      padding: '12px',
                      borderRadius: '6px',
                      overflow: 'auto',
                      fontSize: '12px'
                    }}>
                      {selectedRecord.result.asp_code}
                    </pre>
                  </div>
                )}
                
                {selectedRecord.result.models && selectedRecord.result.models.length > 0 && (
                  <div>
                    <Title level={5}>模型结果</Title>
                    <div>
                      {selectedRecord.result.models.map((model, index) => (
                        <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                          {model}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default HistoryListNew;