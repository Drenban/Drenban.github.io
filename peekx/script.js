let workbookData = null;
let searchHistory = [];

// 加载查询 XLSX 数据
fetch('xlsx-data/data.xlsx')
    .then(response => response.arrayBuffer())
    .then(data => {
        const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
        workbookData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    })
    .catch(error => {
        document.getElementById('result-container').textContent = '数据未加载，请稍后再试';
    });

// 查询
function search() {
    const query = document.getElementById('query-input').value.trim().toLowerCase();
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = '';

    if (!workbookData) {
        resultContainer.textContent = '数据未加载，请稍后再试';
        return;
    }

    const matches = workbookData.filter(row => 
        Object.values(row).some(val => 
            String(val).toLowerCase().includes(query)
        )
    );

    if (matches.length === 0) {
        resultContainer.textContent = '未找到匹配结果';
        return;
    }

    if (query && !searchHistory.includes(query)) {
        searchHistory.unshift(query);
        updateHistory();
    }

    const result = matches[0];
    // 修改位置 1：按键值对分组，逐个 token 输出
    const tokenPairs = Object.entries(result).map(([key, value]) => [
        `<span class="field">${key}:</span>`,
        `<span class="value">${value}</span>`
    ]);
    typeTokenPairs(tokenPairs, resultContainer);
}

// 修改位置 2：逐个 token 输出，每对键值一行
function typeTokenPairs(tokenPairs, element) {
    let pairIndex = 0;
    let tokenIndex = 0;

    function typeNext() {
        if (pairIndex < tokenPairs.length) {
            if (tokenIndex === 0) {
                // 每对键值创建一个新行
                const lineDiv = document.createElement('div');
                lineDiv.className = 'line';
                element.appendChild(lineDiv);
            }

            const currentLine = element.querySelectorAll('.line')[pairIndex];
            const tokenSpan = document.createElement('span');
            tokenSpan.innerHTML = tokenPairs[pairIndex][tokenIndex];
            tokenSpan.style.opacity = '0';
            currentLine.appendChild(tokenSpan);

            setTimeout(() => {
                tokenSpan.style.opacity = '1';
                tokenSpan.style.animation = 'slideFadeIn 0.5s ease forwards';
            }, 50);

            tokenIndex++;
            if (tokenIndex >= tokenPairs[pairIndex].length) {
                tokenIndex = 0;
                pairIndex++;
            }
            setTimeout(typeNext, 300); // 每个 token 间隔 300ms
        }
    }
    typeNext();
}

// 更新历史记录
function updateHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    searchHistory.slice(0, 10).forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        li.addEventListener('click', () => {
            document.getElementById('query-input').value = item;
            search();
        });
        historyList.appendChild(li);
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('index.html')) {
        document.getElementById('search-btn').addEventListener('click', search);
    }
});
