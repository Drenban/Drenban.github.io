export function createFrame(noiseMaterial) {
    const planeGeometry = new THREE.PlaneGeometry(2, 2);
    const plane = new THREE.Mesh(planeGeometry, noiseMaterial);
    plane.position.set(0, 0, -9.9);

    const frameGeometry = new THREE.BoxGeometry(2.4, 2.4, 0.2);
    const frameMaterial = new THREE.MeshBasicMaterial({ color: 0x1e293b });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.set(0, 0, -10);

    return { plane, frame };
}
