
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

    const links = document.querySelectorAll('a[href="#campaign"], a[href="#video"]');
    links.forEach(l => l.addEventListener('click', handler));
});