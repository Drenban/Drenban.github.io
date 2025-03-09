// register.js
// 使用你提供的 Supabase 配置
const supabaseUrl = 'https://xupnsfldgnmeicumtqpp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1cG5zZmxkZ25tZWljdW10cXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1Mjc1OTUsImV4cCI6MjA1NzEwMzU5NX0.hOHdx2iFHqA6LX2T-8xP4fWuYxK3HxZtTV2zjBHD3ro';
const supabase = Supabase.createClient(supabaseUrl, supabaseKey);

// 注册逻辑
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');

    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });

        console.log('注册响应:', { data, error }); // 调试输出

        if (error) {
            message.style.color = 'red';
            message.textContent = '注册失败: ' + error.message;
            console.error('注册错误:', error);
        } else {
            if (data.user) {
                message.style.color = 'green';
                message.textContent = '注册成功！用户 ID: ' + data.user.id;
                console.log('注册成功，用户数据:', data.user);
                setTimeout(() => window.location.href = '/peekx/login.html', 2000);
            } else {
                message.textContent = '注册成功，但需要邮箱验证。请检查你的邮箱。';
                console.log('注册成功，等待邮箱验证:', data);
            }
        }
    } catch (err) {
        message.style.color = 'red';
        message.textContent = '发生未知错误: ' + err.message;
        console.error('未知错误:', err);
    }
});
