// wall.js：
// 创建和更新墙面几何体。
// 接受视野参数，返回墙面对象。

// === 连接调用部分 ===
// 输入：视野宽度、高度
// 输出：墙面对象
export function createWall(width, height) {
    // === 效果部分 ===
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const wall = new THREE.Mesh(geometry, material);
    wall.position.z = -10;

    // === 功能部分 ===
    function update(width, height) {
        wall.geometry.dispose();
        wall.geometry = new THREE.PlaneGeometry(width, height);
    }

    return { wall, update };
}
