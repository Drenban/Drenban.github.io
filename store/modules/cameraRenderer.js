// cameraRenderer.js：
// 管理前景和背景的相机、渲染器，处理窗口调整。
// 输出相机和渲染器对象。

// === 连接调用部分 ===
// 输入：画框容器 DOM 元素
// 输出：前景和背景的相机、渲染器对象
export function setupCameraRenderer(frameContainer) {
    // === 效果部分 ===
    // 前景（画框）
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), antialias: true });
    renderer.setSize(frameContainer.clientWidth, frameContainer.clientHeight);
    console.log('Renderer canvas:', renderer.domElement); // 确认绑定
    renderer.xr.enabled = true;
    camera.position.z = 5;

    // 背景（画廊）
    const bgScene = new THREE.Scene();
    const bgCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const bgRenderer = new THREE.WebGLRenderer({ antialias: true });
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(bgRenderer.domElement);
    console.log('Background renderer canvas:', bgRenderer.domElement); // 确认添加
    bgRenderer.domElement.style.position = 'absolute';
    bgRenderer.domElement.style.top = '0';
    bgRenderer.domElement.style.left = '0';
    bgRenderer.domElement.style.zIndex = '0';
    bgCamera.position.z = 5;

    // === 功能部分 ===
    // 计算视野尺寸
    function getViewSize() {
        const fov = bgCamera.fov;
        const aspect = window.innerWidth / window.innerHeight;
        const distance = 15; // 相机到墙面距离
        const height = 2 * Math.tan((fov * 0.5) * (Math.PI / 180)) * distance;
        const width = height * aspect;
        return { width, height, distance };
    }

    // 窗口调整
    function onResize(callback) {
        window.addEventListener('resize', () => {
            // 背景
            bgCamera.aspect = window.innerWidth / window.innerHeight;
            bgCamera.updateProjectionMatrix();
            bgRenderer.setSize(window.innerWidth, window.innerHeight);

            // 前景
            const frameWidth = frameContainer.clientWidth;
            const frameHeight = frameContainer.clientHeight;
            camera.aspect = frameWidth / frameHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(frameWidth, frameHeight);

            callback({ width: frameWidth, height: frameHeight }, getViewSize());
        });
    }

    return { scene, camera, renderer, bgScene, bgCamera, bgRenderer, getViewSize, onResize };
}
