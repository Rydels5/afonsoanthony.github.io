// =========================================
// 0. SCROLL À ZÉRO ET BOOT SCREEN 
// =========================================
if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }

document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0); 
    document.body.classList.add('booting'); 

    setTimeout(() => {
        document.getElementById('boot-screen').style.display = 'none';
        const tvOverlay = document.getElementById('tv-overlay');
        const appWrapper = document.getElementById('app-wrapper');
        
        tvOverlay.classList.add('tv-animate');
        
        setTimeout(() => {
            tvOverlay.style.background = 'transparent';
            const crtLine = document.querySelector('.crt-line');
            if(crtLine) crtLine.style.opacity = '0';
            
            appWrapper.classList.add('tv-revealed');
            document.body.classList.remove('booting');
            document.querySelectorAll('.reveal').forEach(el => { observer.observe(el); });

            typeTerminalText();

            setTimeout(() => { tvOverlay.style.display = 'none'; }, 600);
            setTimeout(() => { appWrapper.classList.remove('tv-revealed'); }, 1200); 
        }, 450); 
    }, 2200); 
});

// =========================================
// 1. TRADUCTION INSTANTANÉE FR / EN (SÉCURISÉE)
// =========================================
let currentTypingTimeout; // Permet de stopper la machine à écrire si on traduit en cours de route

const langToggleBtn = document.getElementById('lang-toggle');
if(langToggleBtn) {
    langToggleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const htmlElement = document.documentElement;
        const currentLang = htmlElement.lang === 'fr' ? 'en' : 'fr';
        
        htmlElement.lang = currentLang;
        document.getElementById('lang-text').innerText = currentLang === 'fr' ? 'EN' : 'FR';
        
        document.querySelectorAll('.lang-txt').forEach(el => {
            el.innerHTML = el.getAttribute(`data-${currentLang}`);
            if(el.classList.contains('scramble-title')) {
                scrambleText(el, true);
            }
        });
        
        // Traduction spéciale pour le texte du bouton (data-value)
        const btnText = document.querySelector('#btn-init .btn-text');
        if(btnText) {
            btnText.setAttribute('data-value', btnText.getAttribute(`data-${currentLang}`));
            scrambleText(btnText, true);
        }
        
        document.querySelectorAll('.lang-nav').forEach(el => {
            el.setAttribute('data-label', el.getAttribute(`data-${currentLang}`));
        });
        
        // Relance du terminal (coupe proprement l'ancien)
        const term = document.querySelector('.auto-type');
        if(term) {
            term.setAttribute('data-string', term.getAttribute(`data-${currentLang}`));
            typeTerminalText();
        }
    });
}

// =========================================
// 2. MOTEUR DU CURSEUR & PARTICULES MATRICIELLES
// =========================================
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
let dotX = mouseX, dotY = mouseY;
let ringX = mouseX, ringY = mouseY;
const matrixChars = ['0', '1', 'x', '+', 'SYS', 'NULL'];

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    
    // Parallax
    const cyberGrid = document.querySelector('.cyber-grid-container');
    const cyberGlow = document.querySelector('.cyber-grid-glow');
    const parallaxBg = document.getElementById('parallax-bg');
    const xOffset = (mouseX / window.innerWidth - 0.5);
    const yOffset = (mouseY / window.innerHeight - 0.5);
    
    if(cyberGrid && cyberGlow) {
        cyberGrid.style.transform = `perspective(600px) rotateX(75deg) translateX(${xOffset * 40}px)`;
        cyberGlow.style.left = mouseX + 'px'; cyberGlow.style.top = (mouseY + 200) + 'px'; 
    }
    if(parallaxBg) parallaxBg.style.transform = `translate(${xOffset * -20}px, ${yOffset * -20}px)`;

    if(Math.random() > 0.85) { 
        const particle = document.createElement('div');
        particle.classList.add('matrix-particle');
        particle.style.left = (mouseX - 10 + Math.random() * 20) + 'px';
        particle.style.top = (mouseY - 10 + Math.random() * 20) + 'px';
        particle.innerText = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 800);
    }
});

function animateCursor() {
    dotX = mouseX; dotY = mouseY;
    cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
    ringX += (mouseX - ringX) * 0.2; ringY += (mouseY - ringY) * 0.2;
    cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    requestAnimationFrame(animateCursor);
}
animateCursor();

const cliquables = 'a, button, .project-card, .game-box, .close-btn, video, .itch-link, .mag-btn, .project-badge, .hologram-core';
document.addEventListener('mouseover', (e) => {
    if (e.target.closest(cliquables)) cursorRing.classList.add('hover-active');
});
document.addEventListener('mouseout', (e) => {
    if (e.target.closest(cliquables)) cursorRing.classList.remove('hover-active');
});

// =========================================
// 3. TERMINAL JOUABLE (HACKING)
// =========================================
const userTypingArea = document.getElementById('user-typing-area');
const terminal = document.getElementById('interactive-terminal');
let isHoveringTerminal = false;
let typedWord = "";

