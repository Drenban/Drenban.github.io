export function setupInteraction(bgCamera, noiseMaterial, bgRenderer, bgScene) {
    const clock = new THREE.Clock();
    let mode = 'Static';

    const frameContainer = document.querySelector('.frame-container');
    const modeToggle = document.getElementById('mode-toggle');

    // 获取画框对象
    const plane = bgScene.children.find(child => child.geometry instanceof THREE.PlaneGeometry);
    const frame = bgScene.children.find(child => child.geometry instanceof THREE.BoxGeometry);

    frameContainer.addEventListener('mousemove', (e) => {
        const rect = frameContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = rect.height - (e.clientY - rect.top);
        if (mouseX >= 0 && mouseX <= rect.width && mouseY >= 0 && mouseY <= rect.height) {
            noiseMaterial.uniforms.iMouse.value.set(mouseX, mouseY);
        }
    });

    frameContainer.addEventListener('click', () => {
        noiseMaterial.uniforms.iNoiseOffset.value = Math.random() * 10.0;
        let decay = setInterval(() => {
            noiseMaterial.uniforms.iNoiseOffset.value *= 0.9;
            if (noiseMaterial.uniforms.iNoiseOffset.value < 0.1) clearInterval(decay);
        }, 50);
    });

    document.addEventListener('mousemove', (e) => {
        if (mode === 'Free Nav') {
            const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
            bgCamera.position.x = THREE.MathUtils.clamp(mouseX * 2, -1, 1);
            bgCamera.position.y = THREE.MathUtils.clamp(-mouseY * 2, -1, 1);
            bgCamera.position.z = 5 + mouseY * 0.5;
            bgCamera.lookAt(0, 0, -10);
            plane.position.set(bgCamera.position.x, bgCamera.position.y, -9.9);
            frame.position.set(bgCamera.position.x, bgCamera.position.y, -10);
            console.log('Camera:', bgCamera.position, 'Frame:', plane.position);
        }
    });

    modeToggle.addEventListener('click', () => {
        mode = mode === 'Static' ? 'Free Nav' : 'Static';
        modeToggle.textContent = `切换模式 (${mode})`;
        if (mode === 'Static') {
            bgCamera.position.set(0, 0, 5);
            bgCamera.lookAt(0, 0, -10);
            // 重置画框位置
            plane.position.set(0, 0, -9.9);
            frame.position.set(0, 0, -10);
        }
    });

    function animate() {
        requestAnimationFrame(animate);
        console.log('Rendering frame...', bgScene.children.length);
        noiseMaterial.uniforms.iTime.value = clock.getElapsedTime();
        bgRenderer.render(bgScene, bgCamera);
    }
    animate();
}
