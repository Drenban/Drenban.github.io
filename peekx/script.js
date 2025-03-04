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
    // 修改位置 1：按键值对生成字符串数组，逐行逐字符输出
    const lines = Object.entries(result).map(([key, value]) => 
        `<span class="field">${key}:</span> <span class="value">${value}</span>`
    );
    typeLines(lines, resultContainer);
}

// 修改位置 2：逐行逐字符输出，每行完整后换行
function typeLines(lines, element) {
    let lineIndex = 0;
    let charIndex = 0;

    function typeNext() {
        if (lineIndex < lines.length) {
            // 为每行创建一个新容器
            const lineDivs = element.querySelectorAll('.line');
            let currentLine = lineDivs[lineIndex];
            if (!currentLine) {
                currentLine = document.createElement('div');
                currentLine.className = 'line';
                element.appendChild(currentLine);
            }

            if (charIndex < lines[lineIndex].length) {
                currentLine.innerHTML = lines[lineIndex].slice(0, charIndex + 1);
                charIndex++;
                setTimeout(typeNext, 20); // 每个字符间隔 20ms
            } else {
                // 当前行完成后，重置 charIndex 并进入下一行
                charIndex = 0;
                lineIndex++;
                setTimeout(typeNext, 300); // 每行完成后间隔 300ms
            }
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

// 原有代码保持不变，仅添加历史按钮交互
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('index.html')) {
        document.getElementById('search-btn').addEventListener('click', search);
        document.getElementById('logout-btn').addEventListener('click', logout);

        // 修改位置 4：历史按钮点击展开/关闭
        const historyToggle = document.getElementById('history-toggle');
        const historySidebar = document.getElementById('history-sidebar');
        historyToggle.addEventListener('click', () => {
            historySidebar.classList.toggle('active');
        });

        // 修改位置 5：点击历史项后关闭侧栏并查询
        document.getElementById('history-list').addEventListener('click', (e) => {
            if (e.target.tagName === 'LI') {
                document.getElementById('query-input').value = e.target.textContent;
                search();
                historySidebar.classList.remove('active');
            }
        });
    }
});
