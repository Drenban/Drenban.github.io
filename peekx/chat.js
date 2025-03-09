let corpus = null;
let fuse = null;
const searchCache = new Map(); // 搜索结果缓存
window.searchHistory = [];

// Base64 解码函数
function decodeBase64UTF8(base64Str) {
    try {
        const binaryStr = atob(base64Str);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
        }
        return new TextDecoder('utf-8').decode(bytes);
    } catch (error) {
        throw new Error('Base64 解码失败: ' + error.message);
    }
}

// 异步加载语料库
async function loadCorpus() {
    try {
        const response = await fetch('data/obfuscated_corpus.json');
        if (!response.ok) throw new Error(`无法加载语料库: ${response.status}`);
        const obfuscatedData = await response.text();
        const decodedData = decodeBase64UTF8(obfuscatedData);
        corpus = JSON.parse(decodedData);

        fuse = new Fuse(corpus, {
            keys: [
                { name: 'question', weight: 0.5 },   // 主问题字段
                { name: 'keywords', weight: 0.3 },   // 关键词字段
                { name: 'synonyms', weight: 0.15 },  // 同义词字段
                { name: 'tags', weight: 0.05 }       // 标签字段
            ],
            threshold: 0.4,          // 模糊匹配阈值
            includeScore: true,      // 返回匹配分数
            includeMatches: true,    // 返回匹配详情
            minMatchCharLength: 2,   // 最小匹配字符长度
            shouldSort: true         // 自动排序
        });
        console.log('语料库加载完成');
    } catch (error) {
        console.error('加载语料库失败:', error);
    }
}

// 搜索函数
window.searchCorpus = function(query, callback) {
    const resultContainer = document.getElementById('result-container');
    if (resultContainer) resultContainer.innerHTML = '';

    if (!corpus || !fuse) {
        const errorMsg = '语料库未加载，请稍后再试';
        if (callback) callback(errorMsg);
        else console.error(errorMsg);
        return;
    }

    const input = query.trim().toLowerCase();

    // 检查缓存
    if (searchCache.has(input)) {
        if (callback) callback(searchCache.get(input));
        return;
    }

    const results = fuse.search(input);
    const bestMatch = results.length > 0 && results[0].score < 0.6 ? results[0] : null;
    const intent = detectIntent(input);
    const answer = generateResponse(intent, bestMatch);

    // 缓存结果
    searchCache.set(input, answer);

    if (callback) callback(answer);
    else console.warn('未提供回调函数，结果:', answer);

    // 更新搜索历史
    if (query && !window.searchHistory.includes(query)) {
        window.searchHistory.unshift(query);
        if (window.searchHistory.length > 10) window.searchHistory.pop(); // 限制历史长度
        window.updateHistory();
    }
};

// 更新历史
window.updateHistory = function() {
    console.log('搜索历史:', window.searchHistory);
};

