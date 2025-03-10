const express = require('express');
const stripe = require('stripe')('sk_test_你的私钥'); // 从 Stripe 仪表板获取
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

const supabase = createClient(
    'https://xupnsfldgnmeicumtqpp.supabase.co',
    '你的服务角色密钥' // 从 Supabase 仪表板 > Settings > API 获取
);

// 创建支付会话
app.post('/create-checkout-session', async (req, res) => {
    const { email, days, amount } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: `${days} 天会员` },
                    unit_amount: amount,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'http://localhost:3000/success',
            cancel_url: 'http://localhost:3000/payment.html',
            metadata: { email, days } // 传递给 Webhook
        });
        res.json({ id: session.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Webhook 处理支付成功
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = 'whsec_你的Webhook密钥'; // 从 Stripe 仪表板获取

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { email, days } = session.metadata;

        // 计算新有效期
        const newExpiry = new Date();
        newExpiry.setDate(newExpiry.getDate() + parseInt(days));
        const expiryDateString = newExpiry.toISOString().split('T')[0];

        // 查询用户 ID
        const { data: user, error: userError } = await supabase
            .from('auth.users')
            .select('id')
            .eq('email', email)
            .single();

        if (userError || !user) {
            console.error('未找到用户:', userError?.message);
            return res.status(400).send('User not found');
        }

        // 更新 expiry_date
        const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
            user_metadata: { expiry_date: expiryDateString }
        });

        if (error) {
            console.error('更新失败:', error.message);
        } else {
            console.log('续费成功:', email, expiryDateString);
        }
    }

    res.status(200).json({ received: true });
});

// 成功页面（可选）
app.get('/success', (req, res) => {
    res.send('<h1>支付成功！即将跳转到登录页面...</h1><script>setTimeout(() => window.location.href = "/login.html", 2000);</script>');
});

app.listen(3000, () => console.log('Server running on port 3000'));
