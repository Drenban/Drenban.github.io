const stripe = Stripe('pk_test_51R10bBHGvybulR0MnAjvMctJGlfng9ooJtVn2tDtMbHdfvtYc8Io7mdBhhXISRy07ChDXeXh4pwxu0xdRD2n8GN4003QwBK1I9');

async function startPayment(days, amount) {
    const email = localStorage.getItem('expiredEmail');
    if (!email) {
        document.getElementById('payment-message').textContent = '未找到过期账户';
        return;
    }

    try {
        const response = await fetch('/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                days,
                amount // 单位：美分，例如 1000 = $10
            })
        });
        const session = await response.json();

        const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
        if (error) {
            document.getElementById('payment-message').textContent = error.message;
        }
    } catch (err) {
        document.getElementById('payment-message').textContent = '支付初始化失败: ' + err.message;
    }
}

document.getElementById('month-btn').addEventListener('click', () => startPayment(30, 1000));
document.getElementById('quarter-btn').addEventListener('click', () => startPayment(90, 2500));
document.getElementById('year-btn').addEventListener('click', () => startPayment(365, 9000));
