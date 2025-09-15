import { saveAs } from 'file-saver';
import { ReasoningResult, HistoryStorage } from '../types';

// 生成唯一ID
export const generateId = (): string => {
  return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 格式化时间
export const formatTime = (timestamp: number | string): string => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
  return date.toLocaleString('zh-CN');
};

// 格式化日期
export const formatDate = (timestamp: number | string): string => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
  return date.toLocaleDateString('zh-CN');
};

// 截断文本
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// 导出单个结果为JSON
export const exportSingleResult = (result: ReasoningResult): void => {
  const data = JSON.stringify(result, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const fileName = `推理结果_${formatDate(result.timestamp)}_${result.id}.json`;
  saveAs(blob, fileName);
};

// 导出单个结果为TXT
export const exportSingleResultAsTxt = (result: ReasoningResult): void => {
  const content = `
逻辑推理结果报告
==================

问题：${result.question}

求解结果：${result.result}

生成时间：${formatTime(result.timestamp)}
  `.trim();
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const fileName = `推理结果_${formatDate(result.timestamp)}_${result.id}.txt`;
  saveAs(blob, fileName);
};

// 导出所有历史记录为JSON
export const exportAllHistory = (records: ReasoningResult[]): void => {
  const data = JSON.stringify(records, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const fileName = `历史记录_${formatDate(Date.now())}.json`;
  saveAs(blob, fileName);
};

// 导出所有历史记录为TXT
export const exportAllHistoryAsTxt = (records: ReasoningResult[]): void => {
  const content = records.map((record, index) => `
推理记录 ${index + 1}
==================

问题：${record.question}

求解结果：${record.result}

生成时间：${formatTime(record.timestamp)}

${index < records.length - 1 ? '\n' + '='.repeat(50) + '\n' : ''}
  `).join('');
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const fileName = `历史记录_${formatDate(Date.now())}.txt`;
  saveAs(blob, fileName);
};

// 过滤记录
export const filterRecords = (records: ReasoningResult[], keyword: string): ReasoningResult[] => {
  if (!keyword.trim()) return records;
  
  const lowerKeyword = keyword.toLowerCase();
  return records.filter(record => 
    record.question.toLowerCase().includes(lowerKeyword) ||
    record.result.toLowerCase().includes(lowerKeyword)
  );
};

// 新增：导出JSON数据
export const exportToJson = (data: any, fileName: string): void => {
  const jsonData = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  saveAs(blob, `${fileName}.json`);
};

// 新增：导出文本数据
export const exportToTxt = (content: string, fileName: string): void => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${fileName}.txt`);
};
