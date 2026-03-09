// Custom cursor, scroll effects & navigation interactions

const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;

  /* =========
     Custom cursor
     ========= */
  if (isFinePointer) {
    const cursorMain = document.querySelector('.cursor-main');
    const cursorTrail = document.querySelector('.cursor-trail');

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let trailX = targetX;
    let trailY = targetY;

    const setCursorVisible = () => {
      cursorMain.style.opacity = '1';
      cursorTrail.style.opacity = '0.7';
    };

    const moveCursor = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      cursorMain.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) rotate(-18deg)`;
    };

    const animateTrail = () => {
      const speed = 0.16;
      trailX += (targetX - trailX) * speed;
      trailY += (targetY - trailY) * speed;
      cursorTrail.style.transform = `translate3d(${trailX}px, ${trailY}px, 0) rotate(-18deg)`;
      requestAnimationFrame(animateTrail);
    };

    const setCursorState = (isDown) => {
      cursorMain.classList.toggle('cursor--active', isDown);
      cursorTrail.classList.toggle('cursor--active', isDown);
    };

    const linkTargets = document.querySelectorAll('a, button, [data-scroll-to]');

    linkTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursorMain.classList.add('cursor--link');
        cursorTrail.classList.add('cursor--link');
      });
      el.addEventListener('mouseleave', () => {
        cursorMain.classList.remove('cursor--link');
        cursorTrail.classList.remove('cursor--link');
      });
    });

    window.addEventListener('mousemove', (e) => {
      setCursorVisible();
      moveCursor(e);
    });
    window.addEventListener('mousedown', () => setCursorState(true));
    window.addEventListener('mouseup', () => setCursorState(false));
    window.addEventListener('mouseleave', () => {
      cursorMain.classList.add('cursor--hidden');
      cursorTrail.classList.add('cursor--hidden');
    });
    window.addEventListener('mouseenter', () => {
      cursorMain.classList.remove('cursor--hidden');
      cursorTrail.classList.remove('cursor--hidden');
    });

    animateTrail();
  }

  /* =========
     Smooth scroll (buttons with data-scroll-to)
     ========= */
  document.querySelectorAll('[data-scroll-to]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-scroll-to');
      const el = target && document.querySelector(target);
      if (!el) return;

      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({
        top,
        behavior: 'smooth',
      });
    });
  });

  /* =========
     Intersection-based reveals
     ========= */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.15,
      },
    );

    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* =========
     Parallax for visual cards & panels
     ========= */
  const parallaxEls = document.querySelectorAll('[data-parallax]');

  const updateParallax = () => {
    const viewportH = window.innerHeight;
    parallaxEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const progress = (rect.top + rect.height / 2 - viewportH / 2) / viewportH;
      const strength = el.hasAttribute('data-parallax-slower') ? 10 : 18;
      const translateY = -progress * strength;
      el.style.transform = `translateY(${translateY}px)`;
    });
  };

  if (parallaxEls.length) {
    updateParallax();
    window.addEventListener('scroll', updateParallax, { passive: true });
    window.addEventListener('resize', updateParallax);
  }

  /* =========
     Sticky header subtle blur on scroll
     ========= */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScrollHeader = () => {
      const y = window.scrollY || window.pageYOffset;
      header.style.backdropFilter = y > 4 ? 'blur(18px)' : 'blur(10px)';
      header.style.webkitBackdropFilter = header.style.backdropFilter;
    };
    window.addEventListener('scroll', onScrollHeader, { passive: true });
    onScrollHeader();
  }

  /* =========
     Mobile nav toggle + active link highlighting
     ========= */
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');
  const navLinks = document.querySelectorAll('[data-nav-link]');

  if (navToggle && navList) {
    const closeNav = () => {
      navToggle.classList.remove('is-open');
      navList.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    };

    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.classList.toggle('is-open');
      navList.classList.toggle('is-open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.forEach((link) =>
      link.addEventListener('click', () => {
        if (window.innerWidth <= 900) closeNav();
      }),
    );
  }

  // Scroll spy: highlight nav link for section in view
  const sections = document.querySelectorAll('[data-section]');
  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute('id');
          if (!id) return;

          navLinks.forEach((l) => {
            const href = l.getAttribute('href') || '';
            l.classList.toggle('is-active', href === `#${id}`);
          });
        });
      },
      {
        threshold: 0.4,
      },
    );

    sections.forEach((s) => spy.observe(s));
  }

  /* =========
     Horizontal gallery inertia effect
     ========= */
  const horizontalRoot = document.querySelector('[data-horizontal-scroll]');
  if (horizontalRoot) {
    let latestY = window.scrollY;

    const onScroll = () => {
      const rect = horizontalRoot.getBoundingClientRect();
      const viewportH = window.innerHeight;
      if (rect.top > viewportH || rect.bottom < 0) return;

      const scrollProgress = (viewportH - rect.top) / (viewportH + rect.height);
      const strength = 40;

      const rows = horizontalRoot.querySelectorAll('.gallery-row');
      rows.forEach((row, index) => {
        const dir = index === 0 ? 1 : -1;
        const translateX = (scrollProgress - 0.5) * strength * dir;
        row.style.transform = `translateX(${translateX}px)`;
      });

      latestY = window.scrollY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
});

