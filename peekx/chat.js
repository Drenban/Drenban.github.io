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
        return;
    }

    const input = query.replace(/\s+/g, ' ').trim();
    const results = fuse.search(input);
    const bestMatch = results.length > 0 && results[0].score < 0.6 ? results[0] : null;
    const intent = detectIntent(input);
    const answer = generateResponse(intent, bestMatch);
    // resultContainer.textContent = answer;

    if (callback) callback(answer);

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
