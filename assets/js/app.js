/**
 * ACE YOUR PHYSICS - Main Application Script
 * 
 * ============================================================================
 * SOCIAL MEDIA & CONTACT CONFIGURATION (EDIT YOUR LINKS HERE)
 * Yahan aap apne Instagram, Facebook, Telegram aur WhatsApp links badal sakte hain.
 * ============================================================================
 */
window.AYP_SOCIAL = {
  // Apna YouTube channel link yahan daalein:
  youtube: 'https://youtube.com/@aceyourphysics',

  // Apna LinkedIn profile/page link yahan daalein:
  linkedin: 'https://linkedin.com/company/aceyourphysics',

  // Apna Instagram profile link yahan daalein:
  instagram: 'https://instagram.com/aceyourphysics',
  
  // Apna Facebook page link yahan daalein:
  facebook: 'https://facebook.com/aceyourphysics',
  
  // Apna Telegram channel ya group link yahan daalein:
  telegram: 'https://t.me/aceyourphysics',
  
  // WhatsApp direct link:
  whatsapp: 'https://wa.me/919617445950?text=Hello%20Vikash%20Sir%2C%20I%20am%20interested%20in%20Ace%20Your%20Physics%20classes.'
};

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initSocialLinks();
  initNavbar();
  initCurriculumFilter();
  initBookingModal();
  initFaqAccordion();
  initLightbox();
});

/**
 * Sync all social links with data-social attributes
 */
function initSocialLinks() {
  const config = window.AYP_SOCIAL;
  if (!config) return;
  document.querySelectorAll('[data-social]').forEach(el => {
    const platform = el.getAttribute('data-social');
    if (config[platform]) {
      el.href = config[platform];
    }
  });
}

/* ==========================================================================
   0. THEME TOGGLE (DARK / LIGHT MODE - SAFED / DARK THEME)
   ========================================================================== */
function initThemeToggle() {
  const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
  if (!toggleBtns.length) return;

  function applyTheme(isLight) {
    if (isLight) {
      document.documentElement.classList.add('light-theme');
      document.body.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
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
   5. TOAST NOTIFICATIONS & LIGHTBOX
   ========================================================================== */
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

