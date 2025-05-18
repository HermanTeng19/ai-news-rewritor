# AI 热搜榜内容生成器

一个现代化的网页应用，展示实时百度热搜榜并利用AI根据选定的热搜话题生成相关内容。

## 功能特点

- 展示实时百度热搜榜单
- 点击热搜话题自动生成AI内容
- 使用NVIDIA DeepSeek模型生成高质量新闻内容
- 为每个新闻话题自动配图
- 支持内容重新生成、复制和分享
- 响应式设计，适配各种设备
- 完善的错误处理和后备机制

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **后端**: Node.js, Express
- **API集成**: 
  - SerpAPI (获取百度热搜数据)
  - NVIDIA DeepSeek API (AI内容生成)
- **其他依赖**:
  - axios: API请求
  - cors: 跨域资源共享
  - dotenv: 环境变量管理

## 项目结构

```
ai-news-rewritor/
├── .env                    # 环境变量配置文件
├── .gitignore              # Git忽略文件
├── server.js               # 服务器入口文件
├── package.json            # 项目依赖管理
├── public/                 # 静态资源和前端代码
│   ├── css/                # 样式文件
│   │   └── styles.css      # 主样式文件
│   ├── js/                 # JavaScript 文件
│   │   └── app.js          # 主应用逻辑
│   └── index.html          # 主页面
└── src/                    # 源代码
    ├── api/                # API 服务
    │   ├── baiduNewsService.js  # 百度热搜服务
    │   ├── deepSeekService.js   # NVIDIA DeepSeek内容生成服务
    │   └── trendingService.js   # 后备热搜数据服务
    ├── config.js           # 应用配置文件
    ├── components/         # 组件 (用于未来扩展)
    └── utils/              # 工具函数
```

## 快速开始

1. 克隆仓库:
   ```
   git clone https://github.com/yourusername/ai-news-rewritor.git
   cd ai-news-rewritor
   ```

2. 安装依赖:
   ```
   npm install
   ```

3. 配置环境变量:
   - 创建 `.env` 文件在项目根目录
   - 添加以下内容:
     ```
     # API Keys
     SERPAPI_KEY=your_serpapi_key_here
     NVIDIA_DEEPSEEK_KEY=your_nvidia_api_key_here
     
     # Server Configuration
     PORT=3000
     ```

4. 启动应用:
   ```
   npm start
   ```

5. 打开浏览器访问 `http://localhost:3000`

## API 配置

### SerpAPI (百度热搜数据)
- 注册 [SerpAPI](https://serpapi.com/) 账号获取API密钥
- 将密钥添加到 `.env` 文件中的 `SERPAPI_KEY` 变量

### NVIDIA DeepSeek API
- 访问 [NVIDIA API Catalog](https://www.nvidia.com/en-us/ai-data-science/generative-ai/api-catalog/) 获取DeepSeek模型的API密钥
- 将密钥添加到 `.env` 文件中的 `NVIDIA_DEEPSEEK_KEY` 变量

## 自定义和扩展

- **添加新热搜源**: 在 `src/api/` 目录下创建新的服务模块，然后在 `server.js` 中添加对应的路由
- **自定义AI响应**: 修改 `src/api/deepSeekService.js` 中的提示词和参数
- **UI定制**: 修改 `public/css/styles.css` 文件自定义界面外观
- **错误处理**: 每个服务都包含错误处理和后备机制，可根据需要调整

## 许可证

MIT

## 联系方式

如有任何问题或建议，请提交issue或联系项目维护者。 