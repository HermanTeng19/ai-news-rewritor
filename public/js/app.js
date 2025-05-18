// DOM Elements
const hotTopicsList = document.getElementById('hot-topics');
const initialState = document.getElementById('initial-state');
const loadingState = document.getElementById('loading-state');
const contentState = document.getElementById('content-state');
const selectedTopicTitle = document.getElementById('selected-topic-title');
const generatedImage = document.getElementById('generated-image');
const generatedText = document.getElementById('generated-text');
const regenerateBtn = document.getElementById('regenerate-btn');
const copyBtn = document.getElementById('copy-btn');
const shareBtn = document.getElementById('share-btn');
const platformTabs = document.querySelectorAll('.platform-tab');

// State
let currentTopic = null;
let currentPlatform = 'weibo'; // Default platform

// Initialize the app
function init() {
    loadHotTopics(currentPlatform);
    setupEventListeners();
}

// Load hot topics from API
async function loadHotTopics(platform = 'weibo') {
    try {
        // Show loading state
        hotTopicsList.innerHTML = `<li class="loading-item">正在加载热搜榜单...</li>`;
        
        // In a real app, we would use the imported service
        // import trendingService from '../../src/api/trendingService.js';
        // let data;
        // switch (platform) {
        //   case 'weibo':
        //     data = await trendingService.fetchWeiboTrending();
        //     break;
        //   case 'zhihu':
        //     data = await trendingService.fetchZhihuTrending();
        //     break;
        //   case 'baidu':
        //     data = await trendingService.fetchBaiduTrending();
        //     break;
        // }
        
        // Mock data for demo
        const mockTopics = {
            weibo: [
                { id: 1, title: "阿根廷VS法国世界杯决赛", hot: 8924156 },
                { id: 2, title: "新冠阳性居家如何护理", hot: 7651432 },
                { id: 3, title: "iPhone15或将搭载可折叠镜头", hot: 6543210 },
                { id: 4, title: "本轮寒潮将影响我国超30个省份", hot: 5432109 },
                { id: 5, title: "茶颜悦色开出北京首店", hot: 4321098 },
                { id: 6, title: "网友偶遇王一博带小狗散步", hot: 3210987 },
                { id: 7, title: "卡塔尔世界杯闭幕式亮点", hot: 2109876 },
                { id: 8, title: "大学生独立研发智能家居系统获奖", hot: 1987654 },
                { id: 9, title: "专家解读经济形势新变化", hot: 1876543 },
                { id: 10, title: "中国传统文化在海外走红", hot: 1765432 }
            ],
            zhihu: [
                { id: 11, title: "新能源汽车销量首超燃油车", hot: 1654321 },
                { id: 12, title: "全国多地迎来降雪天气", hot: 1543210 },
                { id: 13, title: "2023年春节档电影票房创新高", hot: 1432109 },
                { id: 14, title: "新研究发现每天喝茶可能延长寿命", hot: 1321098 },
                { id: 15, title: "网红城市夜间经济活力指数发布", hot: 1210987 },
                { id: 16, title: "人工智能在医疗领域的应用前景", hot: 1109876 },
                { id: 17, title: "国内数字经济发展现状分析", hot: 1008765 },
                { id: 18, title: "青年就业趋势与职业选择", hot: 987654 },
                { id: 19, title: "全球气候变化与环保措施讨论", hot: 876543 },
                { id: 20, title: "元宇宙概念股市场表现", hot: 765432 }
            ],
            baidu: [
                { id: 21, title: "北京冬奥会开幕式精彩瞬间", hot: 654321 },
                { id: 22, title: "国内旅游业复苏数据报告", hot: 543210 },
                { id: 23, title: "多地实施新能源汽车补贴政策", hot: 432109 },
                { id: 24, title: "教育部发布新版课程标准", hot: 321098 },
                { id: 25, title: "航天员太空授课活动直播", hot: 210987 },
                { id: 26, title: "知名导演新片票房破10亿", hot: 109876 },
                { id: 27, title: "医疗保障体系改革新政策", hot: 98765 },
                { id: 28, title: "大型科技展览会举办时间公布", hot: 87654 },
                { id: 29, title: "高考报名人数创历史新高", hot: 76543 },
                { id: 30, title: "知名运动品牌发布环保材料新产品", hot: 65432 }
            ]
        };
        
        // Simulate API delay
        setTimeout(() => {
            renderHotTopics(mockTopics[platform] || []);
        }, 800);
    } catch (error) {
        console.error('Error loading hot topics:', error);
        hotTopicsList.innerHTML = `<li class="error-item">加载失败，请刷新重试</li>`;
    }
}

// Render hot topics to the list
function renderHotTopics(topics) {
    hotTopicsList.innerHTML = '';
    
    topics.forEach((topic, index) => {
        const listItem = document.createElement('li');
        listItem.dataset.id = topic.id;
        listItem.dataset.title = topic.title;
        
        // Add special class for top 3
        if (index < 3) {
            listItem.classList.add('top-three');
        }
        
        // Format the hot count
        const hotCount = formatNumber(topic.hot);
        
        listItem.innerHTML = `
            <span class="topic-number">${index + 1}</span>
            <div class="topic-content">
                <div class="topic-title">${topic.title}</div>
                <div class="topic-hot">${hotCount} 热度</div>
            </div>
        `;
        
        listItem.addEventListener('click', () => selectTopic(topic));
        
        hotTopicsList.appendChild(listItem);
    });
}

// Format large numbers (e.g., 1234567 -> 123.5万)
function formatNumber(num) {
    if (num >= 100000000) {
        return (num / 100000000).toFixed(1) + '亿';
    } else if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
    } else {
        return num.toString();
    }
}