function detectIntent(input) {
    const lowerInput = input.toLowerCase().replace(/\s+/g, ' ').trim();
    const intents = [
        { name: 'time', patterns: ['时间', '什么时候', '几点', '多久', '啥时候', '何时'], fallback: '您想知道什么的时间？可以告诉我更多细节吗？' },
        { name: 'price', patterns: ['价格', '多少钱', '费用', '成本', '价位', '花多少'], fallback: '您想了解哪方面的价格？可以具体一点吗？' },
        { name: 'howto', patterns: ['如何', '怎么', '怎样', '步骤', '方法', '怎么办'], fallback: '您想知道如何做什么？请告诉我具体操作！' },
        { name: 'function', patterns: ['作用', '功能', '干什么', '做什么', '用途', '有啥用'], fallback: '您想了解什么的功能吗？请告诉我更多！' },
        { name: 'strategy', patterns: ['策略', '方案', '操作', '交易方法', '计划', '方式'], fallback: '您想知道哪种交易策略？可以具体一点吗？' },
        { name: 'concept', patterns: ['理念', '是什么', '含义', '定义', '意思', '概念'], fallback: '您想了解什么概念？请详细说明！' },
        { name: 'problem', patterns: ['问题', '缺点', '困难', '怎么办', '麻烦', '挑战'], fallback: '您遇到什么问题了吗？请告诉我详情！' },
        { name: 'goal', patterns: ['目标', '目的', '追求', '想要', '打算', '方向'], fallback: '您想知道什么目标？可以具体描述吗？' },
        { name: 'process', patterns: ['流程', '过程', '步骤', '顺序', '怎么做', '进展'], fallback: '您想了解什么流程？请告诉我具体内容！' },
        { name: 'history', patterns: ['历史', '过去', '以前', '早期', '曾经', '回忆'], fallback: '您想知道什么历史背景？请提供更多信息！' },
        { name: 'motivation', patterns: ['动力', '原因', '为什么', '驱动', '激励'], fallback: '您想知道什么的动力来源？可以具体点吗？' },
        { name: 'information', patterns: ['信息', '数据', '详情', '内容', '资料'], fallback: '您想了解什么信息？请告诉我具体需求！' },
        { name: 'impact', patterns: ['影响', '结果', '后果', '作用于', '改变'], fallback: '您想知道什么的影响？请详细说明！' },
        { name: 'method', patterns: ['方法', '工具', '技术', '手段', '途径'], fallback: '您想了解什么方法或工具？请具体点！' },
        { name: 'caution', patterns: ['注意', '小心', '提醒', '警告', '需知'], fallback: '您想知道什么需要注意的地方吗？请告诉我更多！' },
        { name: 'plan', patterns: ['计划', '安排', '未来', '打算', '预期'], fallback: '您想了解什么计划？请提供更多细节！' },
        { name: 'usage', patterns: ['使用', '怎么用', '操作方法', '应用'], fallback: '您想知道如何使用什么？请具体说明！' },
        { name: 'experience', patterns: ['体验', '感受', '感觉', '经历'], fallback: '您想了解什么的体验？可以告诉我更多吗？' },
        { name: 'access', patterns: ['访问', '获取', '怎么看', '哪里找'], fallback: '您想知道如何访问什么？请详细说说！' },
        { name: 'content', patterns: ['内容', '包含', '有什么', '包括'], fallback: '您想知道什么包含哪些内容？请具体点！' },
        { name: 'definition', patterns: ['定义', '是什么', '解释', '含义', '术语'], fallback: '您想了解什么的定义？请告诉我具体术语！' },
        { name: 'formula', patterns: ['公式', '计算', '怎么算', '算法'], fallback: '您想知道什么的计算公式？请具体说明！' },
        { name: 'acknowledgment', patterns: ['感谢', '支持', '帮助', '致谢'], fallback: '您想了解谁提供了支持吗？请告诉我更多！' },
        { name: 'role', patterns: ['角色', '职责', '作用', '任务'], fallback: '您想知道谁扮演了什么角色？请具体点！' },
        { name: 'contribution', patterns: ['贡献', '支持', '帮助', '作用'], fallback: '您想知道谁有什么贡献？请详细说明！' },
        { name: 'person', patterns: ['谁是', '人物', '介绍', '背景'], fallback: '您想了解某个人的信息吗？请告诉我具体是谁！' },
        { name: 'achievement', patterns: ['成就', '成果', '业绩', '贡献'], fallback: '您想知道什么成就？请提供更多信息！' },
        { name: 'interest', patterns: ['兴趣', '研究', '方向', '关注'], fallback: '您想知道什么的研究兴趣？请具体说说！' },
        { name: 'disclaimer', patterns: ['免责', '声明', '责任', '注意事项'], fallback: '您想了解免责声明的内容吗？请告诉我更多！' },
        { name: 'classification', patterns: ['类型', '分类', '种类', '区别'], fallback: '您想知道什么的分类？请详细说明！' },
        { name: 'psychology', patterns: ['心理', '心态', '情绪', '行为'], fallback: '您想了解交易中的什么心理因素？请具体点！' }
    ];

    for (const intent of intents) {
        if (intent.patterns.some(pattern => lowerInput.includes(pattern))) {
            return intent;
        }
    }
    return null;
}

