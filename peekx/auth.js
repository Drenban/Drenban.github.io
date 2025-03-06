let userData = null;

// 加载特定用户的 JSON 数据
async function loadUserData(username) {
    try {
        const response = await fetch(`users/${username}.json`);
        if (!response.ok) throw new Error(`Failed to fetch users/${username}.json`);
        const data = await response.json();
        userData = data; // 直接赋值单个用户对象
        console.log('用户数据加载成功:', userData); // 调试用
        return true;
    } catch (error) {
        console.error('加载用户数据失败:', error);
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) errorMessage.textContent = '无法加载用户数据，请稍后再试';
        return false;
    }
}

// 前端哈希函数（SHA-256）
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// 生成简单的前端令牌
function generateToken(username) {
    const payload = { username, exp: Date.now() + 3600000 }; // 1小时有效期
    return btoa(JSON.stringify(payload));
}

// 检查会员是否过期
function isMembershipValid(expiryDate) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    return expiry.getTime() > currentDate.getTime() && !isNaN(expiry.getTime());
}

// 输入清理
function sanitizeInput(input) {
    return input.replace(/[<>&;"]/g, '');
}

// 登录验证函数
async function login() { // 移除 event 参数，因为不再依赖 submit
    const loginBtn = document.getElementById('login-btn');
    loginBtn.disabled = true; // 禁用按钮，防止重复点击
    
    const username = sanitizeInput(document.getElementById('username').value.trim());
    const password = sanitizeInput(document.getElementById('password').value.trim());
    const errorMessage = document.getElementById('error-message') || document.getElementById('error');

    console.log('尝试登录:', username); // 调试用

    // 加载特定用户的 JSON 数据
    const dataLoaded = await loadUserData(username);
    if (!dataLoaded || !userData) {
        errorMessage.textContent = '用户不存在或数据未加载，请检查用户名';
        loginBtn.disabled = false;
        return;
    }

    const hashedPassword = await hashPassword(password);
    if (userData.username === username && userData.password === hashedPassword) {
        if (!isMembershipValid(userData.expiry_date)) {
            errorMessage.textContent = '账户已过期，请联系管理员';
            loginBtn.disabled = false;
            return;
        }
        const token = generateToken(username);
        localStorage.setItem('token', token);
        window.location.href = 'index.html';
    } else {
        errorMessage.textContent = '用户名或密码错误';
        loginBtn.disabled = false;
    }
}

// 验证令牌
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
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// 显示查询内容
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

    // 绑定登录按钮的 click 事件
    const loginBtn = document.getElementById('login-btn');
    if (pathname.includes('login.html') && loginBtn) {
        console.log('找到 login-btn，绑定 click 事件'); // 调试用
        loginBtn.addEventListener('click', login);
    } else if (pathname.includes('login.html')) {
        console.error('未找到 login-btn'); // 调试用
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (pathname.includes('index.html') && logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});
