// register.js
if (typeof supabase === 'undefined') {
    console.error('supabase 未定义，请检查 CDN 加载');
    document.getElementById('error-message').textContent = 'Supabase 未加载，请刷新页面或检查网络';
} else {
    const supabaseUrl = 'https://xupnsfldgnmeicumtqpp.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1cG5zZmxkZ25tZWljdW10cXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1Mjc1OTUsImV4cCI6MjA1NzEwMzU5NX0.hOHdx2iFHqA6LX2T-8xP4fWuYxK3HxZtTV2zjBHD3ro';
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey); // 使用 supabaseClient

    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const message = document.getElementById('error-message');

        try {
            const { data, error } = await supabaseClient.auth.signUp({ // 使用 supabaseClient
                email: email,
                password: password
            });
            console.log('注册响应:', { data, error });
            if (error) {
                message.style.color = 'red';
                message.textContent = '注册失败: ' + error.message;
            } else {
                message.style.color = 'green';
                message.textContent = data.user ? 
                    '注册成功！用户 ID: ' + data.user.id : 
                    '注册成功，请检查邮箱验证！';
                setTimeout(() => window.location.href = '/peekx/login.html', 2000);
            }
        } catch (err) {
            message.style.color = 'red';
            message.textContent = '错误: ' + err.message;
            console.error('错误:', err);
        }
    });
}

// login.js
if (typeof supabase === 'undefined') {
    console.error('supabase 未定义，请检查 CDN 加载');
    document.getElementById('error-message').textContent = 'Supabase 未加载，请刷新页面或检查网络';
} else {
    const supabaseUrl = 'https://xupnsfldgnmeicumtqpp.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1cG5zZmxkZ25tZWljdW10cXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1Mjc1OTUsImV4cCI6MjA1NzEwMzU5NX0.hOHdx2iFHqA6LX2T-8xP4fWuYxK3HxZtTV2zjBHD3ro';
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const message = document.getElementById('error-message');

        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });
            console.log('登录响应:', { data, error });
            if (error) {
                message.style.color = 'red';
                message.textContent = '登录失败: ' + error.message;
            } else {
                message.style.color = 'green';
                message.textContent = '登录成功！欢迎回来，用户 ID: ' + data.user.id;
                // 存储会话（可选）
                localStorage.setItem('session', JSON.stringify(data.session));
                // 跳转到主页或仪表板
                setTimeout(() => window.location.href = '/peekx/dashboard.html', 2000);
            }
        } catch (err) {
            message.style.color = 'red';
            message.textContent = '错误: ' + err.message;
            console.error('错误:', err);
        }
    });
}
