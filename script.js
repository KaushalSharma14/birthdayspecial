/* ===== BIRTHDAY SURPRISE - KHUSHI 21 ===== */
(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => el.querySelectorAll(sel);

  // ---------- Custom Cursor ----------
  const cursor = $('.custom-cursor');
  const trail = $('.cursor-trail');
  const isTouch = 'ontouchstart' in window;

  if (!isTouch && cursor && trail) {
    cursor.textContent = '🎂';
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
      gsap.to(trail, { left: e.clientX + 'px', top: e.clientY + 'px', duration: 0.2, overwrite: true });
    });
  }

  // ---------- Asset paths (try same folder as index.html: music/, voice/, images/) ----------
  const PATHS = {
    music: ['public/music/birthday.mp3', 'music/birthday.mp3'],
    voice: ['public/message.mp3', 'public/voice/message.mp3', 'voice/message.MP3', 'voice/message.mp3'],
    imageBase: ['images/', 'public/images/']
  };
  const placeholderSvg = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect fill="%231a0a2a" width="400" height="300"/><text x="50%" y="50%" fill="%23ff69b4" font-size="48" text-anchor="middle" dy=".3em" font-family="sans-serif">💖</text></svg>');

  function setAudioSources() {
    const bg = $('#bgMusic');
    const voice = $('#voiceMessage');
    if (bg) {
      const first = bg.querySelector('source');
      if (first) first.src = PATHS.music[0];
      bg.load();
    }
    if (voice) {
      const first = voice.querySelector('source');
      if (first) first.src = PATHS.voice[0];
      voice.load();
    }
  }
  setAudioSources();
  function tryNextMusicPath(bg, index) {
    if (!bg || index >= PATHS.music.length) return;
    const src = bg.querySelector('source');
    if (src) { src.src = PATHS.music[index]; bg.load(); }
  }
  function tryNextVoicePath(voice, index) {
    if (!voice || index >= PATHS.voice.length) return;
    const s = voice.querySelector('source');
    if (s) { s.src = PATHS.voice[index]; voice.load(); }
  }

  // ---------- Music (start on first user click – browsers block autoplay) ----------
  const bgMusic = $('#bgMusic');
  const musicToggle = $('#musicToggle');
  const musicLabel = $('.music-label', musicToggle);
  const voiceMessage = $('#voiceMessage');
  let bgWasPlayingBeforeVoice = false;
  let musicStarted = false;

  function startBgMusic() {
    if (!bgMusic || musicStarted) return;
    musicStarted = true;
    bgMusic.volume = 0.3;
    bgMusic.play().catch(() => {});
    if (musicToggle) musicToggle.classList.remove('off');
    if (musicLabel) musicLabel.textContent = 'Music ON';
  }

  // When voice message plays: pause background music. When voice ends: resume and loop.
  if (voiceMessage && bgMusic) {
    voiceMessage.addEventListener('play', () => {
      bgWasPlayingBeforeVoice = !bgMusic.paused;
      if (!bgMusic.paused) {
        (function fadeOut() {
          if (bgMusic.volume > 0.05) { bgMusic.volume -= 0.05; setTimeout(fadeOut, 50); }
          else { bgMusic.volume = 0; bgMusic.pause(); }
        })();
      }
    });
    voiceMessage.addEventListener('ended', () => {
      if (bgMusic && bgWasPlayingBeforeVoice) {
        bgMusic.volume = 0;
        bgMusic.play().catch(() => {}); // loop is set in HTML, so it will run in loop
        (function fadeIn() {
          if (bgMusic.volume < 0.3) { bgMusic.volume = Math.min(0.3, bgMusic.volume + 0.03); setTimeout(fadeIn, 80); }
        })();
      }
    });
  }

  if (musicToggle) {
    musicToggle.addEventListener('click', () => {
      startBgMusic();
      if (bgMusic.paused) {
        bgMusic.play().catch(() => {});
        musicToggle.classList.remove('off');
        if (musicLabel) musicLabel.textContent = 'Music ON';
      } else {
        bgMusic.pause();
        musicToggle.classList.add('off');
        if (musicLabel) musicLabel.textContent = 'Music OFF';
      }
    });
  }
  let bgMusicTried = 0;
  let voiceTried = 0;
  if (bgMusic) bgMusic.addEventListener('error', function onBgError() {
    bgMusicTried++;
    if (bgMusicTried < PATHS.music.length) {
      const src = bgMusic.querySelector('source');
      if (src) { src.src = PATHS.music[bgMusicTried]; bgMusic.load(); }
    }
  });
  if (voiceMessage) voiceMessage.addEventListener('error', function onVoiceError() {
    voiceTried++;
    if (voiceTried < PATHS.voice.length) {
      const s = voiceMessage.querySelector('source');
      if (s) { s.src = PATHS.voice[voiceTried]; voiceMessage.load(); }
    }
  });

  // ---------- Intro background & image fallbacks ----------
  function setIntroBg() {
    const el = $('#introBgImage');
    if (!el) return;
    const tryUrl = (url) => {
      const img = new Image();
      img.onload = () => { el.style.backgroundImage = "url('" + url + "')"; el.style.backgroundSize = 'cover'; el.style.backgroundPosition = 'center'; };
      img.onerror = () => {
        if (url === 'images/background.jpg') tryUrl('public/images/background.jpg');
      };
      img.src = url;
    };
    tryUrl('images/background.jpg');
  }
  setIntroBg();

  function initImageFallbacks() {
    $$('img').forEach((img) => {
      img.addEventListener('error', function onImgError() {
        this.style.display = 'none';
        const parent = this.closest('.slideshow-slide, .lockscreen');
        if (parent) {
          parent.style.background = 'linear-gradient(135deg, #1a0a2a 0%, #2a1a4a 100%)';
          parent.style.backgroundSize = 'cover';
          if (parent.classList.contains('lockscreen')) parent.style.backgroundImage = 'url("' + placeholderSvg + '")';
        }
      });
    });
  }
  document.addEventListener('DOMContentLoaded', initImageFallbacks);

  // ---------- Intro (BGMI) ----------
  const intro = $('#intro');
  const mainContent = $('#mainContent');
  const btnStart = $('#btnStart');
  const flashOverlay = $('#flashOverlay');
  const introUsername = $('#introUsername');

  function typewriter(el, text, speed, cb) {
    if (!el) return cb && cb();
    el.textContent = '';
    let i = 0;
    function type() {
      if (i < text.length) {
        el.textContent += text[i++];
        setTimeout(type, speed);
      } else if (cb) cb();
    }
    type();
  }

  function runIntro() {
    gsap.to($('.intro-player'), { opacity: 1, duration: 0.6 });
    gsap.to($('.intro-mission'), { opacity: 0 });
    gsap.to($('.btn-start'), { opacity: 0 });
    if (introUsername) introUsername.textContent = '';
    setTimeout(() => {
      typewriter(introUsername, 'KHUSHI_21', 120, () => {
        gsap.to($('.intro-mission'), { opacity: 1, duration: 0.6 });
        gsap.to($('.btn-start'), { opacity: 1, duration: 0.6 });
      });
    }, 1200);
  }
  runIntro();

  const lockscreen = $('#lockscreen');
  function startMission() {
    if (!btnStart || !flashOverlay || !intro) return;
    btnStart.disabled = true;
    gsap.to(flashOverlay, { opacity: 1, duration: 0.15 });
    gsap.to(flashOverlay, { opacity: 0, duration: 0.5, delay: 0.2 });
    gsap.to(intro, { opacity: 0, visibility: 'hidden', duration: 0.6, delay: 0.25 });
    setTimeout(() => {
      if (lockscreen) {
        lockscreen.classList.remove('hidden');
        gsap.fromTo(lockscreen, { opacity: 0 }, { opacity: 1, duration: 0.5 });
      } else {
        openMainContent();
      }
    }, 600);
  }
  function openMainContent() {
    if (!mainContent) return;
    startBgMusic();
    if (lockscreen) {
      gsap.to(lockscreen, { opacity: 0, transform: 'translateY(-100%)', duration: 0.6, onComplete: () => {
        lockscreen.classList.add('hidden');
      }});
    }
    mainContent.classList.remove('hidden');
    gsap.fromTo(mainContent, { opacity: 0 }, { opacity: 1, duration: 0.8 });
    initNeon();
    initBalloons();
    initScrollAnimations();
    initVoiceMessage();
    initWishSend();
    initSlideshow();
    setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
  }
  if (btnStart) btnStart.addEventListener('click', () => { startBgMusic(); startMission(); });
  if (lockscreen) {
    let touchStartY = 0;
    lockscreen.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; }, { passive: true });
    lockscreen.addEventListener('touchend', (e) => {
      const dy = touchStartY - e.changedTouches[0].clientY;
      if (dy > 50) openMainContent();
    }, { passive: true });
    lockscreen.addEventListener('click', () => openMainContent());
  }

  // ---------- Floating Balloons (fewer on mobile for smooth performance) ----------
  function initBalloons() {
    const container = $('#balloonsBg');
    if (!container) return;
    const isMobile = window.innerWidth <= 768;
    const count = isMobile ? 12 : 25;
    const colors = ['#ff69b4', '#ff1493', '#ffb6c1', '#e6b3ff', '#ffd700', '#87ceeb', '#98fb98', '#ffa07a'];
    for (let i = 0; i < count; i++) {
      const b = document.createElement('div');
      b.className = 'balloon-float';
      b.style.left = Math.random() * 100 + '%';
      b.style.background = `linear-gradient(135deg, ${colors[i % colors.length]}, ${colors[(i + 1) % colors.length]})`;
      b.style.animationDuration = (12 + Math.random() * 10) + 's';
      b.style.animationDelay = Math.random() * 5 + 's';
      b.style.boxShadow = `inset -5px -5px 15px rgba(255,255,255,0.3), 0 0 25px ${colors[i % colors.length]}80`;
      container.appendChild(b);
    }
  }

  // ---------- Voice Message Button (A Message Just For You) ----------
  function initVoiceMessage() {
    const btn = $('#btnPlayMessage');
    const statusEl = $('#voiceStatus');
    if (!btn || !voiceMessage) return;

    function setPlaying(playing) {
      const icon = btn.querySelector('.btn-play-icon');
      const text = btn.querySelector('.btn-play-text');
      if (icon) icon.textContent = playing ? '⏸' : '▶';
      if (text) text.textContent = playing ? 'Pause message' : 'Play My Message from Kaushalll';
      if (statusEl) statusEl.textContent = playing ? 'Playing...' : '';
    }

    function tryPlayVoice() {
      voiceMessage.load();
      const p = voiceMessage.play();
      if (p && p.then) {
        p.then(() => {
          setPlaying(true);
          if (statusEl) statusEl.textContent = '';
        }).catch((err) => {
          voiceTried++;
          if (voiceTried < PATHS.voice.length) {
            const s = voiceMessage.querySelector('source');
            if (s) { s.src = PATHS.voice[voiceTried]; tryPlayVoice(); return; }
          }
          setPlaying(false);
          if (statusEl) statusEl.textContent = 'Could not play. Add message.mp3 in the public folder.';
        });
      }
    }

    btn.addEventListener('click', () => {
      if (voiceMessage.paused) {
        tryPlayVoice();
      } else {
        voiceMessage.pause();
        setPlaying(false);
        if (bgMusic && bgWasPlayingBeforeVoice) bgMusic.play().catch(() => {});
      }
    });

    voiceMessage.addEventListener('ended', () => {
      setPlaying(false);
      if (statusEl) statusEl.textContent = '';
    });
  }

  // ---------- Floating Hearts (Neon section) ----------
  function createFloatingHearts(container) {
    if (!container) return;
    const hearts = ['❤️', '💕', '💖', '💗'];
    for (let i = 0; i < 18; i++) {
      const span = document.createElement('span');
      span.className = 'floating-heart';
      span.textContent = hearts[i % hearts.length];
      span.style.cssText = `
        position: absolute;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        font-size: ${14 + Math.random() * 20}px;
        opacity: ${0.2 + Math.random() * 0.4};
        animation: floatHeart ${4 + Math.random() * 4}s ease-in-out infinite;
        animation-delay: ${Math.random() * 2}s;
      `;
      container.appendChild(span);
    }
  }

  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes floatHeart {
      0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
      50% { transform: translate(10px, -20px) scale(1.1); opacity: 0.7; }
    }
  `;
  document.head.appendChild(styleSheet);

  // ---------- Neon Name ----------
  function initNeon() {
    const letters = $$('.neon-letter');
    if (letters.length) {
      gsap.fromTo(letters, { opacity: 0.3 }, { opacity: 0.3, duration: 0 });
      letters.forEach((letter, i) => {
        gsap.to(letter, { className: '+=lit', duration: 0.2, delay: 0.5 + i * 0.12 });
      });
    }
    const heartsBg = $('#heartsBg');
    createFloatingHearts(heartsBg);
  }

  // ---------- Scroll Animations (GSAP) ----------
  function initScrollAnimations() {
    gsap.utils.toArray('.section').forEach((section, i) => {
      if (section.id === 'intro') return;
      gsap.from(section, {
        scrollTrigger: { trigger: section, start: 'top 85%', toggleActions: 'play none none reverse' },
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power2.out'
      });
    });
    gsap.from('.love-card', {
      scrollTrigger: { trigger: '#lovesSection', start: 'top 80%' },
      opacity: 0,
      y: 30,
      stagger: 0.1,
      duration: 0.6
    });
    gsap.from('.gallery-item', {
      scrollTrigger: { trigger: '#gallerySection', start: 'top 80%' },
      opacity: 0,
      scale: 0.9,
      stagger: 0.08,
      duration: 0.5
    });
    gsap.to($('#glowingHeart'), {
      scrollTrigger: { trigger: '#messageSection', start: 'top 80%' },
      scale: 1.3,
      opacity: 0.8,
      duration: 1,
      yoyo: true,
      repeat: 1
    });
    gsap.to($('.jersey-number'), {
      scrollTrigger: { trigger: '#dhoniSection', start: 'top 70%' },
      opacity: 1,
      scale: 1,
      duration: 1,
      ease: 'power2.out'
    });
    // Why Khushi Is Special: each line fades in every 2 seconds
    const specialLines = $$('.special-line');
    specialLines.forEach((line) => {
      const delay = parseFloat(line.getAttribute('data-delay') || 0);
      ScrollTrigger.create({
        trigger: '#specialSection',
        start: 'top 80%',
        onEnter: () => {
          gsap.to(line, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: delay,
            ease: 'power2.out',
            onStart: () => line.classList.add('visible')
          });
        }
      });
    });
  }

  // ---------- Wish Input & Send ----------
  function initWishSend() {
    const wrap = $('#wishInputWrap');
    const input = $('#wishInput');
    const btnSend = $('#btnSendWish');
    const wishSent = $('#wishSent');
    const makeWish = $('#makeWish');
    if (!wrap || !btnSend || !wishSent) return;
    btnSend.addEventListener('click', () => {
      wrap.classList.add('hidden');
      wishSent.classList.remove('hidden');
      gsap.fromTo(wishSent, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 1, ease: 'back.out(1.2)' });
      createConfetti();
    });
  }

  // ---------- Three.js Cake ----------
  let cakeScene, cakeCamera, cakeRenderer, cakeMesh, knifeMesh, cakeCut = false;

  function initCake() {
    const canvas = $('#cakeCanvas');
    if (!canvas) return;
    const w = canvas.parentElement.offsetWidth;
    const h = canvas.parentElement.offsetHeight || 400;
    cakeScene = new THREE.Scene();
    cakeCamera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    cakeRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    cakeRenderer.setSize(w, h);
    cakeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    cakeCamera.position.set(0, 0, 8);

    const light = new THREE.DirectionalLight(0xfff5ee, 1);
    light.position.set(5, 5, 10);
    cakeScene.add(light);
    cakeScene.add(new THREE.AmbientLight(0x554444, 0.8));

    // Cake body (layered cylinders)
    const cakeGroup = new THREE.Group();
    const layers = [
      { r: 1.4, h: 0.35, y: 0 },
      { r: 1.2, h: 0.35, y: 0.35 },
      { r: 1.0, h: 0.35, y: 0.7 }
    ];
    const cream = new THREE.MeshPhongMaterial({ color: 0xfff0f5, shininess: 30 });
    const pink = new THREE.MeshPhongMaterial({ color: 0xffb6c1, shininess: 40 });
    layers.forEach((l, i) => {
      const geo = new THREE.CylinderGeometry(l.r, l.r * 1.05, l.h, 32);
      const mat = i === 0 ? pink : cream;
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = l.y + l.h / 2;
      cakeGroup.add(mesh);
    });
    cakeScene.add(cakeGroup);
    cakeMesh = cakeGroup;

    // 21 Candles (symbolic for 21st birthday)
    const candleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.35, 12);
    const candleMat = new THREE.MeshPhongMaterial({ color: 0xffe4e1 });
    const flameMat = new THREE.MeshPhongMaterial({ color: 0xffaa00, emissive: 0xff6600 });
    const topY = 1.05 + 0.35 / 2;
    for (let i = 0; i < 21; i++) {
      const angle = (i / 21) * Math.PI * 2;
      const r = 0.5 + (i % 2) * 0.25;
      const candle = new THREE.Mesh(candleGeo.clone(), candleMat);
      candle.position.set(Math.cos(angle) * r, topY, Math.sin(angle) * r);
      cakeGroup.add(candle);
      const flameGeo = new THREE.SphereGeometry(0.04, 8, 8);
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.set(Math.cos(angle) * r, topY + 0.22, Math.sin(angle) * r);
      cakeGroup.add(flame);
    }

    // Knife (invisible until cut)
    const knifeGeo = new THREE.BoxGeometry(0.08, 1.2, 0.02);
    const knifeMat = new THREE.MeshPhongMaterial({ color: 0xc0c0c0 });
    knifeMesh = new THREE.Mesh(knifeGeo, knifeMat);
    knifeMesh.position.set(1.8, 0.6, 0);
    knifeMesh.rotation.z = Math.PI / 6;
    knifeMesh.visible = false;
    cakeScene.add(knifeMesh);

    function animate() {
      if (!cakeRenderer || !cakeScene || !cakeCamera) return;
      requestAnimationFrame(animate);
      cakeRenderer.render(cakeScene, cakeCamera);
    }
    animate();
    window.addEventListener('resize', () => {
      const c = $('#cakeCanvas');
      if (!c || !c.parentElement) return;
      const w = c.parentElement.offsetWidth;
      const h = c.parentElement.offsetHeight || 400;
      cakeCamera.aspect = w / h;
      cakeCamera.updateProjectionMatrix();
      cakeRenderer.setSize(w, h);
    });
  }
  initCake();

  // ---------- Cut Cake Button ----------
  const btnCut = $('#btnCut');
  const makeWish = $('#makeWish');
  const confettiContainer = $('#confettiContainer');

  function createConfetti() {
    if (!confettiContainer) return;
    const colors = ['#ff69b4', '#ff1493', '#ffb6c1', '#ffd700', '#fff'];
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.4;
    for (let i = 0; i < 80; i++) {
      const angle = (Math.random() * 360 * Math.PI) / 180;
      const dist = 100 + Math.random() * 200;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;
      const p = document.createElement('div');
      p.style.cssText = `
        position: absolute;
        left: ${cx}px;
        top: ${cy}px;
        width: ${6 + Math.random() * 8}px;
        height: ${6 + Math.random() * 8}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 2px;
        pointer-events: none;
      `;
      confettiContainer.appendChild(p);
      gsap.to(p, {
        x: tx,
        y: ty,
        opacity: 0,
        rotation: Math.random() * 720,
        duration: 1.5,
        ease: 'power2.out',
        onComplete: () => p.remove()
      });
    }
  }

  function createBalloons() {
    if (!confettiContainer) return;
    const emojis = ['🎈', '🎈', '💕', '❤️'];
    for (let i = 0; i < 12; i++) {
      const b = document.createElement('div');
      b.style.cssText = `
        position: absolute;
        left: ${30 + Math.random() * 40}%;
        bottom: -50px;
        font-size: ${28 + Math.random() * 20}px;
        pointer-events: none;
      `;
      b.textContent = emojis[i % emojis.length];
      confettiContainer.appendChild(b);
      gsap.to(b, {
        y: -window.innerHeight - 100,
        x: (Math.random() - 0.5) * 100,
        duration: 4 + Math.random() * 2,
        ease: 'power1.in',
        onComplete: () => b.remove()
      });
    }
  }

  if (btnCut) {
    btnCut.addEventListener('click', () => {
      if (cakeCut) return;
      cakeCut = true;
      btnCut.disabled = true;
      knifeMesh.visible = true;
      knifeMesh.position.set(1.8, 0.6, 0);
      gsap.to(knifeMesh.position, { x: -1.2, duration: 1.2, ease: 'power2.inOut' });
      gsap.to(cakeMesh.rotation, { y: Math.PI / 2, duration: 1, delay: 0.5, ease: 'power2.inOut' });
      setTimeout(() => {
        createConfetti();
        createBalloons();
        makeWish.classList.remove('hidden');
        gsap.fromTo(makeWish, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.8 });
        const wrap = $('#wishInputWrap');
        if (wrap) {
          setTimeout(() => {
            wrap.classList.remove('hidden');
            gsap.fromTo(wrap, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5 });
          }, 1200);
        }
      }, 800);
    });
  }

  // ---------- Cricket Ball (Dhoni) ----------
  const ball = $('#cricketBall');
  if (ball && $('#dhoniSection')) {
    ScrollTrigger.create({
      trigger: '#dhoniSection',
      start: 'top 50%',
      onEnter: () => {
        gsap.to(ball, {
          left: '90%',
          top: '60%',
          duration: 2,
          ease: 'power1.inOut',
          repeat: 1,
          yoyo: true
        });
      }
    });
  }

  // ---------- Three.js Floating (Hearts, Roses, Stars) ----------
  let threeScene, threeCamera, threeRenderer, threeMeshes = [];

  function initThreeBackground() {
    const canvas = $('#threeCanvas');
    if (!canvas) return;
    const section = $('#threeSection');
    const w = section ? section.offsetWidth : window.innerWidth;
    const h = section ? section.offsetHeight : window.innerHeight;
    threeScene = new THREE.Scene();
    threeCamera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    threeRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    threeRenderer.setSize(w, h);
    threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    threeCamera.position.z = 5;

    const ambient = new THREE.AmbientLight(0x332244, 0.6);
    threeScene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffb6c1, 0.4);
    dir.position.set(2, 2, 5);
    threeScene.add(dir);

    const shapes = [];
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0.2);
    heartShape.bezierCurveTo(0.5, 0.2, 0.5, -0.5, 0, -0.2);
    heartShape.bezierCurveTo(-0.5, -0.5, -0.5, 0.2, 0, 0.2);
    const heartGeo = new THREE.ExtrudeGeometry(heartShape, { depth: 0.1, bevelEnabled: false });
    const mat = new THREE.MeshPhongMaterial({ color: 0xff1493 });
    for (let i = 0; i < 15; i++) {
      const mesh = new THREE.Mesh(heartGeo, mat.clone());
      mesh.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 5);
      mesh.rotation.set(Math.random() * 6, Math.random() * 6, 0);
      mesh.scale.setScalar(0.15 + Math.random() * 0.2);
      threeScene.add(mesh);
      shapes.push({ mesh, speed: 0.2 + Math.random() * 0.3 });
    }
    const starGeo = new THREE.OctahedronGeometry(0.2, 0);
    const starMat = new THREE.MeshPhongMaterial({ color: 0xffd700 });
    for (let i = 0; i < 10; i++) {
      const mesh = new THREE.Mesh(starGeo, starMat);
      mesh.position.set((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 6);
      mesh.scale.setScalar(0.5 + Math.random());
      threeScene.add(mesh);
      shapes.push({ mesh, speed: 0.15 + Math.random() * 0.2 });
    }
    threeMeshes = shapes;

    let time = 0;
    function animate() {
      if (!threeRenderer || !threeScene || !threeCamera) return;
      requestAnimationFrame(animate);
      time += 0.01;
      threeMeshes.forEach(({ mesh, speed }) => {
        mesh.rotation.y += speed * 0.02;
        mesh.rotation.x += speed * 0.01;
        mesh.position.y += Math.sin(time + mesh.position.x) * 0.002;
      });
      threeRenderer.render(threeScene, threeCamera);
    }
    animate();
    window.addEventListener('resize', () => {
      const sec = $('#threeSection');
      if (!sec) return;
      const w = sec.offsetWidth;
      const h = sec.offsetHeight;
      threeCamera.aspect = w / h;
      threeCamera.updateProjectionMatrix();
      threeRenderer.setSize(w, h);
    });
  }
  initThreeBackground();

  // ---------- Mouse Parallax on 3D section ----------
  const threeSection = $('#threeSection');
  if (threeSection && threeMeshes.length) {
    threeSection.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 0.5;
      const y = -(e.clientY / window.innerHeight - 0.5) * 0.5;
      gsap.to(threeCamera.position, { x: x * 2, y: y * 2, duration: 0.5 });
    });
  }

  // ---------- Final Section: Text + Falling Roses ----------
  function createRoses(container) {
    if (!container) return;
    const rose = '🌹';
    for (let i = 0; i < 25; i++) {
      const span = document.createElement('span');
      span.textContent = rose;
      span.style.cssText = `
        position: absolute;
        left: ${Math.random() * 100}%;
        top: -10%;
        font-size: ${20 + Math.random() * 24}px;
        opacity: 0.7;
        animation: fallRose ${6 + Math.random() * 4}s linear infinite;
        animation-delay: ${Math.random() * 5}s;
      `;
      container.appendChild(span);
    }
  }
  const roseStyle = document.createElement('style');
  roseStyle.textContent = `
    @keyframes fallRose {
      0% { transform: translateY(0) rotate(0deg); }
      100% { transform: translateY(100vh) rotate(360deg); }
    }
  `;
  document.head.appendChild(roseStyle);
  createRoses($('#rosesFall'));

  // ---------- Slideshow (Video Mode) – loop forever, never stop ----------
  function initSlideshow() {
    const slides = $$('.slideshow-slide');
    const endEl = $('#slideshowEnd');
    if (!slides.length) return;
    let idx = 0;
    const DURATION = 6000;
    function next() {
      slides[idx].classList.remove('active');
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add('active');
    }
    let slideInterval = null;
    ScrollTrigger.create({
      trigger: '#slideshowSection',
      start: 'top 50%',
      onEnter: () => {
        if (!slideInterval) slideInterval = setInterval(next, DURATION);
      },
      onLeaveBack: () => { clearInterval(slideInterval); slideInterval = null; }
    });
  }
  function createFireworks(container) {
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const colors = ['#ff69b4', '#ff1493', '#ffd700', '#00ffff', '#ffb6c1'];
    for (let burst = 0; burst < 12; burst++) {
      setTimeout(() => {
        const bx = rect.width * (0.2 + Math.random() * 0.6);
        const by = rect.height * (0.2 + Math.random() * 0.5);
        for (let i = 0; i < 30; i++) {
          const p = document.createElement('div');
          const angle = (i / 30) * Math.PI * 2 + Math.random();
          const dist = 40 + Math.random() * 120;
          p.style.cssText = `
            position: absolute; left: ${bx}px; top: ${by}px;
            width: 4px; height: 4px; border-radius: 50%;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            box-shadow: 0 0 10px currentColor;
            pointer-events: none;
          `;
          container.appendChild(p);
          gsap.to(p, {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist,
            opacity: 0,
            scale: 0,
            duration: 1.2,
            ease: 'power2.out',
            onComplete: () => p.remove()
          });
        }
      }, burst * 400);
    }
  }
  function createConfettiForSlideshow() {
    const container = $('#fireworksContainer');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const colors = ['#ff69b4', '#ff1493', '#ffd700', '#fff'];
    for (let i = 0; i < 60; i++) {
      const angle = (Math.random() * 360 * Math.PI) / 180;
      const dist = 100 + Math.random() * 200;
      const p = document.createElement('div');
      p.style.cssText = `
        position: absolute; left: ${cx}px; top: ${cy}px;
        width: 8px; height: 8px; border-radius: 2px;
        background: ${colors[i % colors.length]};
        pointer-events: none;
      `;
      container.appendChild(p);
      gsap.to(p, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        opacity: 0,
        rotation: Math.random() * 720,
        duration: 1.8,
        ease: 'power2.out',
        onComplete: () => p.remove()
      });
    }
  }


  const final1 = $('#final1');
  const final2 = $('#final2');
  const final3 = $('#final3');
  ScrollTrigger.create({
    trigger: '#finalSection',
    start: 'top 60%',
    onEnter: () => {
      gsap.to(final1, { opacity: 1, duration: 0.8 });
      gsap.to(final2, { opacity: 1, duration: 0.8, delay: 0.6 });
      gsap.to(final3, { opacity: 1, duration: 0.8, delay: 1.2 });
    }
  });
})();
