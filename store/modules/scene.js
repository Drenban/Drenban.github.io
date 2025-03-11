export function setupScene() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;

    const clock = new THREE.Clock();

    // Shader 材质
    const material = new THREE.ShaderMaterial({
        uniforms: {
            iTime: { value: 0 },
            iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            iMouse: { value: new THREE.Vector2() }
        },
        vertexShader: `
            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float iTime;
            uniform vec2 iResolution;
            uniform vec2 iMouse;

            float noise(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
            }

            void main() {
                vec2 uv = gl_FragCoord.xy / iResolution.xy;
                float n = noise(uv * 5.0 + iTime);
                float dist = length(uv - iMouse / iResolution.xy);
                vec3 color = vec3(n * smoothstep(0.2, 0.0, dist));
                gl_FragColor = vec4(color, 1.0);
            }
        `
    });

    const geometry = new THREE.PlaneGeometry(16, 9);
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);
    camera.position.z = 5;

    // 鼠标交互
    window.addEventListener('mousemove', (e) => {
        material.uniforms.iMouse.value.set(e.clientX, window.innerHeight - e.clientY);
    });

    // 窗口调整
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        material.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight);
    });

    // 动画循环
    function animate() {
        requestAnimationFrame(animate);
        material.uniforms.iTime.value = clock.getElapsedTime();
        renderer.render(scene, camera);
    }
    animate();

    return { scene, camera, renderer, material };
}
