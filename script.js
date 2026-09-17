// =========================================
// 0. SCROLL À ZÉRO ET BOOT SCREEN 
// =========================================
if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }

// Intersection Observer (Initialisé tôt pour assurer l'affichage)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            const scrambleTarget = entry.target.querySelector('.scramble-title');
            if(scrambleTarget) setTimeout(() => scrambleText(scrambleTarget), 200);
        }
    });
}, { threshold: 0.15 });

document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0); 
    document.body.classList.add('booting'); 

    setTimeout(() => {
        const boot = document.getElementById('boot-screen');
        if(boot) boot.remove(); // Retire complètement l'écran de chargement
        
        const tvOverlay = document.getElementById('tv-overlay');
        const appWrapper = document.getElementById('app-wrapper');
        
        if(tvOverlay) tvOverlay.classList.add('tv-animate');
        
        setTimeout(() => {
            if(tvOverlay) tvOverlay.style.background = 'transparent';
            const crtLine = document.querySelector('.crt-line');
            if(crtLine) crtLine.style.opacity = '0';
            
            if(appWrapper) appWrapper.classList.add('tv-revealed');
            document.body.classList.remove('booting');
            
            // Activation du scroll révèle
            document.querySelectorAll('.reveal').forEach(el => { observer.observe(el); });

            typeTerminalText();

            // Nettoyage final pour ne jamais bloquer la souris
            setTimeout(() => { if(tvOverlay) tvOverlay.remove(); }, 600);
            setTimeout(() => { if(appWrapper) appWrapper.classList.remove('tv-revealed'); }, 1200); 
        }, 450); 
    }, 2200); 
});

// =========================================
// 1. TRADUCTION INSTANTANÉE FR / EN 
// =========================================
let currentTypingTimeout;

const langToggleBtn = document.getElementById('lang-toggle');
if(langToggleBtn) {
    langToggleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const htmlElement = document.documentElement;
        const currentLang = htmlElement.lang === 'fr' ? 'en' : 'fr';
        
        htmlElement.lang = currentLang;
        const textIndicator = document.getElementById('lang-text');
        if(textIndicator) textIndicator.innerText = currentLang === 'fr' ? 'EN' : 'FR';
        
        document.querySelectorAll('.lang-txt').forEach(el => {
            const translation = el.getAttribute(`data-${currentLang}`);
            if(translation) {
                el.innerHTML = translation;
                if(el.classList.contains('scramble-title')) scrambleText(el, true);
            }
        });
        
        const btnText = document.querySelector('#btn-init .btn-text');
        if(btnText) {
            const btnVal = btnText.getAttribute(`data-${currentLang}`);
            if(btnVal) {
                btnText.setAttribute('data-value', btnVal);
                scrambleText(btnText, true);
            }
        }
        
        document.querySelectorAll('.lang-nav').forEach(el => {
            const navLabel = el.getAttribute(`data-${currentLang}`);
            if(navLabel) el.setAttribute('data-label', navLabel);
        });
        
        const term = document.querySelector('.auto-type');
        if(term) {
            const termVal = term.getAttribute(`data-${currentLang}`);
            if(termVal) {
                term.setAttribute('data-string', termVal);
                typeTerminalText();
            }
        }
    });
}

// =========================================
// 2. MOTEUR DU CURSEUR (INFAILLIBLE SÉCURITÉ ABSOLUE)
// =========================================
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let dotX = mouseX;
let dotY = mouseY;
let ringX = mouseX;
let ringY = mouseY;
let isCursorActive = false;

const matrixChars = ['0', '1', 'x', '+', 'SYS', 'NULL'];

function updateCursorPosition(e) {
    // SÉCURITÉ 1 : Ignore les faux événements (0,0) envoyés par certains navigateurs au chargement
    if (e.clientX === 0 && e.clientY === 0) return;

    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isCursorActive) {
        if (cursorDot) cursorDot.style.opacity = '1';
        if (cursorRing) cursorRing.style.opacity = '1';
        dotX = mouseX; 
        dotY = mouseY;
        ringX = mouseX; 
        ringY = mouseY;
        isCursorActive = true;
    }

    // Parallaxe Fond & Grille
    const cyberGrid = document.querySelector('.cyber-grid-container');
    const cyberGlow = document.querySelector('.cyber-grid-glow');
    const parallaxBg = document.getElementById('parallax-bg');
    const xOffset = (mouseX / window.innerWidth - 0.5);
    const yOffset = (mouseY / window.innerHeight - 0.5);
    
    if (cyberGrid && cyberGlow) {
        cyberGrid.style.transform = `perspective(600px) rotateX(75deg) translateX(${xOffset * 40}px)`;
        cyberGlow.style.left = mouseX + 'px'; 
        cyberGlow.style.top = (mouseY + 200) + 'px'; 
    }
    if (parallaxBg) {
        parallaxBg.style.transform = `translate(${xOffset * -20}px, ${yOffset * -20}px)`;
    }

    if (Math.random() > 0.88) { 
        const particle = document.createElement('div');
        particle.classList.add('matrix-particle');
        // Particules utilisent translate3d avec base top:0 left:0 CSS
        particle.style.transform = `translate3d(${mouseX - 10 + Math.random() * 20}px, ${mouseY - 10 + Math.random() * 20}px, 0)`;
        particle.innerText = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 800);
    }
}

