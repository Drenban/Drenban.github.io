export function setupScene() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000); // 正方形宽高比 1:1
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), antialias: true });
    const frameContainer = document.querySelector('.frame-container');
    renderer.setSize(frameContainer.clientWidth, frameContainer.clientHeight);
    renderer.xr.enabled = true;

    const clock = new THREE.Clock();
    let mode = 'Static'; // 默认模式

    // Shader 材质
    const material = new THREE.ShaderMaterial({
        uniforms: {
            iTime: { value: 0 },
            iResolution: { value: new THREE.Vector2(frameContainer.clientWidth, frameContainer.clientHeight) },
            iMouse: { value: new THREE.Vector2() },
            iNoiseOffset: { value: 0.0 } // 点击干扰偏移
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
                float noise = 0.25 + fbm(vec3(uv * 12.0 + (iMouse.xy - gl_FragCoord.xy) * mouseRatio * 0.05 + iNoiseOffset, iTime * 0.18 + 0.5 * mouseRatio));
                noise *= 0.25 + snoise(vec3(uv * 4.0 + 1.5 + iNoiseOffset, iTime * 0.15));
                gl_FragColor = vec4(1.0, 1.0, 1.0, noise);
            }
        `
    });

    const geometry = new THREE.PlaneGeometry(4, 4); // 小尺寸适配画框
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);
    camera.position.z = 5;

    // 鼠标交互（限制在画框内）
    frameContainer.addEventListener('mousemove', (e) => {
        const rect = frameContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = rect.height - (e.clientY - rect.top);
        if (mouseX >= 0 && mouseX <= rect.width && mouseY >= 0 && mouseY <= rect.height) {
            material.uniforms.iMouse.value.set(mouseX, mouseY);
        }
    });

    // 点击干扰噪声
    frameContainer.addEventListener('click', () => {
        material.uniforms.iNoiseOffset.value = Math.random() * 10.0;
        setTimeout(() => {
            material.uniforms.iNoiseOffset.value *= 0.9; // 逐渐衰减
        }, 100);
    });

    // 画廊晃动（Free Nav 模式）
    document.addEventListener('mousemove', (e) => {
        if (mode === 'Free Nav') {
            const mouseX = (e.clientX / window.innerWidth - 0.5) * 2; // -1 到 1
            const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
            camera.position.x = mouseX * 0.5;
            camera.position.y = -mouseY * 0.5;
            camera.lookAt(0, 0, 0);
        }
    });

    // 模式切换
    const modeToggle = document.getElementById('mode-toggle');
    modeToggle.addEventListener('click', () => {
        mode = mode === 'Static' ? 'Free Nav' : 'Static';
        modeToggle.textContent = `切换模式 (${mode})`;
        if (mode === 'Static') {
            camera.position.set(0, 0, 5);
            camera.lookAt(0, 0, 0);
        }
    });

    // 窗口调整
    window.addEventListener('resize', () => {
        const width = frameContainer.clientWidth;
        const height = frameContainer.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        material.uniforms.iResolution.value.set(width, height);
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
