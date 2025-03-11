import { setupCameraRenderer } from './cameraRenderer.js';
import { setupInteraction } from './interaction.js';
import { createFloor } from './floor.js';
import { createWall } from './wall.js';
import { createFrame } from './frame.js';
import { createNoiseMaterial } from './noise.js';

export function setupScene() {
    console.log('Setting up scene...');
    const frameContainer = document.querySelector('.frame-container');
    if (!frameContainer) {
        console.error('Frame container not found!');
        return;
    }

    // 只使用背景场景和渲染器
    const { bgScene, bgCamera, bgRenderer, getViewSize, onResize } = setupCameraRenderer(frameContainer);
    const { width, height, distance } = getViewSize();

    const { floor, update: updateFloor } = createFloor(width, distance, height);
    const { wall, update: updateWall } = createWall(width, height);
    bgScene.add(floor);
    bgScene.add(wall);

    const { material, updateResolution } = createNoiseMaterial(new THREE.Vector2(frameContainer.clientWidth, frameContainer.clientHeight));
    const { plane, frame } = createFrame(material);
    bgScene.add(plane); // 画框放入背景场景
    bgScene.add(frame);

    setupInteraction(bgCamera, material, bgRenderer, bgScene);

    onResize((frameSize, viewSize) => {
        updateFloor(viewSize.width, viewSize.distance, viewSize.height);
        updateWall(viewSize.width, viewSize.height);
        updateResolution(frameSize.width, frameSize.height);
    });

    const loading = document.querySelector('.loading');
    if (loading) {
        loading.classList.add('hidden');
    }

    return { bgScene, bgCamera, bgRenderer, material };
}
