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
  initNavbar();
  initCurriculumFilter();
  initVisualLab();
  initBookingModal();
  initFaqAccordion();
  initResourceDownloads();
});

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
    mobileToggle.addEventListener('click', () => {
      const isVisible = navLinks.style.display === 'flex';
      navLinks.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) {
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '78px';
        navLinks.style.left = '0';
        navLinks.style.right = '0';
        navLinks.style.background = '#0a0f1d';
        navLinks.style.padding = '24px';
        navLinks.style.borderBottom = '1px solid rgba(148, 163, 184, 0.15)';
      }
    });

    // Close mobile nav on click
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          navLinks.style.display = 'none';
        }
      });
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
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
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

  angleSlider.addEventListener('input', updateMetricsDisplay);
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
          <h3 style="font-size: 1.6rem; color: #fff; margin-bottom: 12px;">Demo Class Request Received!</h3>
          <p style="color: #94a3b8; font-size: 1rem; line-height: 1.6; max-width: 440px; margin: 0 auto 24px;">
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
   6. FREE RESOURCES DOWNLOAD TOAST
   ========================================================================== */
function initResourceDownloads() {
  const resourceCards = document.querySelectorAll('.resource-card');

  resourceCards.forEach(card => {
    card.addEventListener('click', () => {
      const title = card.querySelector('h5')?.textContent || 'Physics Resource';
      showToast(`📥 Starting download: ${title}`);
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
