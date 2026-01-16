// =========================================
// 1. DOM CONTENT LOADED WRAPPER
// =========================================
function initApp() {
    // Initialize all major functions
    loadNavbarFooter(); // Load navbar/footer first if using placeholders
    initScrollReveal(); // The Intersection Observer logic
    initRippleEffect(); // The Hero Canvas animation
    initReviewsSlide(); // If you have a review slider
}

// Ensure init runs even if DOMContentLoaded has already fired
if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}

// =========================================
// 2. LOAD NAVBAR & FOOTER (Handles placeholders)
// =========================================
function loadNavbarFooter() {
    // Load Navbar
    const navPlaceholder = document.getElementById("navbar-placeholder");
    if (navPlaceholder) {
        // If you are fetching external files, use this logic. 
        // If your HTML already has the navbar, we just init the scroll logic.
        // For this fix, I will assume we might need to just init existing elements if fetch isn't used
        // or wait for fetch if it is.
        
        // CHECK: If your navbar is already in the HTML (static), just init scroll.
        if (document.querySelector('nav')) {
             initNavbarScroll();
             initMobileMenu();
        } else {
            // Fetch logic (Optional - only if you use separate files)
            fetch("component/navbar.html")
                .then(res => {
                    if (!res.ok) throw new Error("Navbar not found");
                    return res.text();
                })
                .then(data => {
                    navPlaceholder.innerHTML = data;
                    initNavbarScroll();
                    initMobileMenu();
                })
                .catch(err => console.log("Navbar fetch error or not using fetch:", err));
        }
    } else {
        // Fallback if no placeholder, just try to init logic on existing elements
        initNavbarScroll();
        initMobileMenu();
    }

    // Load Footer
    const footerPlaceholder = document.getElementById("footer-placeholder");
    if (footerPlaceholder) {
         if (!document.querySelector('footer')) {
            fetch("component/footer.html")
                .then(res => res.text())
                .then(data => {
                    footerPlaceholder.innerHTML = data;
                })
                .catch(err => console.log("Footer fetch error:", err));
         }
    }
}

// =========================================
// 3. NAVBAR SCROLL EFFECT
// =========================================
function initNavbarScroll() {
    // Try to find the nav element by tag or ID
    const nav = document.querySelector('nav') || document.getElementById('navbar'); 
    
    if (!nav) {
        console.warn("Navbar element not found for scroll effect");
        return;
    }

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            nav.classList.add("scrolled");
        } else {
            nav.classList.remove("scrolled");
        }
    });
}

// =========================================
// 4. MOBILE MENU TOGGLE
// =========================================
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn && navLinks) {
        // Remove old listeners to prevent duplicates
        const newBtn = menuBtn.cloneNode(true);
        menuBtn.parentNode.replaceChild(newBtn, menuBtn);
        
        newBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent bubbling
            navLinks.classList.toggle('mobile-active');
            
            // Icon Toggle
            const icon = newBtn.querySelector('i');
            if(icon) {
                if(navLinks.classList.contains('mobile-active')) {
                    icon.classList.replace('ph-list', 'ph-x');
                } else {
                    icon.classList.replace('ph-x', 'ph-list');
                }
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !newBtn.contains(e.target) && navLinks.classList.contains('mobile-active')) {
                navLinks.classList.remove('mobile-active');
                const icon = newBtn.querySelector('i');
                if(icon) icon.classList.replace('ph-x', 'ph-list');
            }
        });

        // Close menu when a link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('mobile-active');
                const icon = newBtn.querySelector('i');
                if(icon) icon.classList.replace('ph-x', 'ph-list');
            });
        });
    }
}

// Global toggle fallback
window.toggleMenu = function() {
    const nav = document.querySelector('.nav-links');
    if (nav) nav.classList.toggle("mobile-active");
};


// =========================================
// 5. SCROLL REVEAL ANIMATION
// =========================================
function initScrollReveal() {
    const selector = '.reveal, .slide-in-left, .slide-in-right, .reveal-left, .reveal-right, .stagger-list, .about-image-wrapper';
    const animatedElements = document.querySelectorAll(selector);

    if (animatedElements.length === 0) return;

    if (!('IntersectionObserver' in window)) {
        animatedElements.forEach(el => el.classList.add('active'));
        return;
    }

    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animatedElements.forEach((el) => {
        observer.observe(el);
    });
}


// =========================================
// 6. RIPPLE EFFECT (HERO CANVAS)
// =========================================
function initRippleEffect() {
    const canvas = document.getElementById('ripple-canvas');
    if (!canvas) return; 

    const ctx = canvas.getContext('2d');
    const heroSection = document.querySelector('.hero') || document.querySelector('.hero-section');
    if (!heroSection) return;

    let width, height;
    let ripples = [];

    function resizeCanvas() {
        width = heroSection.offsetWidth;
        height = heroSection.offsetHeight;
        canvas.width = width;
        canvas.height = height;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Ripple {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.radius = 0;
            this.maxRadius = 50 + Math.random() * 50;
            this.speed = 1 + Math.random();
            this.opacity = 0.6 + Math.random() * 0.4;
            this.lineWidth = 2 + Math.random() * 2;
            this.life = 1;
        }

        update() {
            this.radius += this.speed;
            this.life -= 0.01;
            this.opacity = this.life * 0.5;
            this.lineWidth -= 0.02;
        }

        draw(ctx) {
            if (this.opacity <= 0) return;
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.lineWidth = Math.max(0.1, this.lineWidth);
            ctx.stroke();
        }
    }

    function animateRipples() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < ripples.length; i++) {
            ripples[i].update();
            ripples[i].draw(ctx);

            if (ripples[i].life <= 0) {
                ripples.splice(i, 1);
                i--;
            }
        }

        if (Math.random() < 0.03) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            ripples.push(new Ripple(x, y));
        }

        requestAnimationFrame(animateRipples);
    }

    heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (Math.random() < 0.2) {
            ripples.push(new Ripple(x, y));
        }
    });

    animateRipples();
}


// =========================================
// 7. FLOATING CONTACT WIDGET
// =========================================
window.toggleContactMenu = function() {
    var widget = document.querySelector(".floating-contact-wrapper");
    if(widget) {
        widget.classList.toggle("active");
    }
};


// =========================================
// 8. REVIEW SLIDER
// =========================================
function initReviewsSlide() {
    const track = document.getElementById("review-track");
    if (!track) return;
    
    const reviews = document.querySelectorAll(".review-item");
    if (reviews.length === 0) return;

    const reviewCount = reviews.length;
    let index = 0;

    function slideReviews() {
        index++;
        const currentHeight = reviews[0].offsetHeight + 20; 
        
        track.style.transition = "transform 0.7s ease-in-out";
        track.style.transform = `translateY(-${index * currentHeight}px)`;

        if (index === reviewCount - 1) {
            setTimeout(() => {
                track.style.transition = "none";
                track.style.transform = "translateY(0)";
                index = 0;
            }, 700);
        }
    }

    setInterval(slideReviews, 4000);
}

// =========================================
// 9. FORM MOCK
// =========================================
function handleSubmit(event) {
    event.preventDefault();
    const btn = event.target.querySelector("button");
    if(!btn) return;
    
    const originalText = btn.innerText;

    btn.innerText = "Sending...";
    btn.disabled = true;

    setTimeout(() => {
        alert("Thank you! Request received.");
        event.target.reset();
        btn.innerText = originalText;
        btn.disabled = false;
    }, 1500);
}