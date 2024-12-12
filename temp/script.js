async function searchFiles() {
            const query = document.getElementById('searchQuery').value.trim();
            if (!query) {
                alert('请输入搜索内容');
                return;
            }
            const searchResults = document.getElementById('searchResults');
            searchResults.innerHTML = '';  // 清空以前的搜索结果

            // 获取上传的文件
            const fileInput = document.getElementById('fileInput');
            const file = fileInput.files[0];
            if (!file) {
                alert('请先上传一个 XLSX 文件');
                return;
            }

            try {
                // 使用 FileReader 读取上传的文件
                const reader = new FileReader();
                reader.onload = function(e) {
                    const arrayBuffer = e.target.result;
                    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

                    const results = [];
                    workbook.SheetNames.forEach(sheetName => {
                        const sheet = workbook.Sheets[sheetName];
                        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });  // 以二维数组形式获取数据

                        data.forEach(row => {
                            row.forEach(cell => {
                                if (cell && cell.toString().includes(query)) {
                                    results.push({ sheet: sheetName, value: cell });
                                }
                            });
                        });
                    });

                    // 显示搜索结果
                    if (results.length > 0) {
                        results.forEach(result => {
                            const resultElement = document.createElement('div');
                            resultElement.classList.add('result-item');
                            resultElement.innerHTML = `<b>表格:</b> ${result.sheet} <b>值:</b> ${result.value}`;
                            searchResults.appendChild(resultElement);
                        });
                    } else {
                        searchResults.innerHTML = '<p>未找到相关结果。</p>';
                    }
                };

                reader.onerror = function(error) {
                    console.error('文件读取错误:', error);
                    searchResults.innerHTML = '<p>加载文件失败，请稍后再试。</p>';
                };

                // 读取文件
                reader.readAsArrayBuffer(file);

            } catch (error) {
                console.error('搜索时出错:', error);
                searchResults.innerHTML = '<p>加载文件失败，请稍后再试。</p>';
            }
        }
