let userData = null;

(function() {
    function generateRandomString(length) {
        const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    window.addEventListener('DOMContentLoaded', () => { // 延迟到DOM加载完成
        const currentUrl = window.location.href;
        const basePath = '/peekx/';
        const targetUrl = window.location.origin + basePath;

        const urlParams = new URLSearchParams(window.location.search);
        const currentRandom = urlParams.get('r');
        const isBasePath = currentUrl === targetUrl || currentUrl.endsWith('/peekx/index.html');
        const isRandomPath = currentRandom !== null;

        if (isBasePath || isRandomPath) {
            const randomSlug = generateRandomString(6);
            const newPath = basePath + '?r=' + randomSlug;
            window.history.replaceState({}, document.title, newPath);
        }
    });
})();

// 加载特定用户的 JSON 数据
async function loadUserData(username) {
    try {
        const response = await fetch(`users/${username}.json`);
        if (response.status === 404) {
            const errorMessage = document.getElementById('error-message');
            if (errorMessage) errorMessage.textContent = '用户不存在';
            return false;
        }
        if (!response.ok) throw new Error(`Failed to fetch users/${username}.json`);
        const data = await response.json();
        userData = data;
        console.log('用户数据加载成功:', userData);
        return true;
    } catch (error) {
        console.error('加载用户数据失败:', error);
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) errorMessage.textContent = '网络错误，请稍后再试';
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
    const salt = crypto.randomUUID();
    const payload = { username, exp: Date.now() + 3600000, salt };
    localStorage.setItem('salt', salt);
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
async function login() {
    const loginBtn = document.getElementById('login-btn');
    loginBtn.disabled = true;
    
    const username = sanitizeInput(document.getElementById('username').value.trim());
    const password = sanitizeInput(document.getElementById('password').value.trim());
    const errorMessage = document.getElementById('error-message') || document.getElementById('error');

    console.log('尝试登录:', username);

    const dataLoaded = await loadUserData(username);
    if (!dataLoaded || !userData) {
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
    if (!token) {
        localStorage.removeItem('token');
        localStorage.removeItem('salt');
        console.warn('Token 不存在，已清除');
        return false;
    }
    try {
        const payload = JSON.parse(atob(token));
        const storedSalt = localStorage.getItem('salt');
        if (!payload.exp || payload.salt !== storedSalt) {
            localStorage.removeItem('token');
            localStorage.removeItem('salt');
            console.warn('Token 校验失败（过期或盐值不匹配），已清除');
            return false;
        }
        if (payload.exp < Date.now()) {
            localStorage.removeItem('token');
            localStorage.removeItem('salt');
            console.info('Token 已过期，已清除');
            return false;
        }
        return true;
    } catch (error) {
        console.error('Token 验证失败:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('salt');
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
    const urlParams = new URLSearchParams(window.location.search);
    const hasRandomParam = urlParams.has('r');
    const token = localStorage.getItem('token');

    // 修改路径检查，支持伪装URL
    const isIndexPage = pathname === '/peekx/' || pathname.endsWith('/peekx/index.html') || hasRandomParam;

    if (isIndexPage) {
        if (!token || !verifyToken(token)) {
            window.location.href = 'login.html';
        } else {
            showQuerySection();
        }
    }

    const loginBtn = document.getElementById('login-btn');
    if (pathname.includes('login.html') && loginBtn) {
        console.log('找到 login-btn，绑定 click 事件');
        loginBtn.addEventListener('click', login);
    } else if (pathname.includes('login.html')) {
        console.error('未找到 login-btn');
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (isIndexPage && logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});
