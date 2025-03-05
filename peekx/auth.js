let userData = null;

// 加载用户 JSON 数据
fetch('users.json')
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        userData = data.users; // 假设 JSON 结构为 { "users": [...] }
        console.log('用户数据加载成功:', userData); // 调试用
    })
    .catch(error => {
        console.error('加载用户数据失败:', error);
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.textContent = '无法加载用户数据，请稍后再试';
        }
    });

// 前端模拟哈希函数（使用 SHA-256）
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// 生成简单的前端令牌（模拟 JWT）
function generateToken(username) {
    const payload = { username, exp: Date.now() + 3600000 }; // 1小时有效期
    return btoa(JSON.stringify(payload));
}

// 检查会员是否过期
function isMembershipValid(expiryDate) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDate);
    if (isNaN(expiry.getTime())) {
        console.error("无效的到期日期:", expiryDate);
        return false;
    }
    expiry.setHours(0, 0, 0, 0);

    return expiry.getTime() > currentDate.getTime();
}

// 输入清理
function sanitizeInput(input) {
    return input.replace(/[<>&;"]/g, '');
}

// 登录验证（优化异步加载）
async function login(event) {
    if (event) event.preventDefault();
    const username = sanitizeInput(document.getElementById('username').value.trim());
    const password = sanitizeInput(document.getElementById('password').value.trim());
    const errorMessage = document.getElementById('error-message') || document.getElementById('error');

    // 等待 userData 加载
    if (!userData) {
        try {
            const response = await fetch('users.json');
            if (!response.ok) throw new Error('Failed to fetch users.json');
            const data = await response.json();
            userData = data.users;
            console.log('异步加载 userData:', userData);
        } catch (error) {
            console.error('加载用户数据失败:', error);
            errorMessage.textContent = '无法加载用户数据，请稍后再试';
            return;
        }
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

    const token = generateToken(username);
    localStorage.setItem('token', token);
    console.log('登录成功，Token:', token);
    window.location.href = 'index.html';
}

// 验证令牌（前端模拟）
function verifyToken(token) {
    try {
        const payload = JSON.parse(atob(token));
        const isValid = payload.exp > Date.now();
        console.log('Token 验证:', isValid ? '有效' : '失效', payload);
        return isValid;
    } catch (error) {
        console.error('无效的 Token:', error);
        return false;
    }
}

// 退出
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// 显示查询内容（适用于单页应用）
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
    const token = localStorage.getItem('token');

    if (pathname.includes('index.html')) {
        if (!token || !verifyToken(token)) {
            window.location.href = 'login.html';
        } else {
            showQuerySection();
        }
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
