const axios = require('axios');
const cheerio = require('cheerio');

class NewsImageService {
  constructor() {
    this.timeout = 10000; // 10秒超时
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  }

  /**
   * 从新闻链接中提取主要图片
   * @param {string} newsUrl 新闻链接
   * @param {string} fallbackImage 备用图片URL
   * @returns {Promise<string>} 图片URL
   */
  async extractNewsImage(newsUrl, fallbackImage = null) {
    try {
      if (!newsUrl || !this.isValidUrl(newsUrl)) {
        return fallbackImage || this.generateFallbackImage();
      }

      console.log(`Extracting image from: ${newsUrl}`);
      
      // 获取网页内容
      const response = await axios.get(newsUrl, {
        timeout: this.timeout,
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive'
        },
        maxRedirects: 5,
        validateStatus: function (status) {
          return status < 400; // 只接受2xx和3xx状态码
        }
      });

      const $ = cheerio.load(response.data);
      
      // 尝试多种方法提取主要图片
      const imageUrl = this.findMainImage($, newsUrl);
      
      if (imageUrl && this.isValidImageUrl(imageUrl)) {
        console.log(`Found image: ${imageUrl}`);
        return imageUrl;
      }

      console.log('No valid image found, using fallback');
      return fallbackImage || this.generateFallbackImage();

    } catch (error) {
      console.error(`Error extracting image from ${newsUrl}:`, error.message);
      return fallbackImage || this.generateFallbackImage();
    }
  }

  /**
   * 从页面中查找主要图片
   * @param {CheerioAPI} $ Cheerio实例
   * @param {string} baseUrl 基础URL
   * @returns {string|null} 图片URL
   */
  findMainImage($, baseUrl) {
    const imageSelectors = [
      // Open Graph 图片
      'meta[property="og:image"]',
      'meta[property="og:image:url"]',
      
      // Twitter Card 图片
      'meta[name="twitter:image"]',
      'meta[name="twitter:image:src"]',
      
      // Article 相关图片
      'article img[src]',
      '.article-image img[src]',
      '.news-image img[src]',
      '.story-image img[src]',
      '.featured-image img[src]',
      '.hero-image img[src]',
      '.main-image img[src]',
      
      // 通用选择器
      '.content img[src]',
      '.post-content img[src]',
      'main img[src]',
      
      // 最后尝试第一张大图
      'img[src]'
    ];

    for (const selector of imageSelectors) {
      let imgSrc = null;
      
      if (selector.startsWith('meta')) {
        // Meta标签
        const metaTag = $(selector).first();
        imgSrc = metaTag.attr('content');
      } else {
        // img标签
        const imgs = $(selector);
        
        // 查找尺寸较大的图片
        for (let i = 0; i < imgs.length; i++) {
          const img = $(imgs[i]);
          const src = img.attr('src');
          const width = parseInt(img.attr('width')) || 0;
          const height = parseInt(img.attr('height')) || 0;
          
          // 跳过过小的图片
          if (width > 0 && height > 0 && (width < 200 || height < 150)) {
            continue;
          }
          
          // 跳过明显的图标或装饰图片
          if (src && this.isLikelyDecorative(src)) {
            continue;
          }
          
          if (src) {
            imgSrc = src;
            break;
          }
        }
      }
      
      if (imgSrc) {
        // 转换为绝对URL
        const absoluteUrl = this.makeAbsoluteUrl(imgSrc, baseUrl);
        if (this.isValidImageUrl(absoluteUrl)) {
          return absoluteUrl;
        }
      }
    }
    
    return null;
  }

  /**
   * 判断图片是否可能是装饰性的
   * @param {string} src 图片URL
   * @returns {boolean} 是否是装饰性图片
   */
  isLikelyDecorative(src) {
    const decorativePatterns = [
      /logo/i,
      /icon/i,
      /avatar/i,
      /profile/i,
      /thumbnail/i,
      /small/i,
      /tiny/i,
      /placeholder/i,
      /\.svg$/i,
      /sprite/i,
      /button/i,
      /badge/i
    ];
    
    return decorativePatterns.some(pattern => pattern.test(src));
  }

  /**
   * 将相对URL转换为绝对URL
   * @param {string} url 相对或绝对URL
   * @param {string} baseUrl 基础URL
   * @returns {string} 绝对URL
   */
  makeAbsoluteUrl(url, baseUrl) {
    if (!url) return '';
    
    try {
      // 如果已经是绝对URL，直接返回
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      
      // 处理协议相对URL
      if (url.startsWith('//')) {
        const protocol = new URL(baseUrl).protocol;
        return `${protocol}${url}`;
      }
      
      // 处理绝对路径
      if (url.startsWith('/')) {
        const urlObj = new URL(baseUrl);
        return `${urlObj.protocol}//${urlObj.host}${url}`;
      }
      
      // 处理相对路径
      const urlObj = new URL(baseUrl);
      const basePath = urlObj.pathname.endsWith('/') ? urlObj.pathname : urlObj.pathname + '/';
      return `${urlObj.protocol}//${urlObj.host}${basePath}${url}`;
      
    } catch (error) {
      console.error('Error making absolute URL:', error);
      return url;
    }
  }

  /**
   * 验证URL是否有效
   * @param {string} url URL字符串
   * @returns {boolean} 是否有效
   */
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 验证是否是有效的图片URL
   * @param {string} url 图片URL
   * @returns {boolean} 是否有效
   */
  isValidImageUrl(url) {
    if (!url || !this.isValidUrl(url)) return false;
    
    // 检查是否是常见的图片格式
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i;
    const hasImageExtension = imageExtensions.test(url);
    
    // 或者包含图片相关的路径
    const hasImagePath = /\/image|\/photo|\/picture|\/media/i.test(url);
    
    // 或者是常见的图片服务域名
    const isImageService = /\.(cloudfront|amazonaws|googleusercontent|fbcdn|twimg)\./.test(url);
    
    return hasImageExtension || hasImagePath || isImageService;
  }

  /**
   * 生成备用图片
   * @returns {string} 备用图片URL
   */
  generateFallbackImage() {
    const randomId = Math.floor(Math.random() * 1000);
    return `https://picsum.photos/seed/news${randomId}/600/400`;
  }

  /**
   * 批量处理多个新闻的图片提取
   * @param {Array} newsItems 新闻数组
   * @returns {Promise<Array>} 处理后的新闻数组
   */
  async processNewsImages(newsItems) {
    const promises = newsItems.map(async (item) => {
      if (item.link) {
        const extractedImage = await this.extractNewsImage(item.link, item.thumbnail);
        return {
          ...item,
          extractedImage,
          hasRealImage: extractedImage !== item.thumbnail && !extractedImage.includes('picsum.photos')
        };
      }
      return {
        ...item,
        extractedImage: item.thumbnail || this.generateFallbackImage(),
        hasRealImage: false
      };
    });

    return Promise.all(promises);
  }
}

module.exports = new NewsImageService(); 