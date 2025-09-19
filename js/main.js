/* MAIN.JS: The Quantum Conductor
   - Orchestrates form symphonies
   - Evolves particle nebulae with 3D depth illusions
   - Unveils revelations on scroll's whisper
   - Infuses tilt-responsive magic for 3D immersion

   Behold: Code that breathes life into the void, where particles orbit like lost souls in a digital galaxy.
*/

(() => {
  console.log("Cosmic Portfolio Awakened: Dimensions unfold...");

  /* ================== FORM HARMONIZER ================== */
  const harmonizeForms = () => {
    const form = document.getElementById("contact-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        // In a parallel universe, this whispers to the ether (e.g., EmailJS or Netlify)
        alert("Message propelled into the cosmos! (Backend awaits stellar alignment)");
        form.reset();
      });
    }
  };

  /* ================== NEBULA EVOLUTION: Enhanced Particles with Depth ================== */
  const canvas = document.getElementById("bg-canvas");
  const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: true });
  let DPR = Math.max(1, window.devicePixelRatio || 1);
  let w = 0, h = 0;
  let particles = [];
  let animationId;
  let mouse = { x: -10000, y: -10000, vx: 0, vy: 0, down: false, tiltX: 0, tiltY: 0 };

  const cosmicPalette = {
    gold: ["#FFD166", "#FFB703", "#FFCB08"],
    blue: ["#00B4FF", "#0057FF", "#0099E6"],
    purple: ["#8A2BE2", "#A855F7", "#C084FC"],
  };

  function stellarDensity(width) {
    if (width > 1600) return 140; // Dense starfields
    if (width > 1200) return 100;
    if (width > 800) return 70;
    if (width > 480) return 45;
    return 25;
  }

  function recalibrateCanvas() {
    DPR = Math.max(1, window.devicePixelRatio || 1);
    w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function quantumRandom(min, max) { return Math.random() * (max - min) + min; }

  function birthParticles() {
    particles = [];
    const count = stellarDensity(w);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: quantumRandom(0, w),
        y: quantumRandom(0, h),
        z: quantumRandom(0, 1), // Depth layer for 3D illusion
        vx: quantumRandom(-0.3, 0.3),
        vy: quantumRandom(-0.2, 0.2),
        vz: quantumRandom(-0.01, 0.01), // Z-velocity for subtle depth shift
        r: quantumRandom(0.8, 4),
        hueOffset: Math.random(),
        drift: quantumRandom(-0.05, 0.05),
        trail: [], // For comet-like trails
      });
    }
  }

  /* ================== RENDER ALCHEMY ================== */
  function conjureNebula(scrollFactor = 0) {
    // Parallax-shifting gradients, breathing with scroll
    const g = ctx.createLinearGradient(0, 0, w, h);
    const t = Math.max(0, Math.min(1, scrollFactor));
    g.addColorStop(0, `rgba(15,8,30,${0.8 - t * 0.3})`);
    g.addColorStop(0.3, `rgba(10,6,25,${0.6 - t * 0.2})`);
    g.addColorStop(0.65, `rgba(6,4,18,${0.5 - t * 0.15})`);
    g.addColorStop(1, `rgba(2,1,6,${0.9 - t * 0.1})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Radial auras: Now with depth-modulated opacity
    const depthMod = 1 - t * 0.5;
    drawRadialAura(w * 0.15 + Math.sin(t * Math.PI) * 50, h * 0.2, 40, cosmicPalette.gold[0], 0.15 * depthMod);
    drawRadialAura(w * 0.75 + Math.cos(t * Math.PI) * 30, h * 0.7, 35, cosmicPalette.blue[0], 0.1 * depthMod);
    drawRadialAura(w * 0.55, h * 0.45 + Math.sin(t * 2 * Math.PI) * 20, 45, cosmicPalette.purple[0], 0.08 * depthMod);
  }

  function drawRadialAura(cx, cy, r0, color, opacity) {
    const rg = ctx.createRadialGradient(cx, cy, r0, cx, cy, Math.max(w, h) * 0.8);
    rg.addColorStop(0, color + Math.max(0.1, opacity));
    rg.addColorStop(1, color + '00');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, w, h);
  }

  function evokeParticles(scrollFactor) {
    const maxDist = Math.max(100, Math.min(w, h) / 6);
    ctx.globalCompositeOperation = "lighter"; // Glow like distant suns

    particles.forEach((p, i) => {
      // Mouse gravity: Stronger pull with depth
      const dx = mouse.x - p.x; const dy = mouse.y - p.y;
      const d2 = dx * dx + dy * dy;
      const d = Math.sqrt(d2) || 0.001;
      if (d < 2000) {
        const force = Math.min(0.15, 2000 / (d2 + 200)) * (1 + p.z); // Depth amplifies attraction
        p.vx += (dx / d) * force * 0.08;
        p.vy += (dy / d) * force * 0.08;
        p.vz += (mouse.tiltY * 0.01) * p.z; // Tilt influences Z
      } else {
        p.vx += p.drift * 0.003;
        p.vy += Math.sin(Date.now() * 0.001 + p.hueOffset) * 0.02; // Organic sway
      }

      // Friction and boundaries: Eternal orbit
      p.vx *= 0.98; p.vy *= 0.98; p.vz *= 0.95;
      p.x += p.vx; p.y += p.vy; p.z += p.vz;
      p.z = Math.max(0, Math.min(1, p.z)); // Clamp depth

      // Wraparound: Infinite cosmos
      if (p.x < -30) p.x = w + 30; if (p.x > w + 30) p.x = -30;
      if (p.y < -30) p.y = h + 30; if (p.y > h + 30) p.y = -30;

      // Trail: Comet whispers
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 10) p.trail.shift();

      // Hue symphony: Scroll-tied iridescence
      const hue = (p.hueOffset + scrollFactor * 0.5 + p.z) % 1;
      const essence = forgeEssence(hue, p.r, p.z);
      drawStellarBody(p, essence);

      // Trail rendering: Fading echoes
      p.trail.forEach((point, j) => {
        const fade = (j / p.trail.length) * 0.3 * p.z;
        ctx.beginPath();
        ctx.arc(point.x, point.y, p.r * (1 - j / p.trail.length), 0, Math.PI * 2);
        ctx.fillStyle = essence.replace(/[\d.]+(?=\))/, (m) => (+m * fade).toFixed(2));
        ctx.fill();
      });
    });

    // Interstellar bonds: Lines that hum with proximity and depth
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist2 = dx * dx + dy * dy;
        const avgZ = (a.z + b.z) / 2;
        if (dist2 < maxDist * maxDist * avgZ) { // Depth scales connections
          const alpha = 0.1 * (1 - Math.sqrt(dist2) / (maxDist * avgZ));
          const bondColor = weaveBond(a, b, alpha);
          ctx.strokeStyle = bondColor;
          ctx.lineWidth = Math.min(2, (1 - Math.sqrt(dist2) / maxDist) * 2 * avgZ);
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }

    ctx.globalCompositeOperation = "source-over";
  }

  function drawStellarBody(p, color) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * (1 + p.z * 0.5), 0, Math.PI * 2); // Depth scales size
    ctx.fillStyle = color;
    ctx.fill();

    // Inner glow: Radial pulse
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
    glow.addColorStop(0, color.replace(/[\d.]+(?=\))/, (m) => (+m * 1.5).toFixed(2)));
    glow.addColorStop(1, color.replace(/[\d.]+(?=\))/, '0'));
    ctx.fillStyle = glow;
    ctx.fill();
  }

  function forgeEssence(hue, r, z) {
    let core;
    if (hue < 0.33) core = interpolateHex(cosmicPalette.gold[0], cosmicPalette.blue[0], hue / 0.33);
    else if (hue < 0.66) core = interpolateHex(cosmicPalette.blue[0], cosmicPalette.purple[0], (hue - 0.33) / 0.33);
    else core = interpolateHex(cosmicPalette.purple[0], cosmicPalette.gold[1], (hue - 0.66) / 0.34);
    const alpha = Math.min(1, 0.4 + r * 0.1 + z * 0.2);
    return hexToRgba(core, alpha);
  }

  function weaveBond(a, b, alpha) {
    const ca = hexToRgb(forgeEssence(a.hueOffset + a.z, a.r, a.z).replace(/rgba?\(/, '').replace(/\)/, '').split(',').map(Number));
    const cb = hexToRgb(forgeEssence(b.hueOffset + b.z, b.r, b.z).replace(/rgba?\(/, '').replace(/\)/, '').split(',').map(Number));
    const r = Math.round((ca.r + cb.r) / 2), g = Math.round((ca.g + cb.g) / 2), bl = Math.round((ca.b + cb.b) / 2);
    return `rgba(${r},${g},${bl},${Math.min(0.3, alpha * (a.z + b.z))})`;
  }

  // Hex alchemy utilities
  function interpolateHex(a, b, t) {
    const ax = hexToRgb(a), bx = hexToRgb(b);
    return rgbToHex(
      Math.round(ax.r + (bx.r - ax.r) * t),
      Math.round(ax.g + (bx.g - ax.g) * t),
      Math.round(ax.b + (bx.b - ax.b) * t)
    );
  }

  function hexToRgb(hex) {
    const c = hex.startsWith('#') ? hex.slice(1) : hex;
    return {
      r: parseInt(c.slice(0, 2), 16),
      g: parseInt(c.slice(2, 4), 16),
      b: parseInt(c.slice(4, 6), 16),
    };
  }

  function rgbToHex(r, g, b) {
    return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
  }

  function hexToRgba(hex, a) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r},${g},${b},${a})`;
  }

  /* ================== TEMPORAL LOOP: Frame's Eternal Dance ================== */
  let lastEpoch = 0;
  function epoch(ts) {
    const delta = Math.min(50, ts - (lastEpoch || ts));
    lastEpoch = ts;
    ctx.clearRect(0, 0, w, h);

    const ascent = window.scrollY || document.documentElement.scrollTop;
    const realmHeight = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const scrollNexus = Math.min(1, ascent / realmHeight);

    conjureNebula(scrollNexus);
    evokeParticles(scrollNexus);

    animationId = window.requestAnimationFrame(epoch);
  }

  /* ================== SENSORY ORACLE: Events that Echo ================== */
  const attuneSenses = () => {
    // Mouse constellation
    document.addEventListener("mousemove", (e) => {
      const { clientX: x, clientY: y } = e;
      const centerX = w / 2, centerY = h / 2;
      mouse.x = x; mouse.y = y;
      mouse.tiltX = (x - centerX) / centerX * 10; // Parallax tilt
      mouse.tiltY = (y - centerY) / centerY * 10;
    });

    // Touch in the void
    document.addEventListener("touchmove", (e) => {
      const touch = e.touches[0];
      if (touch) {
        mouse.x = touch.clientX; mouse.y = touch.clientY;
        const centerX = w / 2, centerY = h / 2;
        mouse.tiltX = (touch.clientX - centerX) / centerX * 10;
        mouse.tiltY = (touch.clientY - centerY) / centerY * 10;
      }
    }, { passive: true });

    // Gestures of intent
    document.addEventListener("pointerdown", () => { mouse.down = true; });
    document.addEventListener("pointerup", () => { mouse.down = false; });

    // Realm resize: Adapt or perish
    window.addEventListener("resize", () => {
      recalibrateCanvas();
      birthParticles();
    });
  };

  /* ================== REVELATION OBSERVER: Unveil on Ascent ================== */
  const awakenRevelations = () => {
    const sentinel = new IntersectionObserver((visions) => {
      visions.forEach((vision) => {
        if (vision.isIntersecting) {
          const el = vision.target;
          el.classList.add("in-view");
          const delay = el.dataset.delay || 0;
          setTimeout(() => {
            el.style.transitionDelay = `${delay}ms`;
          }, 50);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll(".reveal").forEach((el) => sentinel.observe(el));

    // Hero prelude: Staggered dawn
    document.querySelectorAll("#hero .reveal").forEach((el, i) => {
      const preludeDelay = 200 + i * 150;
      el.dataset.delay = preludeDelay;
      setTimeout(() => el.classList.add("in-view"), preludeDelay);
    });
  };

  /* ================== 3D TILT HARMONIZER ================== */
  const infuseTilt = () => {
    const tiltElements = document.querySelectorAll(".3d-tilt, .3d-hover, .3d-card, .3d-input, .3d-flip");
    tiltElements.forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const tiltX = (y / rect.height) * 15;
        const tiltY = -(x / rect.width) * 15;
        el.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(20px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "rotateX(0) rotateY(0) translateZ(0)";
      });
    });
  };

  /* ================== GENESIS: Ignite the Stars ================== */
  const igniteCosmos = () => {
    recalibrateCanvas();
    birthParticles();
    if (animationId) cancelAnimationFrame(animationId);
    lastEpoch = performance.now();
    animationId = requestAnimationFrame(epoch);
    harmonizeForms();
    awakenRevelations();
    infuseTilt();
  };

  // Await the dawn or seize the moment
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(() => {
      igniteCosmos();
      attuneSenses();
    }, 100);
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      igniteCosmos();
      attuneSenses();
    });
  }

})();