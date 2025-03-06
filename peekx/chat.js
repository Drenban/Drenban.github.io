let corpus = null;

async function loadCorpus() {
    try {
        const response = await fetch('data/corpus.json');
        if (!response.ok) throw new Error('无法加载语料库');
        corpus = await response.json();
    } catch (error) {
        console.error('加载语料库失败:', error);
    }
}

window.searchCorpus = function(query) {
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = '';

    if (!corpus) {
        resultContainer.textContent = '语料库未加载，请稍后再试';
        return;
    }

    const input = query.toLowerCase().trim();
    let bestMatch = null;
    let highestScore = 0;

    for (const item of corpus) {
        let score = 0;
        for (const keyword of item.keywords) {
            if (input.includes(keyword.toLowerCase())) {
                score += 1;
            }
        }
        if (score > highestScore) {
            highestScore = score;
            bestMatch = item;
        }
    }

    const answer = bestMatch && highestScore > 0
        ? bestMatch.answer
        : "抱歉，我无法理解您的问题，请尝试换个说法。";
    resultContainer.textContent = answer;

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
