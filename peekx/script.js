let workbookData = null;
window.searchHistory = []; // 全局历史记录

// 加载 XLSX 数据
fetch('xlsx-data/data.xlsx')
    .then(response => response.arrayBuffer())
    .then(data => {
        const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
        workbookData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        console.log('XLSX 数据加载成功');
    })
    .catch(error => {
        console.error('加载 XLSX 数据失败:', error);
        document.getElementById('result-container').textContent = '服务器繁忙，请稍后再试';
    });

// XLSX 查询逻辑
function searchXLSX(query) {
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = '';

    if (!workbookData) {
        resultContainer.textContent = '服务器繁忙，请稍后再试';
        return false; // 返回 false 表示查询失败
    }

    const conditions = {};
    let isSimpleQuery = false;
    let name, age;

    query = query.trim().toLowerCase();
    if (query.includes(':')) {
        query.split(',').forEach(part => {
            const [key, value] = part.split(':').map(s => s.trim());
            if (key && value !== undefined) conditions[key] = value;
        });
        name = conditions['celv'] || conditions['策略'];
        age = conditions['shoupanjia'] || conditions['收盘价'];
        if (name && age && Object.keys(conditions).length === 2) isSimpleQuery = true;
    } else if (/[，, ]/.test(query) || /^[\u4e00-\u9fa5a-zA-Z]+\d+$/.test(query)) {
        isSimpleQuery = true;
        if (/[，, ]/.test(query)) {
            [name, age] = query.split(/[，, ]+/).map(s => s.trim());
        } else if (/^[\u4e00-\u9fa5a-zA-Z]+\d+$/.test(query)) {
            name = query.match(/[\u4e00-\u9fa5a-zA-Z]+/)[0];
            age = query.match(/\d+/)[0];
        }
        conditions['策略'] = name;
        conditions['收盘价'] = age;
    } else {
        // 支持直接输入股票代码
        if (/^\d+$/.test(query)) { // 全数字，认为是股票代码
            conditions['股票代码'] = query;
        } else {
            conditions[''] = query; // 无条件模糊查询
        }
    }

    const matches = workbookData.filter(row => {
        if (conditions['']) {
            return Object.values(row).some(val => 
                String(val).toLowerCase().includes(conditions[''])
            );
        }
        return Object.entries(conditions).every(([key, value]) => {
            const rowValue = String(row[key] || '').toLowerCase();
            if (!value) return true;
            if (value.includes('-')) {
                const [min, max] = value.split('-').map(Number);
                const numValue = Math.floor(Number(rowValue));
                return numValue >= min && numValue <= max;
            } else if (value.startsWith('>')) {
                return Math.floor(Number(rowValue)) > Number(value.slice(1));
            } else if (value.startsWith('<')) {
                return Math.floor(Number(rowValue)) < Number(value.slice(1));
            }
            if (key.toLowerCase() === '收盘价') {
                return Math.floor(Number(rowValue)) === Math.floor(Number(value));
            }
            return rowValue.includes(value);
        });
    });

    if (matches.length === 0) {
        return false; // 未找到匹配，返回 false
    }

    if (query && !window.searchHistory.includes(query)) {
        window.searchHistory.unshift(query);
        window.updateHistory();
    }

    let lines;
    if (isSimpleQuery) {
        const cities = matches.map(row => row['股票代码']).filter(city => city !== undefined);
        lines = [
            `<span class="field">全部代码:</span><br><span class="value">${cities.join(', ')}</span>`,
            `<span class="field">合计:</span> <span class="value">${cities.length}</span>`
        ];
    } else {
        lines = matches.flatMap((result, index) => {
            const resultLines = Object.entries(result).map(([key, value]) => 
                `<span class="field">${key}:</span> <span class="value">${value}</span>`
            );
            return index < matches.length - 1 ? [...resultLines, '<hr>'] : resultLines;
        });
    }
    typeLines(lines, resultContainer);

    setTimeout(() => {
        if (window.innerWidth > 768) {
            resultContainer.scrollTop = resultContainer.scrollHeight;
        }
    }, lines.length * 320);
    return true; // 查询成功
}

function typeLines(lines, element) {
    let lineIndex = 0;
    let charIndex = 0;

    function typeNext() {
        if (lineIndex < lines.length) {
            const lineDivs = element.querySelectorAll('.line');
            let currentLine = lineDivs[lineIndex];
            if (!currentLine) {
                currentLine = document.createElement('div');
                currentLine.className = 'line';
                element.appendChild(currentLine);
            }
            const lineContent = lines[lineIndex] || '';
            if (charIndex < lineContent.length) {
                currentLine.innerHTML = lineContent.slice(0, charIndex + 1);
                charIndex++;
                setTimeout(typeNext, 20);
                element.scrollTop = element.scrollHeight;
            } else {
                charIndex = 0;
                lineIndex++;
                setTimeout(typeNext, 300);
            }
        }
    }
    typeNext();
}

window.updateHistory = function() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';
    window.searchHistory.slice(0, 10).forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        li.addEventListener('click', () => {
            document.getElementById('query-input').value = item;
            search();
        });
        historyList.appendChild(li);
    });
};

function search() {
    const query = document.getElementById('query-input').value.trim();
    if (!query) return;

    console.log('搜索输入:', query);
    // 先尝试 XLSX 查询
    const xlsxSuccess = searchXLSX(query);
    // 如果 XLSX 查询失败，且输入不符合 XLSX 模式，则尝试语料库查询
    if (!xlsxSuccess && !(query.includes(':') || /[，, ]/.test(query) || /^[\u4e00-\u9fa5a-zA-Z]+\d+$/.test(query))) {
        console.log('调用语料库查询');
        window.searchCorpus(query);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('index.html')) {
        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', search);
            console.log('搜索按钮绑定成功');
        }

        const historyToggle = document.getElementById('history-toggle');
        if (historyToggle) {
            historyToggle.addEventListener('click', () => {
                document.getElementById('history-sidebar').classList.toggle('active');
            });
        }

        const historyList = document.getElementById('history-list');
        if (historyList) {
            historyList.addEventListener('click', (e) => {
                if (e.target.tagName === 'LI') {
                    document.getElementById('query-input').value = e.target.textContent;
                    search();
                    document.getElementById('history-sidebar').classList.remove('active');
                }
            });
        }

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }

        window.updateHistory();
    }
});
