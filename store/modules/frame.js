// frame.js
// 创建画框和画布对象
// 输入：噪声材质、可选配置
// 输出：包含画布和平面边框的对象

import * as THREE from 'three';

/**
 * 创建一个带边框的画布
 * @param {THREE.Material} noiseMaterial - 用于画布的材质
 * @param {Object} options - 配置参数
 * @param {number} options.planeSize - 画布尺寸（默认 2）
 * @param {number} options.frameSize - 边框尺寸（默认 2.4）
 * @param {number} options.frameDepth - 边框厚度（默认 0.2）
 * @param {THREE.Color | number | string} options.frameColor - 边框颜色（默认深灰蓝 #1e293b）
 * @param {number} options.planeZ - 画布 Z 坐标（默认 -9.9）
 * @param {number} options.frameZ - 边框 Z 坐标（默认 -10）
 * @returns {Object} { plane, frame }
 */
export function createFrame(noiseMaterial, options = {}) {
  const {
    planeSize = 2,
    frameSize = 2.4,
    frameDepth = 0.2,
    frameColor = 0x1e293b,
    planeZ = -9.9,
    frameZ = -10,
  } = options;

  // 画布
  const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
  const plane = new THREE.Mesh(planeGeometry, noiseMaterial);
  plane.position.set(0, 0, planeZ);

  // 边框
  const frameGeometry = new THREE.BoxGeometry(frameSize, frameSize, frameDepth);
  const frameMaterial = new THREE.MeshBasicMaterial({ color: frameColor });
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);
  frame.position.set(0, 0, frameZ);

  return { plane, frame };
}
