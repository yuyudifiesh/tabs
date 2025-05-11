const VERSION = '1.2.5.20250510';
const BETA = 'null';
const WEATHER_API_KEY = '589658c57e30103630480b0a6f31c779';
// 缓存对象
const weatherCache = {};
const poemCache = {};
const stockCache = {};
// 敏感词列表
const sensitiveLocations = ['tibet', 'formosa', 'Formosa', 'Tibet'];
const sensitivePhrases = [
    '中华民国台湾',
    '台湾独立',
    '中華民國（Republic of China）',
    '台湾国',
    '一中一台',
    '两个中国',
    '台独'
];

// 更新时间和日期显示
function updateDateTime() {
    const now = new Date();
    
    // 格式化时间（不含秒，使用span包裹分隔符）
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('time-display').innerHTML = `${hours}<span class="time-separator">:</span>${minutes}`;
    
    // 格式化日期
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekday = weekdays[now.getDay()];
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    document.getElementById('date-display').textContent = `${year} 年 ${month} 月 ${day} 日 ${weekday}`;
}

// 计算两个日期之间的天数差
function calculateDaysDifference(targetDateStr) {
    // 解析目标日期 YYYY.MM.DD
    const [year, month, day] = targetDateStr.split('.').map(Number);
    const targetDate = new Date(year, month - 1, day); // 月份从0开始
    
    // 获取今天的日期（忽略时间部分）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 计算时间差（毫秒）
    const timeDiff = targetDate - today;
    
    // 转换为天数
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    return daysDiff;
}

// 获取天气数据，使用缓存机制
async function fetchWeather(location) {
    // 安全检查
    if (isSensitiveLocation(location.toLowerCase())) {
        return '非法字符';
    }
    
    // 检查缓存
    if (weatherCache[location]) {
        // 缓存有效（10分钟内），直接返回
        if (Date.now() - weatherCache[location].timestamp < 10 * 60 * 1000) {
            return weatherCache[location].temperature;
        }
    }
    
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${WEATHER_API_KEY}`);
        
        if (!response.ok) {
            throw new Error(`天气API请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        const temperature = Math.floor(data.main.temp);
        
        // 缓存结果
        weatherCache[location] = {
            temperature,
            timestamp: Date.now()
        };
        
        return temperature;
    } catch (error) {
        console.error('获取天气数据失败:', error);
        return null;
    }
}
// 敏感位置检测
function isSensitiveLocation(location) {
    return sensitiveLocations.includes(location);
}

// 获取天气数据，使用缓存机制
async function fetchWeather(location) {
    // 安全检查
    if (isSensitiveLocation(location.toLowerCase())) {
        return '非法字符';
    }
    
    // 检查缓存
    if (weatherCache[location]) {
        // 缓存有效（10分钟内），直接返回
        if (Date.now() - weatherCache[location].timestamp < 10 * 60 * 1000) {
            return weatherCache[location].temperature;
        }
    }
    
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${WEATHER_API_KEY}`);
        
        if (!response.ok) {
            throw new Error(`天气API请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        const temperature = Math.floor(data.main.temp);
        
        // 缓存结果
        weatherCache[location] = {
            temperature,
            timestamp: Date.now()
        };
        
        return temperature;
    } catch (error) {
        console.error('获取天气数据失败:', error);
        return null;
    }
}

