async function searchFiles() {
    const query = document.getElementById('searchQuery').value.trim();
    if (!query) {
        alert('请输入搜索内容');
        return;
    }
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';  // 清空以前的搜索结果

    try {
        // 假设文件已转换为 JSON 格式并上传到 GitHub
        const response = await fetch('xlsx/files.json'); // 读取 JSON 文件（如果你把 XLSX 转换为 JSON 格式）
        const fileData = await response.json();
        const results = [];

        fileData.files.forEach(file => {
            const fileName = file.name;
            const fileContent = file.content; // 从 JSON 数据中提取内容
            fileContent.forEach(row => {
                row.forEach(cell => {
                    if (cell && cell.toString().includes(query)) {
                        results.push({ file: fileName, value: cell });
                    }
                });
            });
        });

        // 显示搜索结果
        if (results.length > 0) {
            results.forEach(result => {
                const resultElement = document.createElement('div');
                resultElement.classList.add('result-item');
                resultElement.innerHTML = `<b>文件:</b> ${result.file} <b>值:</b> ${result.value}`;
                searchResults.appendChild(resultElement);
            });
        } else {
            searchResults.innerHTML = '<p>未找到相关结果。</p>';
        }
    } catch (error) {
        console.error('搜索时出错:', error);
        searchResults.innerHTML = '<p>加载文件失败，请稍后再试。</p>';
    }
}
