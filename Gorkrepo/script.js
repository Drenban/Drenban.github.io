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
    const lines = Object.entries(result).map(([key, value]) => ({
        html: `<div class="line"><span class="field">${key}:</span> <span class="value">${value}</span></div>`
    }));

    typeLines(lines, resultDiv);
}

// 按字段逐行输出
function typeLines(lines, element) {
    let index = 0;

    function typeNext() {
        if (index < lines.length) {
            const lineDiv = document.createElement('div');
            lineDiv.innerHTML = lines[index].html;
            element.appendChild(lineDiv);
            index++;
            setTimeout(typeNext, 500); // 与动画时间匹配（0.5s）
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

// 页面加载时检查用户是否登录
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('userLoggedIn') !== 'true') {
        window.location.href = '/login.html'; // 未登录跳转到登录页面
    }
});
