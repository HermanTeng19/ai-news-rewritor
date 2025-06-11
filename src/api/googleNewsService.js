const axios = require('axios');
const config = require('../config');
const newsImageService = require('./newsImageService');

class GoogleNewsService {
  constructor() {
    this.baseUrl = 'https://serpapi.com/search.json';
    this.apiKey = process.env.SERPAPI_KEY || config.SERPAPI_KEY;
  }

  /**
   * 获取Google Top Stories（带图片爬取）
   * @param {boolean} extractImages 是否爬取真实新闻图片
   * @returns {Promise<Array>} 格式化的新闻列表
   */
  async fetchGoogleTopStories(extractImages = false) {
    try {
      if (!this.apiKey) {
        throw new Error('SERPAPI_KEY not configured');
      }

      const params = {
        engine: 'google',
        tbm: 'nws', // 新闻搜索
        q: 'breaking news OR trending OR "top stories"', // 更广泛的查询获取热门新闻
        api_key: this.apiKey,
        num: 20, // 获取20条新闻
        gl: 'us', // 地理位置：美国
        hl: 'en', // 语言：英语
        tbs: 'qdr:d', // 最近一天的新闻
        sort: 'date' // 按日期排序获取最新新闻
      };

      console.log('Fetching Google Top Stories...');
      const response = await axios.get(this.baseUrl, { params });

      let newsData = [];
      
      if (response.data && response.data.news_results) {
        newsData = this.formatNewsData(response.data.news_results);
      } else {
        // 如果没有news_results，尝试使用organic_results
        if (response.data && response.data.organic_results) {
          newsData = this.formatOrganicResults(response.data.organic_results);
        } else {
          throw new Error('No news results found');
        }
      }

      // 如果需要提取图片，处理图片爬取
      if (extractImages && newsData.length > 0) {
        console.log('Extracting real news images...');
        newsData = await newsImageService.processNewsImages(newsData);
      }

      return newsData;
    } catch (error) {
      console.error('Error fetching Google Top Stories:', error.message);
      
      // 返回备用数据
      return this.getFallbackData();
    }
  }

  /**
   * 格式化新闻数据
   * @param {Array} newsResults SerpApi返回的新闻结果
   * @returns {Array} 格式化的新闻列表
   */
  formatNewsData(newsResults) {
    return newsResults.slice(0, 20).map((item, index) => ({
      id: index + 1,
      title: this.cleanTitle(item.title || ''),
      hot: this.generateRandomHot(),
      source: item.source || 'Google News',
      link: item.link || '',
      snippet: this.enhanceSnippet(item.snippet || item.title || ''),
      date: item.date || new Date().toISOString(),
      thumbnail: item.thumbnail || this.generateFallbackThumbnail(item.source)
    }));
  }

  /**
   * 格式化有机搜索结果作为新闻
   * @param {Array} organicResults SerpApi返回的有机搜索结果
   * @returns {Array} 格式化的新闻列表
   */
  formatOrganicResults(organicResults) {
    return organicResults.slice(0, 20).map((item, index) => ({
      id: index + 1,
      title: this.cleanTitle(item.title || ''),
      hot: this.generateRandomHot(),
      source: this.extractDomain(item.link) || 'Google',
      link: item.link || '',
      snippet: item.snippet || '',
      date: new Date().toISOString(),
      thumbnail: ''
    }));
  }

  /**
   * 清理标题文本
   * @param {string} title 原始标题
   * @returns {string} 清理后的标题
   */
  cleanTitle(title) {
    // 移除多余的符号和格式化文本
    return title
      .replace(/\s+/g, ' ')
      .replace(/^[\s\-\|]+/, '')
      .replace(/[\s\-\|]+$/, '')
      .trim();
  }

  /**
   * 从URL中提取域名
   * @param {string} url 完整URL
   * @returns {string} 域名
   */
  extractDomain(url) {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch (error) {
      return 'Unknown';
    }
  }

  /**
   * 增强新闻摘要
   * @param {string} snippet 原始摘要
   * @returns {string} 增强后的摘要
   */
  enhanceSnippet(snippet) {
    if (!snippet) return 'No description available.';
    
    // 如果摘要太短，尝试增加更多信息
    if (snippet.length < 50) {
      return snippet + ' Read the full story for more details.';
    }
    
    // 确保摘要以句号结尾
    if (!snippet.endsWith('.') && !snippet.endsWith('...')) {
      return snippet + '...';
    }
    
    return snippet;
  }

  /**
   * 生成备用缩略图
   * @param {string} source 新闻源
   * @returns {string} 缩略图URL
   */
  generateFallbackThumbnail(source) {
    // 根据新闻源生成相应的图片
    const sourceMap = {
      'CNN': 'https://picsum.photos/seed/cnn/200/150',
      'BBC': 'https://picsum.photos/seed/bbc/200/150',
      'Reuters': 'https://picsum.photos/seed/reuters/200/150',
      'AP News': 'https://picsum.photos/seed/ap/200/150',
      'ABC News': 'https://picsum.photos/seed/abc/200/150',
      'NBC News': 'https://picsum.photos/seed/nbc/200/150',
      'Fox News': 'https://picsum.photos/seed/fox/200/150',
      'NPR': 'https://picsum.photos/seed/npr/200/150'
    };
    
    // 如果有匹配的源，使用对应图片，否则使用通用新闻图片
    const seedName = sourceMap[source] ? source.toLowerCase().replace(/\s+/g, '') : 'news';
    return `https://picsum.photos/seed/${seedName}${Math.floor(Math.random() * 100)}/200/150`;
  }

  /**
   * 生成随机热度值
   * @returns {number} 随机热度值
   */
  generateRandomHot() {
    // 生成10万到500万之间的随机热度值
    return Math.floor(Math.random() * (5000000 - 100000) + 100000);
  }

  /**
   * 获取备用数据（当API调用失败时使用）
   * @returns {Array} 备用新闻列表
   */
  getFallbackData() {
    return [
      {
        id: 1,
        title: "Breaking: Major Technology Breakthrough Announced",
        hot: 2500000,
        source: "Google News",
        link: "#",
        snippet: "Scientists announce significant advancement in quantum computing...",
        date: new Date().toISOString()
      },
      {
        id: 2,
        title: "Global Climate Summit Reaches Historic Agreement",
        hot: 1800000,
        source: "Reuters",
        link: "#",
        snippet: "World leaders unite on comprehensive climate action plan...",
        date: new Date().toISOString()
      },
      {
        id: 3,
        title: "Stock Markets React to Federal Reserve Decision",
        hot: 1200000,
        source: "Bloomberg",
        link: "#",
        snippet: "Markets show mixed reactions following interest rate announcement...",
        date: new Date().toISOString()
      },
      {
        id: 4,
        title: "New Archaeological Discovery Rewrites History",
        hot: 950000,
        source: "National Geographic",
        link: "#",
        snippet: "Ancient artifacts found in Egypt provide new insights...",
        date: new Date().toISOString()
      },
      {
        id: 5,
        title: "Tech Giant Announces Revolutionary AI Model",
        hot: 890000,
        source: "TechCrunch",
        link: "#",
        snippet: "Next-generation AI promises to transform industries...",
        date: new Date().toISOString()
      }
    ];
  }
}

module.exports = new GoogleNewsService(); 