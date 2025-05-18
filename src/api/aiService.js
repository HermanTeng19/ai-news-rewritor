/**
 * AI Service for generating content based on news topics
 * In production, this would connect to an actual AI API
 */

class AIService {
    /**
     * Generate text content based on a news topic
     * @param {string} topic - The news topic or title
     * @returns {Promise<string>} - The generated text
     */
    async generateText(topic) {
        try {
            // In production, replace with actual API call
            // Example with OpenAI API:
            /*
            const response = await fetch('https://api.openai.com/v1/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo-instruct",
                    prompt: `Write a news article about: ${topic}`,
                    max_tokens: 250,
                    temperature: a0.7
                })
            });
            
            const data = await response.json();
            return data.choices[0].text.trim();
            */
            
            // Mock implementation for demo
            return this._generateMockText(topic);
        } catch (error) {
            console.error('Error generating text:', error);
            throw new Error('Failed to generate text content');
        }
    }
    
    /**
     * Generate image based on a news topic
     * @param {string} topic - The news topic or title
     * @returns {Promise<string>} - URL of the generated image
     */
    async generateImage(topic) {
        try {
            // In production, replace with actual API call
            // Example with OpenAI DALL-E:
            /*
            const response = await fetch('https://api.openai.com/v1/images/generations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    prompt: `News image related to: ${topic}`,
                    n: 1,
                    size: "1024x1024"
                })
            });
            
            const data = await response.json();
            return data.data[0].url;
            */
            
            // Mock implementation for demo
            return this._generateMockImageUrl(topic);
        } catch (error) {
            console.error('Error generating image:', error);
            throw new Error('Failed to generate image');
        }
    }
    
    /**
     * Generate both text and image for a news topic
     * @param {string} topic - The news topic or title
     * @returns {Promise<{text: string, imageUrl: string}>} - Generated content
     */
    async generateContent(topic) {
        try {
            // Generate text and image in parallel
            const [text, imageUrl] = await Promise.all([
                this.generateText(topic),
                this.generateImage(topic)
            ]);
            
            return { text, imageUrl };
        } catch (error) {
            console.error('Error generating content:', error);
            throw new Error('Failed to generate content');
        }
    }
    
    /**
     * Mock text generation for demo purposes
     * @private
     * @param {string} topic - The news topic
     * @returns {string} - Mock generated text
     */
    _generateMockText(topic) {
        const sentences = [
            `关于"${topic}"的最新消息引发了广泛关注。`,
            `据最新报道，"${topic}"已经成为社交媒体上的热门话题。`,
            `专家分析认为，"${topic}"反映了当前社会的重要趋势。`,
            `"${topic}"背后有着深刻的社会意义，值得我们深入思考。`,
            `从数据来看，"${topic}"已经影响了众多人的日常生活。`,
            `对于"${topic}"，不同群体表现出了不同的态度和观点。`,
            `未来，"${topic}"可能会带来更多深远的影响。`,
            `值得注意的是，"${topic}"并非偶然现象，而是有迹可循的。`,
            `多方观点认为，"${topic}"折射出我们这个时代的特点。`,
            `随着事态发展，"${topic}"将持续引发讨论和关注。`
        ];
        
        // Randomly select 4-6 sentences to form a paragraph
        const count = Math.floor(Math.random() * 3) + 4; // 4 to 6 sentences
        const selectedSentences = [];
        
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * sentences.length);
            selectedSentences.push(sentences[randomIndex]);
        }
        
        return new Promise(resolve => {
            // Simulate network delay
            setTimeout(() => {
                resolve(selectedSentences.join(' '));
            }, 1000);
        });
    }
    
    /**
     * Mock image URL generation for demo purposes
     * @private
     * @param {string} topic - The news topic
     * @returns {string} - Mock image URL
     */
    _generateMockImageUrl(topic) {
        const width = 600;
        const height = 400;
        
        // Add a random ID to avoid caching issues
        const randomId = Math.floor(Math.random() * 1000);
        
        // Using picsum.photos API for demo purposes
        return new Promise(resolve => {
            // Simulate network delay
            setTimeout(() => {
                resolve(`https://picsum.photos/seed/${randomId}/${width}/${height}`);
            }, 1000);
        });
    }
}

// Export as singleton
const aiService = new AIService();
export default aiService; 