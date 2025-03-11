// frame.js：
// 创建画框和边框。
// 接受噪声材质，返回画框对象。

// === 连接调用部分 ===
// 输入：噪声材质
// 输出：画框和边框对象
export function createFrame(noiseMaterial) {
    // === 效果部分 ===
    const planeGeometry = new THREE.PlaneGeometry(2, 2);
    const plane = new THREE.Mesh(planeGeometry, noiseMaterial);
    plane.position.set(0, 0, -9.9);

    const frameGeometry = new THREE.BoxGeometry(2.4, 2.4, 0.2);
    const frameMaterial = new THREE.MeshBasicMaterial({ color: 0x1e293b });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.set(0, 0, -10);

    // === 功能部分 ===
    // 无需动态更新，画框大小固定

    return { plane, frame };
}
