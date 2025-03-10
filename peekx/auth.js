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

    window.addEventListener('DOMContentLoaded', () => {
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

// async function loadUserData(username) {
//     try {
//         const response = await fetch(`users/${username}.json`);
//         if (response.status === 404) {
//             const errorMessage = document.getElementById('error-message');
//             if (errorMessage) errorMessage.textContent = '用户不存在';
//             return false;
//         }
//         if (!response.ok) throw new Error(`Failed to fetch users/${username}.json`);
//         const data = await response.json();
//         userData = data;
//         console.log('用户数据加载成功:', userData);
//         return true;
//     } catch (error) {
//         console.error('加载用户数据失败:', error);
//         const errorMessage = document.getElementById('error-message');
//         if (errorMessage) errorMessage.textContent = '网络错误，请稍后再试';
//         return false;
//     }
// }

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateToken(username) {
    const salt = crypto.randomUUID();
    const payload = { username, exp: Date.now() + 3600000, salt };
    localStorage.setItem('salt', salt);
    return btoa(JSON.stringify(payload));
}

function isMembershipValid(expiryDate) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    return expiry.getTime() > currentDate.getTime() && !isNaN(expiry.getTime());
}

function sanitizeInput(input) {
    return input.replace(/[<>&;"]/g, '');
}

// async function login() {
//     const loginBtn = document.getElementById('login-btn');
//     loginBtn.disabled = true;
    
//     const username = sanitizeInput(document.getElementById('username').value.trim());
//     const password = sanitizeInput(document.getElementById('password').value.trim());
//     const errorMessage = document.getElementById('error-message') || document.getElementById('error');

//     console.log('尝试登录:', username);

//     const dataLoaded = await loadUserData(username);
//     if (!dataLoaded || !userData) {
//         loginBtn.disabled = false;
//         return;
//     }

//     const hashedPassword = await hashPassword(password);
//     if (userData.username === username && userData.password === hashedPassword) {
//         if (!isMembershipValid(userData.expiry_date)) {
//             errorMessage.textContent = '账户已过期，请联系管理员';
//             loginBtn.disabled = false;
//             return;
//         }
//         const token = generateToken(username);
//         localStorage.setItem('token', token);
//         window.location.href = 'index.html';
//     } else {
//         errorMessage.textContent = '用户名或密码错误';
//         loginBtn.disabled = false;
//     }
// }

// auth.js

// 独立的数据加载函数
async function loadUserData(username) {
    try {
        const response = await fetch(`users/${username}.json`);
        if (response.status === 404) {
            console.warn(`用户 ${username} 不存在`);
            return false;
        }
        if (!response.ok) throw new Error(`Failed to fetch users/${username}.json`);
        const data = await response.json();
        console.log('用户数据加载成功:', data);
        return data;
    } catch (error) {
        console.error('加载用户数据失败:', error);
        return false;
    }
}

// 登录函数
async function login() {
    const loginBtn = document.getElementById('login-btn');
    const errorMessage = document.getElementById('error-message');
    loginBtn.disabled = true;
    errorMessage.textContent = '';

    const username = sanitizeInput(document.getElementById('username').value.trim());
    const password = sanitizeInput(document.getElementById('password').value.trim());

    let supabaseFailed = false;
    if (typeof supabase !== 'undefined') {
        const supabaseUrl = 'https://xupnsfldgnmeicumtqpp.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1cG5zZmxkZ25tZWljdW10cXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1Mjc1OTUsImV4cCI6MjA1NzEwMzU5NX0.hOHdx2iFHqA6LX2T-8xP4fWuYxK3HxZtTV2zjBHD3ro';
        const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: username,
                password: password
            });

            if (!error) {
                errorMessage.style.color = 'green';
                errorMessage.textContent = '登录成功（Supabase）！欢迎回来';
                localStorage.setItem('session', JSON.stringify(data.session));
                localStorage.setItem('token', data.session.access_token);
                setTimeout(() => window.location.href = '/peekx/index.html', 2000);
                return;
            } else {
                console.warn('Supabase 登录失败:', error.message);
                supabaseFailed = true;
            }
        } catch (err) {
            console.error('Supabase 登录错误:', err);
            supabaseFailed = true;
        }
    }

    const userData = await loadUserData(username);
    if (!userData) {
        errorMessage.textContent = '用户不存在或网络错误';
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
        errorMessage.style.color = 'green';
        errorMessage.textContent = '登录成功（JSON）！欢迎回来';
        setTimeout(() => window.location.href = '/peekx/index.html', 2000);
    } else {
        errorMessage.textContent = supabaseFailed ? '用户名或密码错误' : 'Supabase 登录失败，请检查凭据';
        loginBtn.disabled = false;
    }
}

