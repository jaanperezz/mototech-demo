/* ═══════════════════════════════════════════
   MOTOTECH BARCELONA — INDUSTRIAL DARK JS
   Bold, dark-themed motorcycle shop template
   ═══════════════════════════════════════════ */
(function(){
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Skip link injection (a11y) ── */
  if(!document.querySelector('.skip-link')){
    const skip = document.createElement('a');
    skip.href = '#main-content';
    skip.className = 'skip-link';
    skip.textContent = 'Saltar al contenido principal';
    document.body.insertBefore(skip, document.body.firstChild);
  }
  if(!document.getElementById('main-content')){
    const first = document.querySelector('section, main, .page-hero, .home-hero');
    if(first) first.id = 'main-content';
  }

  /* ── Icons ── */
  if(window.lucide) lucide.createIcons();

  /* ── Header scroll state (transparent → dark) ── */
  const header = document.getElementById('header');
  if(header){
    let headerTicking = false;
    const updateHeader = () => {
      header.classList.toggle('scrolled', window.scrollY > 60);
      headerTicking = false;
    };
    window.addEventListener('scroll', () => {
      if(!headerTicking){ requestAnimationFrame(updateHeader); headerTicking = true; }
    }, {passive:true});
    updateHeader();
  }

  /* ── Mobile drawer toggle ── */
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileOverlay = document.querySelector('.mobile-overlay');
  const closeDrawer = document.querySelector('.close-drawer');

  function toggleMobileNav(open){
    if(!mobileNav) return;
    mobileNav.classList.toggle('open', open);
    hamburger?.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  hamburger?.addEventListener('click', () => toggleMobileNav(!mobileNav.classList.contains('open')));
  mobileOverlay?.addEventListener('click', () => toggleMobileNav(false));
  closeDrawer?.addEventListener('click', () => toggleMobileNav(false));
  document.querySelectorAll('.drawer-link').forEach(link => {
    link.addEventListener('click', () => toggleMobileNav(false));
  });

  /* ── Staggered reveals for grids ── */
  document.querySelectorAll('[data-stagger]').forEach(container => {
    const delay = parseInt(container.getAttribute('data-stagger')) || 100;
    const children = container.children;
    for(let i = 0; i < children.length; i++){
      const child = children[i];
      if(!child.classList.contains('reveal') && !child.hasAttribute('data-reveal')){
        child.classList.add('reveal');
      }
      child.style.transitionDelay = (i * delay) + 'ms';
    }
  });

  /* ── Scroll reveal with IntersectionObserver (blur + slide) ── */
  const revEls = document.querySelectorAll('.reveal:not(.visible), [data-reveal]:not(.visible)');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if(e.isIntersecting){
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, {threshold:0.08, rootMargin:'0px 0px -40px 0px'});
    revEls.forEach(el => {
      if(el.closest('.page-hero, .home-hero')){
        el.classList.add('visible');
        return;
      }
      if(el.hasAttribute('data-reveal') && !el.classList.contains('reveal')){
        el.classList.add('reveal');
        const dir = el.getAttribute('data-reveal');
        if(dir && dir !== 'up') el.classList.add(dir);
      }
      io.observe(el);
    });
  } else {
    revEls.forEach(el => el.classList.add('visible'));
  }

  /* ── Counter animation (monospace style) ── */
  function animateCount(el){
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const dur = 2000;
    const start = performance.now();
    function step(now){
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      const val = Math.round(target * ease);
      el.textContent = prefix + val.toLocaleString('es-ES') + suffix;
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  const counters = document.querySelectorAll('[data-count]');
  if(counters.length && 'IntersectionObserver' in window){
    const cio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if(e.isIntersecting){ animateCount(e.target); cio.unobserve(e.target); }
      });
    }, {threshold:0.5});
    counters.forEach(c => cio.observe(c));
  }

  /* ── Gallery horizontal drag-scroll ── */
  document.querySelectorAll('.gallery-scroll-track').forEach(track => {
    let isDown = false, startX, scrollLeft;
    track.addEventListener('mousedown', e => {
      isDown = true;
      track.style.cursor = 'grabbing';
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });
    track.addEventListener('mouseleave', () => { isDown = false; track.style.cursor = 'grab'; });
    track.addEventListener('mouseup', () => { isDown = false; track.style.cursor = 'grab'; });
    track.addEventListener('mousemove', e => {
      if(!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5;
      track.scrollLeft = scrollLeft - walk;
    });
  });

  /* ── Gallery tab filtering ── */
  document.querySelectorAll('.gallery-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      const container = btn.closest('section');
      if(!container) return;
      container.querySelectorAll('.gallery-filter').forEach(b => b.classList.toggle('active', b === btn));
      container.querySelectorAll('.gallery-item').forEach(item => {
        const cat = item.dataset.category;
        if(filter === 'todos' || cat?.includes(filter)){
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  /* ── Accordion ── */
  document.querySelectorAll('.accordion-btn').forEach(btn => {
    btn.setAttribute('aria-expanded', 'false');
    const body = btn.closest('.accordion-item')?.querySelector('.accordion-body');
    if(body){
      btn.setAttribute('aria-controls', body.id || (body.id = 'acc-' + Math.random().toString(36).slice(2,7)));
    }
    btn.addEventListener('click', () => {
      const item = btn.closest('.accordion-item');
      const body = item.querySelector('.accordion-body');
      const isOpen = item.classList.contains('open');
      const parent = item.parentElement;
      parent.querySelectorAll('.accordion-item.open').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.accordion-body').style.maxHeight = '0';
        i.querySelector('.accordion-btn').setAttribute('aria-expanded','false');
      });
      if(!isOpen){
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
        btn.setAttribute('aria-expanded','true');
      }
    });
  });

  /* ── Form handling (demo mode) ── */
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      if(!btn) return;

      const required = form.querySelectorAll('[required]');
      let valid = true;
      required.forEach(f => {
        f.style.borderColor = '';
        if(!f.value.trim()){ f.style.borderColor = 'var(--accent)'; valid = false; }
      });
      if(!valid){ form.querySelector('[required][style*="accent"]')?.focus(); return; }

      const orig = btn.innerHTML;
      btn.innerHTML = '<svg class="spin" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Enviando...';
      btn.style.opacity = '0.7';
      btn.style.pointerEvents = 'none';

      setTimeout(() => {
        btn.innerHTML = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Enviado (Demo)';
        btn.style.backgroundColor = '#25D366';
        btn.style.borderColor = '#25D366';
        btn.style.color = '#000';
        form.reset();
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.style.backgroundColor = '';
          btn.style.borderColor = '';
          btn.style.color = '';
          btn.style.opacity = '1';
          btn.style.pointerEvents = 'auto';
          if(window.lucide) lucide.createIcons();
        }, 3000);
      }, 1200);
    });

    if(!document.querySelector('#spin-style')){
      const style = document.createElement('style');
      style.id = 'spin-style';
      style.innerHTML = '@keyframes spin{100%{transform:rotate(360deg)}}.spin{animation:spin 1s linear infinite}';
      document.head.appendChild(style);
    }
  });

  /* ── Smooth anchor scrolling ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const hash = a.getAttribute('href');
      if(hash === '#') return;
      const target = document.querySelector(hash);
      if(target){
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });

  /* ── WhatsApp button show on scroll ── */
  const waBtn = document.querySelector('.whatsapp-btn');
  if(waBtn){
    waBtn.style.opacity = '0';
    waBtn.style.transform = 'scale(0.5) translateY(20px)';
    let waShown = false;
    window.addEventListener('scroll', () => {
      if(!waShown && window.scrollY > 400){
        waBtn.style.transition = '.5s var(--ease, cubic-bezier(.16,1,.3,1))';
        waBtn.style.opacity = '1';
        waBtn.style.transform = 'scale(1) translateY(0)';
        waShown = true;
      }
    }, {passive:true});
  }

  /* ── Custom cursor glow effect on hero ── */
  if(!prefersReducedMotion){
    const heroSection = document.querySelector('.home-hero');
    const heroGlow = document.querySelector('.hero-glow');
    if(heroSection && heroGlow){
      heroSection.addEventListener('mousemove', e => {
        const rect = heroSection.getBoundingClientRect();
        heroGlow.style.left = (e.clientX - rect.left) + 'px';
        heroGlow.style.top = (e.clientY - rect.top) + 'px';
      });
    }
  }

  /* ── Marquee continuous scroll (duplicate content for seamless loop) ── */
  document.querySelectorAll('.marquee-track').forEach(track => {
    // Content is already duplicated in HTML for seamless loop
    // Adjust speed based on content width if needed
    const totalWidth = track.scrollWidth / 2;
    if(totalWidth > 0){
      track.style.animationDuration = Math.max(totalWidth / 40, 15) + 's';
    }
  });

})();
