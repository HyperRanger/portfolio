/* ==============================================================================
   3D PORTFOLIO FEATURES
   ==============================================================================
   Advanced 3D interactions, skill constellation, playground demos
   ============================================================================== */

(() => {
  console.log("3D Features Loading: Entering the dimensional matrix...");

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==============================================================================
     3D SKILLS CONSTELLATION
     ============================================================================== */
  
  const initSkillsConstellation = () => {
    // Use the wrapper container for the 3D scene. The original markup contains a <canvas id="skills-canvas"> inside
    // a wrapper with id `skills-3d-container`. Target the wrapper to ensure we append the Three renderer correctly.
    const container = document.getElementById('skills-3d-container') || document.getElementById('skills-canvas');
    if (!container) return;

    // Show fallback if THREE.js not available or reduced motion
    if (reduceMotion || !window.THREE) {
      showSkillsFallback();
      return;
    }

    const skills = [
      { name: 'JavaScript', position: [0, 0, 0], connections: ['TypeScript', 'React', 'HTML'], color: 0xF7DF1E, category: 'frontend' },
      { name: 'TypeScript', position: [3, 1, -1], connections: ['JavaScript', 'React'], color: 0x3178C6, category: 'frontend' },
      { name: 'Python', position: [-3, 0, 1], connections: ['MongoDB', 'Unity'], color: 0x3776AB, category: 'backend' },
      { name: 'React', position: [1, -2, 0], connections: ['JavaScript', 'TypeScript', 'JSX'], color: 0x61DAFB, category: 'frontend' },
      { name: 'HTML', position: [-1, 2, -1], connections: ['CSS', 'JavaScript'], color: 0xE34F26, category: 'frontend' },
      { name: 'CSS', position: [-2, -1, 1], connections: ['HTML'], color: 0x1572B6, category: 'frontend' },
      { name: 'Unity', position: [0, 3, 0], connections: ['C#', 'C++', 'Python'], color: 0x222C37, category: 'gamedev' },
      { name: 'C++', position: [3, 0, 1], connections: ['Unity', 'Java'], color: 0x00599C, category: 'systems' },
      { name: 'MongoDB', position: [-3, -1, 0], connections: ['Python', 'SQL'], color: 0x47A248, category: 'database' },
      { name: 'JSX', position: [2, 1, 1], connections: ['React'], color: 0x61DAFB, category: 'frontend' },
      { name: 'Java', position: [1, -1, 2], connections: ['C++', 'Kotlin'], color: 0xED8B00, category: 'backend' },
      { name: 'Kotlin', position: [-1, 0, 2], connections: ['Java'], color: 0x7F52FF, category: 'mobile' },
      { name: 'Dart', position: [0, -2, -1], connections: ['Flutter'], color: 0x0175C2, category: 'mobile' },
      { name: 'SQL', position: [-2, 2, 0], connections: ['MongoDB'], color: 0x336791, category: 'database' },
      { name: 'C#', position: [1, 2, -1], connections: ['Unity'], color: 0x239120, category: 'gamedev' }
    ];

    // Scene setup with enhanced settings
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    });
    
  renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // If the container already has an inner <canvas> (from markup or fallback), hide it so our WebGL canvas can occupy the area.
  const existingCanvas = container.querySelector && container.querySelector('canvas');
  if (existingCanvas) existingCanvas.style.display = 'none';
  container.appendChild(renderer.domElement);
    
    // Add ambient lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);
    
    // Add point lights for dramatic effect
    const pointLight1 = new THREE.PointLight(0x8A2BE2, 1, 100);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x00B4FF, 0.8, 100);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

  // Texture loader for skill icons
  const loader = new THREE.TextureLoader();

  // Create skill nodes
    const skillNodes = [];
    const skillConnections = [];

    skills.forEach((skill, index) => {
      // Create enhanced sphere for skill with better materials
      const geometry = new THREE.SphereGeometry(0.3, 32, 32);
      const material = new THREE.MeshPhongMaterial({ 
        color: skill.color,
        transparent: true,
        opacity: 0.9,
        shininess: 100,
        specular: 0x222222,
        emissive: skill.color,
        emissiveIntensity: 0.1
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(...skill.position);
      sphere.userData = { 
        skill, 
        index, 
        originalPosition: sphere.position.clone(),
        bouncing: true,
        bounceIntensity: 1.0,
        bounceSpeed: 1.2
      };
      sphere.castShadow = true;
      sphere.receiveShadow = true;
      
      // Enhanced glow effect with multiple layers
      const glowGroup = new THREE.Group();
      
      // Inner glow
      const innerGlowGeometry = new THREE.SphereGeometry(0.4, 16, 16);
      const innerGlowMaterial = new THREE.MeshBasicMaterial({
        color: skill.color,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
      });
      const innerGlow = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
      
      // Outer glow
      const outerGlowGeometry = new THREE.SphereGeometry(0.6, 16, 16);
      const outerGlowMaterial = new THREE.MeshBasicMaterial({
        color: skill.color,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending
      });
      const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
      
      glowGroup.add(innerGlow);
      glowGroup.add(outerGlow);
      glowGroup.position.copy(sphere.position);
      
      // Particle ring around each skill
      // Try to load an SVG icon for the skill from assets/icons/<name>.svg.
      // Fallback will be the canvas-generated label already in place.
      const normalizeName = (str) => str.toLowerCase().replace(/\+/g, 'plus').replace(/#/g, 'sharp').replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g,'');
      const iconPath = `assets/icons/${normalizeName(skill.name)}.svg`;

      let iconTexture = loader.load(iconPath, (tex) => {
        tex.encoding = THREE.sRGBEncoding;
        tex.needsUpdate = true;
      }, undefined, () => {
        // onError - texture load failed. We'll rely on the canvas label texture already created below.
      });

      // Create an icon sprite (larger, more visible)
      const iconMaterial = new THREE.SpriteMaterial({ map: iconTexture, transparent: true, opacity: 1 });
      const iconSprite = new THREE.Sprite(iconMaterial);
      iconSprite.position.set(skill.position[0], skill.position[1] + 0.2, skill.position[2]);
      iconSprite.scale.set(0.9, 0.9, 1);

      scene.add(sphere);
      scene.add(glowGroup);
      scene.add(iconSprite);
      // store node and sprite; we'll use `pulse` to implement chain reactions
      skillNodes.push({ sphere, glow: glowGroup, skill, iconSprite, pulse: 0 });

      // Create icon-like label using a canvas texture (emoji / initials + name)
      const createLabelTexture = (skill) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 160;

        // Background rounded rect for contrast
        ctx.fillStyle = 'rgba(10,10,12,0.6)';
        const radius = 18;
        const w = canvas.width, h = canvas.height;
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(w - radius, 0);
        ctx.quadraticCurveTo(w, 0, w, radius);
        ctx.lineTo(w, h - radius);
        ctx.quadraticCurveTo(w, h, w - radius, h);
        ctx.lineTo(radius, h);
        ctx.quadraticCurveTo(0, h, 0, h - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.fill();

        // Emoji / initial mapping to simulate icons
        const emojiMap = {
          'JavaScript': 'JS',
          'TypeScript': 'TS',
          'Python': '🐍',
          'React': '⚛️',
          'HTML': '</>',
          'CSS': 'CSS',
          'Unity': 'U',
          'C++': 'C++',
          'MongoDB': 'DB',
          'JSX': 'JSX',
          'Java': '☕',
          'Kotlin': 'K',
          'Dart': 'D',
          'SQL': 'DB',
          'C#': 'C#'
        };

        const icon = emojiMap[skill.name] || skill.name.slice(0, 2).toUpperCase();

        // Draw icon circle
        const circleX = 80, circleY = 80, circleR = 44;
        ctx.beginPath();
        ctx.arc(circleX, circleY, circleR, 0, Math.PI * 2);
        ctx.fillStyle = skill.color || '#888888';
        ctx.fill();

        // Icon text (emoji or initials)
        ctx.font = 'bold 44px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(icon, circleX, circleY + 2);

        // Skill name to the right
        ctx.font = '700 28px Inter, Arial';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(skill.name, 140, 85);

        // Subtle stroke for readability
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.strokeText(skill.name, 140, 85);

        return new THREE.CanvasTexture(canvas);
      };

      const texture = createLabelTexture(skill);
  // Add the textual label as a subtle sprite beneath/next to the icon (kept for accessibility)
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.95 });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.position.set(skill.position[0], skill.position[1] + 0.9, skill.position[2]);
  sprite.scale.set(1.8, 0.6, 1);
  scene.add(sprite);
    });

    // Create enhanced connections with animated flow
    skills.forEach((skill, index) => {
      skill.connections.forEach(connectionName => {
        const connectedSkill = skills.find(s => s.name === connectionName);
        if (connectedSkill) {
          const connection = createAnimatedConnection(skill, connectedSkill);
          scene.add(connection.line);
          scene.add(connection.flow);
          skillConnections.push(connection);
        }
      });
    });
    
    // (Ring particle system removed — replaced by icon sprites for clearer visuals)
    
    // Helper function to create animated connections
    function createAnimatedConnection(skill1, skill2) {
      const points = [
        new THREE.Vector3(...skill1.position),
        new THREE.Vector3(...skill2.position)
      ];
      
      // Main connection line
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ 
        color: 0x8A2BE2, 
        transparent: true, 
        opacity: 0.4,
        linewidth: 2
      });
      const line = new THREE.Line(geometry, material);
      
      // Flowing particle effect
      const flowGeometry = new THREE.SphereGeometry(0.05, 8, 8);
      const flowMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFD166,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      });
      const flow = new THREE.Mesh(flowGeometry, flowMaterial);
      flow.userData = { 
        startPos: new THREE.Vector3(...skill1.position),
        endPos: new THREE.Vector3(...skill2.position),
        progress: 0,
        speed: 0.01 + Math.random() * 0.02
      };
      
      return { line, flow, skill1, skill2 };
    }

    camera.position.set(0, 0, 5);

    // Mouse interaction
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    let hoveredSkill = null;

    const onMouseMove = (event) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(skillNodes.map(n => n.sphere));

      if (intersects.length > 0) {
        const skill = intersects[0].object.userData.skill;
        if (hoveredSkill !== skill) {
          hoveredSkill = skill;
          updateSkillInfo(skill);
          /* connections highlighting disabled */
        }
      } else if (hoveredSkill) {
        hoveredSkill = null;
        resetSkillInfo();
        /* connections reset disabled */
      }
    };

    const updateSkillInfo = (skill) => {
      const skillNameEl = document.getElementById('skill-name');
      const skillDescEl = document.getElementById('skill-description');
      const connectionsDiv = document.getElementById('skill-connections');
      
      if (skillNameEl) skillNameEl.textContent = skill.name;
      if (skillDescEl) skillDescEl.textContent = getSkillDescription(skill.name);
      
      if (connectionsDiv) {
        connectionsDiv.innerHTML = '';
        skill.connections.forEach(conn => {
          const tag = document.createElement('span');
          tag.className = 'connection-tag';
          tag.textContent = conn;
          connectionsDiv.appendChild(tag);
        });
      }
      
      // Make all skills bounce when hovering over one
      skillNodes.forEach((node, index) => {
        const bounceIntensity = 1.0;
        const bounceSpeed = node.skill === skill ? 3.0 : 1.5;
        
        // Add bouncing animation
        node.sphere.userData.bouncing = true;
        node.sphere.userData.bounceIntensity = bounceIntensity;
        node.sphere.userData.bounceSpeed = bounceSpeed;
        
        // Highlight connected skills
        if (skill.connections.includes(node.skill.name) || node.skill.connections.includes(skill.name)) {
          node.sphere.material.emissiveIntensity = 0.3;
          node.glow.children.forEach(glowMesh => {
            glowMesh.material.opacity *= 2;
          });
        }
      });
    };

    const resetSkillInfo = () => {
      const skillNameEl = document.getElementById('skill-name');
      const skillDescEl = document.getElementById('skill-description');
      const connectionsDiv = document.getElementById('skill-connections');
      
      if (skillNameEl) skillNameEl.textContent = 'Hover over a skill';
      if (skillDescEl) skillDescEl.textContent = 'Discover the connections in my tech universe';
      if (connectionsDiv) connectionsDiv.innerHTML = '';
      
      // Reset all skills to normal state
      skillNodes.forEach((node) => {
        node.sphere.userData.bouncing = true;
        node.sphere.userData.bounceIntensity = 1.0;
        node.sphere.userData.bounceSpeed = 1.0;
        node.sphere.material.emissiveIntensity = 0.1;
        
        // Reset glow opacity
        node.glow.children.forEach(glowMesh => {
          if (glowMesh.material.opacity > 0.3) {
            glowMesh.material.opacity = 0.3;
          }
          if (glowMesh.material.opacity > 0.1) {
            glowMesh.material.opacity = 0.1;
          }
        });
      });
    };

    const highlightConnections = (skill) => {
      skillConnections.forEach(line => {
        line.material.opacity = 0.1;
      });
      // Highlight connections for this skill
      // Implementation would check line endpoints against skill positions
    };

    const resetConnections = () => {
      skillConnections.forEach(line => {
        line.material.opacity = 0.3;
      });
    };

    const getSkillDescription = (skillName) => {
      const descriptions = {
        'JavaScript': 'The language that brings web experiences to life with dynamic interactions.',
        'TypeScript': 'JavaScript with superpowers - type safety for scalable applications.',
        'Python': 'Versatile language powering AI, data science, and backend systems.',
        'React': 'Component-based library for building modern user interfaces.',
        'HTML': 'The foundation of web structure and semantic content.',
        'CSS': 'Styling language that transforms designs into visual reality.',
        'Unity': 'Game engine for creating immersive 3D experiences.',
        'C++': 'High-performance language for system programming and game development.',
        'MongoDB': 'NoSQL database for flexible, scalable data storage.',
        'JSX': 'JavaScript syntax extension for writing React components.'
      };
      return descriptions[skillName] || 'A powerful technology in my arsenal.';
    };

  // Disable hover interactions to keep simple continuous motion (if present)
  if (container && container.removeEventListener) container.removeEventListener('mousemove', onMouseMove);

    // Enhanced animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      const time = Date.now() * 0.001;
      
      // Rotate the entire constellation slowly
      scene.rotation.y += 0.001;
      scene.rotation.x = Math.sin(time * 0.3) * 0.1;
      
      // Animate skill nodes with more complex movements
      skillNodes.forEach((node, index) => {
        // Sphere rotation
        node.sphere.rotation.x += 0.01;
        node.sphere.rotation.y += 0.01;
        
        // Complex floating animation with bouncing
        const bounceIntensity = node.sphere.userData.bounceIntensity || 1.0;
        const bounceSpeed = node.sphere.userData.bounceSpeed || 1.0;
        const isBouncing = node.sphere.userData.bouncing || false;
        
        let floatOffset = Math.sin(time * 0.5 + index) * 0.2;
        let orbitOffset = {
          x: Math.cos(time * 0.2 + index) * 0.1,
          z: Math.sin(time * 0.3 + index) * 0.1
        };
        
        // Add bouncing effect when hovering
        if (isBouncing) {
          floatOffset += Math.sin(time * bounceSpeed * 3 + index) * 0.3 * bounceIntensity;
          orbitOffset.x += Math.cos(time * bounceSpeed * 2 + index) * 0.2 * bounceIntensity;
          orbitOffset.z += Math.sin(time * bounceSpeed * 2.5 + index) * 0.2 * bounceIntensity;
          
          // Add some randomness to make it more lively
          const randomBounce = Math.sin(time * 4 + index * 1.5) * 0.1 * bounceIntensity;
          floatOffset += randomBounce;
        }
        
        node.sphere.position.x = node.sphere.userData.originalPosition.x + orbitOffset.x;
        node.sphere.position.y = node.sphere.userData.originalPosition.y + floatOffset;
        node.sphere.position.z = node.sphere.userData.originalPosition.z + orbitOffset.z;
        
        // Update glow position
        node.glow.position.copy(node.sphere.position);
        node.glow.rotation.x -= 0.005;
        node.glow.rotation.y -= 0.005;
        
        // Update icon sprite position & apply pulse-driven scale/opacity for chain reaction bounce
        if (node.iconSprite) {
          node.iconSprite.position.copy(node.sphere.position);
          node.iconSprite.position.y = node.sphere.position.y + 0.2;
          // decay pulse
          node.pulse *= 0.94;

          // if pulse active, amplify bounce and icon scale
          if (node.pulse > 0.02) {
            node.sphere.userData.bounceIntensity = 1 + node.pulse * 3;
            node.sphere.userData.bounceSpeed = 1 + node.pulse * 2;
            const s = 0.9 + Math.min(2.5, 1 + node.pulse * 1.8);
            node.iconSprite.scale.setScalar(s);
            if (node.iconSprite.material) node.iconSprite.material.opacity = Math.min(1, 0.6 + node.pulse * 0.6);
          } else {
            // settle back to base
            node.sphere.userData.bounceIntensity = 1.0;
            node.sphere.userData.bounceSpeed = 1.0;
            node.iconSprite.scale.setScalar(0.9);
            if (node.iconSprite.material) node.iconSprite.material.opacity = 1;
          }
        }
      });

      // Chain reaction propagation: if a node has pulse, transfer to nearby nodes
      for (let i = 0; i < skillNodes.length; i++) {
        const a = skillNodes[i];
        if (!a || a.pulse <= 0.01) continue;
        for (let j = 0; j < skillNodes.length; j++) {
          if (i === j) continue;
          const b = skillNodes[j];
          const dx = a.sphere.position.x - b.sphere.position.x;
          const dy = a.sphere.position.y - b.sphere.position.y;
          const dz = a.sphere.position.z - b.sphere.position.z;
          const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
          const threshold = 2.2; // influence radius
          if (dist < threshold) {
            const influence = (1 - dist / threshold) * 0.4;
            b.pulse += a.pulse * influence * 0.5;
          }
        }
      }

      // Occasional random spark to keep motion alive
      if (Math.random() < 0.003) {
        const idx = Math.floor(Math.random() * skillNodes.length);
        if (skillNodes[idx]) skillNodes[idx].pulse += 0.9 + Math.random() * 0.8;
      }
      
      // Animate connection flows
      skillConnections.forEach(connection => {
        if (connection.flow) {
          connection.flow.userData.progress += connection.flow.userData.speed;
          if (connection.flow.userData.progress > 1) {
            connection.flow.userData.progress = 0;
          }
          
          // Interpolate position along the line
          connection.flow.position.lerpVectors(
            connection.flow.userData.startPos,
            connection.flow.userData.endPos,
            connection.flow.userData.progress
          );
          
          // Pulsing opacity
          connection.flow.material.opacity = 0.8 + Math.sin(time * 4) * 0.2;
        }
        
        // Animate connection line opacity
        if (connection.line) {
          connection.line.material.opacity = 0.3 + Math.sin(time + connection.line.id) * 0.1;
        }
      });
      
      // Camera gentle movement
      camera.position.x = Math.sin(time * 0.1) * 0.5;
      camera.position.y = Math.cos(time * 0.15) * 0.3;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = container.offsetWidth / container.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.offsetWidth, container.offsetHeight);
    };

    window.addEventListener('resize', handleResize);

    // Pointer interaction to trigger a pulse on click/tap (chain reaction)
    container.addEventListener && container.addEventListener('pointerdown', (ev) => {
      const rect = container.getBoundingClientRect();
      const x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const intersects = raycaster.intersectObjects(skillNodes.map(n => n.sphere));
      if (intersects.length > 0) {
        const obj = intersects[0].object;
        const node = skillNodes.find(n => n.sphere === obj);
        if (node) node.pulse += 1.6;
      }
    });
  };

  // Physics-based skills bouncing system
  const showSkillsFallback = () => {
    const container = document.getElementById('skills-canvas');
    if (!container) return;
    
    // Create physics canvas
    const physicsCanvas = document.createElement('canvas');
    physicsCanvas.width = container.offsetWidth;
    physicsCanvas.height = container.offsetHeight;
    physicsCanvas.style.width = '100%';
    physicsCanvas.style.height = '100%';
    container.appendChild(physicsCanvas);
    
    const ctx = physicsCanvas.getContext('2d');
    
    // Skill data with themed colors
    const skills = [
      { name: 'JavaScript', color: '#F7DF1E', category: 'frontend' },
      { name: 'TypeScript', color: '#3178C6', category: 'frontend' },
      { name: 'Python', color: '#3776AB', category: 'backend' },
      { name: 'React', color: '#61DAFB', category: 'frontend' },
      { name: 'HTML', color: '#E34F26', category: 'frontend' },
      { name: 'CSS', color: '#1572B6', category: 'frontend' },
      { name: 'Unity', color: '#222C37', category: 'gamedev' },
      { name: 'C++', color: '#00599C', category: 'systems' },
      { name: 'MongoDB', color: '#47A248', category: 'database' },
      { name: 'Java', color: '#ED8B00', category: 'backend' },
      { name: 'Kotlin', color: '#7F52FF', category: 'mobile' },
      { name: 'Dart', color: '#0175C2', category: 'mobile' },
      { name: 'SQL', color: '#336791', category: 'database' },
      { name: 'C#', color: '#239120', category: 'gamedev' }
    ];
    
    // Physics objects
    const skillBalls = skills.map((skill, index) => ({
      ...skill,
      x: Math.random() * (physicsCanvas.width - 80) + 40,
      y: Math.random() * (physicsCanvas.height - 80) + 40,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      radius: 25,
      mass: 1,
      id: index
    }));
    
    // Physics simulation
    const updatePhysics = () => {
      skillBalls.forEach((ball, i) => {
        // Update position
        ball.x += ball.vx;
        ball.y += ball.vy;
        
        // Wall collision
        if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= physicsCanvas.width) {
          ball.vx *= -0.8;
          ball.x = Math.max(ball.radius, Math.min(physicsCanvas.width - ball.radius, ball.x));
        }
        if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= physicsCanvas.height) {
          ball.vy *= -0.8;
          ball.y = Math.max(ball.radius, Math.min(physicsCanvas.height - ball.radius, ball.y));
        }
        
        // Ball-to-ball collision
        skillBalls.forEach((other, j) => {
          if (i !== j) {
            const dx = other.x - ball.x;
            const dy = other.y - ball.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = ball.radius + other.radius;
            
            if (distance < minDistance) {
              // Collision response
              const overlap = minDistance - distance;
              const separationX = (dx / distance) * overlap * 0.5;
              const separationY = (dy / distance) * overlap * 0.5;
              
              ball.x -= separationX;
              ball.y -= separationY;
              other.x += separationX;
              other.y += separationY;
              
              // Velocity exchange
              const normalX = dx / distance;
              const normalY = dy / distance;
              const relativeVelocityX = other.vx - ball.vx;
              const relativeVelocityY = other.vy - ball.vy;
              const speed = relativeVelocityX * normalX + relativeVelocityY * normalY;
              
              if (speed < 0) return;
              
              const impulse = 2 * speed / (ball.mass + other.mass);
              ball.vx += impulse * other.mass * normalX;
              ball.vy += impulse * other.mass * normalY;
              other.vx -= impulse * ball.mass * normalX;
              other.vy -= impulse * ball.mass * normalY;
            }
          }
        });
        
        // Friction
        ball.vx *= 0.995;
        ball.vy *= 0.995;
        
        // Add slight random movement to keep things active
        ball.vx += (Math.random() - 0.5) * 0.1;
        ball.vy += (Math.random() - 0.5) * 0.1;
      });
    };
    
    // Rendering
    const render = () => {
      ctx.clearRect(0, 0, physicsCanvas.width, physicsCanvas.height);
      
      skillBalls.forEach(ball => {
        // Draw skill ball with glow
        const gradient = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ball.radius * 2);
        gradient.addColorStop(0, ball.color + 'FF');
        gradient.addColorStop(0.7, ball.color + '80');
        gradient.addColorStop(1, ball.color + '00');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw main ball
        ctx.fillStyle = ball.color;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw skill name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ball.name, ball.x, ball.y);
      });
    };
    
    // Animation loop
    const animate = () => {
      updatePhysics();
      render();
      requestAnimationFrame(animate);
    };
    
    animate();
    
    // Handle resize
    const handleResize = () => {
      physicsCanvas.width = container.offsetWidth;
      physicsCanvas.height = container.offsetHeight;
    };
    
    window.addEventListener('resize', handleResize);
  };

  /* ==============================================================================
     INTERACTIVE PLAYGROUND DEMOS
     ============================================================================== */

  const initPlaygroundDemos = () => {
    // Particle Physics Demo
    const initParticleDemo = () => {
      const canvas = document.getElementById('particle-demo');
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      const particles = [];
      const particleCount = 50;

      class Particle {
        constructor() {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.vx = (Math.random() - 0.5) * 2;
          this.vy = (Math.random() - 0.5) * 2;
          this.radius = Math.random() * 3 + 1;
          this.color = `hsl(${Math.random() * 60 + 200}, 70%, 60%)`;
        }

        update() {
          this.x += this.vx;
          this.y += this.vy;

          // Bounce off walls
          if (this.x <= this.radius || this.x >= canvas.width - this.radius) {
            this.vx *= -0.8;
          }
          if (this.y <= this.radius || this.y >= canvas.height - this.radius) {
            this.vy *= -0.8;
          }

          // Keep in bounds
          this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
          this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
        }

        draw() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
          
          // Glow effect
          ctx.shadowBlur = 10;
          ctx.shadowColor = this.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Initialize particles
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
          particle.update();
          particle.draw();
        });

        // Draw connections
        particles.forEach((p1, i) => {
          particles.slice(i + 1).forEach(p2 => {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(138, 43, 226, ${1 - distance / 100})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          });
        });

        requestAnimationFrame(animate);
      };

      animate();
    };

    // Algorithm Visualizer Demo
    const initAlgorithmDemo = () => {
      const container = document.getElementById('algorithm-viz');
      if (!container) return;

      const barsContainer = container.querySelector('.sorting-bars');
      const arraySize = 20;
      let array = [];
      let isAnimating = false;

      const generateArray = () => {
        array = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 150) + 10);
        renderBars();
      };

      const renderBars = () => {
        barsContainer.innerHTML = '';
        array.forEach((value, index) => {
          const bar = document.createElement('div');
          bar.className = 'sorting-bar';
          bar.style.height = `${value}px`;
          bar.style.backgroundColor = `hsl(${240 + (value / 160) * 120}, 70%, 60%)`;
          barsContainer.appendChild(bar);
        });
      };

      const bubbleSort = async () => {
        if (isAnimating) return;
        isAnimating = true;

        const bars = barsContainer.children;
        
        for (let i = 0; i < array.length - 1; i++) {
          for (let j = 0; j < array.length - i - 1; j++) {
            // Highlight comparison
            bars[j].style.backgroundColor = '#ff6b6b';
            bars[j + 1].style.backgroundColor = '#ff6b6b';
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (array[j] > array[j + 1]) {
              // Swap
              [array[j], array[j + 1]] = [array[j + 1], array[j]];
              
              // Animate swap
              bars[j].style.height = `${array[j]}px`;
              bars[j + 1].style.height = `${array[j + 1]}px`;
            }
            
            // Reset colors
            bars[j].style.backgroundColor = `hsl(${240 + (array[j] / 160) * 120}, 70%, 60%)`;
            bars[j + 1].style.backgroundColor = `hsl(${240 + (array[j + 1] / 160) * 120}, 70%, 60%)`;
          }
          
          // Mark as sorted
          bars[array.length - 1 - i].style.backgroundColor = '#51cf66';
        }
        
        bars[0].style.backgroundColor = '#51cf66';
        isAnimating = false;
      };

      generateArray();

      // Add button listener
      const algorithmBtn = document.querySelector('[data-demo="algorithms"]');
      if (algorithmBtn) {
        algorithmBtn.addEventListener('click', () => {
          if (!isAnimating) {
            generateArray();
            setTimeout(bubbleSort, 500);
          }
        });
      }
    };

    // Neural Network Demo
    const initNeuralDemo = () => {
      const container = document.getElementById('neural-viz');
      if (!container) return;

      const networkContainer = container.querySelector('.neural-network-demo');
      let isTraining = false;

      const createNetwork = () => {
        networkContainer.innerHTML = '';
        
        // Create layers
        const layers = [3, 4, 2]; // Input, hidden, output
        
        layers.forEach((nodeCount, layerIndex) => {
          const layer = document.createElement('div');
          layer.className = 'neural-layer';
          
          for (let i = 0; i < nodeCount; i++) {
            const node = document.createElement('div');
            node.className = 'neural-node';
            node.textContent = Math.random().toFixed(1);
            layer.appendChild(node);
          }
          
          networkContainer.appendChild(layer);
        });
      };

      const trainNetwork = async () => {
        if (isTraining) return;
        isTraining = true;

        const nodes = networkContainer.querySelectorAll('.neural-node');
        
        for (let epoch = 0; epoch < 10; epoch++) {
          nodes.forEach(node => {
            node.style.backgroundColor = '#ff6b6b';
            setTimeout(() => {
              node.textContent = Math.random().toFixed(1);
              node.style.backgroundColor = '';
            }, Math.random() * 500);
          });
          
          await new Promise(resolve => setTimeout(resolve, 800));
        }
        
        // Final state - trained
        nodes.forEach(node => {
          node.style.backgroundColor = '#51cf66';
        });
        
        isTraining = false;
      };

      createNetwork();

      // Add button listener
      const neuralBtn = document.querySelector('[data-demo="neural"]');
      if (neuralBtn) {
        neuralBtn.addEventListener('click', trainNetwork);
      }
    };

    // Initialize all demos
    initParticleDemo();
    initAlgorithmDemo();
    initNeuralDemo();
  };

  /* ==============================================================================
     PROJECT CAROUSEL
     ============================================================================== */

  const initProjectCarousel = () => {
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    const projects = document.querySelectorAll('.project.card-3d');
    
    if (!prevBtn || !nextBtn || projects.length === 0) return;

    let currentIndex = 0;

    const updateCarousel = () => {
      projects.forEach((project, index) => {
        project.style.transform = `translateX(${(index - currentIndex) * 110}%) scale(${index === currentIndex ? 1 : 0.8})`;
        project.style.opacity = index === currentIndex ? 1 : 0.6;
        project.style.zIndex = index === currentIndex ? 10 : 1;
      });
    };

    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + projects.length) % projects.length;
      updateCarousel();
    });

    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % projects.length;
      updateCarousel();
    });

    // Auto-advance carousel
    setInterval(() => {
      currentIndex = (currentIndex + 1) % projects.length;
      updateCarousel();
    }, 5000);

    updateCarousel();
  };

  /* ==============================================================================
     INITIALIZATION
     ============================================================================== */

  const init3DFeatures = () => {
    console.log("Initializing 3D features...");
    
    if (!reduceMotion) {
      initSkillsConstellation();
      initProjectCarousel();
    }
    
    initPlaygroundDemos();
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init3DFeatures);
  } else {
    init3DFeatures();
  }

})();