// 绑定登录按钮事件
// document.getElementById('login-btn').addEventListener('click', async () => {
//     await login();
// });

// function verifyToken(token) {
//     if (!token) {
//         localStorage.removeItem('token');
//         localStorage.removeItem('salt');
//         console.warn('Token 不存在，已清除');
//         return false;
//     }
//     try {
//         const payload = JSON.parse(atob(token));
//         const storedSalt = localStorage.getItem('salt');
//         if (!payload.exp || payload.salt !== storedSalt) {
//             localStorage.removeItem('token');
//             localStorage.removeItem('salt');
//             console.warn('Token 校验失败（过期或盐值不匹配），已清除');
//             return false;
//         }
//         if (payload.exp < Date.now()) {
//             localStorage.removeItem('token');
//             localStorage.removeItem('salt');
//             console.info('Token 已过期，已清除');
//             return false;
//         }
//         return true;
//     } catch (error) {
//         console.error('Token 验证失败:', error);
//         localStorage.removeItem('token');
//         localStorage.removeItem('salt');
//         return false;
//     }
// }

function verifyToken(token) {
    if (!token) {
        localStorage.removeItem('token');
        localStorage.removeItem('salt');
        console.warn('Token 不存在，已清除');
        return false;
    }
    try {
        let payload;
        if (token.includes('.')) {
            const [, payloadBase64] = token.split('.');
            payload = JSON.parse(atob(payloadBase64));
            payload.exp = payload.exp * 1000;
        } else {
            payload = JSON.parse(atob(token));
        }

        if (!payload.exp) {
            localStorage.removeItem('token');
            localStorage.removeItem('salt');
            console.warn('Token 无有效到期时间，已清除');
            return false;
        }

        if (payload.exp < Date.now()) {
            localStorage.removeItem('token');
            localStorage.removeItem('salt');
            console.info('Token 已过期，已清除');
            return false;
        }

        if (!token.includes('.')) {
            const storedSalt = localStorage.getItem('salt');
            if (!payload.salt || payload.salt !== storedSalt) {
                localStorage.removeItem('token');
                localStorage.removeItem('salt');
                console.warn('Token 校验失败（盐值不匹配），已清除');
                return false;
            }
        }

        return true;
    } catch (error) {
        console.error('Token 验证失败:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('salt');
        return false;
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

function showQuerySection() {
    const loginSection = document.getElementById('login-section');
    const querySection = document.getElementById('query-section');
    if (loginSection && querySection) {
        loginSection.style.display = 'none';
        querySection.style.display = 'block';
    }
}

// document.addEventListener('DOMContentLoaded', () => {
//     const pathname = window.location.pathname;
//     const urlParams = new URLSearchParams(window.location.search);
//     const hasRandomParam = urlParams.has('r');
//     const token = localStorage.getItem('token');

//     const isIndexPage = pathname === '/peekx/' || pathname.endsWith('/peekx/index.html') || hasRandomParam;

//     if (isIndexPage) {
//         if (!token || !verifyToken(token)) {
//             window.location.href = 'login.html';
//         } else {
//             showQuerySection();
//         }
//     }

//     const loginBtn = document.getElementById('login-btn');
//     if (pathname.includes('login.html') && loginBtn) {
//         console.log('找到 login-btn，绑定 click 事件');
//         loginBtn.addEventListener('click', login);
//     } else if (pathname.includes('login.html')) {
//         console.error('未找到 login-btn');
//     }

//     const logoutBtn = document.getElementById('logout-btn');
//     if (isIndexPage && logoutBtn) {
//         logoutBtn.addEventListener('click', logout);
//     }
// });

document.addEventListener('DOMContentLoaded', () => {
    const pathname = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const hasRandomParam = urlParams.has('r');
    const token = localStorage.getItem('token');

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
        loginBtn.addEventListener('click', login);
    } else if (pathname.includes('login.html')) {
        console.error('未找到 login-btn');
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (isIndexPage && logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});