// Select a topic and generate content
function selectTopic(topic) {
    // Update UI to show selected topic
    document.querySelectorAll('#hot-topics li').forEach(item => {
        item.classList.remove('active');
        if (Number(item.dataset.id) === topic.id) {
            item.classList.add('active');
        }
    });
    
    currentTopic = topic;
    
    // Show loading state
    initialState.classList.add('hidden');
    contentState.classList.add('hidden');
    loadingState.classList.remove('hidden');
    
    // Generate content for the selected topic
    generateContent(topic);
}

// Generate AI content based on the selected topic
async function generateContent(topic) {
    try {
        // In a real app, we would use the imported service
        // import aiService from '../../src/api/aiService.js';
        // const data = await aiService.generateContent(topic.title);
        
        // Mock AI generation with setTimeout to simulate API call
        setTimeout(() => {
            const mockResponse = {
                text: generateMockText(topic.title),
                imageUrl: getRandomImageUrl(topic.title)
            };
            
            // Display the generated content
            displayGeneratedContent(mockResponse, topic);
        }, 2000);
        
    } catch (error) {
        console.error('Error generating content:', error);
        loadingState.classList.add('hidden');
        contentState.classList.remove('hidden');
        generatedText.textContent = '抱歉，内容生成失败，请重试。';
    }
}

// Display the generated content
function displayGeneratedContent(data, topic) {
    // Hide loading state
    loadingState.classList.add('hidden');
    
    // Update content
    selectedTopicTitle.textContent = topic.title;
    generatedText.textContent = data.text;
    
    // 预加载图片，确保图片正确加载后再显示
    const tempImage = new Image();
    tempImage.onload = function() {
        generatedImage.src = data.imageUrl;
        generatedImage.alt = topic.title;
        
        // 显示内容区域
        contentState.classList.remove('hidden');
    };
    
    tempImage.onerror = function() {
        // 如果加载失败，使用备用图片
        generatedImage.src = `https://picsum.photos/600/400?random=${Math.random()}`;
        generatedImage.alt = topic.title;
        
        // 显示内容区域
        contentState.classList.remove('hidden');
    };
    
    // 开始加载图片
    tempImage.src = data.imageUrl;
}

// Setup event listeners
function setupEventListeners() {
    // Platform tabs
    platformTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            platformTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update current platform
            const platform = tab.dataset.platform;
            currentPlatform = platform;
            
            // Reset content view if showing content
            if (!initialState.classList.contains('hidden')) {
                initialState.classList.remove('hidden');
                contentState.classList.add('hidden');
            }
            
            // Load topics for selected platform
            loadHotTopics(platform);
        });
    });
    
    // Regenerate button
    regenerateBtn.addEventListener('click', () => {
        if (currentTopic) {
            // Show loading state
            contentState.classList.add('hidden');
            loadingState.classList.remove('hidden');
            
            // Generate new content
            generateContent(currentTopic);
        }
    });
    
    // Copy button
    copyBtn.addEventListener('click', () => {
        if (generatedText.textContent) {
            const textToCopy = `${currentTopic.title}\n\n${generatedText.textContent}`;
            
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    // Show success message
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> 已复制';
                    
                    setTimeout(() => {
                        copyBtn.innerHTML = originalText;
                    }, 2000);
                })
                .catch(err => {
                    console.error('复制失败:', err);
                });
        }
    });
    
    // Share button
    shareBtn.addEventListener('click', () => {
        if (navigator.share && currentTopic) {
            navigator.share({
                title: currentTopic.title,
                text: generatedText.textContent,
                url: window.location.href
            })
            .catch(err => {
                console.error('分享失败:', err);
            });
        } else {
            // Fallback for browsers that don't support Web Share API
            copyBtn.click(); // Just copy to clipboard
            alert('内容已复制到剪贴板，您可以手动分享');
        }
    });
}

// Helper function to generate mock text based on topic title
function generateMockText(topicTitle) {
    const sentences = [
        `关于"${topicTitle}"的最新消息引发了广泛关注。`,
        `据最新报道，"${topicTitle}"已经成为社交媒体上的热门话题。`,
        `专家分析认为，"${topicTitle}"反映了当前社会的重要趋势。`,
        `"${topicTitle}"背后有着深刻的社会意义，值得我们深入思考。`,
        `从数据来看，"${topicTitle}"已经影响了众多人的日常生活。`,
        `对于"${topicTitle}"，不同群体表现出了不同的态度和观点。`,
        `未来，"${topicTitle}"可能会带来更多深远的影响。`,
        `值得注意的是，"${topicTitle}"并非偶然现象，而是有迹可循的。`,
        `多方观点认为，"${topicTitle}"折射出我们这个时代的特点。`,
        `随着事态发展，"${topicTitle}"将持续引发讨论和关注。`
    ];
    
    // Randomly select 4-6 sentences to form a paragraph
    const count = Math.floor(Math.random() * 3) + 4; // 4 to 6 sentences
    const selectedSentences = [];
    
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * sentences.length);
        selectedSentences.push(sentences[randomIndex]);
    }
    
    return selectedSentences.join(' ');
}

// Helper function to get a random image URL based on topic
function getRandomImageUrl(topic) {
    // Using picsum.photos for random images
    const width = 600;
    const height = 400;
    
    // Add a random ID to avoid caching issues
    const randomId = Math.floor(Math.random() * 1000);
    
    // Using picsum.photos API for demo purposes
    return `https://picsum.photos/seed/${randomId}/${width}/${height}`;
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init); 