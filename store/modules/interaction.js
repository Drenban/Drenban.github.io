// interaction.js：
// 处理鼠标交互、模式切换和动画循环。
// 接受相机和材质作为输入，更新状态。

// === 连接调用部分 ===
// 输入：前景相机、背景相机、噪声材质、前景渲染器、背景渲染器
// 输出：无（直接绑定事件和动画）
export function setupInteraction(camera, bgCamera, noiseMaterial, renderer, bgRenderer, scene, bgScene) {
    const clock = new THREE.Clock();
    let mode = 'Static';

    // === 效果部分 ===
    const frameContainer = document.querySelector('.frame-container');
    const modeToggle = document.getElementById('mode-toggle');

    // === 功能部分 ===
    // 鼠标移动（画框噪声）
    frameContainer.addEventListener('mousemove', (e) => {
        const rect = frameContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = rect.height - (e.clientY - rect.top);
        if (mouseX >= 0 && mouseX <= rect.width && mouseY >= 0 && mouseY <= rect.height) {
            noiseMaterial.uniforms.iMouse.value.set(mouseX, mouseY);
        }
    });

    // 点击干扰
    frameContainer.addEventListener('click', () => {
        noiseMaterial.uniforms.iNoiseOffset.value = Math.random() * 10.0;
        let decay = setInterval(() => {
            noiseMaterial.uniforms.iNoiseOffset.value *= 0.9;
            if (noiseMaterial.uniforms.iNoiseOffset.value < 0.1) clearInterval(decay);
        }, 50);
    });

    // 鼠标移动（背景相机）
    document.addEventListener('mousemove', (e) => {
        if (mode === 'Free Nav') {
            const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
            bgCamera.position.x = THREE.MathUtils.clamp(mouseX * 2, -1, 1);
            bgCamera.position.y = THREE.MathUtils.clamp(-mouseY * 2, -1, 1);
            bgCamera.position.z = 5 + mouseY * 0.5;
            bgCamera.lookAt(0, 0, -10);
        }
    });

    // 模式切换
    modeToggle.addEventListener('click', () => {
        mode = mode === 'Static' ? 'Free Nav' : 'Static';
        modeToggle.textContent = `切换模式 (${mode})`;
        if (mode === 'Static') {
            bgCamera.position.set(0, 0, 5);
            bgCamera.lookAt(0, 0, -10);
        }
    });

    // 动画循环
    function animate() {
        requestAnimationFrame(animate);
        console.log('Rendering frame...');
        noiseMaterial.uniforms.iTime.value = clock.getElapsedTime();
        bgRenderer.render(bgScene, bgCamera);
        renderer.render(scene, camera);
    }
    animate();
}
