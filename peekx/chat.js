let corpus = null;
let fuse = null;

// UTF-8 Base64 解码函数
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
        console.log('混淆数据:', obfuscatedData.substring(0, 50) + '...');

        const decodedData = decodeBase64UTF8(obfuscatedData); // 正确解码 UTF-8
        console.log('解码后的数据:', decodedData.substring(0, 50) + '...');

        corpus = JSON.parse(decodedData);
        console.log('解析后的语料库:', corpus);

        fuse = new Fuse(corpus, {
            keys: ['question', 'keywords'],
            threshold: 0.4,
            includeScore: true,
            minMatchCharLength: 2
        });
        console.log('Fuse.js 初始化成功');
    } catch (error) {
        console.error('加载语料库失败:', error);
    }
}

function detectIntent(input) {
    const lowerInput = input.toLowerCase().replace(/\s+/g, ' ').trim();
    const intents = [
        { name: 'time', patterns: ['时间', '什么时候', '几点', '多久', '啥时候'], fallback: '您想知道什么的时间？可以告诉我更多细节吗？' },
        { name: 'price', patterns: ['价格', '多少钱', '费用', '成本', '价位'], fallback: '您想了解哪方面的价格？可以具体一点吗？' },
        { name: 'howto', patterns: ['如何', '怎么', '怎样', '步骤', '方法'], fallback: '您想知道如何做什么？请告诉我具体操作！' }
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
        return match.item.answer;
    }
    if (intent) {
        switch (intent.name) {
            case 'time': return '我可以帮您查时间相关的信息，您具体想知道什么时间？';
            case 'price': return '价格信息可能因产品不同而异，您想了解哪个产品的价格？';
            case 'howto': return '我可以指导您完成操作，请告诉我您想做什么！';
            default: return intent.fallback;
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

    const input = query.replace(/\s+/g, ' ').trim();
    console.log('处理后的输入:', input);

    const results = fuse.search(input);
    console.log('Fuse.js 搜索结果:', results);

    const bestMatch = results.length > 0 && results[0].score < 0.6 ? results[0] : null;
    const intent = detectIntent(input);
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