// SÉCURITÉ 2 : On écoute les événements de pointage à la racine de window
window.addEventListener('pointermove', updateCursorPosition, { passive: true });
window.addEventListener('mousemove', updateCursorPosition, { passive: true });

// SÉCURITÉ 3 : Boucle d'animation fluide
function renderCursor() {
    if (isCursorActive) {
        // Le point est très réactif, l'anneau est lissé
        dotX += (mouseX - dotX) * 0.8;
        dotY += (mouseY - dotY) * 0.8;
        ringX += (mouseX - ringX) * 0.2;
        ringY += (mouseY - ringY) * 0.2;
        
        if (cursorDot) cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
        if (cursorRing) cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    }
    requestAnimationFrame(renderCursor);
}
requestAnimationFrame(renderCursor);

const cliquables = 'a, button, .project-card, .game-box-wrapper, .close-btn, video, iframe, .itch-link, .mag-btn, .project-badge, .hologram-core';
document.addEventListener('mouseover', (e) => {
    if (e.target.closest(cliquables) && cursorRing) cursorRing.classList.add('hover-active');
});
document.addEventListener('mouseout', (e) => {
    if (e.target.closest(cliquables) && cursorRing) cursorRing.classList.remove('hover-active');
});

// =========================================
// 3. TERMINAL JOUABLE (HACKING)
// =========================================
const userTypingArea = document.getElementById('user-typing-area');
const terminal = document.getElementById('interactive-terminal');
let isHoveringTerminal = false;
let typedWord = "";