if(terminal && userTypingArea) {
    terminal.addEventListener('mouseenter', () => { isHoveringTerminal = true; document.querySelector('.terminal-hint').style.color = 'var(--cyan)'; });
    terminal.addEventListener('mouseleave', () => { isHoveringTerminal = false; document.querySelector('.terminal-hint').style.color = 'rgba(255,255,255,0.2)'; });

    document.addEventListener('keydown', (e) => {
        if(isHoveringTerminal && e.key.length === 1) { 
            userTypingArea.innerText += e.key;
            typedWord += e.key.toUpperCase();
            if(typedWord.includes("HIRE")) {
                const title = document.documentElement.lang === 'fr' ? "COMPÉTENCE DÉVERROUILLÉE" : "SKILL UNLOCKED";
                const desc = document.documentElement.lang === 'fr' ? "Embauche imminente !" : "Hiring imminent!";
                triggerAchievement(title, desc);
                typedWord = ""; userTypingArea.style.color = "#39ff14"; 
            }
        }
        if(isHoveringTerminal && e.key === "Backspace") {
            userTypingArea.innerText = userTypingArea.innerText.slice(0, -1);
            typedWord = typedWord.slice(0, -1);
        }
    });
}

function typeTerminalText() {
    const el = document.querySelector('.auto-type');
    if(!el) return;
    const text = el.getAttribute('data-string');
    el.innerHTML = '';
    let i = 0;
    
    clearTimeout(currentTypingTimeout);
    
    function typeWriter() {
        if (i < text.length) {
            if(text.charAt(i) === '<') {
                let tag = "";
                while(text.charAt(i) !== '>' && i < text.length) { tag += text.charAt(i); i++; }
                tag += '>'; el.innerHTML += tag; i++; 
                typeWriter();
            } else if(text.charAt(i) === '^') {
                i++; let timeStr = "";
                while(text.charAt(i) !== '<' && i < text.length) { timeStr += text.charAt(i); i++; }
                currentTypingTimeout = setTimeout(typeWriter, parseInt(timeStr));
            } else {
                el.innerHTML += text.charAt(i); i++;
                currentTypingTimeout = setTimeout(typeWriter, 15);
            }
        }
    }
    typeWriter();
}

// =========================================
// 4. BLOCKOUT MODE (LEVEL DESIGN)
// =========================================
let blockoutActive = false;
window.triggerBlockoutMode = function() {
    blockoutActive = !blockoutActive; 
    
    if(blockoutActive) {
        document.body.classList.add('blockout-mode');
        document.querySelector('.overdrive-hint').innerText = "[ DEV MODE ACTIVE ]";
        const title = document.documentElement.lang === 'fr' ? "PIPELINE MAÎTRISÉ" : "PIPELINE MASTERED";
        const desc = document.documentElement.lang === 'fr' ? "Le mode Greybox a été activé." : "Greybox mode activated.";
        triggerAchievement(title, desc);
    } else {
        document.body.classList.remove('blockout-mode');
        document.querySelector('.overdrive-hint').innerText = "[ TOGGLE GREYBOX ]";
    }
};

// =========================================
// 5. DIMENSION SHIFT & WIREFRAME KONAMI
// =========================================
const dimensionBtn = document.getElementById('dimension-shift');
if(dimensionBtn) {
    dimensionBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.classList.toggle('alt-dimension');
    });
}

const konamiCode = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiIndex = 0;
document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            document.body.classList.toggle('wireframe-mode');
            const title = document.documentElement.lang === 'fr' ? "DEBUG MODE" : "DEBUG MODE";
            const desc = document.documentElement.lang === 'fr' ? "Le fil de fer a été activé." : "Wireframe mode activated.";
            triggerAchievement(title, desc);
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

// =========================================
// 6. XP BAR, SPEEDLINES & FOG (RÉPARÉ : SANS BOSS BAR)
// =========================================
const crtOverlay = document.querySelector('.crt-overlay');
let scrollTimeout;
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    // Normal XP Scroll Bar
    if(scrollHeight > 0) {
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        document.getElementById('xp-bar').style.width = scrollPercent + '%';
    }
    
    // Fog of War
    const fog = document.querySelector('.fog-of-war');
    if(fog) {
        fog.style.transform = `translateY(${scrollTop * 0.5}px)`;
        if(scrollTop > scrollHeight - 300) fog.style.opacity = '0';
        else fog.style.opacity = '1';
    }
    
    // Speedlines
    if(Math.abs(scrollTop - lastScrollY) > 50) { document.body.classList.add('speeding'); }
    lastScrollY = scrollTop;

    if(crtOverlay) {
        crtOverlay.classList.add('scrolling');
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => { 
            crtOverlay.classList.remove('scrolling'); 
            document.body.classList.remove('speeding');
        }, 150);
    }
    
    // Mini-map update
    document.querySelectorAll('.section, .hero-section').forEach((sec, i) => {
        if(scrollTop >= sec.offsetTop - 200) {
            document.querySelectorAll('.map-dot').forEach(d => d.classList.remove('active'));
            const dots = document.querySelectorAll('.map-dot');
            if(dots[i]) dots[i].classList.add('active');
        }
    });
});

