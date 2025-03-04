let userData = null;

// 加载用户 XLSX 数据
fetch('xlsx-data/users.xlsx')
    .then(response => response.arrayBuffer())
    .then(data => {
        const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
        userData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    })
    .catch(error => {
        document.getElementById('error-message').textContent = '无法加载用户数据';
    });

// 登录验证
function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    if (!userData) {
        document.getElementById('error-message').textContent = '用户数据未加载，请稍后重试';
        return;
    }
    const user = userData.find(u => u.username === username && u.password === password);
    if (user) {
        localStorage.setItem('userLoggedIn', 'true');
        window.location.href = 'index.html';
    } else {
        document.getElementById('error-message').textContent = '用户名或密码错误';
    }
}

// 退出
function logout() {
    localStorage.removeItem('userLoggedIn');
    window.location.href = 'login.html';
}

// 检查登录状态
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('index.html') && localStorage.getItem('userLoggedIn') !== 'true') {
        window.location.href = 'login.html';
    }
    if (window.location.pathname.includes('login.html')) {
        document.getElementById('login-btn').addEventListener('click', login);
    }
    if (window.location.pathname.includes('index.html')) {
        document.getElementById('logout-btn').addEventListener('click', logout);
    }
});
