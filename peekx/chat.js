let corpus = null;
let fuse = null;

// 加载语料库
async function loadCorpus() {
    try {
        const response = await fetch('data/corpus.json');
        if (!response.ok) throw new Error('无法加载语料库');
        corpus = await response.json();
        console.log('语料库加载成功:', corpus);

        // 初始化 Fuse.js
        fuse = new Fuse(corpus, {
            keys: ['question', 'keywords'], // 搜索字段
            threshold: 0.4, // 模糊匹配阈值（0-1，越低越严格）
            includeScore: true, // 返回匹配得分
            minMatchCharLength: 2 // 最小匹配字符长度
        });
    } catch (error) {
        console.error('加载语料库失败:', error);
    }
}

// 简单意图识别
function detectIntent(input) {
    const lowerInput = input.toLowerCase().replace(/\s+/g, ' ').trim();
    const intents = [
        {
            name: 'time', // 时间相关
            patterns: ['时间', '什么时候', '几点', '多久', '啥时候'],
            fallback: '您想知道什么的时间？可以告诉我更多细节吗？'
        },
        {
            name: 'price', // 价格相关
            patterns: ['价格', '多少钱', '费用', '成本', '价位'],
            fallback: '您想了解哪方面的价格？可以具体一点吗？'
        },
        {
            name: 'howto', // 操作步骤
            patterns: ['如何', '怎么', '怎样', '步骤', '方法'],
            fallback: '您想知道如何做什么？请告诉我具体操作！'
        }
    ];

    for (const intent of intents) {
        if (intent.patterns.some(pattern => lowerInput.includes(pattern))) {
            return intent;
        }
    }
    return null;
}

// 动态生成回复
function generateResponse(intent, match) {
    if (match) {
        return match.item.answer; // 语料库直接匹配
    }

    if (intent) {
        switch (intent.name) {
            case 'time':
                return '我可以帮您查时间相关的信息，您具体想知道什么时间？';
            case 'price':
                return '价格信息可能因产品不同而异，您想了解哪个产品的价格？';
            case 'howto':
                return '我可以指导您完成操作，请告诉我您想做什么！';
            default:
                return intent.fallback;
        }
    }

    return '抱歉，我不太明白您的意思，可以换个说法试试吗？';
}

window.searchCorpus = function(query) {
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = '';

    if (!corpus || !fuse) {
        resultContainer.textContent = '语料库未加载，请稍后再试';
        console.warn('语料库未加载');
        return;
    }

    const input = query.replace(/\s+/g, ' ').trim(); // 清理多余空格
    console.log('处理后的输入:', input);

    // 使用 Fuse.js 进行模糊匹配
    const results = fuse.search(input);
    const bestMatch = results.length > 0 && results[0].score < 0.6 ? results[0] : null;

    // 检测意图
    const intent = detectIntent(input);

    // 生成回复
    const answer = generateResponse(intent, bestMatch);
    resultContainer.textContent = answer;
    console.log('查询结果:', answer, '匹配得分:', bestMatch ? bestMatch.score : '无匹配', '意图:', intent ? intent.name : '无意图');

    if (query && !window.searchHistory.includes(query)) {
        window.searchHistory.unshift(query);
        window.updateHistory();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('index.html')) {
        loadCorpus();
    }
});
