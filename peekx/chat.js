let corpus = null;
let fuse = null;

function decodeBase64UTF8(base64Str) {
    const binaryStr = atob(base64Str);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
}

async function loadCorpus() {
    try {
        const response = await fetch('data/obfuscated_corpus.json');
        if (!response.ok) throw new Error('无法加载语料库');
        const obfuscatedData = await response.text();
        const decodedData = decodeBase64UTF8(obfuscatedData);
        corpus = JSON.parse(decodedData);

        fuse = new Fuse(corpus, {
            keys: ['question', 'keywords'],
            threshold: 0.4,
            includeScore: true,
            minMatchCharLength: 2
        });
    } catch (error) {
    }
}

function detectIntent(input) {
    const lowerInput = input.toLowerCase().replace(/\s+/g, ' ').trim();
    const intents = [
        { name: 'time', patterns: ['时间', '什么时候', '几点', '多久', '啥时候'], fallback: '您想知道什么的时间？可以告诉我更多细节吗？' },
        { name: 'price', patterns: ['价格', '多少钱', '费用', '成本', '价位'], fallback: '您想了解哪方面的价格？可以具体一点吗？' },
        { name: 'howto', patterns: ['如何', '怎么', '怎样', '步骤', '方法'], fallback: '您想知道如何做什么？请告诉我具体操作！' },
        { name: 'function', patterns: ['作用', '功能', '干什么', '做什么'], fallback: '您想了解什么的功能吗？请告诉我更多！' },
        { name: 'strategy', patterns: ['策略', '方案', '操作', '交易方法'], fallback: '您想知道哪种交易策略？可以具体一点吗？' },
        { name: 'concept', patterns: ['理念', '是什么', '含义', '定义'], fallback: '您想了解什么概念？请详细说明！' },
        { name: 'problem', patterns: ['问题', '缺点', '困难', '怎么办'], fallback: '您遇到什么问题了吗？请告诉我详情！' },
        { name: 'goal', patterns: ['目标', '目的', '追求', '想要'], fallback: '您想知道什么目标？可以具体描述吗？' }
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
        const item = match.item;
        return item.answer.trim();
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
            default: return intent.fallback || '抱歉，我不太明白您的意思，可以换个说法试试吗？';
        }
    }
    return '抱歉，我不太明白您的意思，可以换个说法试试吗？';
}

window.searchCorpus = function(query, callback) {
    const resultContainer = document.getElementById('result-container');
    if (resultContainer) {
        resultContainer.innerHTML = '';
    }

    if (!corpus || !fuse) {
        const errorMsg = '语料库未加载，请稍后再试';
        if (callback) callback(errorMsg);
        else console.error(errorMsg);
        return;
    }

    const input = query.replace(/\s+/g, ' ').trim();
    const results = fuse.search(input);
    const bestMatch = results.length > 0 && results[0].score < 0.6 ? results[0] : null;
    const intent = detectIntent(input);
    const answer = generateResponse(intent, bestMatch);

    if (callback) {
        callback(answer);
    } else {
        console.warn('未提供回调函数，结果:', answer); 
    }

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
