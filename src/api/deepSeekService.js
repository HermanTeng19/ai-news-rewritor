/**
 * NVIDIA DeepSeek R1模型API服务
 * 用于根据热搜话题生成内容
 */

const axios = require('axios');
const config = require('../config');

class DeepSeekService {
  /**
   * 生成新闻图文内容
   * @param {string} topic - 新闻话题标题
   * @param {string} source - 新闻来源
   * @returns {Promise<{text: string, imagePrompt: string}>} - 生成的内容
   */
  async generateContent(topic, source = '') {
    try {
      const prompt = this._generatePrompt(topic, source);
      
      // 调用NVIDIA DeepSeek模型API
      const response = await axios.post(`${config.nvidiaDeeepSeek.baseUrl}/chat/completions`, 
        {
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          model: "deepseek-ai/deepseek-r1",
          temperature: 0.8,
          max_tokens: 1000,
          top_p: 0.95,
          // 其他参数可以根据需要添加
        },
        {
          headers: {
            'Authorization': `Bearer ${config.nvidiaDeeepSeek.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // 解析响应
      const result = response.data;
      
      // 从结果中提取文本内容
      const generatedText = result.choices && result.choices[0].message.content
        ? this._cleanResponse(result.choices[0].message.content.trim())
        : this._generateFallbackText(topic);

      // 从生成的文本中提取适合生成图片的描述
      const imagePrompt = this._extractImagePrompt(generatedText, topic);
      
      return {
        text: generatedText,
        imagePrompt: imagePrompt
      };
    } catch (error) {
      console.error('NVIDIA DeepSeek API调用失败:', error.message);
      // 返回后备内容
      return {
        text: this._generateFallbackText(topic),
        imagePrompt: `新闻图片，关于：${topic}`
      };
    }
  }

  /**
   * 生成给DeepSeek模型的提示
   * @private
   * @param {string} topic - 热搜话题
   * @param {string} source - 新闻来源
   * @returns {string} 用于模型的提示文本
   */
  _generatePrompt(topic, source) {
    return `你是一位专业新闻编辑，请根据以下热搜话题"${topic}"${source ? `（来源：${source}）` : ''}撰写一篇简短的新闻内容，要求：
1. 内容要符合事实，客观中立
2. 语言简洁专业，有新闻风格
3. 不要过长，300字左右即可
4. 内容需包含适当的细节和背景信息
5. 只需生成正文内容，无需标题
6. 一定要使用简体中文

新闻正文：`;
  }

  /**
   * 从生成的新闻内容中提取适合制作图片的描述
   * @private
   * @param {string} text - 生成的新闻文本
   * @param {string} topic - 原始话题
   * @returns {string} 图片描述提示词
   */
  _extractImagePrompt(text, topic) {
    // 简单实现：提取主题词和关键内容，用于图片生成
    // 在实际应用中可以使用更复杂的方法提取关键信息
    const mainKeywords = topic.split(/\s+/).slice(0, 3).join(' ');
    return `新闻图片，高质量，专业，关于：${mainKeywords}，${text.slice(0, 50)}`;
  }

  /**
   * 当API调用失败时生成后备文本
   * @private
   * @param {string} topic - 热搜话题
   * @returns {string} 生成的后备文本
   */
  _generateFallbackText(topic) {
    const sentences = [
      `关于"${topic}"的最新消息引发了广泛关注。`,
      `据权威媒体报道，"${topic}"已成为公众热议的焦点话题。`,
      `专家分析认为，"${topic}"反映了当前社会的重要趋势和变化。`,
      `"${topic}"背后有着深刻的社会意义，值得我们深入思考。`,
      `从最新数据来看，"${topic}"已经影响了众多人的日常生活和工作。`,
      `对于"${topic}"，不同群体表现出了不同的态度和观点。`,
      `未来，"${topic}"可能会带来更多深远的影响和变化。`,
      `值得注意的是，"${topic}"并非偶然现象，而是有其发展脉络的。`,
      `多方观点认为，"${topic}"折射出我们这个时代的特点和挑战。`,
      `随着事态发展，"${topic}"将持续引发讨论和关注。`
    ];
    
    // 随机选择4-6个句子组成段落
    const count = Math.floor(Math.random() * 3) + 4; // 4到6个句子
    const selectedSentences = [];
    
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * sentences.length);
      selectedSentences.push(sentences[randomIndex]);
    }
    
    return selectedSentences.join(' ');
  }

  /**
   * 清理API返回的响应，移除思考过程和不必要的内容
   * @private
   * @param {string} rawContent - API返回的原始内容
   * @returns {string} 清理后的内容
   */
  _cleanResponse(rawContent) {
    return rawContent
      .replace(/<think>[\s\S]*?<\/think>\n*/g, "") // 移除所有思考过程
      .replace(/\n*注：.*/s, "") // 移除注释行
      .replace(/\n{2,}/g, "\n") // 将多个连续换行替换为单个换行
      .trim(); // 去除首尾空白
  }
}

// 导出单例
const deepSeekService = new DeepSeekService();
module.exports = deepSeekService; 