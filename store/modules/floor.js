// floor.js：
// 创建和更新地板几何体。
// 接受视野参数，返回地板对象。

// === 连接调用部分 ===
// 输入：视野宽度、深度、高度
// 输出：地板对象
export function createFloor(width, depth, height) {
    // === 效果部分 ===
    const geometry = new THREE.PlaneGeometry(width, depth);
    const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -height / 2;
    floor.position.z = -depth / 2;

    // === 功能部分 ===
    function update(width, depth, height) {
        floor.geometry.dispose();
        floor.geometry = new THREE.PlaneGeometry(width, depth);
        floor.position.y = -height / 2;
        floor.position.z = -depth / 2;
    }

    return { floor, update };
}
