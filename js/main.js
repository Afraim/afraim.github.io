// ============================================================
// MAIN.JS — Portfolio interactions & animations
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

  // ── Typed text effect ──────────────────────────────────────
  const typedEl = document.getElementById("typed-text");
  const phrases = [
    "Full-Stack Developer",
    "Python & Django Engineer",
    "Coding Instructor (4,500+ classes)",
    "Springer Published Researcher",
    "IoT & AI Enthusiast",
    "Award-Winning Sci-Fi Writer"
  ];
  let pi = 0, ci = 0, deleting = false;

  function typeLoop() {
    const phrase = phrases[pi];
    if (!deleting) {
      typedEl.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) { deleting = true; setTimeout(typeLoop, 2200); return; }
    } else {
      typedEl.textContent = phrase.slice(0, --ci);
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
    }
    setTimeout(typeLoop, deleting ? 40 : 70);
  }
  if (typedEl) typeLoop();

  // ── Navbar scroll behavior ─────────────────────────────────
  const nav = document.getElementById("main-nav");
  let lastY = 0;
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    nav.classList.toggle("nav--scrolled", y > 60);
    nav.classList.toggle("nav--hidden", y > lastY + 10 && y > 200);
    nav.classList.toggle("nav--hidden", false); // always show for simplicity
    lastY = y;
  }, { passive: true });

  // ── Mobile nav toggle ──────────────────────────────────────
  const menuBtn = document.getElementById("menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  menuBtn?.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", mobileMenu.classList.contains("open"));
  });
  document.querySelectorAll(".mobile-nav-link").forEach(a => {
    a.addEventListener("click", () => mobileMenu.classList.remove("open"));
  });

  // ── Active nav link on scroll ──────────────────────────────
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(l => l.classList.remove("active"));
        document.querySelectorAll(`[href="#${e.target.id}"]`).forEach(l => l.classList.add("active"));
      }
    });
  }, { threshold: 0.35 });
  sections.forEach(s => observer.observe(s));

  // ── Scroll reveal ──────────────────────────────────────────
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("revealed");
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
  document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

  // ── Skill bars animate ─────────────────────────────────────
  const skillObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll(".skill-fill").forEach(bar => {
          bar.style.width = bar.dataset.width;
        });
        skillObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll(".skills-grid").forEach(el => skillObserver.observe(el));

  // ── Stats counter animation ────────────────────────────────
  const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll(".stat-number").forEach(el => {
          const target = parseInt(el.dataset.target);
          const suffix = el.dataset.suffix || "";
          let current = 0;
          const step = Math.ceil(target / 60);
          const timer = setInterval(() => {
            current = Math.min(current + step, target);
            el.textContent = current.toLocaleString() + suffix;
            if (current >= target) clearInterval(timer);
          }, 24);
        });
        statsObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll(".stats-row").forEach(el => statsObserver.observe(el));

  // ── Project filter tabs ────────────────────────────────────
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;
      projectCards.forEach(card => {
        const show = filter === "all" || card.dataset.category === filter;
        card.style.opacity = show ? "1" : "0";
        card.style.transform = show ? "scale(1)" : "scale(0.95)";
        card.style.pointerEvents = show ? "auto" : "none";
        setTimeout(() => { card.style.display = show ? "flex" : "none"; }, show ? 0 : 300);
        if (show) setTimeout(() => { card.style.opacity = "1"; card.style.transform = "scale(1)"; }, 50);
      });
    });
  });

  // ── Smooth scrolling for anchor links ──────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // ── Parallax on hero ───────────────────────────────────────
  const heroOrbs = document.querySelectorAll(".orb");
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    heroOrbs.forEach((orb, i) => {
      orb.style.transform = `translateY(${y * (0.15 + i * 0.07)}px)`;
    });
  }, { passive: true });

  // ── Mouse glow follow ──────────────────────────────────────
  const glow = document.getElementById("cursor-glow");
  if (glow) {
    let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;
    document.addEventListener("mousemove", e => { mouseX = e.clientX; mouseY = e.clientY; });
    function animateGlow() {
      glowX += (mouseX - glowX) * 0.08;
      glowY += (mouseY - glowY) * 0.08;
      glow.style.left = glowX + "px";
      glow.style.top = glowY + "px";
      requestAnimationFrame(animateGlow);
    }
    animateGlow();
  }

  // ── Timeline expand (experience) ──────────────────────────
  document.querySelectorAll(".timeline-item").forEach(item => {
    item.addEventListener("click", () => item.classList.toggle("expanded"));
  });

  // ── Copy email on click ────────────────────────────────────
  const emailCopy = document.getElementById("copy-email");
  if (emailCopy) {
    emailCopy.addEventListener("click", () => {
      navigator.clipboard.writeText("afraim.zahangir@gmail.com").then(() => {
        emailCopy.textContent = "✓ Copied!";
        setTimeout(() => emailCopy.textContent = "Copy Email", 2000);
      });
    });
  }

  // ── Year for footer ────────────────────────────────────────
  const yearEl = document.getElementById("current-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
