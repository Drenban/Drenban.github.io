export function setupVR(renderer, scene, camera, material) {
    let vrButton = document.createElement('button');
    vrButton.textContent = '进入 VR';
    vrButton.className = 'cta-button';
    document.querySelector('.hero').appendChild(vrButton);

    let controller1, controller2;

    // 检查 VR 支持
    navigator.xr.isSessionSupported('immersive-vr').then(supported => {
        if (!supported) {
            vrButton.style.display = 'none';
            return;
        }

        vrButton.onclick = () => renderer.xr.getSession() || renderer.xr.requestSession('immersive-vr');

        // 添加控制器
        controller1 = renderer.xr.getController(0);
        controller2 = renderer.xr.getController(1);
        scene.add(controller1);
        scene.add(controller2);

        controller1.addEventListener('selectstart', onSelectStart);
        controller2.addEventListener('selectstart', onSelectStart);

        function onSelectStart() {
            material.uniforms.iMouse.value.set(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
        }
    });

    renderer.xr.addEventListener('sessionstart', () => {
        console.log('VR 会话开始');
    });
}
