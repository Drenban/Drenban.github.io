import { setupScene } from './modules/scene.js';

export function init() {
    console.log('Initializing scene...');
    const loading = document.querySelector('.loading');
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.loading p');

    // 模拟加载（可选）
    let progress = 0;
    const fakeLoad = setInterval(() => {
        progress += 20;
        progressText.textContent = `Now Loading (${progress}%)`;
        progressBar.style.width = `${progress}%`;
        if (progress >= 100) {
            clearInterval(fakeLoad);
            setupScene();
            loading.classList.add('hidden');
        }
    }, 200);
}
