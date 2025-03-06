let corpus = null;

async function loadCorpus() {
    try {
        const response = await fetch('data/corpus.json');
        if (!response.ok) throw new Error('无法加载语料库');
        corpus = await response.json();
        console.log('语料库加载成功:', corpus);
    } catch (error) {
        console.error('加载语料库失败:', error);
    }
}

window.searchCorpus = function(query) {
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = '';

    if (!corpus) {
        resultContainer.textContent = '语料库未加载，请稍后再试';
        console.warn('语料库未加载');
        return;
    }

    // 清理输入，去掉多余空格
    const input = query.toLowerCase().replace(/\s+/g, ' ').trim();
    let bestMatch = null;
    let highestScore = 0;

    for (const item of corpus) {
        let score = 0;
        const keywords = item.keywords.map(k => k.toLowerCase());
        
        // 检查完整问题匹配（更高权重）
        if (input === item.question.toLowerCase()) {
            score += 10; // 完整匹配加高分
        }
        
        // 关键词匹配
        keywords.forEach(keyword => {
            if (input.includes(keyword)) {
                // 特定关键词加权
                if (keyword !== 'peekx') {
                    score += 2; // 非品牌词加更高分
                } else {
                    score += 1; // 品牌词加低分
                }
            }
        });

        if (score > highestScore) {
            highestScore = score;
            bestMatch = item;
        }
    }

    const answer = bestMatch && highestScore > 0
        ? bestMatch.answer
        : "抱歉，我无法理解您的问题，请尝试换个说法。";
    resultContainer.textContent = answer;
    console.log('语料库查询结果:', answer, '得分:', highestScore);

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
