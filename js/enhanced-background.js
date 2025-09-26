/* ==============================================================================
   ENHANCED INTERACTIVE BACKGROUND SYSTEM
   ==============================================================================
   Full-page 3D animated background with particle systems and interactive elements
   ============================================================================== */

(() => {
  console.log("Enhanced Background System: Initializing cosmic dimensions...");

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (reduceMotion) {
    console.log("Reduced motion detected - using simplified background");
    return;
  }

  let scene, camera, renderer, particles, mouse, windowHalf;
  let particleSystem, geometricShapes, floatingOrbs;
  let mouseX = 0, mouseY = 0;
  let scrollY = 0;

  /* ==============================================================================
     INITIALIZATION
     ============================================================================== */

  const initEnhancedBackground = () => {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || !window.THREE) return;

    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
    renderer = new THREE.WebGLRenderer({ 
      canvas: canvas,
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    
    camera.position.z = 1000;
    
    windowHalf = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };

    // Initialize all systems
    createParticleSystem();
    createGeometricShapes();
    createFloatingOrbs();
    createCosmicNebula();
    
    // Event listeners
    setupEventListeners();
    
    // Start animation loop
    animate();
  };

  /* ==============================================================================
     PARTICLE SYSTEM
     ============================================================================== */

  const createParticleSystem = () => {
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);

    const colorPalette = [
      new THREE.Color(0xFFD166), // Gold
      new THREE.Color(0x00B4FF), // Blue
      new THREE.Color(0x8A2BE2), // Purple
      new THREE.Color(0xA855F7), // Light Purple
      new THREE.Color(0x2196F3)  // Light Blue
    ];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Positions - spread across a larger area
      positions[i3] = (Math.random() - 0.5) * 4000;
      positions[i3 + 1] = (Math.random() - 0.5) * 4000;
      positions[i3 + 2] = (Math.random() - 0.5) * 2000;
      
      // Colors - random from palette
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      
      // Sizes
      sizes[i] = Math.random() * 3 + 0.5;
      
      // Velocities
      velocities[i3] = (Math.random() - 0.5) * 0.5;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.5;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        mouse: { value: new THREE.Vector2() },
        scroll: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        uniform vec2 mouse;
        uniform float scroll;
        
        void main() {
          vColor = color;
          
          vec3 pos = position;
          
          // Mouse interaction
          float mouseDistance = distance(pos.xy, mouse * 100.0);
          float mouseEffect = smoothstep(200.0, 0.0, mouseDistance);
          pos.z += mouseEffect * 50.0;
          
          // Scroll parallax
          pos.y += scroll * 0.3;
          
          // Floating animation
          pos.x += sin(time * 0.001 + position.y * 0.01) * 10.0;
          pos.y += cos(time * 0.0015 + position.x * 0.01) * 8.0;
          pos.z += sin(time * 0.002 + position.x * 0.005 + position.y * 0.005) * 15.0;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z) * (1.0 + mouseEffect * 2.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        uniform float time;
        
        void main() {
          vec2 center = gl_PointCoord - 0.5;
          float dist = length(center);
          
          if (dist > 0.5) discard;
          
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          alpha *= (0.8 + 0.2 * sin(time * 0.003));
          
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending
    });

    particleSystem = new THREE.Points(geometry, material);
    particleSystem.userData = { velocities };
    scene.add(particleSystem);
  };

  /* ==============================================================================
     GEOMETRIC SHAPES
     ============================================================================== */

  const createGeometricShapes = () => {
    geometricShapes = new THREE.Group();
    
    const shapes = [
      { geometry: new THREE.TetrahedronGeometry(20, 0), color: 0xFFD166 },
      { geometry: new THREE.OctahedronGeometry(15, 0), color: 0x8A2BE2 },
      { geometry: new THREE.IcosahedronGeometry(18, 0), color: 0x00B4FF },
      { geometry: new THREE.DodecahedronGeometry(12, 0), color: 0xA855F7 }
    ];

    for (let i = 0; i < 20; i++) {
      const shapeData = shapes[Math.floor(Math.random() * shapes.length)];
      
      const material = new THREE.MeshBasicMaterial({
        color: shapeData.color,
        transparent: true,
        opacity: 0.1,
        wireframe: true
      });
      
      const mesh = new THREE.Mesh(shapeData.geometry, material);
      
      mesh.position.set(
        (Math.random() - 0.5) * 3000,
        (Math.random() - 0.5) * 3000,
        (Math.random() - 0.5) * 1000
      );
      
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      mesh.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.01,
          y: (Math.random() - 0.5) * 0.01,
          z: (Math.random() - 0.5) * 0.01
        },
        originalPosition: mesh.position.clone()
      };
      
      geometricShapes.add(mesh);
    }
    
    scene.add(geometricShapes);
  };

  /* ==============================================================================
     FLOATING ORBS
     ============================================================================== */

  const createFloatingOrbs = () => {
    floatingOrbs = new THREE.Group();
    
    for (let i = 0; i < 15; i++) {
      const geometry = new THREE.SphereGeometry(Math.random() * 30 + 10, 16, 16);
      const material = new THREE.MeshBasicMaterial({
        color: Math.random() * 0xffffff,
        transparent: true,
        opacity: 0.05,
        wireframe: false
      });
      
      const orb = new THREE.Mesh(geometry, material);
      
      orb.position.set(
        (Math.random() - 0.5) * 2500,
        (Math.random() - 0.5) * 2500,
        (Math.random() - 0.5) * 800
      );
      
      orb.userData = {
        floatSpeed: Math.random() * 0.02 + 0.01,
        floatRange: Math.random() * 100 + 50,
        originalY: orb.position.y
      };
      
      floatingOrbs.add(orb);
    }
    
    scene.add(floatingOrbs);
  };

  /* ==============================================================================
     COSMIC NEBULA
     ============================================================================== */

  const createCosmicNebula = () => {
    const nebulaGeometry = new THREE.PlaneGeometry(5000, 5000);
    const nebulaMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      },
      vertexShader: `
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        
        vec3 hash3(vec2 p) {
          vec3 q = vec3(dot(p, vec2(127.1, 311.7)),
                       dot(p, vec2(269.5, 183.3)),
                       dot(p, vec2(419.2, 371.9)));
          return fract(sin(q) * 43758.5453);
        }
        
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(dot(hash3(i + vec2(0.0, 0.0)).xy, f - vec2(0.0, 0.0)),
                        dot(hash3(i + vec2(1.0, 0.0)).xy, f - vec2(1.0, 0.0)), u.x),
                    mix(dot(hash3(i + vec2(0.0, 1.0)).xy, f - vec2(0.0, 1.0)),
                        dot(hash3(i + vec2(1.0, 1.0)).xy, f - vec2(1.0, 1.0)), u.x), u.y);
        }
        
        void main() {
          vec2 uv = gl_FragCoord.xy / resolution.xy;
          uv = uv * 2.0 - 1.0;
          uv.x *= resolution.x / resolution.y;
          
          float n = 0.0;
          n += 0.5 * noise(uv * 2.0 + time * 0.1);
          n += 0.25 * noise(uv * 4.0 + time * 0.15);
          n += 0.125 * noise(uv * 8.0 + time * 0.2);
          
          vec3 color1 = vec3(0.5, 0.2, 0.8); // Purple
          vec3 color2 = vec3(0.0, 0.7, 1.0); // Blue
          vec3 color3 = vec3(1.0, 0.8, 0.4); // Gold
          
          vec3 finalColor = mix(color1, color2, n);
          finalColor = mix(finalColor, color3, n * 0.3);
          
          float alpha = n * 0.1;
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
    
    const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
    nebula.position.z = -1000;
    scene.add(nebula);
  };

  /* ==============================================================================
     EVENT LISTENERS
     ============================================================================== */

  const setupEventListeners = () => {
    // Mouse movement
    document.addEventListener('mousemove', (event) => {
      mouseX = (event.clientX - windowHalf.x) / windowHalf.x;
      mouseY = (event.clientY - windowHalf.y) / windowHalf.y;
    });

    // Scroll tracking
    window.addEventListener('scroll', () => {
      scrollY = window.pageYOffset;
    });

    // Resize handling
    window.addEventListener('resize', () => {
      windowHalf.x = window.innerWidth / 2;
      windowHalf.y = window.innerHeight / 2;
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  };

  /* ==============================================================================
     ANIMATION LOOP
     ============================================================================== */

  const animate = () => {
    requestAnimationFrame(animate);
    
    const time = Date.now();
    
    // Update camera based on mouse and scroll
    camera.position.x += (mouseX * 100 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 100 - camera.position.y) * 0.05;
    camera.position.z = 1000 - scrollY * 0.5;
    
    // Update particle system
    if (particleSystem) {
      const material = particleSystem.material;
      material.uniforms.time.value = time;
      material.uniforms.mouse.value.set(mouseX, mouseY);
      material.uniforms.scroll.value = scrollY;
      
      // Update particle positions
      const positions = particleSystem.geometry.attributes.position.array;
      const velocities = particleSystem.userData.velocities;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i];
        positions[i + 1] += velocities[i + 1];
        positions[i + 2] += velocities[i + 2];
        
        // Boundary wrapping
        if (positions[i] > 2000) positions[i] = -2000;
        if (positions[i] < -2000) positions[i] = 2000;
        if (positions[i + 1] > 2000) positions[i + 1] = -2000;
        if (positions[i + 1] < -2000) positions[i + 1] = 2000;
      }
      
      particleSystem.geometry.attributes.position.needsUpdate = true;
    }
    
    // Update geometric shapes
    if (geometricShapes) {
      geometricShapes.children.forEach((shape) => {
        shape.rotation.x += shape.userData.rotationSpeed.x;
        shape.rotation.y += shape.userData.rotationSpeed.y;
        shape.rotation.z += shape.userData.rotationSpeed.z;
        
        // Mouse interaction
        const distance = shape.position.distanceTo(camera.position);
        const mouseInfluence = Math.max(0, 1 - distance / 1000);
        shape.position.x = shape.userData.originalPosition.x + mouseX * 50 * mouseInfluence;
        shape.position.y = shape.userData.originalPosition.y + mouseY * 50 * mouseInfluence;
      });
    }
    
    // Update floating orbs
    if (floatingOrbs) {
      floatingOrbs.children.forEach((orb) => {
        orb.position.y = orb.userData.originalY + 
          Math.sin(time * orb.userData.floatSpeed) * orb.userData.floatRange;
        orb.rotation.x += 0.005;
        orb.rotation.y += 0.003;
      });
    }
    
    // Update nebula
    const nebula = scene.children.find(child => child.material && child.material.uniforms && child.material.uniforms.time);
    if (nebula) {
      nebula.material.uniforms.time.value = time * 0.001;
    }
    
    renderer.render(scene, camera);
  };

  /* ==============================================================================
     INITIALIZATION
     ============================================================================== */

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEnhancedBackground);
  } else {
    initEnhancedBackground();
  }

})();
