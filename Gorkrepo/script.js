let workbookData = null;
let searchHistory = [];

// 加载 XLSX 文件
fetch('data.xlsx')
    .then(response => response.arrayBuffer())
    .then(data => {
        const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        workbookData = XLSX.utils.sheet_to_json(sheet);
    })
    .catch(error => console.error('加载 XLSX 文件失败:', error));

// 查询并优化输出
function search() {
    const query = document.getElementById('query').value.trim().toLowerCase();
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = ''; // 清空结果

    if (!workbookData) {
        resultDiv.textContent = '数据未加载，请稍后再试';
        return;
    }

    // 查找匹配的数据
    const matches = workbookData.filter(row => 
        Object.values(row).some(val => 
            String(val).toLowerCase().includes(query)
        )
    );

    if (matches.length === 0) {
        resultDiv.textContent = '未找到匹配结果';
        return;
    }

    // 添加到历史记录
    if (query && !searchHistory.includes(query)) {
        searchHistory.unshift(query);
        updateHistory();
    }

    // 格式化输出第一个匹配结果
    const result = matches[0];
    const formattedText = Object.entries(result)
        .map(([key, value]) => `<span class="field">${key}:</span> <span class="value">${value}</span>`)
        .join('\n');

    typeResult(formattedText, resultDiv);
}

// 模拟逐 token 输出（优化速度）
function typeResult(text, element) {
    let index = 0;
    element.innerHTML = ''; // 清空内容

    function typeNext() {
        if (index < text.length) {
            element.innerHTML += text[index];
            index++;
            setTimeout(typeNext, 20); // 加快速度到 20ms，更流畅
        }
    }
    typeNext();
}

// 更新历史记录显示
function updateHistory() {
    const historyList = document.getElementById('history');
    historyList.innerHTML = '';
    searchHistory.slice(0, 10).forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        li.onclick = () => {
            document.getElementById('query').value = item;
            search();
        };
        historyList.appendChild(li);
    });
}
