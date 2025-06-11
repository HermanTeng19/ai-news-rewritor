const axios = require('axios');
const config = require('../config');
const newsImageService = require('./newsImageService');

class YahooNewsService {
  constructor() {
    this.baseUrl = 'https://serpapi.com/search.json';
    this.apiKey = process.env.SERPAPI_KEY || config.SERPAPI_KEY;
  }

  /**
   * 获取Yahoo Top Stories（带图片爬取）
   * @param {boolean} extractImages 是否爬取真实新闻图片
   * @returns {Promise<Array>} 格式化的新闻列表
   */
  async fetchYahooTopStories(extractImages = false) {
    try {
      if (!this.apiKey) {
        throw new Error('SERPAPI_KEY not configured');
      }

      const params = {
        engine: 'yahoo',
        type: 'news',
        api_key: this.apiKey,
        num: 20, // 获取20条新闻
        gl: 'us', // 地理位置：美国
        hl: 'en', // 语言：英语
        qdr: 'd' // 最近一天的新闻
      };

      console.log('Fetching Yahoo Top Stories...');
      const response = await axios.get(this.baseUrl, { params });

      let newsData = [];
      
      if (response.data && response.data.news_results) {
        newsData = this.formatNewsData(response.data.news_results);
      } else if (response.data && response.data.organic_results) {
        // 如果没有news_results，尝试使用organic_results
        newsData = this.formatOrganicResults(response.data.organic_results);
      } else {
        throw new Error('No news results found');
      }

      // 如果需要提取图片，处理图片爬取
      if (extractImages && newsData.length > 0) {
        console.log('Extracting real news images...');
        newsData = await newsImageService.processNewsImages(newsData);
      }

      return newsData;

    } catch (error) {
      console.error('Error fetching Yahoo Top Stories:', error.message);
      
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
      source: item.source || 'Yahoo News',
      link: this.cleanLink(item.link || ''),
      snippet: this.enhanceSnippet(item.snippet || item.title || ''),
      date: this.parseNewsDate(item.date || item.time),
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
      source: this.extractDomain(item.link) || 'Yahoo',
      link: this.cleanLink(item.link || ''),
      snippet: this.enhanceSnippet(item.snippet || ''),
      date: this.generateRecentDate(),
      thumbnail: this.generateFallbackThumbnail(this.extractDomain(item.link))
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
   * 清理和验证新闻链接
   * @param {string} link 原始链接
   * @returns {string} 清理后的链接
   */
  cleanLink(link) {
    if (!link) return '';
    
    // 如果是Yahoo重定向链接，尝试提取真实URL
    if (link.includes('yahoo.com') && link.includes('RU=')) {
      try {
        const urlParams = new URLSearchParams(link.split('?')[1]);
        const realUrl = urlParams.get('RU');
        if (realUrl) {
          return decodeURIComponent(realUrl);
        }
      } catch (error) {
        console.log('Failed to extract real URL from Yahoo redirect:', error.message);
      }
    }
    
    // 确保链接是完整的URL
    if (link.startsWith('//')) {
      return 'https:' + link;
    } else if (link.startsWith('/')) {
      return 'https://news.yahoo.com' + link;
    }
    
    return link;
  }

  /**
   * 解析新闻日期
   * @param {string} dateString 日期字符串
   * @returns {string} ISO格式的日期字符串
   */
  parseNewsDate(dateString) {
    if (!dateString) {
      return this.generateRecentDate();
    }

    try {
      // 处理相对时间格式 (如 "2 hours ago", "1 day ago")
      const relativeTimeMatch = dateString.match(/(\d+)\s*(minute|hour|day|week)s?\s*ago/i);
      if (relativeTimeMatch) {
        const amount = parseInt(relativeTimeMatch[1]);
        const unit = relativeTimeMatch[2].toLowerCase();
        const now = new Date();
        
        switch (unit) {
          case 'minute':
            now.setMinutes(now.getMinutes() - amount);
            break;
          case 'hour':
            now.setHours(now.getHours() - amount);
            break;
          case 'day':
            now.setDate(now.getDate() - amount);
            break;
          case 'week':
            now.setDate(now.getDate() - (amount * 7));
            break;
        }
        
        return now.toISOString();
      }

      // 尝试直接解析日期
      const parsedDate = new Date(dateString);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString();
      }

      // 如果解析失败，生成最近的随机日期
      return this.generateRecentDate();
      
    } catch (error) {
      console.log('Failed to parse date:', dateString, error.message);
      return this.generateRecentDate();
    }
  }

  /**
   * 生成最近的随机日期
   * @returns {string} ISO格式的日期字符串
   */
  generateRecentDate() {
    const now = new Date();
    // 生成1-24小时前的随机时间
    const hoursAgo = Math.floor(Math.random() * 24) + 1;
    const minutesAgo = Math.floor(Math.random() * 60);
    
    now.setHours(now.getHours() - hoursAgo);
    now.setMinutes(now.getMinutes() - minutesAgo);
    
    return now.toISOString();
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
      'Yahoo News': 'https://picsum.photos/seed/yahoo/200/150',
      'Reuters': 'https://picsum.photos/seed/reuters/200/150',
      'Associated Press': 'https://picsum.photos/seed/ap/200/150',
      'USA Today': 'https://picsum.photos/seed/usatoday/200/150',
      'CNN': 'https://picsum.photos/seed/cnn/200/150',
      'BBC': 'https://picsum.photos/seed/bbc/200/150',
      'Fox News': 'https://picsum.photos/seed/fox/200/150',
      'CNBC': 'https://picsum.photos/seed/cnbc/200/150'
    };
    
    // 如果有匹配的源，使用对应图片，否则使用通用新闻图片
    const seedName = sourceMap[source] ? source.toLowerCase().replace(/\s+/g, '') : 'yahoo';
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
        title: "Yahoo Finance Reports: Tech Stocks Surge in Morning Trading",
        hot: 2800000,
        source: "Yahoo Finance",
        link: "https://finance.yahoo.com",
        snippet: "Major technology companies see significant gains as investors show confidence in the sector...",
        date: this.generateRecentDate(),
        thumbnail: "https://picsum.photos/seed/yahoo1/200/150"
      },
      {
        id: 2,
        title: "Yahoo Sports: Championship Game Sets New Viewership Record",
        hot: 2100000,
        source: "Yahoo Sports",
        link: "https://sports.yahoo.com",
        snippet: "Record-breaking audience tunes in for the biggest game of the season...",
        date: this.generateRecentDate(),
        thumbnail: "https://picsum.photos/seed/yahoo2/200/150"
      },
      {
        id: 3,
        title: "International Summit Addresses Global Economic Challenges",
        hot: 1900000,
        source: "Yahoo News",
        link: "https://news.yahoo.com",
        snippet: "World leaders gather to discuss coordinated response to economic pressures...",
        date: this.generateRecentDate(),
        thumbnail: "https://picsum.photos/seed/yahoo3/200/150"
      },
      {
        id: 4,
        title: "Breakthrough Medical Research Published in Leading Journal",
        hot: 1500000,
        source: "Yahoo Health",
        link: "https://news.yahoo.com/health",
        snippet: "New treatment shows promising results in clinical trials...",
        date: this.generateRecentDate(),
        thumbnail: "https://picsum.photos/seed/yahoo4/200/150"
      },
      {
        id: 5,
        title: "Environmental Initiative Launches Across Major Cities",
        hot: 1200000,
        source: "Yahoo News",
        link: "https://news.yahoo.com",
        snippet: "Comprehensive sustainability program aims to reduce carbon emissions...",
        date: this.generateRecentDate(),
        thumbnail: "https://picsum.photos/seed/yahoo5/200/150"
      }
    ];
  }
}

module.exports = new YahooNewsService(); 