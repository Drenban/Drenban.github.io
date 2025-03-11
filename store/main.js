import { setupScene } from './modules/scene.js';

export function init() {
    console.log('Initializing scene...');
    const loading = document.querySelector('.loading');
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.loading p');

    // 模拟加载进度（可选）
    let progress = 0;
    const fakeLoad = setInterval(() => {
        progress += 10;
        progressText.textContent = `Now Loading (${progress}%)`;
        progressBar.style.width = `${progress}%`;
        if (progress >= 100) {
            clearInterval(fakeLoad);
            loading.classList.add('hidden'); // 加载完成后隐藏
        }
    }, 100);

    setupScene(); // 初始化场景
}
