# AI 热搜榜内容生成器

一个现代化的网页应用，展示当前热搜榜单并利用 AI 根据选定的热搜话题生成相关内容。

## 功能特点

- 展示实时热搜榜单
- 点击热搜话题自动生成 AI 内容
- 生成包含图片和文字的内容
- 支持内容重新生成、复制和分享
- 响应式设计，适配各种设备

## 技术栈

- 前端: HTML5, CSS3, JavaScript (ES6+)
- AI 集成: 预留了与 AI API 集成的接口 (如 OpenAI)
- 数据来源: 支持从各种热搜平台获取数据 (微博、知乎、百度)

## 项目结构

```
ai-news-rewritor/
├── public/                 # 静态资源和前端代码
│   ├── css/                # 样式文件
│   │   └── styles.css      # 主样式文件
│   ├── js/                 # JavaScript 文件
│   │   └── app.js          # 主应用逻辑
│   └── index.html          # 主页面
├── src/                    # 源代码
│   ├── api/                # API 服务
│   │   ├── aiService.js    # AI 内容生成服务
│   │   └── trendingService.js # 热搜数据服务
│   ├── components/         # 组件 (用于未来扩展)
│   └── utils/              # 工具函数
│       └── formatter.js    # 格式化工具
└── README.md               # 项目文档
```

## 快速开始

1. 克隆仓库:
   ```
   git clone https://github.com/yourusername/ai-news-rewritor.git
   cd ai-news-rewritor
   ```

2. 运行应用:
   - 使用任意的 HTTP 服务器托管 `public` 目录
   - 例如，使用 Python 的简易 HTTP 服务器:
     ```
     cd public
     python -m http.server 8000
     ```
   - 或使用 Node.js 的 `http-server`:
     ```
     npm install -g http-server
     cd public
     http-server -p 8000
     ```

3. 打开浏览器访问 `http://localhost:8000`

## 生产环境配置

对于生产环境，您需要:

1. 替换 `src/api/aiService.js` 中的 mock 实现为实际的 AI API 调用
2. 替换 `src/api/trendingService.js` 中的 mock 数据为实际的热搜 API 或爬虫服务
3. 创建适当的后端服务来处理这些 API 请求

## 自定义和扩展

- **添加新热搜源**: 在 `src/api/trendingService.js` 中添加新的数据源方法
- **自定义 AI 响应**: 修改 `src/api/aiService.js` 中的提示词和参数
- **UI 定制**: 修改 `public/css/styles.css` 文件自定义界面外观

## 许可证

MIT

## 联系方式

如有任何问题或建议，请提交 issue 或联系项目维护者。 