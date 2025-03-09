const supabaseUrl = 'https://xupnsfldgnmeicumtqpp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1cG5zZmxkZ25tZWljdW10cXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1Mjc1OTUsImV4cCI6MjA1NzEwMzU5NX0.hOHdx2iFHqA6LX2T-8xP4fWuYxK3HxZtTV2zjBHD3ro';
const supabase = Supabase.createClient(supabaseUrl, supabaseKey);

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    try {
        const { user, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });
        if (error) throw error;
        alert('注册成功！请检查邮箱验证链接。');
        window.location.href = '/peekx/login.html'; // 跳转到登录页面
    } catch (error) {
        errorMessage.textContent = error.message;
    }
});