function generateResponse(intent, match) {
    if (match) {
        const score = (1 - match.score).toFixed(2); // 转换为相似度（0-1）
        if (score < 0.5) return '抱歉，找不到准确答案，您可以换个说法试试！';
        return `${match.item.answer.trim()}`; // (匹配度: ${score})
    }
    if (intent) {
        switch (intent.name) {
            case 'time': return '我可以帮您查时间相关的信息，您具体想知道什么时间？';
            case 'price': return '价格信息可能因产品不同而异，您想了解哪个产品的价格？';
            case 'howto': return '我可以指导您完成操作，请告诉我您想做什么！';
            case 'function': return '我可以解释它的作用，请告诉我您想了解什么功能！';
            case 'strategy': return '我可以提供交易策略建议，您想知道哪方面的操作方法？';
            case 'concept': return '我可以帮您解释这个概念，您具体想了解什么含义？';
            case 'problem': return '我可以帮您分析问题，请告诉我您遇到了什么困难！';
            case 'goal': return '我可以告诉您相关的目标，请具体说说您想追求什么！';
            case 'process': return '我可以为您讲解流程，请告诉我您想了解什么过程！';
            case 'history': return '我可以告诉您相关历史背景，请具体说说您想知道什么！';
            case 'motivation': return '我可以帮您分析动因，请告诉我您想了解什么的动力！';
            case 'information': return '我可以提供相关信息，请告诉我您想知道什么详情！';
            case 'impact': return '我可以分析它的影响，请告诉我您想了解什么后果！';
            case 'method': return '我可以告诉您相关方法，请具体说说您想用什么工具！';
            case 'caution': return '我可以提醒您注意事项，请告诉我您关心什么风险！';
            case 'plan': return '我可以告诉您未来的计划，请具体说说您想了解什么！';
            case 'usage': return '我可以教您如何使用，请告诉我您想操作什么！';
            case 'experience': return '我可以分享相关体验，请告诉我您想了解什么感受！';
            case 'access': return '我可以告诉您如何访问，请具体说说您想获取什么！';
            case 'content': return '我可以告诉您包含的内容，请告诉我您想了解什么！';
            case 'definition': return '我可以解释定义，请告诉我您想知道什么术语的意思！';
            case 'formula': return '我可以提供计算公式，请告诉我您想知道什么算法！';
            case 'acknowledgment': return '我可以告诉您谁提供了支持，请具体说说您想感谢谁！';
            case 'role': return '我可以告诉您相关角色，请告诉我您想知道谁的任务！';
            case 'contribution': return '我可以告诉您相关贡献，请具体说说您想了解谁的帮助！';
            case 'person': return '我可以介绍相关人物，请告诉我您想了解谁的背景！';
            case 'achievement': return '我可以告诉您相关成就，请具体说说您想知道什么成果！';
            case 'interest': return '我可以告诉您研究兴趣，请告诉我您想了解什么方向！';
            case 'disclaimer': return '我可以告诉您免责声明的内容，请具体说说您想知道什么！';
            case 'classification': return '我可以告诉您分类信息，请告诉我您想了解什么类型！';
            case 'psychology': return '我可以分析交易心理，请告诉我您想了解什么心态！';
            default: return intent.fallback || '抱歉，我不太明白您的意思，可以换个说法试试吗？';
        }
    }
    return '抱歉，我不太明白您的意思，可以换个说法试试吗？';
}

// DOM 加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    const pathname = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const hasRandomParam = urlParams.has('r');

    const isIndexPage = pathname === '/peekx/' || pathname.endsWith('/peekx/index.html') || hasRandomParam;

    if (isIndexPage) {
        loadCorpus();
    }
});
