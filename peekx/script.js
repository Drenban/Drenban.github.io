let workbookData = null;
window.searchHistory = [];

fetch('xlsx-data/data.xlsx')
    .then(response => response.arrayBuffer())
    .then(data => {
        const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
        workbookData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    })
    .catch(error => {
        document.getElementById('result-container').textContent = '服务器繁忙，请稍后再试';
    });

function searchXLSX(query) {
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = '';

    if (!workbookData) {
        resultContainer.textContent = '服务器繁忙，请稍后再试';
        return false;
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
    } else if (/[，, ]/.test(query)) {
        const parts = query.split(/[，, ]+/).map(s => s.trim());
        if (parts.length === 2) {
            isSimpleQuery = true;
            if (/^\d+$/.test(parts[0])) {
                age = parts[0];
                name = parts[1];
            } else {
                name = parts[0];
                age = parts[1];
            }
            conditions['策略'] = name;
            conditions['收盘价'] = age;
        }
    } else if (/^[\u4e00-\u9fa5a-zA-Z]+\d+$/.test(query) || /^\d+[\u4e00-\u9fa5a-zA-Z]+$/.test(query)) {
        isSimpleQuery = true;
        if (/^[\u4e00-\u9fa5a-zA-Z]+\d+$/.test(query)) {
            name = query.match(/[\u4e00-\u9fa5a-zA-Z]+/)[0];
            age = query.match(/\d+/)[0];
        } else {
            age = query.match(/\d+/)[0];
            name = query.match(/[\u4e00-\u9fa5a-zA-Z]+/)[0];
        }
        conditions['策略'] = name;
        conditions['收盘价'] = age;
    } else if (/^\d+$/.test(query)) {
        conditions['股票代码'] = query;
    } else {
        conditions[''] = query;
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
            return rowValue === value;
        });
    });

    if (matches.length === 0) {
        return false;
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
    return lines;
    
    // typeLines(lines, resultContainer);

    // setTimeout(() => {
    //     if (window.innerWidth > 768) {
    //         resultContainer.scrollTop = resultContainer.scrollHeight;
    //     }
    // }, lines.length * 320);
    // return true;
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

    const isXlsxQuery = query.includes(':') || 
                        (/[，, ]/.test(query) && query.split(/[，, ]+/).length === 2 && 
                         (/\d/.test(query.split(/[，, ]+/)[0]) || /\d/.test(query.split(/[，, ]+/)[1]))) || 
                        /^[\u4e00-\u9fa5a-zA-Z]+\d+$/.test(query) || 
                        /^\d+[\u4e00-\u9fa5a-zA-Z]+$/.test(query) || 
                        /^\d+$/.test(query);

    // if (isXlsxQuery && searchXLSX(query)) {
    //     return;
    // }
    // window.searchCorpus(query, (result) => {
    //     // 将结果按行分割并逐条输出
    //     const lines = result.split('\n').filter(line => line.trim());
    //     typeLines(lines, resultContainer);
    // });
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = ''; // 清空现有内容

    if (isXlsxQuery) {
        const xlsxResult = searchXLSX(query);
        if (xlsxResult) {
            // 处理 xlsx 的逐条输出
            typeLines(xlsxResult, resultContainer);
            setTimeout(() => {
                if (window.innerWidth > 768) {
                    resultContainer.scrollTop = resultContainer.scrollHeight;
                }
            }, xlsxResult.length * 320);
            return;
        }
    }

    // 处理语料库查询，确保 resultContainer 可用
    window.searchCorpus(query, (result) => {
        if (typeof result !== 'string') {
            console.error('searchCorpus 返回的结果不是字符串:', result);
            typeLines(['抱歉，查询出错，请稍后再试'], resultContainer);
            return;
        }
        const lines = result.split('\n').filter(line => line.trim());
        typeLines(lines, resultContainer);
        setTimeout(() => {
            if (window.innerWidth > 768) {
                resultContainer.scrollTop = resultContainer.scrollHeight;
            }
        }, lines.length * 320);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('index.html')) {
        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', search);
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
