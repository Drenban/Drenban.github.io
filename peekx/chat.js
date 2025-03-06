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
