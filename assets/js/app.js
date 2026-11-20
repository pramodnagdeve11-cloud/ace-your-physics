/**
 * ACE YOUR PHYSICS - Main Application Script
 * Features:
 * - Interactive Projectile Motion Visual Lab
 * - Curriculum Category Filtering
 * - Free Demo Booking Modal & WhatsApp Lead Generator
 * - FAQ Accordion
 * - Dynamic Mobile Navigation & Smooth Scroll
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initNavbar();
  initCurriculumFilter();
  initVisualLab();
  initConceptHub();
  initBookingModal();
  initFaqAccordion();
  initLightbox();
  initCalculusCalculator();
});

/* ==========================================================================
   0. THEME TOGGLE (DARK / LIGHT MODE - SAFED / DARK THEME)
   ========================================================================== */
function initThemeToggle() {
  const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
  if (!toggleBtns.length) return;

  function applyTheme(isLight) {
    if (isLight) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }

    toggleBtns.forEach(btn => {
      const icon = btn.querySelector('.theme-icon');
      const text = btn.querySelector('.theme-text');
      if (isLight) {
        if (icon) icon.textContent = '☀️';
        if (text) text.textContent = 'Light';
        btn.setAttribute('title', 'Switch to Dark Mode');
        btn.setAttribute('aria-label', 'Switch to Dark Mode');
      } else {
        if (icon) icon.textContent = '🌙';
        if (text) text.textContent = 'Dark';
        btn.setAttribute('title', 'Switch to Light / White Background Mode');
        btn.setAttribute('aria-label', 'Switch to Light / White Background Mode');
      }
    });

    document.dispatchEvent(new CustomEvent('themeChanged', { detail: { isLight } }));
  }

  // Check saved theme in localStorage (defaults to light theme like AP Guru)
  const savedTheme = localStorage.getItem('ayp_theme');
  const isCurrentlyLight = savedTheme !== 'dark';
  applyTheme(isCurrentlyLight);

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const willBeLight = !document.body.classList.contains('light-theme');
      localStorage.setItem('ayp_theme', willBeLight ? 'light' : 'dark');
      applyTheme(willBeLight);
    });
  });
}

/* ==========================================================================
   1. NAVBAR & SCROLL EFFECTS
   ========================================================================== */
function initNavbar() {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.toggle('mobile-open');
    });

    // Close mobile nav on click of any link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
      });
    });

    // Close when clicking outside header
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target)) {
        navLinks.classList.remove('mobile-open');
      }
    });
  }
}

/* ==========================================================================
   2. CURRICULUM TABS & FILTERING
   ========================================================================== */
