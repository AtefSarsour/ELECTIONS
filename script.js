document.addEventListener('DOMContentLoaded', function () {
    // إضافة حركة ظهور للعناصر عند التمرير
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('reveal-hidden');
                entry.target.classList.add('reveal-visible');
                // optional: unobserve after reveal
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    const cards = document.querySelectorAll('.campaign-card, .profile-card');

    cards.forEach(card => {
        // Use CSS classes instead of inline styles so :hover rules can override transforms
        card.classList.add('reveal-hidden');
        observer.observe(card);
        // If the card is already in viewport (e.g. negative margins pulled it up), reveal it immediately
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            card.classList.remove('reveal-hidden');
            card.classList.add('reveal-visible');
            observer.unobserve(card);
        }
    });
    const message = 'قريبا, كونوا بالقرب';

    function showToast(text) {
        let toast = document.getElementById('site-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'site-toast';
            Object.assign(toast.style, {
                position: 'fixed',
                bottom: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(34,58,112,0.95)',
                color: '#fff',
                padding: '12px 18px',
                borderRadius: '8px',
                zIndex: '2000',
                fontSize: '16px',
                boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                direction: 'rtl',
                opacity: '0'
            });
            document.body.appendChild(toast);
        }

        toast.textContent = text;
        // trigger visible
        requestAnimationFrame(() => {
            toast.style.transition = 'opacity 220ms ease';
            toast.style.opacity = '1';
        });

        // clear any existing timeout
        if (window.__siteToastTimeout) clearTimeout(window.__siteToastTimeout);
        window.__siteToastTimeout = setTimeout(() => {
            toast.style.opacity = '0';
        }, 2200);
    }

    function handler(e) {
        e.preventDefault();
        showToast(message);
    }

    // تم التعديل: تطبيق الـ handler فقط على #video لأن #campaign أصبح مرئياً الآن
    const links = document.querySelectorAll('a[href="#video"]');
    links.forEach(l => l.addEventListener('click', handler));

    // --- Scrollspy: highlight nav links when their section is in view ---
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

    // Map links to their target sections (ignore links without matching sections)
    const sections = Array.from(navLinks).map(a => {
        const id = a.getAttribute('href').slice(1);
        return document.getElementById(id) || null;
    }).filter(Boolean);

    if (sections.length) {
        const spyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.id;
                const link = document.querySelector(`.nav-links a[href="#${id}"]`);
                if (!link) return;

                if (entry.isIntersecting) {
                    // remove active from all then set the current one
                    navLinks.forEach(a => a.classList.remove('active'));
                    link.classList.add('active');
                } else {
                    // if leaving the viewport, remove the active class
                    // (we keep the simple behavior where intersection adds it)
                    link.classList.remove('active');
                }
            });
        }, { threshold: 0.55 });

        sections.forEach(s => spyObserver.observe(s));

        // Ensure initial active state on load/refresh
        window.addEventListener('load', () => {
            sections.forEach(sec => {
                const rect = sec.getBoundingClientRect();
                if (rect.top < window.innerHeight * 0.55 && rect.bottom > window.innerHeight * 0.2) {
                    const link = document.querySelector(`.nav-links a[href="#${sec.id}"]`);
                    if (link) {
                        navLinks.forEach(a => a.classList.remove('active'));
                        link.classList.add('active');
                    }
                }
            });
        });
    }

    // --- Simple looping image slider for portfolio ---
    const sliders = document.querySelectorAll('.image-slider');
    sliders.forEach(slider => {
        const track = slider.querySelector('.slider-track');
        const slides = Array.from(slider.querySelectorAll('.slide'));
        const prevBtn = slider.querySelector('.slider-btn.prev');
        const nextBtn = slider.querySelector('.slider-btn.next');
        const dotsContainer = slider.querySelector('.slider-dots');
        const wrapper = slider.querySelector('.slider-track-wrapper');
        if (!track || slides.length === 0 || !wrapper) return;

        let index = 0;

        // create dots
        slides.forEach((s, i) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.setAttribute('aria-label', `انتقال إلى الشريحة ${i+1}`);
            if (i === 0) btn.classList.add('active');
            btn.addEventListener('click', () => {
                goTo(i);
            });
            dotsContainer.appendChild(btn);
        });

        const dots = Array.from(dotsContainer.children);

        function setSlideWidths() {
            const w = wrapper.clientWidth;
            slides.forEach(s => {
                s.style.minWidth = w + 'px';
                s.style.maxWidth = w + 'px';
            });
            // ensure track doesn't keep inline transform issues
            track.style.willChange = 'transform';
            // explicitly set track width to avoid layout rounding issues
            track.style.width = (w * slides.length) + 'px';
        }

        function update() {
            const w = wrapper.clientWidth;
            // use translate3d for better GPU compositing
            track.style.transform = `translate3d(${ -index * w }px, 0, 0)`;
            dots.forEach((d, i) => d.classList.toggle('active', i === index));
        }

        function goTo(i) {
            const count = slides.length;
            index = ((i % count) + count) % count;
            update();
        }

        if (prevBtn) prevBtn.addEventListener('click', () => goTo(index - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => goTo(index + 1));

        // allow swipe on touch devices
        let startX = null;
        if (wrapper) {
            wrapper.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
            wrapper.addEventListener('touchend', (e) => {
                if (startX === null) return;
                const endX = e.changedTouches[0].clientX;
                const dx = endX - startX;
                if (Math.abs(dx) > 30) {
                    if (dx < 0) goTo(index + 1); else goTo(index - 1);
                }
                startX = null;
            });
        }

        // set widths initially and keep slider sizing correct on resize
        setSlideWidths();
        window.addEventListener('resize', () => {
            setSlideWidths();
            update();
        });

        // initial paint
        update();
    });
});