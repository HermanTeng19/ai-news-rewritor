# Yahoo Top Stories API 配置指南

## 概述

Yahoo Top Stories功能使用SerpApi来获取真实的Yahoo新闻数据，替换了原本的知乎热搜。该功能提供：

- 真实的Yahoo新闻内容
- 英文界面和数据格式
- 新闻图片爬取功能
- 丰富的新闻元数据（来源、日期、摘要等）

## API配置

### 1. SerpApi密钥

Yahoo Top Stories使用与Google Top Stories相同的SerpApi服务。确保您已经配置了SERPAPI_KEY：

```bash
# .env 文件中添加
SERPAPI_KEY=your_serpapi_key_here
```

或在 `src/config/config.js` 中配置：

```javascript
module.exports = {
    SERPAPI_KEY: 'your_serpapi_key_here'
};
```

### 2. API参数

Yahoo新闻API使用以下参数：

```javascript
const params = {
  engine: 'yahoo',           // 使用Yahoo搜索引擎
  type: 'news',             // 新闻类型
  api_key: this.apiKey,     // SerpApi密钥
  num: 20,                  // 获取20条新闻
  gl: 'us',                 // 地理位置：美国
  hl: 'en',                 // 语言：英语
  tbs: 'qdr:d'              // 最近一天的新闻
};
```

## 功能特性

### 1. 数据格式

每条Yahoo新闻包含以下信息：

```javascript
{
  id: 1,                    // 新闻ID
  title: "新闻标题",         // 新闻标题
  hot: 2800000,            // 随机热度值
  source: "Yahoo Finance",  // 新闻来源
  link: "https://...",     // 原文链接
  snippet: "新闻摘要...",   // 新闻摘要
  date: "2023-...",        // 发布时间
  thumbnail: "https://..." // 缩略图URL
}
```

### 2. 英文界面

Yahoo Top Stories使用英文界面：

- **加载文本**: "Loading Yahoo Top Stories..."
- **热度标签**: "views" (而非"热度")
- **数字格式**: "2.8M views", "1.5K views"
- **按钮文本**: "Copy", "Share", "Regenerate"
- **错误信息**: 英文错误提示

### 3. 图片爬取

Yahoo新闻支持真实图片爬取：

- 从新闻链接中提取Open Graph图片
- 支持Yahoo News、Reuters、AP等主流媒体
- 自动过滤装饰性图片
- 失败时使用高质量备用图片

## API端点

### 获取Yahoo Top Stories

```http
GET /api/hot-topics?platform=zhihu
```

或

```http
GET /api/hot-topics?platform=yahoo
```

**响应示例**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Yahoo Finance Reports: Tech Stocks Surge in Morning Trading",
      "hot": 2800000,
      "source": "Yahoo Finance",
      "link": "https://finance.yahoo.com/news/...",
      "snippet": "Major technology companies see significant gains...",
      "date": "2023-12-07T10:30:00Z",
      "thumbnail": "https://picsum.photos/seed/yahoo1/200/150"
    }
  ]
}
```

### 生成内容

```http
POST /api/generate-content
```

**请求体**:

```json
{
  "topic": "新闻标题",
  "source": "Yahoo Finance",
  "platform": "zhihu",
  "originalNews": {
    "title": "新闻标题",
    "source": "Yahoo Finance",
    "link": "https://finance.yahoo.com/news/...",
    "snippet": "新闻摘要...",
    "date": "2023-12-07T10:30:00Z"
  }
}
```

## 备用数据

当API调用失败时，系统提供备用新闻数据：

1. **Yahoo Finance**: 科技股市行情
2. **Yahoo Sports**: 体育赛事新闻  
3. **Yahoo News**: 国际新闻
4. **Yahoo Health**: 医疗健康
5. **Yahoo News**: 环保倡议

## 错误处理

### 常见错误

1. **API密钥无效**
   ```
   Error: SERPAPI_KEY not configured
   ```
   解决：检查环境变量或配置文件中的API密钥

2. **网络请求失败**
   ```
   Error fetching Yahoo Top Stories: Network Error
   ```
   解决：检查网络连接和API服务状态

3. **数据格式错误**
   ```
   Error: No news results found
   ```
   解决：API返回数据格式异常，使用备用数据

### 调试信息

开发环境下可以查看详细日志：

```bash
npm start

# 控制台输出
Fetching Yahoo Top Stories...
Extracting real news images...
Successfully extracted news image: https://example.com/image.jpg
```

## 与Google Top Stories的区别

| 特性 | Google Top Stories | Yahoo Top Stories |
|------|-------------------|-------------------|
| **平台映射** | weibo/google | zhihu/yahoo |
| **API引擎** | `engine: 'google'` | `engine: 'yahoo'` |
| **数据来源** | Google新闻 | Yahoo新闻 |
| **界面语言** | 英文 | 英文 |
| **图片爬取** | ✅ 支持 | ✅ 支持 |
| **备用数据** | Google主题 | Yahoo主题 |

## 使用建议

### 1. API配额管理

SerpApi有请求限制，建议：

- 合理设置刷新频率
- 使用缓存减少API调用
- 监控API使用量

### 2. 内容质量

Yahoo新闻通常包含：

- 财经新闻（Yahoo Finance）
- 体育新闻（Yahoo Sports）
- 科技新闻
- 国际新闻

### 3. 图片处理

- Yahoo新闻图片质量较高
- 支持多种新闻网站的图片提取
- 自动处理图片加载失败

## 故障排除

1. **检查API密钥**: 确保SERPAPI_KEY正确配置
2. **验证网络连接**: 确保可以访问SerpApi服务
3. **查看控制台日志**: 观察详细的错误信息
4. **测试备用数据**: 确认备用机制正常工作

## 更新日志

- **v1.0.0**: 初始版本，支持基础Yahoo新闻获取
- **v1.1.0**: 添加图片爬取功能
- **v1.2.0**: 优化错误处理和备用数据
- **v1.3.0**: 完整英文界面支持 