function initCurriculumFilter() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const courseCards = document.querySelectorAll('.course-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      courseCards.forEach(card => {
        const categoryAttr = card.getAttribute('data-category') || '';
        const categories = categoryAttr.split(/\s+/);
        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.3s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   3. INTERACTIVE VISUAL PHYSICS LAB (CANVAS PROJECTILE SIMULATOR)
   ========================================================================== */
function initVisualLab() {
  const canvas = document.getElementById('projectileCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const angleSlider = document.getElementById('angleSlider');
  const velocitySlider = document.getElementById('velocitySlider');
  const angleVal = document.getElementById('angleVal');
  const velocityVal = document.getElementById('velocityVal');
  const launchBtn = document.getElementById('launchBtn');
  const resetBtn = document.getElementById('resetBtn');
  const planetBtns = document.querySelectorAll('.planet-btn');

  // Outputs
  const outTime = document.getElementById('outTime');
  const outHeight = document.getElementById('outHeight');
  const outRange = document.getElementById('outRange');
  const telemetryData = document.getElementById('telemetryData');

  let gravity = 9.8; // m/s^2 (Earth default)
  let animationId = null;
  let projectile = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    t: 0,
    history: []
  };
  let isFlying = false;

  // Responsive canvas size adjustment
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = 420 * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    drawEnvironment();
  }

  window.addEventListener('resize', resizeCanvas);

  function getControls() {
    return {
      angle: parseFloat(angleSlider.value),
      velocity: parseFloat(velocitySlider.value),
      rad: (parseFloat(angleSlider.value) * Math.PI) / 180
    };
  }

  function calculatePhysics(velocity, angleDeg, g) {
    const rad = (angleDeg * Math.PI) / 180;
    const timeOfFlight = (2 * velocity * Math.sin(rad)) / g;
    const maxHeight = (Math.pow(velocity * Math.sin(rad), 2)) / (2 * g);
    const maxRange = (Math.pow(velocity, 2) * Math.sin(2 * rad)) / g;

    return {
      time: timeOfFlight.toFixed(2),
      height: maxHeight.toFixed(2),
      range: maxRange.toFixed(2)
    };
  }

  function updateMetricsDisplay() {
    const { angle, velocity } = getControls();
    angleVal.textContent = `${angle}°`;
    velocityVal.textContent = `${velocity} m/s`;

    const metrics = calculatePhysics(velocity, angle, gravity);
    outTime.textContent = `${metrics.time} s`;
    outHeight.textContent = `${metrics.height} m`;
    outRange.textContent = `${metrics.range} m`;

    if (!isFlying) {
      drawEnvironment();
      drawPreviewTrajectory();
    }
  }

  // Planet Gravity Selectors
  planetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      planetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      gravity = parseFloat(btn.getAttribute('data-gravity'));
      updateMetricsDisplay();
    });
  });

  // Angle Presets
  const anglePresetBtns = document.querySelectorAll('.angle-preset-btn');
  anglePresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      anglePresetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.getAttribute('data-angle');
      angleSlider.value = val;
      updateMetricsDisplay();
    });
  });

  angleSlider.addEventListener('input', () => {
    anglePresetBtns.forEach(b => {
      if (b.getAttribute('data-angle') === angleSlider.value) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
    updateMetricsDisplay();
  });
  velocitySlider.addEventListener('input', updateMetricsDisplay);

  function drawEnvironment() {
    const w = canvas.width / window.devicePixelRatio;
    const h = 420;

    ctx.clearRect(0, 0, w, h);

    // Coordinate grid lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Ground platform
    const groundY = h - 40;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, groundY, w, 40);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(w, groundY);
    ctx.stroke();

    // Launcher Cannon
    const originX = 50;
    const originY = groundY;
    const { angle } = getControls();
    const rad = (angle * Math.PI) / 180;
    const cannonLen = 35;

    ctx.save();
    ctx.translate(originX, originY);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(cannonLen * Math.cos(rad), -cannonLen * Math.sin(rad));
    ctx.stroke();

    // Pivot base
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPreviewTrajectory() {
    const w = canvas.width / window.devicePixelRatio;
    const groundY = 420 - 40;
    const originX = 50;
    const { angle, velocity } = getControls();
    const rad = (angle * Math.PI) / 180;

    const vx = velocity * Math.cos(rad);
    const vy = velocity * Math.sin(rad);

    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.beginPath();

    const scale = 3.2; // visual pixels per meter
    let t = 0;
    const dt = 0.05;
    ctx.moveTo(originX, groundY);

    while (t < 10) {
      const x = originX + (vx * t) * scale;
      const y = groundY - ((vy * t) - 0.5 * gravity * t * t) * scale;

      if (y > groundY || x > w) break;
      ctx.lineTo(x, y);
      t += dt;
    }
    ctx.stroke();
    ctx.restore();
  }

  function startLaunch() {
    if (animationId) cancelAnimationFrame(animationId);
    isFlying = true;

    const { angle, velocity } = getControls();
    const rad = (angle * Math.PI) / 180;
    const groundY = 420 - 40;
    const originX = 50;
    const scale = 3.2;

    projectile = {
      originX: originX,
      groundY: groundY,
      vx: velocity * Math.cos(rad),
      vy: velocity * Math.sin(rad),
      t: 0,
      scale: scale,
      history: []
    };

    const startTime = performance.now();

    function step(currentTime) {
      const dt = 0.035; // simulated time increment
      projectile.t += dt;

      const simX = projectile.vx * projectile.t;
      const simY = (projectile.vy * projectile.t) - (0.5 * gravity * Math.pow(projectile.t, 2));

      const px = projectile.originX + simX * projectile.scale;
      const py = projectile.groundY - simY * projectile.scale;

      projectile.history.push({ x: px, y: py });

      drawEnvironment();

      // Draw particle trajectory trail
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      projectile.history.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();

      // Draw glowing projectile body
      ctx.fillStyle = '#60a5fa';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Telemetry update
      if (telemetryData) {
        telemetryData.innerHTML = `
          <span>X: <strong>${simX.toFixed(1)} m</strong></span>
          <span>Y: <strong>${Math.max(0, simY).toFixed(1)} m</strong></span>
          <span>T: <strong>${projectile.t.toFixed(2)} s</strong></span>
          <span>G: <strong>${gravity} m/s²</strong></span>
        `;
      }

      // Check if hit ground or out of bounds
      if (py >= projectile.groundY && projectile.t > 0.1) {
        isFlying = false;
        // Impact ripple effect
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(px, projectile.groundY, 14, 0, Math.PI * 2);
        ctx.stroke();
        return;
      }

      animationId = requestAnimationFrame(step);
    }

    animationId = requestAnimationFrame(step);
  }

  launchBtn.addEventListener('click', startLaunch);
  resetBtn.addEventListener('click', () => {
    if (animationId) cancelAnimationFrame(animationId);
    isFlying = false;
    updateMetricsDisplay();
  });

  // Initial draw
  resizeCanvas();
  updateMetricsDisplay();
}

/* ==========================================================================
   4. FREE DEMO BOOKING MODAL & WHATSAPP GENERATOR
   ========================================================================== */
function initBookingModal() {
  const modal = document.getElementById('bookingModal');
  const openButtons = document.querySelectorAll('.open-demo-modal');
  const closeBtn = document.querySelector('.modal-close');
  const form = document.getElementById('demoBookingForm');

  if (!modal) return;

  function openModal(courseTitle = '') {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (courseTitle) {
      const notesField = document.getElementById('studentNotes');
      if (notesField && !notesField.value) {
        notesField.value = `Interested in: ${courseTitle}`;
      }
    }
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const course = btn.getAttribute('data-course-name') || '';
      openModal(course);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Handle Form Submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('studentName').value.trim();
      const phone = document.getElementById('studentPhone').value.trim();
      const grade = document.getElementById('studentGrade').value;
      const board = document.getElementById('studentBoard').value;
      const subject = document.getElementById('studentSubject').value;
      const slot = document.getElementById('preferredSlot').value;
      const notes = document.getElementById('studentNotes').value.trim();

      // Format WhatsApp Message
      const message = 
`Hello Sir, I want to book a Free 1-on-1 Demo Class with Vikash Hanwat at Ace Your Physics.
*Student Name:* ${name}
*Contact / WhatsApp:* ${phone}
*Curriculum / Board:* ${board}
*Class / Grade:* ${grade}
*Subject:* ${subject}
*Preferred Slot:* ${slot}
${notes ? `*Notes:* ${notes}` : ''}
Thank you!`;

      // Official WhatsApp Number: Pre-fill message
      const whatsappNumber = "919617445950"; // Primary booking contact line
      const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

      // Show instant confirmation inside modal
      const modalContent = modal.querySelector('.modal-content');
      modalContent.innerHTML = `
        <div style="text-align: center; padding: 20px 10px;">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(16, 185, 129, 0.15); color: #10b981; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 20px;">✓</div>
          <h3 class="modal-confirm-title" style="font-size: 1.6rem; margin-bottom: 12px;">Demo Class Request Received!</h3>
          <p class="modal-confirm-desc" style="font-size: 1rem; line-height: 1.6; max-width: 440px; margin: 0 auto 24px;">
            Thank you, <strong>${name}</strong>. Vikash Sir will personally contact you on <strong>${phone}</strong> within a few hours to confirm your 1-on-1 trial slot.
          </p>
          <div style="display: flex; flex-direction: column; gap: 12px; max-width: 360px; margin: 0 auto;">
            <a href="${waUrl}" target="_blank" class="btn btn-whatsapp" style="width: 100%;">
              <span>Connect Instantly on WhatsApp</span>
            </a>
            <button class="btn btn-secondary" onclick="window.location.reload()" style="width: 100%;">
              Back to Home
            </button>
          </div>
        </div>
      `;

      // Also trigger open in new tab
      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 700);
    });
  }
}

