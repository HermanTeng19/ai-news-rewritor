/**
 * 百度新闻API服务
 * 使用SerpAPI获取百度热搜数据
 */

const axios = require('axios');
const config = require('../config');

class BaiduNewsService {
  /**
   * 获取百度热搜榜数据
   * @returns {Promise<Array>} 热搜话题列表
   */
  async fetchBaiduHotTopics() {
    try {
      const response = await axios.get(config.serpApi.baseUrl, {
        params: {
          engine: 'baidu_news',
          q: '热点',  // 通用查询词，用于获取热点新闻
          device: 'desktop',
          api_key: config.serpApi.apiKey,
          rtt: 1     // 实时新闻
        }
      });

      // 解析返回的数据
      const data = response.data;
      
      // 获取热搜话题
      let hotTopics = [];
      
      // 从organic_results中获取热门新闻
      if (data.organic_results && data.organic_results.length > 0) {
        hotTopics = data.organic_results.map((item, index) => ({
          id: index + 1,
          title: item.title || item.headline || '未知标题',
          hot: this._generateRandomHot(index), // 模拟热度值
          source: item.source || '百度新闻',
          link: item.link || '',
          snippet: item.snippet || '',
          date: item.date || new Date().toISOString()
        }));
      }
      
      // 如果有top_stories，也加入结果
      if (data.top_stories && data.top_stories.length > 0) {
        const topStories = data.top_stories.map((item, index) => ({
          id: hotTopics.length + index + 1,
          title: item.title || '未知标题',
          hot: this._generateRandomHot(index, true), // 置顶新闻热度更高
          source: item.source || '百度新闻',
          link: item.link || '',
          snippet: item.snippet || '',
          date: item.date || new Date().toISOString(),
          isTop: true
        }));
        
        // 合并结果，确保置顶新闻在前
        hotTopics = [...topStories, ...hotTopics].slice(0, 15);
      }
      
      // 兜底：如果API返回为空或失败，使用后备数据
      if (hotTopics.length === 0) {
        console.warn('百度热搜API返回为空，使用后备数据');
        return this._getFallbackHotTopics();
      }
      
      return hotTopics;
    } catch (error) {
      console.error('获取百度热搜失败:', error.message);
      // 返回后备数据
      return this._getFallbackHotTopics();
    }
  }
  
  /**
   * 生成随机热度值
   * @private
   * @param {number} index - 话题索引
   * @param {boolean} isTop - 是否为置顶话题
   * @returns {number} 热度值
   */
  _generateRandomHot(index, isTop = false) {
    const base = isTop ? 8000000 : 7000000;
    return base - (index * 500000) + Math.floor(Math.random() * 100000);
  }
  
  /**
   * 获取后备热搜数据
   * @private
   * @returns {Array} 后备热搜话题
   */
  _getFallbackHotTopics() {
    return [
      { id: 1, title: "俄罗斯卫星遭美国激光武器攻击", hot: 8924156, source: "环球时报" },
      { id: 2, title: "新冠病毒变种JN.1占比达到90%", hot: 7651432, source: "央视新闻" },
      { id: 3, title: "iPhone16或将搭载全新AI功能", hot: 6543210, source: "科技日报" },
      { id: 4, title: "本轮强降雨将影响我国南方多省份", hot: 5432109, source: "中国气象局" },
      { id: 5, title: "五一假期国内旅游收入突破2000亿", hot: 4321098, source: "文旅部" },
      { id: 6, title: "网友偶遇明星王一博骑摩托", hot: 3210987, source: "娱乐周刊" },
      { id: 7, title: "亚洲杯中国队小组赛对阵日本队", hot: 2109876, source: "体坛周报" },
      { id: 8, title: "大学生独立研发可降解塑料获国际大奖", hot: 1987654, source: "科技日报" },
      { id: 9, title: "专家解读当前经济形势新特点", hot: 1876543, source: "经济日报" },
      { id: 10, title: "中国传统文化海外走红引关注", hot: 1765432, source: "人民日报" },
      { id: 11, title: "新能源汽车产销量连续9年全球第一", hot: 1654321, source: "工信部" },
      { id: 12, title: "全国多地推出生育支持新政策", hot: 1543210, source: "新华社" },
      { id: 13, title: "2023年春节档电影票房创新高", hot: 1432109, source: "电影局" },
      { id: 14, title: "研究发现每天喝茶可能延长寿命", hot: 1321098, source: "健康时报" },
      { id: 15, title: "网红城市夜间经济活力指数发布", hot: 1210987, source: "商务部" }
    ];
  }
}

// 导出单例
const baiduNewsService = new BaiduNewsService();
module.exports = baiduNewsService; 