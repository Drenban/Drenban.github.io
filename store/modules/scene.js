export function setupScene() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000); // 正方形画框视角
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), antialias: true });
    const frameContainer = document.querySelector('.frame-container');
    renderer.setSize(frameContainer.clientWidth, frameContainer.clientHeight); // 画框大小 200x200
    renderer.xr.enabled = true;

    const clock = new THREE.Clock();
    let mode = 'Static';

    // === 3D 画廊环境（背景场景） ===
    const bgScene = new THREE.Scene();
    const bgCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const bgRenderer = new THREE.WebGLRenderer({ antialias: true });
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(bgRenderer.domElement); // 背景画布
    bgRenderer.domElement.style.position = 'absolute';
    bgRenderer.domElement.style.top = '0';
    bgRenderer.domElement.style.left = '0';
    bgRenderer.domElement.style.zIndex = '0';

    // 墙面：增加深度 (z = -10) 和高度 (20)
    const wallGeometry = new THREE.PlaneGeometry(20, 20); // 高度从 10 增加到 20
    const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x172a45 }); // 颜色改为黑色
    const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    backWall.position.z = -10; // 景深从 -5 增加到 -10
    bgScene.add(backWall);

    // 地板：匹配墙面深度
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x0a192f }); // 颜色改为黑色
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -10; // 高度从 -5 增加到 -10，与墙面对齐
    floor.position.z = -5; // 地板中心调整
    bgScene.add(floor);

    bgCamera.position.z = 5; // 相机初始位置保持

    // === Shader 画框（前景场景） ===
    const material = new THREE.ShaderMaterial({
        uniforms: {
            iTime: { value: 0 },
            iResolution: { value: new THREE.Vector2(frameContainer.clientWidth, frameContainer.clientHeight) },
            iMouse: { value: new THREE.Vector2() },
            iNoiseOffset: { value: 0.0 }
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
            uniform float iNoiseOffset;

            vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

            float snoise(vec3 v) { 
                const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
                const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
                vec3 i = floor(v + dot(v, C.yyy));
                vec3 x0 = v - i + dot(i, C.xxx);
                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min(g.xyz, l.zxy);
                vec3 i2 = max(g.xyz, l.zxy);
                vec3 x1 = x0 - i1 + 1.0 * C.xxx;
                vec3 x2 = x0 - i2 + 2.0 * C.xxx;
                vec3 x3 = x0 - 1. + 3.0 * C.xxx;
                i = mod(i, 289.0); 
                vec4 p = permute(permute(permute(
                            i.z + vec4(0.0, i1.z, i2.z, 1.0))
                        + i.y + vec4(0.0, i1.y, i2.y, 1.0)) 
                        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
                float n_ = 1.0 / 7.0;
                vec3 ns = n_ * D.wyz - D.xzx;
                vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_);
                vec4 x = x_ * ns.x + ns.yyyy;
                vec4 y = y_ * ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y);
                vec4 b0 = vec4(x.xy, y.xy);
                vec4 b1 = vec4(x.zw, y.zw);
                vec4 s0 = floor(b0) * 2.0 + 1.0;
                vec4 s1 = floor(b1) * 2.0 + 1.0;
                vec4 sh = -step(h, vec4(0.0));
                vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
                vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
                vec3 p0 = vec3(a0.xy, h.x);
                vec3 p1 = vec3(a0.zw, h.y);
                vec3 p2 = vec3(a1.xy, h.z);
                vec3 p3 = vec3(a1.zw, h.w);
                vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
                p0 *= norm.x;
                p1 *= norm.y;
                p2 *= norm.z;
                p3 *= norm.w;
                vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
                m = m * m;
                return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
            }

            float fbm(vec3 p) {
                float f = 0.0;
                f += 0.5000 * snoise(p); p = p * 2.02;
                f += 0.2500 * snoise(p); p = p * 2.03;
                f += 0.1250 * snoise(p); p = p * 2.01;
                f += 0.0625 * snoise(p);
                return f / 0.9375;
            }

            void main() {
                vec2 uv = gl_FragCoord.xy / iResolution.xy;
                float mouseRatio = smoothstep(100.0, 0.0, length(iMouse.xy - gl_FragCoord.xy));
                float baseNoise = fbm(vec3(uv * 20.0 + iNoiseOffset, iTime * 0.8));
                float waveNoise = snoise(vec3(uv * 15.0 + (iMouse.xy - gl_FragCoord.xy) * mouseRatio * 0.1 + iNoiseOffset, iTime * 0.5));
                float peak = sin(uv.y * 10.0 + iTime * 2.0 + waveNoise) * 0.5;
                float noise = 0.5 + baseNoise * 1.0 + waveNoise * 0.8 + peak;
                noise = clamp(noise, 0.0, 1.0);
                gl_FragColor = vec4(vec3(noise), 1.0);
            }
        `
    });

    // 画框贴在墙面上
    const geometry = new THREE.PlaneGeometry(2, 2);
    const plane = new THREE.Mesh(geometry, material);
    plane.position.set(0, 0, -9.9); // 贴近墙面 (z = -10)
    scene.add(plane);

    const frameGeometry = new THREE.BoxGeometry(2.4, 2.4, 0.2);
    const frameMaterial = new THREE.MeshBasicMaterial({ color: 0x1e293b });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.set(0, 0, -10); // 边框紧贴墙面
    scene.add(frame);

    camera.position.z = 5;

    // === 交互逻辑 ===
    frameContainer.addEventListener('mousemove', (e) => {
        const rect = frameContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = rect.height - (e.clientY - rect.top);
        if (mouseX >= 0 && mouseX <= rect.width && mouseY >= 0 && mouseY <= rect.height) {
            material.uniforms.iMouse.value.set(mouseX, mouseY);
        }
    });

    frameContainer.addEventListener('click', () => {
        material.uniforms.iNoiseOffset.value = Math.random() * 10.0;
        let decay = setInterval(() => {
            material.uniforms.iNoiseOffset.value *= 0.9;
            if (material.uniforms.iNoiseOffset.value < 0.1) clearInterval(decay);
        }, 50);
    });

    document.addEventListener('mousemove', (e) => {
        if (mode === 'Free Nav') {
            const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
            bgCamera.position.x = THREE.MathUtils.clamp(mouseX * 2, -1, 1);
            bgCamera.position.y = THREE.MathUtils.clamp(-mouseY * 2, -1, 1);
            bgCamera.position.z = 5 + mouseY * 0.5;
            bgCamera.lookAt(0, 0, -10); // 注视墙面
        }
    });

    const modeToggle = document.getElementById('mode-toggle');
    modeToggle.addEventListener('click', () => {
        mode = mode === 'Static' ? 'Free Nav' : 'Static';
        modeToggle.textContent = `切换模式 (${mode})`;
        if (mode === 'Static') {
            bgCamera.position.set(0, 0, 5);
            bgCamera.lookAt(0, 0, -10); // 注视墙面
        }
    });

    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        bgCamera.aspect = width / height;
        bgCamera.updateProjectionMatrix();
        bgRenderer.setSize(width, height);

        const frameWidth = frameContainer.clientWidth;
        const frameHeight = frameContainer.clientHeight;
        camera.aspect = frameWidth / frameHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(frameWidth, frameHeight);
        material.uniforms.iResolution.value.set(frameWidth, frameHeight);
    });

    // === 动画循环 ===
    function animate() {
        requestAnimationFrame(animate);
        material.uniforms.iTime.value = clock.getElapsedTime();
        bgRenderer.render(bgScene, bgCamera); // 渲染 3D 背景
        renderer.render(scene, camera); // 渲染画框
    }
    animate();

    return { scene, camera, renderer, material };
}
