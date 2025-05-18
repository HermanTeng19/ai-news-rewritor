const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// 导入服务
const baiduNewsService = require('./src/api/baiduNewsService');
const deepSeekService = require('./src/api/deepSeekService');

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API路由

// 获取热搜榜单
app.get('/api/hot-topics', async (req, res) => {
  try {
    const platform = req.query.platform || 'baidu';
    let topics = [];
    
    if (platform === 'baidu') {
      topics = await baiduNewsService.fetchBaiduHotTopics();
    } else {
      // 未来可以添加其他平台的支持
      topics = await baiduNewsService.fetchBaiduHotTopics();
    }
    
    res.json({ success: true, data: topics });
  } catch (error) {
    console.error('获取热搜失败:', error);
    res.status(500).json({ success: false, message: '获取热搜失败' });
  }
});

// 生成AI内容
app.post('/api/generate-content', async (req, res) => {
  try {
    const { topic, source } = req.body;
    
    if (!topic) {
      return res.status(400).json({ success: false, message: '缺少话题参数' });
    }
    
    // 调用DeepSeek API生成内容
    const content = await deepSeekService.generateContent(topic, source);
    
    // 添加随机图片URL (picsum.photos)
    const randomId = Math.floor(Math.random() * 1000);
    const imageUrl = `https://picsum.photos/seed/${randomId}/600/400`;
    
    res.json({
      success: true,
      data: {
        text: content.text,
        imageUrl,
        imagePrompt: content.imagePrompt
      }
    });
  } catch (error) {
    console.error('生成内容失败:', error);
    res.status(500).json({ success: false, message: '生成内容失败' });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
  console.log(`在浏览器中打开 http://localhost:${port} 访问应用`);
}); 