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
let currentPlatform = 'weibo'; // Default platform (now Google Top Stories)

// Initialize the app
function init() {
    loadHotTopics(currentPlatform);
    setupEventListeners();
    updateStaticTexts(currentPlatform); // Initialize with correct language
}

// Load hot topics from API
async function loadHotTopics(platform = 'weibo') {
    try {
        // Show loading state with appropriate language
        const loadingText = getLoadingText(platform);
        hotTopicsList.innerHTML = `<li class="loading-item">${loadingText}</li>`;
        
        // Fetch real data from backend API
        const response = await fetch(`/api/hot-topics?platform=${platform}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch hot topics');
        }
        
        const result = await response.json();
        
        if (result.success && Array.isArray(result.data)) {
            renderHotTopics(result.data);
        } else {
            throw new Error('Invalid data format');
        }
    } catch (error) {
        console.error('Error loading hot topics:', error);
        const errorText = getErrorText(platform);
        hotTopicsList.innerHTML = `<li class="error-item">${errorText}</li>`;
    }
}

// Get loading text based on platform language
function getLoadingText(platform = 'baidu') {
    if (platform === 'weibo' || platform === 'google') {
        return 'Loading Google Top Stories...';
    } else if (platform === 'zhihu' || platform === 'yahoo') {
        return 'Loading Yahoo Top Stories...';
    }
    return '正在加载热搜榜单...';
}

// Get error text based on platform language
function getErrorText(platform = 'baidu') {
    if (platform === 'weibo' || platform === 'google' || platform === 'zhihu' || platform === 'yahoo') {
        return 'Failed to load. Please refresh and try again.';
    }
    return '加载失败，请刷新重试';
}

// Get content generation error text based on platform language
function getContentErrorText(platform = 'baidu') {
    if (platform === 'weibo' || platform === 'google' || platform === 'zhihu' || platform === 'yahoo') {
        return 'Sorry, failed to load content. Please try again.';
    }
    return '抱歉，内容生成失败，请重试。';
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
        
        // Format the hot count based on platform
        const hotCount = formatNumber(topic.hot, currentPlatform);
        const hotLabel = getHotLabel(currentPlatform);
        
        // Create rich news display for Google Top Stories and Yahoo Top Stories
        if (currentPlatform === 'weibo' || currentPlatform === 'google' || currentPlatform === 'zhihu' || currentPlatform === 'yahoo') {
            listItem.innerHTML = `
                <span class="topic-number">${index + 1}</span>
                ${topic.thumbnail ? `<img class="topic-thumbnail" src="${topic.thumbnail}" alt="${topic.title}" onerror="this.style.display='none'">` : ''}
                <div class="topic-content">
                    <div class="topic-title">${topic.title}</div>
                    <div class="topic-meta">
                        <span class="topic-source">${topic.source || 'Unknown'}</span>
                        <span class="topic-date">${formatDate(topic.date)}</span>
                    </div>
                    <div class="topic-hot">${hotCount} ${hotLabel}</div>
                    ${topic.snippet ? `<div class="topic-snippet">${topic.snippet}</div>` : ''}
                    <div class="topic-link" data-url="${topic.link || ''}"></div>
                </div>
            `;
        } else {
            // Simple display for Chinese platforms
            listItem.innerHTML = `
                <span class="topic-number">${index + 1}</span>
                <div class="topic-content">
                    <div class="topic-title">${topic.title}</div>
                    <div class="topic-hot">${hotCount} ${hotLabel}</div>
                </div>
            `;
        }
        
        listItem.addEventListener('click', () => selectTopic(topic));
        
        hotTopicsList.appendChild(listItem);
    });
}

// Format large numbers based on platform language
function formatNumber(num, platform = 'baidu') {
    // For Google Top Stories and Yahoo Top Stories, use English formatting
    if (platform === 'weibo' || platform === 'google' || platform === 'zhihu' || platform === 'yahoo') {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        } else {
            return num.toString();
        }
    }
    
    // For Chinese platforms (baidu, zhihu), use Chinese formatting
    if (num >= 100000000) {
        return (num / 100000000).toFixed(1) + '亿';
    } else if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
    } else {
        return num.toString();
    }
}

// Get hot label based on platform language
function getHotLabel(platform = 'baidu') {
    if (platform === 'weibo' || platform === 'google' || platform === 'zhihu' || platform === 'yahoo') {
        return 'views'; // English label for Google Top Stories and Yahoo Top Stories
    }
    return '热度'; // Chinese label for other platforms
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'Unknown time';
    
    // If it's already a relative time (like "1 hour ago"), return as is
    if (dateString.includes('ago') || dateString.includes('LIVE')) {
        return dateString;
    }
    
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 60) {
            return `${diffInMinutes}m ago`;
        } else if (diffInMinutes < 1440) {
            return `${Math.floor(diffInMinutes / 60)}h ago`;
        } else {
            return `${Math.floor(diffInMinutes / 1440)}d ago`;
        }
    } catch (error) {
        return dateString; // Return original if parsing fails
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
        // Call the real backend API
        const response = await fetch('/api/generate-content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                topic: topic.title,
                source: topic.source || '',
                platform: currentPlatform,
                originalNews: topic // 传递完整的新闻对象，包含snippet等信息
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate content');
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
            // Display the generated content
            displayGeneratedContent(result.data, topic);
        } else {
            throw new Error('Invalid data format');
        }
    } catch (error) {
        console.error('Error generating content:', error);
        loadingState.classList.add('hidden');
        contentState.classList.remove('hidden');
        const errorText = getContentErrorText(currentPlatform);
        generatedText.textContent = errorText;
    }
}

// Display the generated content
function displayGeneratedContent(data, topic) {
    // Hide loading state
    loadingState.classList.add('hidden');
    
    // Update content
    selectedTopicTitle.textContent = topic.title;
    
    // For Google Top Stories and Yahoo Top Stories, enhance the content display
    if (currentPlatform === 'weibo' || currentPlatform === 'google' || currentPlatform === 'zhihu' || currentPlatform === 'yahoo') {
        // Add source and date information
        const existingMeta = document.querySelector('.content-meta');
        if (existingMeta) {
            existingMeta.remove();
        }
        
        const metaDiv = document.createElement('div');
        metaDiv.className = 'content-meta';
        
        // Check if this is a real news image
        const isRealImage = data.imageUrl && !data.imageUrl.includes('picsum.photos');
        const imageStatus = isRealImage ? 
            '<span class="image-status real-image"><i class="fas fa-check-circle"></i> Real news image</span>' : 
            '<span class="image-status generated-image"><i class="fas fa-image"></i> Generated image</span>';
        
        metaDiv.innerHTML = `
            <div class="content-source-info">
                <span class="content-source">${topic.source || 'Unknown Source'}</span>
                <span class="content-date">${formatDate(topic.date)}</span>
                ${topic.link ? `<a href="${topic.link}" target="_blank" class="content-link">View Original Article <i class="fas fa-external-link-alt"></i></a>` : ''}
            </div>
            <div class="content-image-info">
                ${imageStatus}
            </div>
        `;
        selectedTopicTitle.insertAdjacentElement('afterend', metaDiv);
    }
    
    generatedText.textContent = data.text;
    
    // Update button texts based on current platform
    updateButtonTexts(currentPlatform);
    
    // Always use high-resolution generated image for content display
    // Thumbnails are only used in the news list, not in the content view
    const imageUrl = data.imageUrl;
    
    // 预加载图片，确保图片正确加载后再显示
    const tempImage = new Image();
    tempImage.onload = function() {
        generatedImage.src = imageUrl;
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
    tempImage.src = imageUrl;
}

// Update button texts based on platform language
function updateButtonTexts(platform = 'baidu') {
    if (platform === 'weibo' || platform === 'google' || platform === 'zhihu' || platform === 'yahoo') {
        // English button texts for Google Top Stories and Yahoo Top Stories
        regenerateBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Regenerate';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
        shareBtn.innerHTML = '<i class="fas fa-share-alt"></i> Share';
    } else {
        // Chinese button texts for other platforms
        regenerateBtn.innerHTML = '<i class="fas fa-sync-alt"></i> 重新生成';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i> 复制内容';
        shareBtn.innerHTML = '<i class="fas fa-share-alt"></i> 分享';
    }
}

// Get copied text based on platform language
function getCopiedText(platform = 'baidu') {
    if (platform === 'weibo' || platform === 'google' || platform === 'zhihu' || platform === 'yahoo') {
        return 'Copied';
    }
    return '已复制';
}

// Get share message based on platform language
function getShareMessage(platform = 'baidu') {
    if (platform === 'weibo' || platform === 'google' || platform === 'zhihu' || platform === 'yahoo') {
        return 'Content copied to clipboard. You can share it manually.';
    }
    return '内容已复制到剪贴板，您可以手动分享';
}

// Update static texts based on platform language
function updateStaticTexts(platform = 'baidu') {
    const initialStateText = document.querySelector('#initial-state p');
    const loadingStateText = document.querySelector('#loading-state p');
    
    if (platform === 'weibo' || platform === 'google' || platform === 'zhihu' || platform === 'yahoo') {
        // English texts for Google Top Stories and Yahoo Top Stories
        if (initialStateText) {
            initialStateText.textContent = 'Select a story from the left to view content';
        }
        if (loadingStateText) {
            loadingStateText.textContent = 'Loading content, please wait...';
        }
    } else {
        // Chinese texts for other platforms
        if (initialStateText) {
            initialStateText.textContent = '从左侧选择一条热搜，AI将为你生成内容';
        }
        if (loadingStateText) {
            loadingStateText.textContent = 'AI正在生成内容，请稍候...';
        }
    }
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
            
            // Update static texts based on platform
            updateStaticTexts(platform);
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
                    const copiedText = getCopiedText(currentPlatform);
                    copyBtn.innerHTML = `<i class="fas fa-check"></i> ${copiedText}`;
                    
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
            const shareMessage = getShareMessage(currentPlatform);
            alert(shareMessage);
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