// 新增：获取股票数据，使用缓存机制
async function fetchStockData(stockCode) {
    // 安全检查
    if (!/^\d{6}$/.test(stockCode)) {
        return null;
    }
    
    // 检查缓存
    if (stockCache[stockCode]) {
        // 缓存有效（1分钟内），直接返回
        if (Date.now() - stockCache[stockCode].timestamp < 60 * 1000) {
            return stockCache[stockCode].data;
        }
    }
    
    try {
        const response = await fetch(`https://api.mairui.club/hsrl/ssjy/${stockCode}/b887d4403688d5e65a`);
        
        if (!response.ok) {
            throw new Error(`股票API请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 缓存结果
        stockCache[stockCode] = {
            data,
            timestamp: Date.now()
        };
        
        return data;
    } catch (error) {
        console.error('获取股票数据失败:', error);
        return null;
    }
}

// 敏感位置检测
function isSensitiveLocation(location) {
    return sensitiveLocations.includes(location);
}

// 敏感内容检测 - 修正：改进检测逻辑，避免误判
function containsSensitivePhrases(text) {
    if (!text) return false;
    
    // 先进行简单的小写转换，处理不区分大小写的情况
    const lowerCaseText = text.toLowerCase();
    
    // 检查敏感位置（排除正常的台湾相关表述）
    for (const phrase of sensitiveLocations) {
        if (phrase !== 'taiwan' && lowerCaseText.includes(phrase.toLowerCase())) {
            return true;
        }
    }
    
    // 检查敏感短语（使用更精确的正则表达式）
    for (const phrase of sensitivePhrases) {
        switch (phrase) {
            case '中华民国台湾':
                // 匹配"中华民国台湾"或类似组合，排除单独的"台湾"
                if (/((中華民國|中华民国)\s*台湾|台湾\s*(中華民國|中华民国))/gi.test(text)) {
                    return true;
                }
                break;
                SS
            case '台湾独立':
                // 匹配"台湾独立"或类似分裂表述
                if (/台湾\s*独立/gi.test(text)) {
                    return true;
                }
                break;
                
            case '中華民國（Republic of China）':
                // 匹配带括号的中华民国英文表述
                if (/((中華民國|中华民国)\s*\(republic of china\))/gi.test(text)) {
                    return true;
                }
                break;
                
            case '台湾国':
                // 确保不会匹配到"台湾省"
                if (/台湾\s*国/gi.test(text)) {
                    return true;
                }
                break;
                
            case '一中一台':
            case '两个中国':
            case '台独':
                // 直接检查这些敏感词
                if (lowerCaseText.includes(phrase.toLowerCase())) {
                    return true;
                }
                break;
        }
    }
    
    return false;
}


// 获取随机古诗词
function fetchPoem(placeholderId) {
    // 检查缓存
    if (poemCache[placeholderId]) {
        renderPoem(placeholderId, poemCache[placeholderId]);
        return;
    }
    
    // 调用古诗词API
    jinrishici.load(function(result) {
        if (result.status === 'success') {
            const poemData = {
                content: result.data.content,
                origin: result.data.origin,
                author: result.data.author
            };
            
            // 缓存诗词
            poemCache[placeholderId] = poemData;
            
            // 渲染诗词
            renderPoem(placeholderId, poemData);
        } else {
            const poemElement = document.getElementById(placeholderId);
            if (poemElement) {
                poemElement.innerHTML = '<p class="text-red-400">诗词加载失败</p>';
            }
        }
    });
}

// 渲染古诗词
function renderPoem(placeholderId, poemData) {
    const poemElement = document.getElementById(placeholderId);
    if (poemElement) {
        poemElement.innerHTML = `
            <div class="poem-container p-4 bg-white/5 rounded-lg my-4">
                <p class="poem-content text-lg italic mb-2">${poemData.content}</p>
                <div class="flex justify-between text-sm text-white/70">
                    <span class="poem-origin">${poemData.origin}</span>
                    <span class="poem-author">${poemData.author}</span>
                </div>
            </div>
        `;
    }
}

// 替换文本中的邮箱地址为可点击链接
function replaceEmailAddresses(text) {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    return text.replace(emailRegex, (email) => {
        return `<a href="mailto:${email}" class="email-link" target="_blank">${email}</a>`;
    });
}

// 替换文本中的日期标签
function replaceDateTags(text) {
    const dateTagRegex = /\[totime=(\d{4}\.\d{1,2}\.\d{1,2})\]/g;
    return text.replace(dateTagRegex, (match, dateStr) => {
        try {
            const daysDiff = calculateDaysDifference(dateStr);
            let displayText, className;
            
            if (daysDiff > 0) {
                displayText = `还有${daysDiff}天`;
                className = 'countdown-future';
            } else if (daysDiff < 0) {
                displayText = `已经${Math.abs(daysDiff)}天`;
                className = 'countdown-past';
            } else {
                displayText = '今天';
                className = 'countdown-future';
            }
            
            return `<span class="countdown-tag ${className}">${displayText}</span>`;
        } catch (error) {
            console.error('日期解析错误:', error);
            return match; // 解析失败时返回原始标签
        }
    });
}

// 日期
function formatCurrentDate() {
    const now = new Date();
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const weekday = weekdays[now.getDay()];
    
    return `${year} 年 ${month} 月 ${day} 日 ${weekday}`;
}

// 生成调试信息文本
function generateDebugInfo() {
    const userAgent = navigator.userAgent;
    
    return `debugsys start
[Version]${VERSION}
[b. ]${BETA}
[JS]github.com
[CSS]tailwindcss
[Markdown]Yes
[EWord]Open
[Weather]OpenWeather
[UA]${userAgent}`;
}
    
    // 新增：格式化股票数据为Markdown列表
function formatStockData(stockData, stockCode) {
    if (!stockData) {
        return `<div class="text-red-500">无法获取股票 ${stockCode} 的数据</div>`;
    }
    
    // 格式化数值，保留两位小数
    const formatNumber = (num) => {
        if (num === undefined || num === null) return '-';
        return parseFloat(num).toFixed(2);
    };
    
    // 格式化成交量，添加单位
    const formatVolume = (vol) => {
        if (vol === undefined || vol === null) return '-';
        if (vol >= 1e8) {
            return (vol / 1e8).toFixed(2) + '亿';
        } else if (vol >= 1e4) {
            return (vol / 1e4).toFixed(2) + '万';
        }
        return vol.toString();
    };
    
    return `
        <div class="stock-info bg-gray-900/30 p-4 rounded-lg my-4">
            <div class="font-medium text-lg mb-2">股票代码: ${stockCode}</div>
            <div class="markdown-list space-y-2">
                <div class="flex items-start">
                    <span class="text-white/70 mr-2">-</span>
                    <span><span class="font-medium">最新价：</span>${formatNumber(stockData.p)}</span>
                </div>
                <div class="flex items-start">
                    <span class="text-white/70 mr-2">-</span>
                    <span><span class="font-medium">开盘价：</span>${formatNumber(stockData.o)}</span>
                </div>
                <div class="flex items-start">
                    <span class="text-white/70 mr-2">-</span>
                    <span><span class="font-medium">最高价：</span>${formatNumber(stockData.h)}</span>
                </div>
                <div class="flex items-start">
                    <span class="text-white/70 mr-2">-</span>
                    <span><span class="font-medium">最低价：</span>${formatNumber(stockData.l)}</span>
                </div>
                <div class="flex items-start">
                    <span class="text-white/70 mr-2">-</span>
                    <span><span class="font-medium">前收盘价：</span>${formatNumber(stockData.yc)}</span>
                </div>
                <div class="flex items-start">
                    <span class="text-white/70 mr-2">-</span>
                    <span><span class="font-medium">成交总额：</span>${formatNumber(stockData.cje)}</span>
                </div>
                <div class="flex items-start">
                    <span class="text-white/70 mr-2">-</span>
                    <span><span class="font-medium">成交总量：</span>${formatVolume(stockData.v)}</span>
                </div>
                <div class="flex items-start">
                    <span class="text-white/70 mr-2">-</span>
                    <span><span class="font-medium">更新时间：</span>${stockData.t || '-'}</span>
                </div>
            </div>
        </div>
    `;
}


// 替换文本中的天气和诗词标签
function replaceSpecialTags(text) {
    let result = text;

    // 处理[hsrldm=xxxxxx]标签 - 新增功能
    const stockTagRegex = /\[hsrldm=([^\]]+)\]/g;
    const stockMatches = result.match(stockTagRegex);
    
    if (stockMatches) {
        stockMatches.forEach(match => {
            const stockCode = match.match(/\[hsrldm=([^\]]+)\]/)[1];
            const placeholderId = `stock-placeholder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            // 替换标签为占位符
            result = result.replace(match, `<div id="${placeholderId}" class="stock-placeholder">加载中...</div>`);
            
            // 异步获取股票数据并更新占位符
            fetchStockData(stockCode).then(stockData => {
                const element = document.getElementById(placeholderId);
                if (element) {
                    element.innerHTML = formatStockData(stockData, stockCode);
                }
            });
        });
    }

    // 处理[debug]标签
    const debugRegex = /\[debug\]/g;
    if (debugRegex.test(result)) {
        const debugInfo = generateDebugInfo();
        result = result.replace(debugRegex, `<pre class="debug-info bg-black/70 text-green-400 p-4 rounded my-4 font-mono text-sm whitespace-pre-wrap word-break-break-all">${debugInfo}</pre>`);
    }

    // 处理[times]标签
    const timesRegex = /\[times\]/g;
    if (timesRegex.test(result)) {
        const formattedDate = formatCurrentDate();
        result = result.replace(timesRegex, formattedDate);
    }
    
    // 处理[poem]标签
    const poemRegex = /\[poem\]/g;
    if (poemRegex.test(result)) {
        const placeholderId = `poem-placeholder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        result = result.replace(poemRegex, `<div id="${placeholderId}" class="poem-placeholder">加载中...</div>`);
        fetchPoem(placeholderId);
    }
    
    // 处理[weather=城市]标签
    const weatherTagRegex = /\[weather=([^\]]+)\]/g;
    const weatherMatches = result.match(weatherTagRegex);
    
    if (weatherMatches) {
        weatherMatches.forEach(match => {
            const location = match.match(/\[weather=([^\]]+)\]/)[1];
            const placeholderId = `weather-placeholder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            // 替换标签为占位符
            result = result.replace(match, `<span id="${placeholderId}" class="weather-tag">加载中...</span>`);
            
            // 异步获取天气数据并更新占位符
            fetchWeather(location).then(temperature => {
                const element = document.getElementById(placeholderId);
                if (element) {
                    if (temperature === '非法字符') {
                        element.textContent = temperature;
                        element.classList.add('error');
                        element.classList.add('text-red-500');
                    } else if (temperature !== null) {
                        element.textContent = `${temperature}°C`;
                        element.classList.add('loaded');
                    } else {
                        element.textContent = `无法获取${location}天气`;
                        element.classList.add('error');
                    }
                }
            });
        });
    }
    
    return result;
}

