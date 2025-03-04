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

    // 修改位置 1：解析输入
    const conditions = {};
    let isSimpleQuery = false;
    let name, age;

    if (query.includes(':')) {
        // 多条件查询（键值对模式）
        query.split(',').forEach(part => {
            const [key, value] = part.split(':').map(s => s.trim());
            if (key && value !== undefined) {
                conditions[key] = value;
            }
        });
        // 检查是否为简单查询的键值对形式
        name = conditions['策略'] || conditions['策略'];
        age = conditions['收盘价'] || conditions['收盘价'];
        if (name && age && Object.keys(conditions).length === 2) {
            isSimpleQuery = true;
        }
    } else if (query.includes(',')) {
        // 简单查询（值模式，如 "Alice,10"）
        isSimpleQuery = true;
        [name, age] = query.split(',').map(s => s.trim());
        conditions['策略'] = name;
        conditions['收盘价'] = age;
    } else {
        // 无条件模糊查询
        conditions[''] = query;
    }

    // 修改位置 2：筛选数据
    const matches = workbookData.filter(row => {
        if (conditions['']) {
            // 无条件模糊匹配所有字段
            return Object.values(row).some(val => 
                String(val).toLowerCase().includes(conditions[''])
            );
        }

        // 多条件或简单查询匹配
        return Object.entries(conditions).every(([key, value]) => {
            const rowValue = String(row[key] || '').toLowerCase();
            if (!value) return true; // 空值条件跳过

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

            // 数值字段忽略小数
            if (key.toLowerCase() === '收盘价') {
                return Math.floor(Number(rowValue)) === Math.floor(Number(value));
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

    // 修改位置 3：根据查询类型输出结果
    let lines;
    if (isSimpleQuery) {
        // 简单查询模式：输出 City 汇总和总数
        const cities = matches.map(row => row['股票代码']).filter(city => city !== undefined);
        lines = [
            `<span class="field">全部代码:</span> <span class="value">${cities.join(', ')}</span>`,
            `<span class="field">合计:</span> <span class="value">${cities.length}</span>`
        ];
    } else {
        // 多条件模式：输出所有键值对
        lines = matches.flatMap((result, index) => {
            const resultLines = Object.entries(result).map(([key, value]) => 
                `<span class="field">${key}:</span> <span class="value">${value}</span>`
            );
            return index < matches.length - 1 ? [...resultLines, '<hr>'] : resultLines;
        });
    }
    typeLines(lines, resultContainer);

    // 修改位置 2：电脑端自动滚动到最新输出
    setTimeout(() => {
        if (window.innerWidth > 768) {
            resultContainer.scrollTop = resultContainer.scrollHeight;
        }
    }, lines.length * 320); // 等待输出完成
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
