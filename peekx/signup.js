// 检查 Supabase 是否通过 CDN 加载
if (typeof supabase === 'undefined') {
    console.error('supabase 未定义，请检查 CDN 加载');
    document.getElementById('error-message').textContent = 'Supabase 未加载，请刷新页面或检查网络';
} else {
    const supabaseUrl = 'https://xupnsfldgnmeicumtqpp.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1cG5zZmxkZ25tZWljdW10cXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1Mjc1OTUsImV4cCI6MjA1NzEwMzU5NX0.hOHdx2iFHqA6LX2T-8xP4fWuYxK3HxZtTV2zjBHD3ro';
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

    async function signUp(email, password, messageElement) {
        // 计算 7 天后的日期
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);
        const expiryDateString = expiryDate.toISOString().split('T')[0]; // 格式: YYYY-MM-DD

        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        expiry_date: expiryDateString // 添加 7 天有效期
                    }
                }
            });
            console.log('注册响应:', { data, error });

            if (error) {
                messageElement.style.color = 'red';
                messageElement.textContent = '注册失败: ' + error.message;
            } else {
                messageElement.style.color = 'green';
                messageElement.textContent = data.user
                    ? `注册成功！用户 ID: ${data.user.id}，7 天有效期已设置: ${expiryDateString}`
                    : `注册成功，请检查邮箱验证！7 天有效期已设置: ${expiryDateString}`;
                setTimeout(() => window.location.href = '/peekx/login.html', 2000);
            }
        } catch (err) {
            messageElement.style.color = 'red';
            messageElement.textContent = '注册错误: ' + err.message;
            console.error('注册错误:', err);
        }
    }

    // 表单提交事件
    document.getElementById('register-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const message = document.getElementById('error-message');

        await signUp(email, password, message);
    });

    // 按钮点击事件（兼容 signup.js 的用法）
    document.getElementById('signup-btn')?.addEventListener('click', async () => {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const message = document.getElementById('error-message');

        await signUp(email, password, message);
    });
}