// 更新预览内容
function updatePreview() {
    const markdown = editor.value;
    
    // 检查敏感内容
    if (containsSensitivePhrases(markdown)) {
        preview.innerHTML = `
            <div class="w-full h-full flex items-center justify-center">
                <div class="text-center">
                    <i class="fa fa-exclamation-triangle text-red-500 text-5xl mb-4"></i>
                    <h2 class="text-xl font-bold text-red-500 mb-2">内容包含非法字符</h2>
                    <p class="text-white/70">请检查地区命名规范和英文缩写或拼音</p>
                </div>
            </div>
        `;
        return;
    }
    
    const processedText = replaceEmailAddresses(replaceDateTags(replaceSpecialTags(markdown)));
    preview.innerHTML = marked.parse(processedText);
}

// Markdown 编辑器功能
let editor, preview, editModeBtn, previewModeBtn, saveBtn, saveStatus;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    editor = document.getElementById('markdown-editor');
    preview = document.getElementById('markdown-preview');
    editModeBtn = document.getElementById('edit-mode-btn');
    previewModeBtn = document.getElementById('preview-mode-btn');
    saveBtn = document.getElementById('save-btn');
    saveStatus = document.getElementById('save-status');
    
    // 配置 marked 解析器
    marked.setOptions({
        highlight: function(code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                return hljs.highlight(code, { language: lang }).value;
            }
            return hljs.highlightAuto(code).value;
        },
        breaks: true
    });
    
    // 从Cookie加载内容
    loadFromCookie();
    
    // 初始更新预览
    updatePreview();
    
    // 初始更新时间和日期
    updateDateTime();
    
    // 每分钟更新一次时间
    setInterval(updateDateTime, 60000);
    
    // 每10分钟更新一次天气缓存
    setInterval(updatePreview, 10 * 60 * 1000);
    
    // 事件监听器
    editModeBtn.addEventListener('click', switchToEditMode);
    previewModeBtn.addEventListener('click', switchToPreviewMode);
    saveBtn.addEventListener('click', saveToCookie);
    editor.addEventListener('input', updatePreview);
    
    // 键盘快捷键处理
    editor.addEventListener('keydown', (e) => {
        // Ctrl+S 保存
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveToCookie();
        }
    });
    
    // 搜索功能
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value.trim();
            if (query) {
                window.location.href = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
            }
        }
    });
    
    // 页面加载动画
    const elements = document.querySelectorAll('.transition-custom');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 100 + index * 100);
    });
    
    // 默认显示预览模式
    switchToPreviewMode();
});

