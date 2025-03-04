// 用户数据存储变量
let userData = []; // 用于存储从 .xlsx 文件读取的用户数据

// 通过地址获取 .xlsx 文件
function loadUserData() {
    return new Promise((resolve, reject) => {
        const url = "/assets/JS/xlsx/logo.xlsx"; // 替换为实际的 .xlsx 文件地址

        // 禁用登录按钮，等待数据加载
        loginButton.disabled = true;
        errorMessage.textContent = '正在加载数据，请稍等...';
    
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    console.error('请求失败:', response.status, response.statusText);
                    throw new Error('无法加载文件');
                }
                return response.arrayBuffer();
            })
            .then(data => {
                const workbook = XLSX.read(data, { type: 'array' });
                console.log("Workbook loaded:", workbook); // 打印加载的工作簿内容
    
                // 假设 Excel 文件的第一个工作表包含用户名和密码
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(sheet);
    
                // 存储用户名和密码的数据
                userData = json.map(row => ({
                    email: row["Email"], // 假设 Excel 表格的列名为 "Email" 和 "Password"
                    password: row["Password"],
                    expiryDate: row["ExpiryDate"]  // 假设日期是字符串格式，如 "2025-01-15"
                }));

                console.log("User data loaded:", userData); // 用于调试
                resolve(); // 完成数据加载
    
                // 开启登录按钮
                loginButton.disabled = false;
                errorMessage.textContent = ''; // 清空错误信息
            })
            .catch(error => {
                console.error("加载文件失败:", error);
                errorMessage.textContent = '加载数据失败，请稍后重试。';
                alert('错误信息: ' + error.message); // 弹出详细错误信息
            });
    });
}

// 检查会员是否过期
function isMembershipValid(expiryDate) {
    const currentDate = new Date();

    // 清除时分秒，确保比较的日期为"纯日期"
    currentDate.setHours(0, 0, 0, 0);  // 设置为午夜（00:00:00）

     // 将 Excel 日期序列值转换为 JavaScript 日期
    const excelStartDate = new Date(1900, 0, 1); // 1900年1月1日作为起始日期
    const expiry = new Date(excelStartDate.getTime() + (expiryDate - 2) * 86400000);  // -2是因为Excel的日期从1900年开始，但Excel错误地认为1900是闰年

    if (isNaN(expiry.getTime())) {
        console.error("Invalid expiry date:", expiryDate);
        return false; // 无效日期视为过期
    }
    expiry.setHours(0, 0, 0, 0);  // 清除时分秒部分

    console.log("Original Excel expiryDate: ", expiryDate);
    console.log("Converted expiryDate: ", expiry);
    console.log("Expiry date in user data:", userData);

    const diffTime = expiry.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));  // 转换为天数

    console.log("Remaining days: ", diffDays);

    return diffDays > 0;  // 只要剩余天数大于0，会员有效
}

// 用户登录验证
async function login() {
    await loadUserData();  // 等待数据加载完成
    
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('errorMessage');

    // 清除之前的错误信息
    errorMessage.textContent = '';

    console.log("User input:", email, password);  // 打印用户输入

    // 输入验证
    if (!email || !password) {
        errorMessage.textContent = '请输入电子邮件和密码！';
        return;
    }

    // 检查用户输入的电子邮件和密码是否匹配
    const user = userData.find(u => u.email.toLowerCase() === email && u.password === password);
    console.log("Matching user found:", user);  // 打印找到的用户数据

    if (user) {
        // 检查会员有效期是否过期
        const isValid = isMembershipValid(user.expiryDate);
        
        if (!isValid) {
            errorMessage.textContent = '您的会员已过期！'; // 会员过期
        } else {
            // 登录成功，保存登录状态，并跳转到数据页面
            localStorage.setItem('userLoggedIn', 'true');  // 设置登录状态
            // alert('登录成功！');
            // window.location.href = "/assets/JS/index.html";  // 跳转到数据页面
            window.location.href = "/Gokkrepo/index.html";  // 跳转到数据页面
        }
    } else {
        // 登录失败，显示错误信息
        errorMessage.textContent = '电子邮件或密码错误！';
    }
}

// 页面加载时获取用户数据，并注册事件监听器
window.onload = function() {
    const errorMessage = document.getElementById('errorMessage');
    const loginButton = document.getElementById('loginButton');
    loginButton.addEventListener('click', login);

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

    // 如果用户已经登录，直接跳转
    // if (localStorage.getItem('userLoggedIn') === 'true') {
    //     window.location.href = "/assets/JS/index.html";
    // }
};
