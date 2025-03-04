let workbookData = null;
let searchHistory = [];

// 加载查询 XLSX 数据
fetch('/xlsx-data/data.xlsx')
    .then(response => response.arrayBuffer())
    .then(data => {
        const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
        workbookData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    })
    .catch(error => document.getElementById('result-container').textContent = '数据未加载');

// 查询
function search() {
    // 查询逻辑（待细化）
}

// 更新历史记录
function updateHistory() {
    // 历史更新逻辑（待细化）
}