/* ==========================================================================
   5. FAQ ACCORDION
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   6. INTERACTIVE CONCEPT & FORMULA HUB
   ========================================================================== */
function initConceptHub() {
  const tabs = document.querySelectorAll('.concept-tab-btn');
  const cards = document.querySelectorAll('.concept-card');
  const copyBtns = document.querySelectorAll('.copy-formula-btn');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.getAttribute('data-topic');

      cards.forEach(card => {
        const topic = card.getAttribute('data-topic');
        if (filter === 'all' || topic === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.3s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  copyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const formula = btn.getAttribute('data-formula') || btn.closest('.concept-card')?.querySelector('.formula-math')?.textContent;
      if (formula) {
        navigator.clipboard.writeText(formula.trim()).then(() => {
          const originalHTML = btn.innerHTML;
          btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`;
          showToast(`📋 Copied to clipboard: ${formula.trim()}`);
          setTimeout(() => {
            btn.innerHTML = originalHTML;
          }, 1800);
        }).catch(() => {
          showToast(`Formula: ${formula.trim()}`);
        });
      }
    });
  });
}

function showToast(message) {
  let toast = document.getElementById('siteToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'siteToast';
    toast.style.cssText = `
      position: fixed;
      bottom: 90px;
      left: 50%;
      transform: translateX(-50%);
      background: #1e293b;
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.4);
      padding: 12px 24px;
      border-radius: 9999px;
      font-size: 0.92rem;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.4);
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease, transform 0.3s ease;
      pointer-events: none;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
  }, 3200);
}

/* ==========================================================================
   7. IMAGE LIGHTBOX (STUDENT REVIEW CARDS & CURRICULUM OVERVIEW)
   ========================================================================== */
function initLightbox() {
  const lightbox = document.getElementById('imageLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxCloseBtn');
  const triggers = document.querySelectorAll('.open-lightbox-img');

  if (!lightbox || !lightboxImg) return;

  function openLightbox(src, title = '') {
    lightboxImg.src = src;
    lightboxImg.alt = title || 'Review Card Preview';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
      lightboxImg.src = '';
    }, 250);
  }

  triggers.forEach(el => {
    el.addEventListener('click', () => {
      const src = el.getAttribute('data-img-src') || (el.querySelector('img') ? el.querySelector('img').src : '');
      const title = el.getAttribute('data-img-title') || '';
      if (src) openLightbox(src, title);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}

/* ==========================================================================
   8. INTERACTIVE CALCULUS & PHYSICS SOLVER (CALCULATOR)
   ========================================================================== */
function initCalculusCalculator() {
  const container = document.getElementById('calculus-calc');
  if (!container) return;

  // Elements
  const modeDerivativeBtn = document.getElementById('calcModeDerivative');
  const modeIntegralBtn = document.getElementById('calcModeIntegral');
  const presetBtns = container.querySelectorAll('.calc-preset-btn');

  const sliderA = document.getElementById('sliderA');
  const numA = document.getElementById('numA');
  const labelA = document.getElementById('labelA');

  const sliderB = document.getElementById('sliderB');
  const numB = document.getElementById('numB');
  const labelB = document.getElementById('labelB');

  const sliderC = document.getElementById('sliderC');
  const numC = document.getElementById('numC');
  const labelC = document.getElementById('labelC');

  const sliderD = document.getElementById('sliderD');
  const numD = document.getElementById('numD');
  const labelD = document.getElementById('labelD');

  const sliderT0 = document.getElementById('sliderT0');
  const numT0 = document.getElementById('numT0');
  const labelT0 = document.getElementById('labelT0');

  const integralLimitsGroup = document.getElementById('integralLimitsGroup');
  const numBoundA = document.getElementById('numBoundA');
  const numBoundB = document.getElementById('numBoundB');
  const labelBounds = document.getElementById('labelBounds');

  const funcCoeffTitle = document.getElementById('funcCoeffTitle');
  const evalParamTitle = document.getElementById('evalParamTitle');
  const evalParamSubtitle = document.getElementById('evalParamSubtitle');

  const calcEqDisplay = document.getElementById('calcEquationDisplay');
  const calcVelDisplay = document.getElementById('calcVelocityDisplay');
  const calcAccDisplay = document.getElementById('calcAccelerationDisplay');

  const valBox1Label = document.getElementById('valBox1Label');
  const valBox1Val = document.getElementById('valBox1Val');
  const valBox2Label = document.getElementById('valBox2Label');
  const valBox2Val = document.getElementById('valBox2Val');
  const valBox3Label = document.getElementById('valBox3Label');
  const valBox3Val = document.getElementById('valBox3Val');
  const valBox3Card = document.getElementById('valBox3Card');

  const legCurve1 = document.getElementById('legCurve1');
  const legCurve2 = document.getElementById('legCurve2');
  const legCurve3 = document.getElementById('legCurve3');

  const calcModeIndicator = document.getElementById('calcModeIndicator');
  const calcStepsList = document.getElementById('calcStepsList');
  const calcWhatsAppBtn = document.getElementById('calcWhatsAppBtn');
  const calcResetBtn = document.getElementById('calcResetBtn');
  const canvas = document.getElementById('calculusCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let currentMode = 'derivative'; // 'derivative' | 'integral'
  let activePreset = 'freefall';

  // Presets definition
  const presets = {
    freefall: {
      mode: 'derivative',
      A: 0,
      B: -4.9,
      C: 20.0,
      D: 5.0,
      t0: 2.0,
      boundA: 0,
      boundB: 4.0
    },
    shm: {
      mode: 'derivative',
      A: 0.2,
      B: -2.0,
      C: 0.0,
      D: 8.0,
      t0: 1.5,
      boundA: 0,
      boundB: 3.5
    },
    cubic: {
      mode: 'derivative',
      A: 0.6,
      B: -2.4,
      C: 3.5,
      D: 1.0,
      t0: 2.5,
      boundA: 0,
      boundB: 4.0
    },
    work: {
      mode: 'integral',
      A: 0,
      B: 1.5,
      C: 8.0,
      D: 0,
      t0: 2.0,
      boundA: 0,
      boundB: 3.0
    }
  };

  // Two-way sync binding
  function bindPair(slider, num, label, formatter) {
    if (!slider || !num) return;
    slider.addEventListener('input', () => {
      num.value = slider.value;
      if (label) label.textContent = formatter ? formatter(slider.value) : slider.value;
      updateCalculator();
    });
    num.addEventListener('input', () => {
      slider.value = num.value;
      if (label) label.textContent = formatter ? formatter(num.value) : num.value;
      updateCalculator();
    });
  }

  bindPair(sliderA, numA, labelA);
  bindPair(sliderB, numB, labelB);
  bindPair(sliderC, numC, labelC);
  bindPair(sliderD, numD, labelD);
  bindPair(sliderT0, numT0, labelT0, val => parseFloat(val).toFixed(1) + (currentMode === 'derivative' ? ' s' : ' m'));

  if (numBoundA && numBoundB) {
    numBoundA.addEventListener('input', updateCalculator);
    numBoundB.addEventListener('input', updateCalculator);
  }

  // Format polynomial string: f(t) = At³ + Bt² + Ct + D
  function formatPoly(a, b, c, d, v = 't') {
    const parts = [];
    if (Math.abs(a) > 0.001) parts.push(`${a > 0 && parts.length ? '+ ' : ''}${a === 1 ? '' : a === -1 ? '-' : a}${v}³`);
    if (Math.abs(b) > 0.001) parts.push(`${b > 0 && parts.length ? '+ ' : b < 0 && parts.length ? '- ' : b < 0 ? '-' : ''}${Math.abs(b) === 1 && parts.length ? '' : Math.abs(b)}${v}²`);
    if (Math.abs(c) > 0.001) parts.push(`${c > 0 && parts.length ? '+ ' : c < 0 && parts.length ? '- ' : c < 0 ? '-' : ''}${Math.abs(c) === 1 && parts.length ? '' : Math.abs(c)}${v}`);
    if (Math.abs(d) > 0.001 || parts.length === 0) parts.push(`${d > 0 && parts.length ? '+ ' : d < 0 && parts.length ? '- ' : d < 0 ? '-' : ''}${Math.abs(d)}`);
    return parts.join(' ');
  }

  // Format first derivative: 3At² + 2Bt + C
  function formatDeriv(a, b, c, v = 't') {
    const da = 3 * a;
    const db = 2 * b;
    const dc = c;
    const parts = [];
    if (Math.abs(da) > 0.001) parts.push(`${da > 0 && parts.length ? '+ ' : ''}${da === 1 ? '' : da === -1 ? '-' : da.toFixed(1)}${v}²`);
    if (Math.abs(db) > 0.001) parts.push(`${db > 0 && parts.length ? '+ ' : db < 0 && parts.length ? '- ' : db < 0 ? '-' : ''}${Math.abs(db).toFixed(1)}${v}`);
    if (Math.abs(dc) > 0.001 || parts.length === 0) parts.push(`${dc > 0 && parts.length ? '+ ' : dc < 0 && parts.length ? '- ' : dc < 0 ? '-' : ''}${Math.abs(dc).toFixed(1)}`);
    return parts.join(' ');
  }

  // Format second derivative: 6At + 2B
  function formatSecDeriv(a, b, v = 't') {
    const d2a = 6 * a;
    const d2b = 2 * b;
    const parts = [];
    if (Math.abs(d2a) > 0.001) parts.push(`${d2a > 0 && parts.length ? '+ ' : ''}${d2a.toFixed(1)}${v}`);
    if (Math.abs(d2b) > 0.001 || parts.length === 0) parts.push(`${d2b > 0 && parts.length ? '+ ' : d2b < 0 && parts.length ? '- ' : d2b < 0 ? '-' : ''}${Math.abs(d2b).toFixed(1)}`);
    return parts.join(' ');
  }

  // Format indefinite integral: (A/4)x⁴ + (B/3)x³ + (C/2)x² + Dx + C₀
  function formatInteg(a, b, c, d, v = 'x') {
    const parts = [];
    if (Math.abs(a) > 0.001) parts.push(`${(a / 4).toFixed(2)}${v}⁴`);
    if (Math.abs(b) > 0.001) {
      const coeff = b / 3;
      parts.push(`${coeff > 0 && parts.length ? '+ ' : coeff < 0 && parts.length ? '- ' : ''}${Math.abs(coeff).toFixed(2)}${v}³`);
    }
    if (Math.abs(c) > 0.001) {
      const coeff = c / 2;
      parts.push(`${coeff > 0 && parts.length ? '+ ' : coeff < 0 && parts.length ? '- ' : ''}${Math.abs(coeff).toFixed(2)}${v}²`);
    }
    if (Math.abs(d) > 0.001) {
      parts.push(`${d > 0 && parts.length ? '+ ' : d < 0 && parts.length ? '- ' : ''}${Math.abs(d).toFixed(1)}${v}`);
    }
    parts.push('+ C₀');
    return parts.join(' ');
  }

  function evaluateF(a, b, c, d, t) {
    return a * Math.pow(t, 3) + b * Math.pow(t, 2) + c * t + d;
  }

  function evaluateFPrime(a, b, c, t) {
    return 3 * a * Math.pow(t, 2) + 2 * b * t + c;
  }

  function evaluateFDoublePrime(a, b, t) {
    return 6 * a * t + 2 * b;
  }

  function evaluateIntegralAt(a, b, c, d, t) {
    return (a / 4) * Math.pow(t, 4) + (b / 3) * Math.pow(t, 3) + (c / 2) * Math.pow(t, 2) + d * t;
  }

  function switchMode(newMode) {
    currentMode = newMode;
    if (newMode === 'derivative') {
      modeDerivativeBtn.classList.add('active');
      modeDerivativeBtn.setAttribute('aria-selected', 'true');
      modeIntegralBtn.classList.remove('active');
      modeIntegralBtn.setAttribute('aria-selected', 'false');

      funcCoeffTitle.innerHTML = 'Function Coefficients: <em>x(t) = A t³ + B t² + C t + D</em>';
      evalParamTitle.innerHTML = 'Evaluation Instant (<em>t = t₀</em>)';
      evalParamSubtitle.textContent = 'Time Instant t';
      integralLimitsGroup.style.display = 'none';

      valBox1Label.textContent = 'Position x(t)';
      valBox2Label.textContent = 'Velocity v(t) = dx/dt';
      valBox3Label.textContent = 'Acceleration a(t) = d²x/dt²';
      valBox3Card.className = 'calc-val-box acc';

      legCurve1.textContent = 'x(t) Position';
      legCurve2.textContent = 'v(t) Velocity';
      legCurve3.textContent = 'a(t) Accel';
      legCurve3.parentElement.style.display = 'inline-flex';
    } else {
      modeIntegralBtn.classList.add('active');
      modeIntegralBtn.setAttribute('aria-selected', 'true');
      modeDerivativeBtn.classList.remove('active');
      modeDerivativeBtn.setAttribute('aria-selected', 'false');

      funcCoeffTitle.innerHTML = 'Variable Force Function: <em>F(x) = A x³ + B x² + C x + D</em>';
      evalParamTitle.innerHTML = 'Evaluation Position (<em>x = x₀</em>)';
      evalParamSubtitle.textContent = 'Position x';
      integralLimitsGroup.style.display = 'block';

      valBox1Label.textContent = 'Instant Force F(x₀)';
      valBox2Label.textContent = 'Definite Work W = ∫ F dx';
      valBox3Label.textContent = 'Average Force F_avg';
      valBox3Card.className = 'calc-val-box work';

      legCurve1.textContent = 'F(x) Force';
      legCurve2.textContent = 'W(x) Integral';
      legCurve3.parentElement.style.display = 'none';
    }
    updateCalculator();
  }

  modeDerivativeBtn.addEventListener('click', () => switchMode('derivative'));
  modeIntegralBtn.addEventListener('click', () => switchMode('integral'));

  // Preset buttons handler
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const pKey = btn.getAttribute('data-preset');
      const p = presets[pKey];
      if (!p) return;

      activePreset = pKey;
      if (currentMode !== p.mode) {
        switchMode(p.mode);
      }

      sliderA.value = p.A; numA.value = p.A; if (labelA) labelA.textContent = p.A;
      sliderB.value = p.B; numB.value = p.B; if (labelB) labelB.textContent = p.B;
      sliderC.value = p.C; numC.value = p.C; if (labelC) labelC.textContent = p.C;
      sliderD.value = p.D; numD.value = p.D; if (labelD) labelD.textContent = p.D;
      sliderT0.value = p.t0; numT0.value = p.t0; if (labelT0) labelT0.textContent = p.t0.toFixed(1) + (p.mode === 'derivative' ? ' s' : ' m');
      if (numBoundA) numBoundA.value = p.boundA;
      if (numBoundB) numBoundB.value = p.boundB;

      updateCalculator();
    });
  });

  // Reset default button
  if (calcResetBtn) {
    calcResetBtn.addEventListener('click', () => {
      const firstPreset = container.querySelector('.calc-preset-btn[data-preset="freefall"]');
      if (firstPreset) firstPreset.click();
    });
  }

  // Main calculation & rendering function
  function updateCalculator() {
    const a = parseFloat(numA.value) || 0;
    const b = parseFloat(numB.value) || 0;
    const c = parseFloat(numC.value) || 0;
    const d = parseFloat(numD.value) || 0;
    const t0 = parseFloat(numT0.value) || 0;
    const boundA = numBoundA ? parseFloat(numBoundA.value) || 0 : 0;
    const boundB = numBoundB ? parseFloat(numBoundB.value) || 3 : 3;

    if (labelA) labelA.textContent = a.toFixed(1);
    if (labelB) labelB.textContent = b.toFixed(1);
    if (labelC) labelC.textContent = c.toFixed(1);
    if (labelD) labelD.textContent = d.toFixed(1);
    if (labelT0) labelT0.textContent = t0.toFixed(1) + (currentMode === 'derivative' ? ' s' : ' m');
    if (labelBounds) labelBounds.textContent = `[${boundA.toFixed(1)}, ${boundB.toFixed(1)}] ${currentMode === 'derivative' ? 's' : 'm'}`;

    if (currentMode === 'derivative') {
      // Derivatives
      const polyStr = formatPoly(a, b, c, d, 't');
      const velStr = formatDeriv(a, b, c, 't');
      const accStr = formatSecDeriv(a, b, 't');

      calcEqDisplay.textContent = `x(t) = ${polyStr}`;
      calcVelDisplay.textContent = `v(t) = dx/dt = ${velStr}`;
      calcAccDisplay.textContent = `a(t) = d²x/dt² = ${accStr}`;

      const posVal = evaluateF(a, b, c, d, t0);
      const velVal = evaluateFPrime(a, b, c, t0);
      const accVal = evaluateFDoublePrime(a, b, t0);

      valBox1Val.textContent = (posVal >= 0 ? '+' : '') + posVal.toFixed(2) + ' m';
      valBox2Val.textContent = (velVal >= 0 ? '+' : '') + velVal.toFixed(2) + ' m/s';
      valBox3Val.textContent = (accVal >= 0 ? '+' : '') + accVal.toFixed(2) + ' m/s²';

      calcModeIndicator.textContent = 'Power Rule & Tangent Slope';

      // Physical Insights
      let motionDirection = velVal > 0.05 ? 'Moving in positive direction (upward/forward)' : velVal < -0.05 ? 'Moving in negative direction (downward/backward)' : 'Instantaneously at rest (turning point)';
      let speedChange = Math.sign(velVal) === Math.sign(accVal) && Math.abs(velVal) > 0.05 ? 'Speed is increasing (accelerating in direction of motion).' : Math.sign(velVal) !== Math.sign(accVal) && Math.abs(velVal) > 0.05 ? 'Speed is decreasing (decelerating / retarding).' : 'Constant velocity or zero velocity instant.';
      
      let apexText = '';
      if (Math.abs(a) < 0.001 && Math.abs(b) > 0.001) {
        const tApex = -c / (2 * b);
        if (tApex >= 0) {
          apexText = `<li><strong>Apex / Peak Point:</strong> Velocity <em>v(t) = 0</em> occurs at <em>t = -v₀ / (2B) = ${tApex.toFixed(2)}s</em> with max displacement <em>x_max = ${evaluateF(a, b, c, d, tApex).toFixed(2)}m</em>.</li>`;
        }
      }

      calcStepsList.innerHTML = `
        <li><strong>Velocity as Slope:</strong> At <em>t = ${t0.toFixed(1)}s</em>, the instantaneous rate of change is <em>v(${t0.toFixed(1)}) = ${velVal.toFixed(2)} m/s</em>. State: ${motionDirection}.</li>
        <li><strong>Acceleration as Curvature:</strong> The second derivative <em>a(${t0.toFixed(1)}) = ${accVal.toFixed(2)} m/s²</em>. ${speedChange}</li>
        ${apexText}
        <li><strong>AP/IB Physics Exam Tip:</strong> Remember that speed is |v(t)|. When velocity and acceleration have opposite signs, the particle is slowing down!</li>
      `;

      // WhatsApp Button URL
      const msg = `Hi Vikash Sir, I am testing the AceYourPhysics Calculus Solver for motion equation: x(t) = ${polyStr} at t=${t0.toFixed(1)}s (v=${velVal.toFixed(2)} m/s, a=${accVal.toFixed(2)} m/s²). Could you please help me understand this derivation?`;
      calcWhatsAppBtn.href = `https://wa.me/919617445950?text=${encodeURIComponent(msg)}`;

    } else {
      // Integrals
      const polyStr = formatPoly(a, b, c, d, 'x');
      const intStr = formatInteg(a, b, c, d, 'x');
      const intA = evaluateIntegralAt(a, b, c, d, boundA);
      const intB = evaluateIntegralAt(a, b, c, d, boundB);
      const defInt = intB - intA;
      const interval = Math.abs(boundB - boundA) || 1;
      const avgF = defInt / interval;

      calcEqDisplay.textContent = `F(x) = ${polyStr}`;
      calcVelDisplay.textContent = `W(x) = ∫ F(x) dx = ${intStr}`;
      calcAccDisplay.textContent = `Definite Work W = ∫₍${boundA.toFixed(1)}₎⁽${boundB.toFixed(1)}⁾ F(x) dx = ${defInt.toFixed(2)} J`;

      const forceAtT0 = evaluateF(a, b, c, d, t0);
      valBox1Val.textContent = (forceAtT0 >= 0 ? '+' : '') + forceAtT0.toFixed(2) + ' N';
      valBox2Val.textContent = (defInt >= 0 ? '+' : '') + defInt.toFixed(2) + ' J';
      valBox3Val.textContent = (avgF >= 0 ? '+' : '') + avgF.toFixed(2) + ' N';

      calcModeIndicator.textContent = 'Definite Integration & Work-Energy';

      calcStepsList.innerHTML = `
        <li><strong>Definite Integral as Work Done:</strong> <em>W = ∫ F(x) dx = [W(x)] = ${defInt.toFixed(2)} Joules</em>. This represents the shaded area under the curve!</li>
        <li><strong>Work-Energy Theorem:</strong> Net work done equals change in kinetic energy: <em>W_net = ΔK = ½m v_f² - ½m v_i²</em>.</li>
        <li><strong>Average Force:</strong> <em>F_avg = W / (b - a) = ${defInt.toFixed(2)} / ${interval.toFixed(1)} = ${avgF.toFixed(2)} N</em>.</li>
      `;

      // WhatsApp Button URL
      const msg = `Hi Vikash Sir, I am testing the AceYourPhysics Calculus Solver for work integral: F(x) = ${polyStr} from x=${boundA.toFixed(1)} to ${boundB.toFixed(1)} (Work = ${defInt.toFixed(2)} J). Could you please help explain how to solve this on past papers?`;
      calcWhatsAppBtn.href = `https://wa.me/919617445950?text=${encodeURIComponent(msg)}`;
    }

    drawGraph(a, b, c, d, t0, boundA, boundB);
  }

  // Draw Graph on Canvas
  function drawGraph(a, b, c, d, t0, boundA, boundB) {
    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const width = rect.width || 700;
    const height = 270;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.resetTransform();
    ctx.scale(dpr, dpr);

    const isLight = document.body.classList.contains('light-theme');
    const bgColor = isLight ? '#ffffff' : '#090e1c';
    const gridColor = isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(148, 163, 184, 0.12)';
    const axisColor = isLight ? '#94a3b8' : '#475569';
    const textColor = isLight ? '#475569' : '#94a3b8';

    // Clear background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Coordinate domain: t from 0 to tMax
    const tMin = 0;
    const tMax = Math.max(5.0, boundB + 0.8, t0 + 0.8);

    // Padding
    const padL = 46;
    const padR = 20;
    const padT = 20;
    const padB = 30;
    const plotW = width - padL - padR;
    const plotH = height - padT - padB;

    // Sample points to find y domain
    const steps = 100;
    let yMin = Infinity;
    let yMax = -Infinity;

    for (let i = 0; i <= steps; i++) {
      const t = tMin + (i / steps) * (tMax - tMin);
      const y1 = evaluateF(a, b, c, d, t);
      const y2 = currentMode === 'derivative' ? evaluateFPrime(a, b, c, t) : evaluateIntegralAt(a, b, c, d, t);
      if (isFinite(y1)) { yMin = Math.min(yMin, y1); yMax = Math.max(yMax, y1); }
      if (isFinite(y2)) { yMin = Math.min(yMin, y2); yMax = Math.max(yMax, y2); }
    }

    if (!isFinite(yMin) || !isFinite(yMax) || yMin === yMax) {
      yMin = -10;
      yMax = 30;
    }

    // Always include zero in y domain for clear reference
    yMin = Math.min(0, yMin);
    yMax = Math.max(0, yMax);
    const ySpan = (yMax - yMin) || 1;
    yMin -= ySpan * 0.12;
    yMax += ySpan * 0.12;

    function toPxX(t) {
      return padL + ((t - tMin) / (tMax - tMin)) * plotW;
    }
    function toPxY(y) {
      return padT + plotH - ((y - yMin) / (yMax - yMin)) * plotH;
    }

    // Draw Grid Lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = gridColor;

    // Horizontal grid lines
    const yStepsCount = 5;
    ctx.fillStyle = textColor;
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= yStepsCount; i++) {
      const yVal = yMin + (i / yStepsCount) * (yMax - yMin);
      const py = toPxY(yVal);
      ctx.beginPath();
      ctx.moveTo(padL, py);
      ctx.lineTo(width - padR, py);
      ctx.stroke();
      ctx.fillText(yVal.toFixed(0), padL - 8, py);
    }

    // Vertical grid lines
    const xStepsCount = 6;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let i = 0; i <= xStepsCount; i++) {
      const tVal = tMin + (i / xStepsCount) * (tMax - tMin);
      const px = toPxX(tVal);
      ctx.beginPath();
      ctx.moveTo(px, padT);
      ctx.lineTo(px, height - padB);
      ctx.stroke();
      ctx.fillText(tVal.toFixed(1) + (currentMode === 'derivative' ? 's' : 'm'), px, height - padB + 6);
    }

    // Zero Baseline Axis
    const zeroY = toPxY(0);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = axisColor;
    ctx.beginPath();
    ctx.moveTo(padL, zeroY);
    ctx.lineTo(width - padR, zeroY);
    ctx.stroke();

    // In Integral Mode: Shade the Definite Integral Area between boundA and boundB
    if (currentMode === 'integral' && boundB > boundA) {
      const bMin = Math.max(tMin, Math.min(boundA, boundB));
      const bMax = Math.min(tMax, Math.max(boundA, boundB));
      const areaSteps = 60;

      ctx.beginPath();
      ctx.moveTo(toPxX(bMin), zeroY);
      for (let i = 0; i <= areaSteps; i++) {
        const curX = bMin + (i / areaSteps) * (bMax - bMin);
        ctx.lineTo(toPxX(curX), toPxY(evaluateF(a, b, c, d, curX)));
      }
      ctx.lineTo(toPxX(bMax), zeroY);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, padT, 0, height - padB);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0.08)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Bound markers
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(toPxX(bMin), zeroY);
      ctx.lineTo(toPxX(bMin), toPxY(evaluateF(a, b, c, d, bMin)));
      ctx.moveTo(toPxX(bMax), zeroY);
      ctx.lineTo(toPxX(bMax), toPxY(evaluateF(a, b, c, d, bMax)));
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Curve 1: f(t) or F(x) in Blue / Sky Blue
    ctx.lineWidth = 2.8;
    ctx.strokeStyle = isLight ? '#0284c7' : '#38bdf8';
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = tMin + (i / steps) * (tMax - tMin);
      const px = toPxX(t);
      const py = toPxY(evaluateF(a, b, c, d, t));
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Curve 2: v(t) or W(x) in Emerald (#10b981)
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = isLight ? '#059669' : '#34d399';
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = tMin + (i / steps) * (tMax - tMin);
      const px = toPxX(t);
      const py = toPxY(currentMode === 'derivative' ? evaluateFPrime(a, b, c, t) : evaluateIntegralAt(a, b, c, d, t));
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // In Derivative Mode: Curve 3: a(t) in Amber (#f59e0b)
    if (currentMode === 'derivative') {
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = isLight ? '#d97706' : '#fbbf24';
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const t = tMin + (i / steps) * (tMax - tMin);
        const px = toPxX(t);
        const py = toPxY(evaluateFDoublePrime(a, b, t));
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Tangent Line at t = t0 on x(t)
      const ptx = toPxX(t0);
      const pty = toPxY(evaluateF(a, b, c, d, t0));
      const slope = evaluateFPrime(a, b, c, t0);

      // Tangent line endpoints
      const dt = 0.8;
      const tLeft = Math.max(tMin, t0 - dt);
      const tRight = Math.min(tMax, t0 + dt);
      const yLeft = evaluateF(a, b, c, d, t0) - slope * (t0 - tLeft);
      const yRight = evaluateF(a, b, c, d, t0) + slope * (tRight - t0);

      ctx.lineWidth = 2.0;
      ctx.strokeStyle = isLight ? '#0284c7' : '#7dd3fc';
      ctx.beginPath();
      ctx.moveTo(toPxX(tLeft), toPxY(yLeft));
      ctx.lineTo(toPxX(tRight), toPxY(yRight));
      ctx.stroke();

      // Dot at (t0, x(t0))
      ctx.beginPath();
      ctx.arc(ptx, pty, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Vertical guide to axis
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = isLight ? 'rgba(2, 132, 199, 0.4)' : 'rgba(56, 189, 248, 0.6)';
      ctx.beginPath();
      ctx.moveTo(ptx, pty);
      ctx.lineTo(ptx, zeroY);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // Handle Resize and Theme Change
  window.addEventListener('resize', () => {
    updateCalculator();
  });

  document.addEventListener('themeChanged', () => {
    updateCalculator();
  });

  // Initial Calculation
  updateCalculator();
}

