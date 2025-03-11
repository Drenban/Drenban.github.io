export function showLoading(callback) {
    const loading = document.querySelector('.loading');
    const progressBar = document.querySelector('.progress-bar');
    let progress = 0;

    const interval = setInterval(() => {
        progress += 5;
        progressBar.style.width = `${progress}%`;
        loading.querySelector('p').textContent = `Now Loading (${progress}%)`;

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                loading.classList.add('hidden');
                callback();
            }, 500);
        }
    }, 100);
}
