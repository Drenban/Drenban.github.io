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
    // 修改位置 1：改为逐个 token 输出
    const tokens = Object.entries(result).flatMap(([key, value]) => [
        `<span class="field">${key}:</span>`,
        `<span class="value">${value}</span>`
    ]);
    typeTokens(tokens, resultContainer);
}

// 修改位置 2：逐个 token 输出函数
function typeTokens(tokens, element) {
    let index = 0;
    const lineDiv = document.createElement('div');
    lineDiv.className = 'line';
    element.appendChild(lineDiv);

    function typeNext() {
        if (index < tokens.length) {
            const tokenSpan = document.createElement('span');
            tokenSpan.innerHTML = tokens[index];
            tokenSpan.style.opacity = '0';
            lineDiv.appendChild(tokenSpan);
            setTimeout(() => {
                tokenSpan.style.opacity = '1';
                tokenSpan.style.animation = 'slideFadeIn 0.5s ease forwards';
            }, 50); // 小延迟确保动画可见
            index++;
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
