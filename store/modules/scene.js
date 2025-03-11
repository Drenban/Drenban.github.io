// scene.js：
// 集成所有模块，搭建场景并调用交互。
// 负责模块间的连接和初始化。

import { setupCameraRenderer } from './cameraRenderer.js';
import { setupInteraction } from './interaction.js';
import { createFloor } from './floor.js';
import { createWall } from './wall.js';
import { createFrame } from './frame.js';
import { createNoiseMaterial } from './noise.js';

export function setupScene() {
    // === 连接调用部分 ===
    const frameContainer = document.querySelector('.frame-container');
    const { scene, camera, renderer, bgScene, bgCamera, bgRenderer, getViewSize, onResize } = setupCameraRenderer(frameContainer);
    const { width, height, distance } = getViewSize();

    // 创建背景元素
    const { floor, update: updateFloor } = createFloor(width, distance, height);
    const { wall, update: updateWall } = createWall(width, height);
    bgScene.add(floor);
    bgScene.add(wall);

    // 创建前景元素
    const { material, updateResolution } = createNoiseMaterial(new THREE.Vector2(frameContainer.clientWidth, frameContainer.clientHeight));
    const { plane, frame } = createFrame(material);
    scene.add(plane);
    scene.add(frame);

    // 设置交互
    setupInteraction(camera, bgCamera, material, renderer, bgRenderer, scene, bgScene);

    // === 效果部分 ===
    // （效果由子模块实现，这里仅集成）

    // === 功能部分 ===
    // 窗口调整回调
    onResize((frameSize, viewSize) => {
        updateFloor(viewSize.width, viewSize.distance, viewSize.height);
        updateWall(viewSize.width, viewSize.height);
        updateResolution(frameSize.width, frameSize.height);
    });

    return { scene, camera, renderer, bgScene, bgCamera, bgRenderer, material };
}
