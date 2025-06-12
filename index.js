require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

// 导入服务
const baiduNewsService = require('./src/api/baiduNewsService');
const googleNewsService = require('./src/api/googleNewsService');
const yahooNewsService = require('./src/api/yahooNewsService');
const deepSeekService = require('./src/api/deepSeekService');
const newsImageService = require('./src/api/newsImageService');

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 获取热搜榜单
app.get('/api/hot-topics', async (req, res) => {
  try {
    const platform = req.query.platform || 'baidu';
    let topics = [];
    
    if (platform === 'baidu') {
      topics = await baiduNewsService.fetchBaiduHotTopics();
    } else if (platform === 'google' || platform === 'weibo') {
      // 将"微博"平台改为Google Top Stories
      topics = await googleNewsService.fetchGoogleTopStories();
    } else if (platform === 'zhihu' || platform === 'yahoo') {
      // 将"知乎"平台改为Yahoo Top Stories，启用真实图片爬取
      topics = await yahooNewsService.fetchYahooTopStories(true);
    } else {
      // 默认使用百度数据
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
    const { topic, source, platform, originalNews } = req.body;
    
    if (!topic) {
      return res.status(400).json({ success: false, message: '缺少话题参数' });
    }
    
    let content;
    
    // 如果是Google Top Stories（微博平台）或Yahoo Top Stories（知乎平台），使用真实新闻内容
    if (platform === 'weibo' || platform === 'google' || platform === 'zhihu' || platform === 'yahoo') {
      // 直接使用真实新闻内容，不进行AI改写
      const fullNewsText = generateFullNewsText(originalNews, topic);
      content = {
        text: fullNewsText,
        imagePrompt: `News image about: ${topic}`
      };
    } else {
      // 其他平台继续使用AI生成内容
      content = await deepSeekService.generateContent(topic, source);
    }
    
    // 生成高分辨率图片URL
    let imageUrl;
    if (platform === 'weibo' || platform === 'google' || platform === 'zhihu' || platform === 'yahoo') {
      // 为Google Top Stories和Yahoo Top Stories尝试爬取真实新闻图片
      if (originalNews && originalNews.link) {
        console.log('Attempting to extract real news image...');
        try {
          imageUrl = await newsImageService.extractNewsImage(originalNews.link);
          console.log('Successfully extracted news image:', imageUrl);
        } catch (error) {
          console.error('Failed to extract news image:', error.message);
          // 使用话题种子生成备用图片
          const topicSeed = topic.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
          const randomSuffix = Math.floor(Math.random() * 100);
          imageUrl = `https://picsum.photos/seed/${topicSeed}${randomSuffix}/600/400`;
        }
      } else {
        // 如果没有链接，使用话题种子生成图片
        const topicSeed = topic.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
        const randomSuffix = Math.floor(Math.random() * 100);
        imageUrl = `https://picsum.photos/seed/${topicSeed}${randomSuffix}/600/400`;
      }
    } else {
      // 其他平台使用随机图片
      const randomId = Math.floor(Math.random() * 1000);
      imageUrl = `https://picsum.photos/seed/${randomId}/600/400`;
    }
    
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

// 测试路由
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// 主页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 生成完整的Google新闻文本
function generateFullNewsText(originalNews, topic) {
  if (!originalNews) {
    return `This is a breaking news story from Google Top Stories: "${topic}". Please visit the original source for complete details.`;
  }

  const { snippet, source, date, link } = originalNews;
  
  let fullText = `${topic}\n\n`;
  
  if (snippet) {
    // 确保snippet是完整的句子
    let processedSnippet = snippet.trim();
    if (!processedSnippet.endsWith('.') && !processedSnippet.endsWith('!') && !processedSnippet.endsWith('?')) {
      processedSnippet += '...';
    }
    fullText += `${processedSnippet}\n\n`;
  }
  
  // 添加来源信息
  if (source) {
    fullText += `Source: ${source}`;
    if (date) {
      fullText += ` | Published: ${date}`;
    }
    fullText += '\n\n';
  }
  
  // 添加访问原文的提示
  if (link) {
    fullText += `For the complete story and latest updates, visit the original article at the source website.`;
  } else {
    fullText += `This story is developing. Check major news sources for the latest updates.`;
  }
  
  return fullText;
}

// 导出应用以供Vercel使用
module.exports = app; 