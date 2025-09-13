import React, { useEffect } from 'react';
import { Layout, Menu, Typography, Space } from 'antd';
import { 
  BulbOutlined, 
  SettingOutlined 
} from '@ant-design/icons';
import { useAppStore } from './store';
import QuestionInput from './components/QuestionInput';
import HistoryList from './components/HistoryList';
import './App.css';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  const [selectedKey, setSelectedKey] = React.useState('input');
  const { loadHistoryFromStorage } = useAppStore();

  // 初始化时加载历史记录
  useEffect(() => {
    loadHistoryFromStorage();
  }, [loadHistoryFromStorage]);

  // 渲染内容区域
  const renderContent = () => {
    switch (selectedKey) {
      case 'input':
        return <QuestionInput />;
      case 'history':
        return <HistoryList />;
      case 'settings':
        return (
          <div style={{ padding: '20px' }}>
            <Title level={3}>设置</Title>
            <p>设置功能开发中...</p>
          </div>
        );
      default:
        return <QuestionInput />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 头部 */}
      <Header style={{ 
        background: '#fff', 
        padding: '0 24px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Space>
          <BulbOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
          <Title level={3} style={{ margin: 0 }}>
            逻辑推理助手
          </Title>
        </Space>
        <div style={{ fontSize: '14px', color: '#666' }}>
          基于AI的智能推理系统
        </div>
      </Header>

      <Layout>
        {/* 侧边栏 - 暂时隐藏历史记录 */}
        <Sider 
          width={200} 
          style={{ 
            background: '#fff',
            borderRight: '1px solid #f0f0f0'
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            style={{ height: '100%', borderRight: 0 }}
            onSelect={({ key }) => setSelectedKey(key)}
            items={[
              {
                key: 'input',
                icon: <BulbOutlined />,
                label: '问题输入',
              },
              // 暂时注释掉历史记录功能
              // {
              //   key: 'history',
              //   icon: <HistoryOutlined />,
              //   label: '历史记录',
              // },
              {
                key: 'settings',
                icon: <SettingOutlined />,
                label: '设置',
              },
            ]}
          />
        </Sider>

        {/* 主内容区域 */}
        <Layout style={{ padding: '24px' }}>
          <Content style={{ 
            background: '#fff', 
            padding: '24px',
            margin: 0,
            minHeight: 280,
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default App;
