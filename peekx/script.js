let workbookData = null;
let searchHistory = [];

// 加载查询 XLSX 数据
fetch('/xlsx-data/data.xlsx')
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
    const lines = Object.entries(result).map(([key, value]) => ({
        html: `<div class="line"><span class="field">${key}:</span> <span class="value">${value}</span></div>`
    }));

    typeLines(lines, resultContainer);
}

// 逐行输出
function typeLines(lines, element) {
    let index = 0;
    function typeNext() {
        if (index < lines.length) {
            const lineDiv = document.createElement('div');
            lineDiv.innerHTML = lines[index].html;
            element.appendChild(lineDiv);
            index++;
            setTimeout(typeNext, 500);
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
