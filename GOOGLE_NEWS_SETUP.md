# Google Top Stories 功能说明

## 功能概述

该项目已成功添加了 Google Top Stories 功能，将原来的"微博"热搜榜替换为Google热门新闻。当用户选择Google Top Stories时，系统会显示真实的新闻内容，而不是AI改写的内容。

## 实现的功能

1. **真实新闻数据**：通过SerpApi获取Google Top Stories的真实新闻数据
2. **多语言支持**：获取英文新闻内容，保持内容的原始性和准确性
3. **完整新闻信息**：包括标题、来源、摘要、发布时间、链接、缩略图等完整信息
4. **无AI改写**：对于Google Top Stories，直接显示原始新闻内容，不进行AI改写
5. **富媒体显示**：新闻列表显示缩略图、来源标签、发布时间和新闻摘要
6. **原文链接**：每条新闻都提供"View Original Article"链接跳转到原始新闻源
7. **完整新闻文本**：点击新闻后显示包含来源信息和发布时间的完整格式化文本
8. **高分辨率图片**：内容页面使用600x400像素高分辨率图片，避免缩略图放大模糊问题

## 新增文件

- `src/api/googleNewsService.js` - Google新闻服务，负责调用SerpApi获取Google Top Stories
- `GOOGLE_NEWS_SETUP.md` - 本说明文档

## 修改的文件

1. **server.js**
   - 添加dotenv配置加载
   - 导入googleNewsService
   - 修改/api/hot-topics路由，支持Google平台
   - 修改/api/generate-content路由，对Google新闻使用真实内容

2. **src/config.js**
   - 添加SERPAPI_KEY配置支持

3. **public/index.html**
   - 将"微博"按钮改为"Google Top Stories"
   - 更换图标为Google图标

4. **public/js/app.js**
   - 修改generateContent函数，传递平台信息和原始新闻数据

## API配置

### 环境变量配置

需要在项目根目录创建`.env`文件，包含以下配置：

```bash
# SerpApi配置 - 用于获取Google Top Stories和百度新闻
SERPAPI_KEY=your_serpapi_key_here

# NVIDIA DeepSeek配置 - 用于AI内容生成
NVIDIA_API_KEY=your_nvidia_api_key_here
```

### 获取API Key

1. **SerpApi Key**: 
   - 访问 https://serpapi.com/
   - 注册账户并获取API密钥
   - 每月免费100次请求

2. **NVIDIA DeepSeek Key**:
   - 访问 https://build.nvidia.com/
   - 注册并获取API密钥

## API使用说明

### Google Top Stories API

```javascript
// 获取Google热门新闻
GET /api/hot-topics?platform=weibo
// 或
GET /api/hot-topics?platform=google
```

### 新闻内容生成

```javascript
// 生成内容（对于Google新闻会返回真实内容）
POST /api/generate-content
{
  "topic": "新闻标题",
  "source": "新闻来源",
  "platform": "weibo", // google新闻平台
  "originalNews": {
    "snippet": "原始新闻摘要",
    "link": "新闻链接",
    "date": "发布时间"
  }
}
```

## 数据格式

### Google新闻数据格式

```javascript
{
  "id": 1,
  "title": "Overnight curfew declared for downtown LA after ICE protests",
  "hot": 601267, // 随机生成的热度值
  "source": "LAist", // 真实新闻源
  "link": "https://laist.com/news/federal-agents-immigration-raids-across-la", // 原始新闻链接
  "snippet": "Mayor Karen Bass said she'll consult with officials Wednesday on whether to extend the curfew.", // 真实新闻摘要
  "date": "1 hour ago", // 相对发布时间
  "thumbnail": "https://serpapi.com/.../images/...jpeg" // 真实新闻缩略图
}
```

### 生成的内容格式

```javascript
{
  "text": "Trump tariffs live updates\n\nUS and China agree on framework to ease trade tensions\n\nSource: Yahoo Finance | Published: 3 hours ago\n\nFor the complete story and latest updates, visit the original article at the source website.",
  "imageUrl": "https://picsum.photos/seed/trumptariffsliveupda61/600/400", // 600x400高分辨率图片
  "imagePrompt": "News image about: Trump tariffs live updates"
}
```

### 图片分辨率说明

- **新闻列表缩略图**: 60x60像素，用于列表显示预览
- **内容页面图片**: 600x400像素，高分辨率，基于新闻话题生成相关图片
- **图片种子算法**: 使用新闻标题生成图片种子，确保同一新闻获得一致的相关图片

## 备用数据

当SerpApi调用失败时，系统会自动切换到预设的备用新闻数据，确保用户体验的连续性。

## 测试验证

启动服务器后，可以通过以下方式测试：

```bash
# 启动服务器
npm start

# 测试Google新闻API
curl "http://localhost:3000/api/hot-topics?platform=weibo"

# 在浏览器中访问
http://localhost:3000
```

选择"Google Top Stories"标签，点击任意新闻条目，应该会显示真实的新闻内容而不是AI改写的内容。

## 语言显示修复

项目已实现多语言界面支持：

### Google Top Stories平台（英文界面）
- 热度显示：使用 "K"（千）、"M"（百万）格式
- 按钮文字：Regenerate、Copy、Share
- 状态文字：Loading top stories...、Select a story from the left to view content
- 错误信息：英文提示

### 中文平台（百度、知乎）
- 热度显示：使用 "万"、"亿" 格式  
- 按钮文字：重新生成、复制内容、分享
- 状态文字：正在加载热搜榜单...、从左侧选择一条热搜
- 错误信息：中文提示

界面会根据选择的平台自动切换语言，确保用户体验的一致性。

## 注意事项

1. 确保.env文件中的SERPAPI_KEY配置正确
2. Google新闻为英文内容，界面自动显示英文
3. 每月API调用次数有限制，请合理使用
4. 真实新闻内容直接来源于Google，无需AI改写
5. 数字格式化和界面文字会根据平台自动调整 