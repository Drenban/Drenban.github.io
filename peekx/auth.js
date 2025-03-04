let userData = null;

// 加载用户 XLSX 数据
fetch('/xlsx-data/users.xlsx')
    .then(response => response.arrayBuffer())
    .then(data => {
        const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
        userData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    })
    .catch(error => {
        document.getElementById('error-message').textContent = '无法加载用户数据';
    });

// 检查会员是否过期（处理 Excel 序列值）
function isMembershipValid(expiryDate) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // 清除时分秒

    // 将 Excel 日期序列值转换为 JavaScript 日期
    const excelStartDate = new Date(1900, 0, 1); // 1900-01-01
    const expiry = new Date(excelStartDate.getTime() + (expiryDate - 2) * 86400000); // -2 修正 Excel 闰年 bug
    if (isNaN(expiry.getTime())) {
        console.error("Invalid expiry date:", expiryDate);
        return false;
    }
    expiry.setHours(0, 0, 0, 0); // 清除时分秒

    const diffTime = expiry.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // 转换为天数

    console.log("Excel expiry value:", expiryDate);
    console.log("Converted expiry date:", expiry);
    console.log("Current date:", currentDate);
    console.log("Remaining days:", diffDays);

    return diffDays > 0; // 剩余天数大于 0 则有效
}

// 登录验证
function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('error-message');

    if (!userData) {
        errorMessage.textContent = '用户数据未加载，请稍后重试';
        return;
    }

    const user = userData.find(u => u.email === username && u.password === password);
    if (!user) {
        errorMessage.textContent = '邮箱或密码错误';
        return;
    }

    // 检查有效期
    if (!isMembershipValid(user.expiry_date)) {
        errorMessage.textContent = '账户已过期，请联系管理员';
        return;
    }

    localStorage.setItem('userLoggedIn', 'true');
    window.location.href = '/index.html';
}

// 退出
function logout() {
    localStorage.removeItem('userLoggedIn');
    window.location.href = '/login.html';
}

// 检查登录状态
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('index.html') && localStorage.getItem('userLoggedIn') !== 'true') {
        window.location.href = '/login.html';
    }
    if (window.location.pathname.includes('login.html')) {
        document.getElementById('login-btn').addEventListener('click', login);
    }
    if (window.location.pathname.includes('index.html')) {
        document.getElementById('logout-btn').addEventListener('click', logout);
    }
});
