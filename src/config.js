/**
 * 配置文件
 * 使用环境变量存储敏感信息
 */

require('dotenv').config();

module.exports = {
  // SerpAPI 配置 (百度新闻 API)
  serpApi: {
    apiKey: process.env.SERPAPI_KEY || 'your_serpapi_key_here', // 从环境变量获取
    baseUrl: 'https://serpapi.com/search.json'
  },
  
  // NVIDIA DeepSeek API 配置
  nvidiaDeeepSeek: {
    apiKey: process.env.NVIDIA_DEEPSEEK_KEY || 'your_nvidia_api_key_here', // 从环境变量获取
    baseUrl: 'https://integrate.api.nvidia.com/v1'
  }
}; 