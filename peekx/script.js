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

    // 修改位置 1：解析查询条件
    const conditions = {};
    if (query.includes(':')) {
        const parts = query.split(',').map(part => part.trim());
        parts.forEach(part => {
            const [key, value] = part.split(':').map(s => s.trim());
            if (key && value !== undefined) {
                conditions[key] = value;
            }
        });
    }

    // 修改位置 2：筛选数据
    const matches = workbookData.filter(row => {
        // 无条件时模糊匹配所有字段
        if (Object.keys(conditions).length === 0) {
            return Object.values(row).some(val => 
                String(val).toLowerCase().includes(query)
            );
        }

        // 多条件匹配
        return Object.entries(conditions).every(([key, value]) => {
            const rowValue = String(row[key] || '').toLowerCase();
            // 范围查询
            if (value.includes('-')) {
                const [min, max] = value.split('-').map(Number);
                const numValue = Math.floor(Number(rowValue));
                return numValue >= min && numValue <= max;
            } else if (value.startsWith('>')) {
                return Math.floor(Number(rowValue)) > Number(value.slice(1));
            } else if (value.startsWith('<')) {
                return Math.floor(Number(rowValue)) < Number(value.slice(1));
            }
            // 默认模糊匹配
            return rowValue.includes(value);
        });
    });

    if (matches.length === 0) {
        resultContainer.textContent = '未找到匹配结果';
        return;
    }

    if (query && !searchHistory.includes(query)) {
        searchHistory.unshift(query);
        updateHistory();
    }

    // 修改位置 3：输出所有匹配结果
    const lines = matches.flatMap((result, index) => {
        const resultLines = Object.entries(result).map(([key, value]) => 
            `<span class="field">${key}:</span> <span class="value">${value}</span>`
        );
        // 添加分隔符（可选）
        return index < matches.length - 1 ? [...resultLines, '<hr>'] : resultLines;
    });
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
