import { setupScene } from './modules/scene.js';
import { setupVR } from './modules/vr.js';
import { showLoading } from './modules/utils.js';

export function init() {
    // 加载动画
    showLoading(() => {
        // 初始化 3D 场景和 VR
        const { scene, camera, renderer, material } = setupScene();
        setupVR(renderer, scene, camera, material);
    });
}
