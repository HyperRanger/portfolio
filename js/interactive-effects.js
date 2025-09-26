/* ==============================================================================
   INTERACTIVE EFFECTS & MOUSE INTERACTIONS
   ==============================================================================
   Mouse trail, parallax effects, and interactive background elements
   ============================================================================== */

(() => {
  console.log("Interactive Effects: Initializing cosmic interactions...");

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (reduceMotion) {
    console.log("Reduced motion detected - using simplified interactions");
    return;
  }

  let mouseX = 0, mouseY = 0;
  let scrollY = 0;
  let mouseTrail = [];
  const maxTrailLength = 20;

  /* ==============================================================================
     MOUSE TRACKING & TRAIL EFFECT
     ============================================================================== */

  const initMouseEffects = () => {
    const cosmicOverlay = document.querySelector('.cosmic-overlay');
    const mouseTrailElement = document.querySelector('.mouse-trail');
    const parallaxLayers = document.querySelectorAll('.parallax-layer');

    // Mouse movement tracking
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      const mouseXPercent = (mouseX / window.innerWidth) * 100;
      const mouseYPercent = (mouseY / window.innerHeight) * 100;

      // Update cosmic overlay position
      if (cosmicOverlay) {
        cosmicOverlay.style.setProperty('--mouse-x', `${mouseXPercent}%`);
        cosmicOverlay.style.setProperty('--mouse-y', `${mouseYPercent}%`);
      }

      // Update mouse trail
      updateMouseTrail(mouseX, mouseY);

      // Parallax effect for layers
      parallaxLayers.forEach((layer, index) => {
        const speed = (index + 1) * 0.5;
        const xOffset = (mouseX - window.innerWidth / 2) * speed * 0.01;
        const yOffset = (mouseY - window.innerHeight / 2) * speed * 0.01;
        layer.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
      });
    });

    // Mouse trail effect function
    const updateMouseTrail = (x, y) => {
      if (!mouseTrailElement) return;

      mouseTrail.push({ x, y, opacity: 1, size: 20 });
      
      if (mouseTrail.length > maxTrailLength) {
        mouseTrail.shift();
      }

      // Update trail positions
      mouseTrail.forEach((point, index) => {
        point.opacity *= 0.95;
        point.size *= 0.98;
      });

      // Position the main trail element
      mouseTrailElement.style.left = `${x - 10}px`;
      mouseTrailElement.style.top = `${y - 10}px`;
      mouseTrailElement.style.opacity = '0.8';
    };

    // Hide mouse trail when mouse leaves window
    document.addEventListener('mouseleave', () => {
      if (mouseTrailElement) {
        mouseTrailElement.style.opacity = '0';
      }
    });

    document.addEventListener('mouseenter', () => {
      if (mouseTrailElement) {
        mouseTrailElement.style.opacity = '0.8';
      }
    });
  };

  /* ==============================================================================
     SCROLL PARALLAX EFFECTS
     ============================================================================== */

  const initScrollEffects = () => {
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    const floatingShapes = document.querySelectorAll('.floating-shape');

    window.addEventListener('scroll', () => {
      scrollY = window.pageYOffset;
      const scrollPercent = scrollY / (document.body.scrollHeight - window.innerHeight);

      // Parallax layers movement based on scroll
      parallaxLayers.forEach((layer, index) => {
        const speed = (index + 1) * 0.3;
        const yOffset = scrollY * speed;
        const currentTransform = layer.style.transform || '';
        const translateMatch = currentTransform.match(/translate\(([^)]+)\)/);
        
        if (translateMatch) {
          const [xOffset] = translateMatch[1].split(',');
          layer.style.transform = `translate(${xOffset}, ${yOffset}px)`;
        } else {
          layer.style.transform = `translateY(${yOffset}px)`;
        }
      });

      // Floating shapes rotation based on scroll
      floatingShapes.forEach((shape, index) => {
        const rotationSpeed = (index + 1) * 0.5;
        const rotation = scrollPercent * 360 * rotationSpeed;
        const currentTransform = shape.style.transform || '';
        const baseTransform = currentTransform.replace(/rotate\([^)]*\)/g, '');
        shape.style.transform = `${baseTransform} rotate(${rotation}deg)`;
      });
    });
  };

  /* ==============================================================================
     SECTION HOVER EFFECTS
     ============================================================================== */

  const initSectionEffects = () => {
    const sections = document.querySelectorAll('section');

    sections.forEach(section => {
      section.addEventListener('mouseenter', () => {
        section.style.setProperty('--section-glow', '1');
      });

      section.addEventListener('mouseleave', () => {
        section.style.setProperty('--section-glow', '0');
      });
    });
  };

  /* ==============================================================================
     INTERACTIVE CARD TILT EFFECTS
     ============================================================================== */

  const initCardTiltEffects = () => {
    const tiltElements = document.querySelectorAll('.card, .hero-card, .project');

    tiltElements.forEach(element => {
      element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        
        const rotateX = (deltaY / rect.height) * -10;
        const rotateY = (deltaX / rect.width) * 10;
        
        element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
      });

      element.addEventListener('mouseleave', () => {
        element.style.transform = '';
      });
    });
  };

  /* ==============================================================================
     ENHANCED BUTTON INTERACTIONS
     ============================================================================== */

  const initButtonEffects = () => {
    const buttons = document.querySelectorAll('.btn, .link-pill, .social-link');

    buttons.forEach(button => {
      button.addEventListener('mouseenter', (e) => {
        const ripple = document.createElement('div');
        ripple.classList.add('ripple-effect');
        
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
          border-radius: 50%;
          transform: scale(0);
          animation: ripple-animation 0.6s ease-out;
          pointer-events: none;
          z-index: 1;
        `;
        
        button.style.position = 'relative';
        button.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });

    // Add ripple animation CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ripple-animation {
        to {
          transform: scale(2);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  };

  /* ==============================================================================
     SKILL PILL INTERACTIONS
     ============================================================================== */

  const initSkillPillEffects = () => {
    const skillPills = document.querySelectorAll('.skill-pill');

    skillPills.forEach(pill => {
      pill.addEventListener('mouseenter', () => {
        // Create floating particles around the pill
        createFloatingParticles(pill);
      });
    });

    const createFloatingParticles = (element) => {
      const rect = element.getBoundingClientRect();
      const particleCount = 6;

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
          position: fixed;
          width: 4px;
          height: 4px;
          background: var(--gold-1);
          border-radius: 50%;
          pointer-events: none;
          z-index: 1000;
          left: ${rect.left + rect.width / 2}px;
          top: ${rect.top + rect.height / 2}px;
        `;

        document.body.appendChild(particle);

        const angle = (i / particleCount) * Math.PI * 2;
        const distance = 50 + Math.random() * 30;
        const duration = 800 + Math.random() * 400;

        particle.animate([
          {
            transform: 'translate(0, 0) scale(1)',
            opacity: 1
          },
          {
            transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`,
            opacity: 0
          }
        ], {
          duration: duration,
          easing: 'ease-out'
        }).onfinish = () => {
          particle.remove();
        };
      }
    };
  };

  /* ==============================================================================
     PERFORMANCE OPTIMIZATION
     ============================================================================== */

  const optimizePerformance = () => {
    // Throttle scroll events
    let scrollTimeout;
    const originalScrollHandler = window.onscroll;
    
    window.addEventListener('scroll', () => {
      if (scrollTimeout) return;
      
      scrollTimeout = setTimeout(() => {
        scrollTimeout = null;
      }, 16); // ~60fps
    });

    // Reduce effects on low-end devices
    const isLowEndDevice = navigator.hardwareConcurrency <= 4 || 
                          navigator.deviceMemory <= 4 ||
                          /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isLowEndDevice) {
      document.documentElement.style.setProperty('--animation-duration', '0.2s');
      document.querySelectorAll('.parallax-layer').forEach(layer => {
        layer.style.display = 'none';
      });
    }
  };

  /* ==============================================================================
     INITIALIZATION
     ============================================================================== */

  const initInteractiveEffects = () => {
    console.log("Initializing interactive effects...");
    
    initMouseEffects();
    initScrollEffects();
    initSectionEffects();
    initCardTiltEffects();
    initButtonEffects();
    initSkillPillEffects();
    optimizePerformance();
    
    console.log("Interactive effects initialized successfully!");
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInteractiveEffects);
  } else {
    initInteractiveEffects();
  }

})();