if(terminal && userTypingArea) {
    terminal.addEventListener('mouseenter', () => {
        isHoveringTerminal = true;
        const hint = document.querySelector('.terminal-hint');
        if(hint) hint.style.color = 'var(--cyan)';
    });
    terminal.addEventListener('mouseleave', () => {
        isHoveringTerminal = false;
        const hint = document.querySelector('.terminal-hint');
        if(hint) hint.style.color = 'rgba(255,255,255,0.2)';
    });

    document.addEventListener('keydown', (e) => {
        if(isHoveringTerminal && e.key.length === 1) { 
            userTypingArea.innerText += e.key;
            typedWord += e.key.toUpperCase();
            
            if(typedWord.includes("HIRE")) {
                const title = document.documentElement.lang === 'fr' ? "COMPÉTENCE DÉVERROUILLÉE" : "SKILL UNLOCKED";
                const desc = document.documentElement.lang === 'fr' ? "Embauche imminente !" : "Hiring imminent!";
                triggerAchievement(title, desc);
                typedWord = ""; 
                userTypingArea.style.color = "#39ff14"; 
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
    if(!text) return;
    el.innerHTML = '';
    let i = 0;
    
    clearTimeout(currentTypingTimeout);
    
    function typeWriter() {
        if (i < text.length) {
            if(text.charAt(i) === '<' || text.charAt(i) === '[') {
                let tag = "";
                while(text.charAt(i) !== '>' && text.charAt(i) !== ']' && i < text.length) { tag += text.charAt(i); i++; }
                tag += text.charAt(i); el.innerHTML += tag; i++; 
                typeWriter();
            } else if(text.charAt(i) === '^') {
                i++; let timeStr = "";
                while(text.charAt(i) !== '<' && text.charAt(i) !== '[' && i < text.length) { timeStr += text.charAt(i); i++; }
                currentTypingTimeout = setTimeout(typeWriter, parseInt(timeStr) || 500);
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
    const hint = document.querySelector('.overdrive-hint');
    
    if(blockoutActive) {
        document.body.classList.add('blockout-mode');
        if(hint) hint.innerText = "[ DEV MODE ACTIVE ]";
        const title = document.documentElement.lang === 'fr' ? "PIPELINE MAÎTRISÉ" : "PIPELINE MASTERED";
        const desc = document.documentElement.lang === 'fr' ? "Le mode Greybox a été activé." : "Greybox mode activated.";
        triggerAchievement(title, desc);
    } else {
        document.body.classList.remove('blockout-mode');
        if(hint) hint.innerText = "[ TOGGLE GREYBOX ]";
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
            const title = "DEBUG MODE";
            const desc = document.documentElement.lang === 'fr' ? "Le fil de fer a été activé." : "Wireframe mode activated.";
            triggerAchievement(title, desc);
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

// =========================================
// 6. XP BAR, SPEEDLINES & FOG
// =========================================
const crtOverlay = document.querySelector('.crt-overlay');
let scrollTimeout;
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    if(scrollHeight > 0) {
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        const xpBar = document.getElementById('xp-bar');
        if(xpBar) xpBar.style.width = scrollPercent + '%';
    }
    
    const fog = document.querySelector('.fog-of-war');
    if(fog) {
        fog.style.transform = `translateY(${scrollTop * 0.5}px)`;
        if(scrollTop > scrollHeight - 300) fog.style.opacity = '0';
        else fog.style.opacity = '1';
    }
    
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
    
    document.querySelectorAll('.section, .hero-section').forEach((sec, i) => {
        if(scrollTop >= sec.offsetTop - 200) {
            document.querySelectorAll('.map-dot').forEach(d => d.classList.remove('active'));
            const dots = document.querySelectorAll('.map-dot');
            if(dots[i]) dots[i].classList.add('active');
        }
    });
}, { passive: true });

function triggerAchievement(title, desc) {
    const toast = document.getElementById('achievement-toast');
    if(toast) {
        const h4 = toast.querySelector('h4');
        const p = toast.querySelector('p');
        if(h4) h4.innerText = title;
        if(p) p.innerText = desc;
        toast.classList.add('show');
        setTimeout(() => { toast.classList.remove('show'); }, 4000);
    }
}

const contactSection = document.getElementById('contact');
let achievementUnlocked = false;
const achievementObserver = new IntersectionObserver((entries) => {
    if(entries[0] && entries[0].isIntersecting && !achievementUnlocked) {
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
// 7. SCRAMBLE TEXT (PROTÉGÉ)
// =========================================
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
function scrambleText(element, force = false) {
    if(!element || element.classList.contains('no-scramble')) return; 
    if(element.dataset.scrambled && !force) return;
    element.dataset.scrambled = "true";
    
    const original = element.getAttribute('data-value') || element.innerText;
    let iterations = 0;
    const interval = setInterval(() => {
        element.innerText = original.split("").map((letter, index) => {
            if(letter === " ") return " ";
            if (index < iterations) return original[index];
            return chars[Math.floor(Math.random() * chars.length)];
        }).join("");
        if (iterations >= original.length) { 
            clearInterval(interval); 
            element.innerText = original; 
        }
        iterations += 1/2;
    }, 30);
}

// =========================================
// 8. GESTION MODALE 
// =========================================
const modal = document.getElementById("project-modal");

window.openModal = function(projectId) {
    if(modal) {
        modal.style.display = "block"; 
        document.body.style.overflow = "hidden";
        
        document.querySelectorAll('.modal-project-content').forEach(c => { 
            c.style.display = 'none'; 
            const v = c.querySelector('video'); 
            if (v) { v.pause(); v.currentTime = 0; } 
        });
        
        const target = document.getElementById(projectId);
        if(target) { 
            target.style.display = 'block'; 
            const v = target.querySelector('video'); 
            if (v) { v.play().catch(e => console.log("Autoplay bloqué", e)); } 
        }
    }
};

window.closeModal = function() {
    if(modal) {
        modal.style.display = "none"; 
        document.body.style.overflow = "auto"; 
        document.querySelectorAll('video').forEach(v => { v.pause(); v.currentTime = 0; });
    }
};

window.onclick = function(e) { if (e.target == modal) closeModal(); };

// =========================================
// 9. TILT 3D, MAG-BTNS, HYPERSPACE
// =========================================
const tiltCards = document.querySelectorAll('.tilt-card, .tilt-box');
tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        const centerX = rect.width / 2, centerY = rect.height / 2;
        const multiplier = card.classList.contains('tilt-box') ? 10 : 6;
        card.style.transform = `perspective(1000px) rotateX(${((y - centerY) / centerY) * -multiplier}deg) rotateY(${((x - centerX) / centerX) * multiplier}deg) scale3d(1.02, 1.02, 1.02)`;
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
        btn.style.transition = 'transform 0.3s ease'; 
        btn.style.transform = `translate(0px, 0px)`;
    });
});

document.querySelectorAll('.nav-links a:not(#dimension-shift):not(#lang-toggle)').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault(); 
        const t = document.querySelector(this.getAttribute('href'));
        if (t) window.scrollTo({ top: t.offsetTop - 40, behavior: 'smooth' });
    });
});

const btnInit = document.getElementById('btn-init');
if(btnInit) {
    btnInit.addEventListener('click', function(e) {
        e.preventDefault(); 
        const textSpan = this.querySelector('.btn-text'); 
        if(!textSpan) return;
        const original = textSpan.getAttribute('data-value') || textSpan.innerText; 
        let iteration = 0;
        this.classList.add('hyperspace-active');
        const interval = setInterval(() => {
            textSpan.innerText = original.split("").map((l, i) => {
                if(i < iteration) return original[i]; 
                return chars[Math.floor(Math.random() * chars.length)];
            }).join("");
            if(iteration >= original.length) {
                clearInterval(interval); 
                this.classList.remove('hyperspace-active');
                const proj = document.querySelector('#projects');
                if(proj) window.scrollTo({ top: proj.offsetTop - 40, behavior: 'smooth' });
            }
            iteration += 1/3;
        }, 30);
    });
}