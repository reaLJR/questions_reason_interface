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
  message
} from 'antd';
import { 
  SearchOutlined, 
  DeleteOutlined, 
  DownloadOutlined,
  HistoryOutlined,
  ClearOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useAppStore } from '../store';
import { ReasoningResult } from '../types';
import { 
  formatTime, 
  truncateText, 
  filterRecords, 
  exportAllHistory, 
  exportAllHistoryAsTxt 
} from '../utils';
import ReasoningResultComponent from './ReasoningResult';

const { Search } = Input;
const { Text } = Typography;

const HistoryList: React.FC = () => {
  const [selectedRecord, setSelectedRecord] = useState<ReasoningResult | null>(null);
  const [filteredRecords, setFilteredRecords] = useState<ReasoningResult[]>([]);
  
  const { 
    historyRecords, 
    searchKeyword, 
    setSearchKeyword, 
    deleteHistoryRecord, 
    clearHistory,
    loadHistoryFromStorage 
  } = useAppStore();

  // 加载历史记录
  useEffect(() => {
    loadHistoryFromStorage();
  }, [loadHistoryFromStorage]);

  // 过滤记录
  useEffect(() => {
    const filtered = filterRecords(historyRecords, searchKeyword);
    setFilteredRecords(filtered);
  }, [historyRecords, searchKeyword]);

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
  };

  // 处理删除单条记录
  const handleDeleteRecord = (id: string) => {
    deleteHistoryRecord(id);
    if (selectedRecord?.id === id) {
      setSelectedRecord(null);
    }
    message.success('记录已删除');
  };

  // 处理清空所有记录
  const handleClearAll = () => {
    clearHistory();
    setSelectedRecord(null);
    message.success('所有记录已清空');
  };

  // 处理导出所有记录为JSON
  const handleExportAllJson = () => {
    exportAllHistory(historyRecords);
    message.success('历史记录已导出为JSON文件');
  };

  // 处理导出所有记录为TXT
  const handleExportAllTxt = () => {
    exportAllHistoryAsTxt(historyRecords);
    message.success('历史记录已导出为TXT文件');
  };

  // 渲染列表项
  const renderListItem = (record: ReasoningResult) => (
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
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Text strong>{truncateText(record.question, 50)}</Text>
            <Tag color="blue" style={{ marginLeft: 8 }}>
              逻辑推理
            </Tag>
          </div>
        }
        description={
          <div>
            <div style={{ marginBottom: 4 }}>
              <Text type="secondary">
                结果：{truncateText(record.result, 80)}
              </Text>
            </div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {formatTime(record.timestamp)}
            </Text>
          </div>
        }
      />
    </List.Item>
  );

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
              <Tooltip title="导出所有记录为JSON">
                <Button 
                  icon={<DownloadOutlined />} 
                  onClick={handleExportAllJson}
                  disabled={historyRecords.length === 0}
                  size="small"
                >
                  导出JSON
                </Button>
              </Tooltip>
              <Tooltip title="导出所有记录为TXT">
                <Button 
                  icon={<FileTextOutlined />} 
                  onClick={handleExportAllTxt}
                  disabled={historyRecords.length === 0}
                  size="small"
                >
                  导出TXT
                </Button>
              </Tooltip>
              <Popconfirm
                title="确定要清空所有历史记录吗？"
                onConfirm={handleClearAll}
                okText="确定"
                cancelText="取消"
              >
                <Button 
                  icon={<ClearOutlined />} 
                  danger
                  disabled={historyRecords.length === 0}
                  size="small"
                >
                  清空
                </Button>
              </Popconfirm>
            </Space>
          }
        >
          {/* 搜索框 */}
          <div style={{ marginBottom: 16 }}>
            <Search
              placeholder="搜索问题、领域、逻辑或结果..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={handleSearch}
              allowClear
              enterButton={<SearchOutlined />}
            />
          </div>

          {/* 记录列表 */}
          {filteredRecords.length > 0 ? (
            <List
              dataSource={filteredRecords}
              renderItem={renderListItem}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`
              }}
              style={{ maxHeight: '600px', overflow: 'auto' }}
            />
          ) : (
            <Empty 
              description={
                searchKeyword 
                  ? `没有找到包含"${searchKeyword}"的记录` 
                  : "暂无历史记录"
              }
            />
          )}
        </Card>
      </div>

      {/* 右侧详情展示 */}
      {selectedRecord && (
        <div style={{ flex: 1 }}>
          <ReasoningResultComponent result={selectedRecord} />
        </div>
      )}
    </div>
  );
};

export default HistoryList;
