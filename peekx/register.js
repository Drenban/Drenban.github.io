// register.js
const supabaseUrl = 'https://xupnsfldgnmeicumtqpp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1cG5zZmxkZ25tZWljdW10cXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1Mjc1OTUsImV4cCI6MjA1NzEwMzU5NX0.hOHdx2iFHqA6LX2T-8xP4fWuYxK3HxZtTV2zjBHD3ro';
const supabase = Supabase.createClient(supabaseUrl, supabaseKey); // 确保是 Supabase

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
