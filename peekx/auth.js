let userData = null;

// 加载用户 JSON 数据
fetch('users.json')
    .then(response => response.json())
    .then(data => {
        userData = data.users; // 假设 JSON 结构为 { "users": [...] }
    })
    .catch(error => {
        console.error('加载用户数据失败:', error);
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.textContent = '无法加载用户数据，请稍后再试';
        }
    });

// // 前端模拟哈希函数（使用 SHA-256）
// async function hashPassword(password) {
//     const encoder = new TextEncoder();
//     const data = encoder.encode(password);
//     const hash = await crypto.subtle.digest('SHA-256', data);
//     return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
// }

// 生成简单的前端令牌（模拟 JWT）
function generateToken(username) {
    const payload = { username, exp: Date.now() + 3600000 }; // 1小时有效期
    return btoa(JSON.stringify(payload)); // Base64 编码，非加密，仅混淆
}

// 检查会员是否过期（处理 ISO 日期字符串或时间戳）
function isMembershipValid(expiryDate) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // 假设 expiryDate 是 ISO 日期字符串（如 "2025-12-31"）或时间戳
    const expiry = new Date(expiryDate);
    if (isNaN(expiry.getTime())) {
        console.error("无效的到期日期:", expiryDate);
        return false;
    }
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    console.log("Expiry date:", expiryDate);
    console.log("Converted expiry date:", expiry);
    console.log("Current date:", currentDate);
    console.log("Remaining days:", diffDays);

    return diffDays > 0;
}

// 输入清理
function sanitizeInput(input) {
    return input.replace(/[<>&;"]/g, '');
}

// 登录验证
function login(event) {
    if (event) event.preventDefault(); // 防止表单提交刷新页面
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('error-message') || document.getElementById('error');

    if (!userData) {
        errorMessage.textContent = '用户数据未加载，请稍后重试';
        return;
    }

    const user = userData.find(u => u.username === username && u.password === password);
    if (!user) {
        errorMessage.textContent = '邮箱或密码错误';
        return;
    }

    if (!isMembershipValid(user.expiry_date)) {
        errorMessage.textContent = '账户已过期，请联系管理员';
        return;
    }

    localStorage.setItem('loggedIn', 'true');
    window.location.href = 'index.html';
}

// 验证令牌（前端模拟）
function verifyToken(token) {
    try {
        const payload = JSON.parse(atob(token));
        return payload.exp > Date.now();
    } catch {
        return false;
    }
}

// 退出
function logout() {
    localStorage.removeItem('loggedIn');
    window.location.href = 'login.html';
}

// 显示查询内容（适用于单页应用，若不需要可移除）
function showQuerySection() {
    const loginSection = document.getElementById('login-section');
    const querySection = document.getElementById('query-section');
    if (loginSection && querySection) {
        loginSection.style.display = 'none';
        querySection.style.display = 'block';
    }
}

// 检查登录状态并绑定事件
document.addEventListener('DOMContentLoaded', () => {
    const pathname = window.location.pathname;

    if (pathname.includes('index.html') && localStorage.getItem('loggedIn') !== 'true') {
        window.location.href = 'login.html';
    } else if (pathname.includes('index.html') && localStorage.getItem('loggedIn') === 'true') {
        showQuerySection();
    }

    const loginForm = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');
    if (pathname.includes('login.html')) {
        if (loginForm) {
            loginForm.addEventListener('submit', login);
        } else if (loginBtn) {
            loginBtn.addEventListener('click', login);
        }
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (pathname.includes('index.html') && logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});
