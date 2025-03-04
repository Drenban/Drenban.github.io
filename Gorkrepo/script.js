let workbookData = null;

// 加载 XLSX 文件
fetch('data.xlsx')
    .then(response => response.arrayBuffer())
    .then(data => {
        const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        workbookData = XLSX.utils.sheet_to_json(sheet); // 转换为 JSON
    })
    .catch(error => console.error('加载 XLSX 文件失败:', error));

// 查询并逐 token 输出
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

    // 逐 token 输出第一个匹配结果
    const result = JSON.stringify(matches[0], null, 2);
    typeResult(result, resultDiv);
}

// 模拟逐 token 输出
function typeResult(text, element) {
    let index = 0;
    element.textContent = ''; // 清空内容

    function typeNext() {
        if (index < text.length) {
            element.textContent += text[index];
            index++;
            setTimeout(typeNext, 50); // 每 50ms 输出一个字符
        }
    }
    typeNext();
}