// Achievement System
function triggerAchievement(title, desc) {
    const toast = document.getElementById('achievement-toast');
    toast.querySelector('h4').innerText = title;
    toast.querySelector('p').innerText = desc;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 4000);
}

const contactSection = document.getElementById('contact');
let achievementUnlocked = false;
const achievementObserver = new IntersectionObserver((entries) => {
    if(entries[0].isIntersecting && !achievementUnlocked) {
        achievementUnlocked = true;
        const title = document.documentElement.lang === 'fr' ? "SUCCÈS DÉVERROUILLÉ" : "ACHIEVEMENT UNLOCKED";
        const desc = document.documentElement.lang === 'fr' ? "A exploré le portfolio à 100% !" : "Explored the portfolio to 100%!";
        triggerAchievement(title, desc);
    }
}, { threshold: 0.5 });
if(contactSection) achievementObserver.observe(contactSection);

document.querySelectorAll('.map-dot').forEach(dot => {
    dot.addEventListener('click', () => {
        const target = document.querySelector(dot.dataset.target);
        if(target) window.scrollTo({ top: target.offsetTop - 40, behavior: 'smooth' });
    });
});

// =========================================
// 7. SCRAMBLE TEXT (PROTÉGÉ SUR LES NOMS)
// =========================================
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
function scrambleText(element, force = false) {
    if(element.classList.contains('no-scramble')) return; 
    if(element.dataset.scrambled && !force) return;
    element.dataset.scrambled = true;
    
    const original = element.getAttribute('data-value') || element.innerText; // Use data-value if available
    let iterations = 0;
    const interval = setInterval(() => {
        element.innerText = original.split("").map((letter, index) => {
            if(letter === " ") return " ";
            if (index < iterations) return original[index];
            return chars[Math.floor(Math.random() * chars.length)];
        }).join("");
        if (iterations >= original.length) { clearInterval(interval); element.innerText = original; }
        iterations += 1/2;
    }, 30);
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            const scrambleTarget = entry.target.querySelector('.scramble-title');
            if(scrambleTarget) setTimeout(() => scrambleText(scrambleTarget), 200);
        }
    });
}, { threshold: 0.15 });

// =========================================
// 8. GESTION MODALE (SANS BOSS BAR)
// =========================================
const modal = document.getElementById("project-modal");

window.openModal = function(projectId) {
    if(modal) {
        modal.style.display = "block"; document.body.style.overflow = "hidden";
        document.querySelectorAll('.modal-project-content').forEach(c => { c.style.display = 'none'; const v = c.querySelector('video'); if (v) { v.pause(); v.currentTime = 0; } });
        const target = document.getElementById(projectId);
        if(target) { target.style.display = 'block'; const v = target.querySelector('video'); if (v) { v.play().catch(e=>console.log("Autoplay", e)); } }
    }
};

window.closeModal = function() {
    if(modal) {
        modal.style.display = "none"; document.body.style.overflow = "auto"; 
        document.querySelectorAll('video').forEach(v => { v.pause(); v.currentTime = 0; });
    }
};

window.onclick = function(e) { if (e.target == modal) closeModal(); };

// =========================================
// 9. TILT 3D, MAG-BTNS, HYPERSPACE
// =========================================
const tiltCards = document.querySelectorAll('.tilt-card');
tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        const centerX = rect.width / 2, centerY = rect.height / 2;
        card.style.transform = `perspective(1000px) rotateX(${((y - centerY) / centerY) * -6}deg) rotateY(${((x - centerX) / centerX) * 6}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
        card.style.transition = 'transform 0.5s ease';
        setTimeout(() => { card.style.transition = ''; }, 500); 
    });
});

document.querySelectorAll('.mag-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2, y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        btn.style.transition = 'none'; 
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform 0.3s ease'; btn.style.transform = `translate(0px, 0px)`;
    });
});

document.querySelectorAll('.nav-links a:not(#dimension-shift):not(#lang-toggle)').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault(); const t = document.querySelector(this.getAttribute('href'));
        if (t) window.scrollTo({ top: t.offsetTop - 40, behavior: 'smooth' });
    });
});

const btnInit = document.getElementById('btn-init');
if(btnInit) {
    btnInit.addEventListener('click', function(e) {
        e.preventDefault(); const textSpan = this.querySelector('.btn-text'); const original = textSpan.getAttribute('data-value') || textSpan.innerText; let iteration = 0;
        this.classList.add('hyperspace-active');
        const interval = setInterval(() => {
            textSpan.innerText = original.split("").map((l, i) => {
                if(i < iteration) return original[i]; return chars[Math.floor(Math.random() * chars.length)];
            }).join("");
            if(iteration >= original.length) {
                clearInterval(interval); this.classList.remove('hyperspace-active');
                window.scrollTo({ top: document.querySelector('#projects').offsetTop - 40, behavior: 'smooth' });
            }
            iteration += 1/3;
        }, 30);
    });
}