// 切换到编辑模式
function switchToEditMode() {
    // 移除所有按钮的活动状态
    editModeBtn.classList.remove('editor-tab-active');
    previewModeBtn.classList.remove('editor-tab-active');
    
    // 显示编辑区域
    editor.classList.remove('hidden');
    preview.classList.add('hidden');
    
    // 添加活动状态到编辑按钮
    editModeBtn.classList.add('editor-tab-active');
    editModeBtn.classList.add('text-white/80');
    editModeBtn.classList.remove('text-white/60');
    previewModeBtn.classList.remove('text-white/80');
    previewModeBtn.classList.add('text-white/60');
}

// 切换到预览模式
function switchToPreviewMode() {
    // 移除所有按钮的活动状态
    editModeBtn.classList.remove('editor-tab-active');
    previewModeBtn.classList.remove('editor-tab-active');
    
    // 更新预览并显示
    updatePreview();
    editor.classList.add('hidden');
    preview.classList.remove('hidden');
    
    // 添加活动状态到预览按钮
    previewModeBtn.classList.add('editor-tab-active');
    editModeBtn.classList.remove('text-white/80');
    editModeBtn.classList.add('text-white/60');
    previewModeBtn.classList.add('text-white/80');
    previewModeBtn.classList.remove('text-white/60');
}

