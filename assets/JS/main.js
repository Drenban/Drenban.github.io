// 用户数据存储变量
let userData = []; // 用于存储从 .xlsx 文件读取的用户数据

// 通过地址获取 .xlsx 文件
function loadUserData() {
    const url = "google/logo.xlsx"; // 替换为实际的 .xlsx 文件地址
    
    fetch(url)
        .then(response => response.arrayBuffer())
        .then(data => {
            const workbook = XLSX.read(data, { type: 'array' });

            // 假设 Excel 文件的第一个工作表包含用户名和密码
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(sheet);

            // 存储用户名和密码的数据
            userData = json.map(row => ({
                username: row["Username"], // 假设 Excel 表格的列名为 "Username" 和 "Password"
                password: row["Password"],
                expiryDate: row["ExpiryDate"]  // 假设日期是字符串格式，如 "2025-01-15"
            }));

            console.log("User data loaded:", userData); // 用于调试
        })
        .catch(error => {
            console.error("加载文件失败:", error);
        });
}

// 检查会员是否过期
function isMembershipValid(expiryDate) {
    const currentDate = new Date();

    // 清除时分秒，确保比较的日期为"纯日期"
    currentDate.setHours(0, 0, 0, 0);  // 设置为午夜（00:00:00）
    
    const expiry = new Date(expiryDate);
    if (isNaN(expiry.getTime())) {
        console.error("Invalid expiry date:", expiryDate);
        return false; // 无效日期视为过期
    }
    expiry.setHours(0, 0, 0, 0);  // 清除时分秒部分

    console.log("Original expiryDate: ", expiryDate);
    console.log("Parsed expiryDate: ", new Date(expiryDate));

    const diffTime = expiry.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));  // 转换为天数

    console.log("Remaining days: ", diffDays);

    return diffDays > 0;  // 只要剩余天数大于0，会员有效
}

// 用户登录验证
function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('errorMessage');

    // 清除之前的错误信息
    errorMessage.textContent = '';

    // 输入验证
    if (!username || !password) {
        errorMessage.textContent = '请输入用户名和密码！';
        return;
    }

    // 检查用户输入的用户名和密码是否匹配
    const user = userData.find(u => u.username === username && u.password === password);

    if (user) {
        // 检查会员有效期是否过期
        const isValid = isMembershipValid(user.expiryDate);
        
        if (!isValid) {
            errorMessage.textContent = '您的会员已过期！'; // 会员过期
        } else {
            // 登录成功，保存登录状态，并跳转到数据页面
            localStorage.setItem('userLoggedIn', 'true');  // 设置登录状态
            alert('登录成功！');
            window.location.href = "data_index.html";  // 跳转到数据页面
        }
    } else {
        // 登录失败，显示错误信息
        errorMessage.textContent = '用户名或密码错误！';
    }
}

// 页面加载时获取用户数据，并注册事件监听器
window.onload = function() {
    loadUserData();  // 加载用户数据

    // 注册按钮事件，切换面板
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const container = document.getElementById('container');

    signUpButton.addEventListener('click', () => 
        container.classList.add('right-panel-active')
    );

    signInButton.addEventListener('click', () => 
        container.classList.remove('right-panel-active')
    );
};
