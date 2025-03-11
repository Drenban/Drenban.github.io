// frame.js
// 创建画框平面和边框，使用噪声材质生成动态效果。

import * as THREE from 'three';

// 常量定义
const PLANE_SIZE = 2;
const FRAME_SIZE = 2.4;
const FRAME_DEPTH = 0.2;
const FRAME_COLOR = 0x1e293b;

// 共享几何体和材质
const planeGeo = new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE);
const frameGeo = new THREE.BoxGeometry(FRAME_SIZE, FRAME_SIZE, FRAME_DEPTH);
const frameMat = new THREE.MeshBasicMaterial({ color: FRAME_COLOR });

/**
 * 创建画框和边框对象
 * @param {THREE.ShaderMaterial} noiseMaterial - 用于画框平面的噪声材质
 * @returns {{ plane: THREE.Mesh, frame: THREE.Mesh }} - 包含画框平面和边框的网格对象
 */
export function createFrame(noiseMaterial) {
    const plane = new THREE.Mesh(planeGeo, noiseMaterial);
    plane.position.set(0, 0, -9.9);

    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0, 0, -10);

    return { plane, frame };
}