// 保存到 Cookie
function saveToCookie() {
    // 确保编辑器元素已加载
    if (!editor) {
        console.error('编辑器元素未找到');
        return;
    }
    
    const markdown = editor.value;
    console.log('保存内容:', markdown); // 调试日志
    
    // 设置Cookie
    try {
        document.cookie = `markdown笔记=${encodeURIComponent(markdown)}; expires=Fri, 31 Dec 2026 23:59:59 GMT; path=/; SameSite=Lax`;
        console.log('Cookie设置成功'); // 调试日志
        
        // 显示保存状态
        saveStatus.classList.remove('hidden');
        setTimeout(() => {
            saveStatus.classList.add('hidden');
        }, 2000);
    } catch (error) {
        console.error('保存到Cookie失败:', error);
        saveStatus.innerHTML = '<span class="text-red-400">保存失败</span>';
        saveStatus.classList.remove('hidden');
        setTimeout(() => {
            saveStatus.classList.add('hidden');
        }, 3000);
    }
}

// 从 Cookie 加载
function loadFromCookie() {
    // 确保编辑器元素已加载
    if (!editor) {
        console.error('编辑器元素未找到');
        return;
    }
    
    try {
        const cookies = document.cookie.split('; ');
        for (const cookie of cookies) {
            const [name, value] = cookie.split('=');
            if (name === 'markdown笔记') {
                const decodedValue = decodeURIComponent(value);
                console.log('从Cookie加载内容:', decodedValue); // 调试日志
                editor.value = decodedValue;
                return;
            }
        }
        
        console.log('未找到保存的内容，使用默认内容'); // 调试日志
        // 如果没有保存的内容，设置默认内容
        editor.value = `# 欢迎使用 Markdown 编辑器

这是一个功能丰富的 Markdown 编辑器，支持多种特殊标签[【查看教程】](https://yuyudifiesh.github.io/tabs/docs/teach.html)

## 编辑器功能

- 实时预览 Markdown 效果
- 自动保存到本地
- 支持代码高亮
- 支持邮箱地址自动识别

## 使用方法

1. 在编辑模式下输入 Markdown 文本
2. 点击"预览"按钮查看渲染效果
3. 内容会自动保存到浏览器中

## 易错地区天气码
- 西藏 >>> xizang
- 台湾省 >>> taiwan

## 数据源
气温数据：OpenWeather
股票行情：山西麦蕊智数软件科技有限公司
页面背景：bing_wallpaper
搜索引擎：Bing

开始创建你的笔记吧！`;
    } catch (error) {
        console.error('从Cookie加载失败:', error);
        editor.value = '# 无法加载保存的内容\n\n请尝试重新输入。';
    }
}
