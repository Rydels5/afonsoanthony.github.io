// =========================================
// 0. SCROLL À ZÉRO ET BOOT SCREEN 
// =========================================
if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }

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

    // GESTION DE L'ÉCRAN DE CHARGEMENT
    setTimeout(() => {
        const boot = document.getElementById('boot-screen');
        if(boot) boot.remove(); 
        
        const tvOverlay = document.getElementById('tv-overlay');
        const appWrapper = document.getElementById('app-wrapper');
        
        if(tvOverlay) tvOverlay.classList.add('tv-animate');
        
        setTimeout(() => {
            if(tvOverlay) tvOverlay.style.background = 'transparent';
            const crtLine = document.querySelector('.crt-line');
            if(crtLine) crtLine.style.opacity = '0';
            
            if(appWrapper) appWrapper.classList.add('tv-revealed');
            document.body.classList.remove('booting');
            
            document.querySelectorAll('.reveal').forEach(el => { observer.observe(el); });
            typeTerminalText();

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
            const translation = el.getAttribute('data-' + currentLang);
            if(translation) {
                el.innerHTML = translation;
                if(el.classList.contains('scramble-title')) scrambleText(el, true);
            }
        });
        
        const btnText = document.querySelector('#btn-init .btn-text');
        if(btnText) {
            const btnVal = btnText.getAttribute('data-' + currentLang);
            if(btnVal) {
                btnText.setAttribute('data-value', btnVal);
                scrambleText(btnText, true);
            }
        }
        
        document.querySelectorAll('.lang-nav').forEach(el => {
            const navLabel = el.getAttribute('data-' + currentLang);
            if(navLabel) el.setAttribute('data-label', navLabel);
        });
        
        const term = document.querySelector('.auto-type');
        if(term) {
            const termVal = term.getAttribute('data-' + currentLang);
            if(termVal) {
                term.setAttribute('data-string', termVal);
                typeTerminalText();
            }
        }
    });
}

// =========================================
// 1.5. ACCORDÉON COMPÉTENCES (SÉCURISÉ)
// =========================================
window.toggleSkills = function(id, headerElement) {
    const content = document.getElementById(id);
    if(!content) return;
    
    if(content.classList.contains('active')) {
        content.classList.remove('active');
        headerElement.classList.remove('active');
    } else {
        content.classList.add('active');
        headerElement.classList.add('active');
    }
};

// =========================================
// 2. MOTEUR DU CURSEUR ET PARALLAXE
// =========================================
let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
let dotX = mouseX, dotY = mouseY;
let ringX = mouseX, ringY = mouseY;
let isDesktop = window.matchMedia("(pointer: fine)").matches;

const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

window.addEventListener('mousemove', (e) => {
    if (!isDesktop) return; 
    
    if (typeof e.clientX !== 'number' || typeof e.clientY !== 'number') return;
    mouseX = e.clientX; mouseY = e.clientY;

    if (cursorDot) cursorDot.style.opacity = '1';
    if (cursorRing) cursorRing.style.opacity = '1';

    const cyberGrid = document.querySelector('.cyber-grid-container');
    const cyberGlow = document.querySelector('.cyber-grid-glow');
    const parallaxBg = document.getElementById('parallax-bg');
    const xOffset = (mouseX / window.innerWidth - 0.5);
    const yOffset = (mouseY / window.innerHeight - 0.5);
    
    if (cyberGrid) cyberGrid.style.transform = "perspective(600px) rotateX(75deg) translateX(" + (xOffset * 40) + "px)";
    if (cyberGlow) { cyberGlow.style.left = mouseX + "px"; cyberGlow.style.top = (mouseY + 200) + "px"; }
    if (parallaxBg) parallaxBg.style.transform = "translate(" + (xOffset * -20) + "px, " + (yOffset * -20) + "px)";
});

function renderCursor() {
    if (isDesktop) {
        dotX += (mouseX - dotX) * 0.8;
        dotY += (mouseY - dotY) * 0.8;
        ringX += (mouseX - ringX) * 0.2;
        ringY += (mouseY - ringY) * 0.2;
        
        if (cursorDot) cursorDot.style.transform = "translate3d(" + dotX + "px, " + dotY + "px, 0) translate(-50%, -50%)";
        if (cursorRing) cursorRing.style.transform = "translate3d(" + ringX + "px, " + ringY + "px, 0) translate(-50%, -50%)";
    } else {
        if(cursorDot) cursorDot.style.display = 'none';
        if(cursorRing) cursorRing.style.display = 'none';
    }
    requestAnimationFrame(renderCursor);
}
requestAnimationFrame(renderCursor);

const cliquables = 'a, button, .game-box-wrapper, .close-btn, video, iframe, .itch-link, .doc-link, .mag-btn, .hologram-core, .node-chip, .shelf-header';
document.addEventListener('mouseover', (e) => {
    if (e.target.closest(cliquables) && cursorRing && isDesktop) cursorRing.classList.add('hover-active');
});
document.addEventListener('mouseout', (e) => {
    if (e.target.closest(cliquables) && cursorRing) cursorRing.classList.remove('hover-active');
});

// =========================================
// 3. TERMINAL HACKING ("HIRE" EASTER EGG)
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
                triggerAchievement("COMPÉTENCE DÉVERROUILLÉE", "Embauche imminente !");
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
// 4. BLOCKOUT MODE (GREYBOX)
// =========================================
let blockoutActive = false;
window.triggerBlockoutMode = function() {
    blockoutActive = !blockoutActive; 
    const hint = document.querySelector('.overdrive-hint');
    if(blockoutActive) {
        document.body.classList.add('blockout-mode');
        if(hint) hint.innerText = "[ DEV MODE ACTIVE ]";
        triggerAchievement("PIPELINE MAÎTRISÉ", "Le mode Greybox a été activé.");
    } else {
        document.body.classList.remove('blockout-mode');
        if(hint) hint.innerText = "[ TOGGLE GREYBOX ]";
    }
};

// =========================================
// 5. DIMENSION & KONAMI CODE
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
            triggerAchievement("DEBUG MODE", "Le fil de fer a été activé.");
            konamiIndex = 0;
        }
    } else { konamiIndex = 0; }
});

// =========================================
// 6. XP BAR, SCROLL & ACHIEVEMENTS
// =========================================
const crtOverlay = document.querySelector('.crt-overlay');
let scrollTimeout;

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
        fog.style.transform = "translateY(" + (scrollTop * 0.5) + "px)";
        fog.style.opacity = scrollTop > scrollHeight - 300 ? '0' : '1';
    }

    if(crtOverlay) {
        crtOverlay.classList.add('scrolling');
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => { crtOverlay.classList.remove('scrolling'); }, 150);
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
        toast.querySelector('h4').innerText = title;
        toast.querySelector('p').innerText = desc;
        toast.classList.add('show');
        setTimeout(() => { toast.classList.remove('show'); }, 4000);
    }
}

// TROPHÉE EXPLORATION 100%
const contactSection = document.getElementById('contact');
let portfolioExplored = false;
const achievementObserver = new IntersectionObserver((entries) => {
    if(entries[0] && entries[0].isIntersecting && !portfolioExplored) {
        portfolioExplored = true;
        const title = document.documentElement.lang === 'fr' ? "SUCCÈS DÉVERROUILLÉ" : "ACHIEVEMENT UNLOCKED";
        const desc = document.documentElement.lang === 'fr' ? "A exploré le portfolio à 100% !" : "Explored the portfolio to 100% !";
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
// 7. SCRAMBLE TEXT (SÉCURISÉ)
// =========================================
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
function scrambleText(element, force = false) {
    if(!element || element.classList.contains('no-scramble')) return; 
    if(element.dataset.scrambled === "true" && !force) return;
    
    const original = element.getAttribute('data-value') || element.innerText;
    if(!original) return; 
    
    element.dataset.scrambled = "true";
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
// 8. GESTION MODALES PROJETS
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
        if(window.resetCyberCamera) window.resetCyberCamera();
    }
};

window.onclick = function(e) { if (e.target == modal) closeModal(); };

// =========================================
// 9. BOUTON HERO HYPERSPACE
// =========================================
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

// ========================================================
// 10. MOTEUR 3D DES PROJETS (HUD CLAIR & IMAGES)
// ========================================================
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById('cyberspace-container');
    if (!container) return;

    // --- DONNÉES CLAIRES (COULEURS + RÔLES) ---
    const cyberNodes = [
        { id: 'modal-synergy', name: "SYNERGY OS v95.0", category: "PUZZLE / OS SIMULATOR", team: "PROJET SOLO", color: 0x00fff9, css: "var(--cyan)", pos: [0, 0, 5], image: "synergy1.png", roles: ["GAME DESIGN", "LEVEL DESIGN", "UX", "3C"] },
        { id: 'modal-dusked', name: "DUSKED", category: "JEU DE RYTHME", team: "PROJET DE GROUPE", color: 0xff00c1, css: "var(--magenta)", pos: [-6, 0, -2], image: "dusked1.png", roles: ["GAME DESIGN", "LEVEL DESIGN", "INTÉGRATION"] },
        { id: 'modal-fling', name: "FLING", category: "PLATEFORME 2.5D", team: "PROJET DE GROUPE", color: 0xff00c1, css: "var(--magenta)", pos: [6, 0, -3], image: "fling1.png", roles: ["LEVEL DESIGN", "GAME DESIGN", "INTÉGRATION"] },
        { id: 'modal-kenjiro', name: "KENJIRO", category: "ONE BUTTON GAME", team: "PROJET SOLO", color: 0x00fff9, css: "var(--cyan)", pos: [-9, 0, 4], image: "kenjiro.png", roles: ["GAME DESIGN", "LEVEL DESIGN", "VS", "3C"] },
        { id: 'modal-killer', name: "KILLER SHARK FROM OUTER SPACE", category: "ACTION / BRAWLER", team: "PROJET DE GROUPE", color: 0xff00c1, css: "var(--magenta)", pos: [9, 0, 4], image: "killer1.png", roles: ["COMBAT DESIGN", "GAME FEEL", "JUICE"] },
        { id: 'modal-moonpact', name: "MOON PACT", category: "BOARD GAME", team: "PROJET DE GROUPE", color: 0xff00c1, css: "var(--magenta)", pos: [-3, 0, -8], image: "moonpact1.png", roles: ["GAME DESIGN", "ÉQUILIBRAGE"] },
        { id: 'modal-shapeshooter', name: "SPEC WAR", category: "SHOOTER MOBILE", team: "PROJET DE GROUPE", color: 0xff00c1, css: "var(--magenta)", pos: [4, 0, -8], image: "shape1.png", roles: ["GAME DESIGN", "MONÉTISATION"] },
        { id: 'modal-ue5', name: "PROJET NON DÉVOILÉ", category: "UNREAL ENGINE 5", team: "PROJET SOLO", color: 0x555555, css: "#888888", pos: [11, 0, -6], image: "", isLocked: true, roles: ["GAME DESIGN", "LEVEL DESIGN", "3C"] }
    ];

    // --- SCÈNE & CAMÉRA ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020205, 0.035);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    const initialCamPos = { x: 0, y: 10, z: 18 };
    camera.position.set(initialCamPos.x, initialCamPos.y, initialCamPos.z);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    // OPTIMISATION MOBILE : Ratio max limité à 1.5 pour fluidité
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false; 
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.minPolarAngle = Math.PI / 6;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Sur mobile on désactive la rotation via swipe pour ne pas bloquer le scroll de la page web !
    if(window.innerWidth < 992) {
        controls.enableRotate = false;
    }

    // --- OCÉAN DYNAMIQUE ---
    const gridGeo = new THREE.PlaneGeometry(120, 120, 45, 45);
    const gridMat = new THREE.MeshBasicMaterial({ color: 0x00fff9, wireframe: true, transparent: true, opacity: 0.18 });
    const cyberOcean = new THREE.Mesh(gridGeo, gridMat);
    cyberOcean.rotation.x = -Math.PI / 2;
    cyberOcean.position.y = -1;
    scene.add(cyberOcean);

    const oceanVertices = cyberOcean.geometry.attributes.position.array;
    const oceanBaseZ = [];
    for (let i = 0; i < oceanVertices.length; i += 3) { oceanBaseZ.push(oceanVertices[i + 2]); }

    // --- GÉNÉRATION DES PROJETS AVEC HITBOX INVISIBLE ---
    const nodeObjects = [];
    cyberNodes.forEach((node) => {
        const group = new THREE.Group();
        group.position.set(node.pos[0], node.pos[1], node.pos[2]);

        const hitboxGeo = new THREE.SphereGeometry(3.5, 16, 16);
        const hitboxMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
        const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
        hitbox.userData = node; 
        group.add(hitbox);

        const baseGeo = new THREE.CylinderGeometry(1.6, 1.3, 0.6, 6);
        const baseMat = new THREE.MeshBasicMaterial({ color: 0x05050a });
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);
        
        const edges = new THREE.EdgesGeometry(baseGeo);
        const lineMat = node.isLocked ? new THREE.LineDashedMaterial({ color: node.color, dashSize: 0.2, gapSize: 0.1 }) : new THREE.LineBasicMaterial({ color: node.color, linewidth: 2 });
        const wireframeBase = new THREE.LineSegments(edges, lineMat);
        if(node.isLocked) wireframeBase.computeLineDistances();
        baseMesh.add(wireframeBase);
        group.add(baseMesh);

        const crystalGeo = new THREE.OctahedronGeometry(1.1, 0);
        const crystalMat = new THREE.MeshBasicMaterial({ color: node.color, wireframe: true });
        const crystal = new THREE.Mesh(crystalGeo, crystalMat);
        crystal.position.y = 1.6;

        const coreMat = new THREE.MeshBasicMaterial({ color: 0x020205, transparent: true, opacity: 0.85 });
        const core = new THREE.Mesh(crystalGeo, coreMat);
        crystal.add(core);
        group.add(crystal);

        const ringGeo = new THREE.TorusGeometry(2.2, 0.03, 4, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: node.color });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);

        scene.add(group);
        nodeObjects.push({ group, hitbox, crystal, ring, baseY: node.pos[1], data: node });
    });

    const partCount = 800;
    const partGeo = new THREE.BufferGeometry();
    const partPos = new Float32Array(partCount * 3);
    for(let i = 0; i < partCount * 3; i++) { partPos[i] = (Math.random() - 0.5) * 70; }
    partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
    const partMat = new THREE.PointsMaterial({ size: 0.12, color: 0x00fff9, transparent: true, opacity: 0.5 });
    const partSystem = new THREE.Points(partGeo, partMat);
    scene.add(partSystem);

    // --- INTERACTIONS & HUD ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredGroup = null;
    let isCinematicFlying = false;

    const hudTargetName = document.getElementById('cyber-target-name');
    const hudTargetCat = document.getElementById('cyber-target-cat');
    const hudTargetTeam = document.getElementById('cyber-target-team');
    const hudTargetRoles = document.getElementById('cyber-target-roles');
    const hudImgContainer = document.getElementById('cyber-image-container');
    const hudImg = document.getElementById('cyber-hud-image');

    let lastMoveTime = 0;

    container.addEventListener('pointermove', (e) => {
        if (isCinematicFlying) return;
        
        if(Date.now() - lastMoveTime < 30) return;
        lastMoveTime = Date.now();
        
        const rect = container.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(nodeObjects.map(n => n.hitbox));

        if (intersects.length > 0) {
            const hitData = intersects[0].object.userData;
            const targetObj = nodeObjects.find(n => n.data.id === hitData.id);

            if (!hoveredGroup || hoveredGroup.data.id !== hitData.id) {
                hoveredGroup = targetObj;
                const d = hoveredGroup.data;
                
                if(!d || !d.name) return; 
                
                hudTargetName.innerText = d.name;
                hudTargetName.style.color = d.css;
                hudTargetName.style.textShadow = `0 0 15px ${d.css}`;
                
                hudTargetCat.innerText = `// ${d.category} //`;
                hudTargetCat.style.color = d.css;

                hudTargetTeam.innerText = d.team;
                hudTargetTeam.style.display = "inline-block";
                hudTargetTeam.style.color = d.css;
                hudTargetTeam.style.borderColor = d.css;
                hudTargetTeam.style.boxShadow = `0 0 10px ${d.css} inset`;
                
                if(d.roles && d.roles.length > 0 && hudTargetRoles) {
                    hudTargetRoles.innerHTML = d.roles.map(r => `<span class="cyber-role-tag" style="color:${d.css}; border-color:${d.css};">${r}</span>`).join('');
                } else if(hudTargetRoles) {
                    hudTargetRoles.innerHTML = "";
                }
                
                if(d.image && d.image !== "") {
                    hudImg.src = d.image;
                    hudImgContainer.style.display = 'block';
                    hudImgContainer.style.borderColor = d.css;
                    hudImgContainer.style.boxShadow = `0 0 15px ${d.css}`;
                } else {
                    hudImgContainer.style.display = 'none';
                }
                
                container.style.cursor = 'pointer';
                gsap.to(hoveredGroup.group.scale, { x: 1.25, y: 1.25, z: 1.25, duration: 0.3, ease: "back.out(1.7)" });
            }
        } else {
            if (hoveredGroup) {
                gsap.to(hoveredGroup.group.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
                hoveredGroup = null;
                
                hudTargetName.innerText = (!isDesktop) ? "SÉLECTIONNEZ UN PROJET" : "SURVOLEZ UN PROJET";
                hudTargetName.style.color = "var(--cyan)";
                hudTargetName.style.textShadow = "0 0 15px var(--cyan)";
                
                hudTargetCat.innerText = "// EN ATTENTE //";
                hudTargetCat.style.color = "var(--magenta)";
                
                hudTargetTeam.style.display = "none";
                if(hudTargetRoles) hudTargetRoles.innerHTML = "";
                hudImgContainer.style.display = 'none';
                
                container.style.cursor = 'auto';
            }
        }
    });

    function flyToNode(targetObj) {
        if (isCinematicFlying || !targetObj) return;
        const d = targetObj.data;
        if (!d) return;
        
        isCinematicFlying = true;
        controls.enabled = false;

        const pos = targetObj.group.position;
        hudTargetName.innerText = "OUVERTURE DU PROJET...";

        gsap.to(camera.position, {
            x: pos.x,
            y: pos.y + 1.2,
            z: pos.z + 4.5,
            duration: 1.4,
            ease: "power3.inOut"
        });

        gsap.to(controls.target, {
            x: pos.x,
            y: pos.y + 1.5,
            z: pos.z,
            duration: 1.4,
            ease: "power3.inOut",
            onUpdate: () => controls.update(),
            onComplete: () => { openModal(d.id); }
        });
    }

    container.addEventListener('click', () => {
        if (hoveredGroup) flyToNode(hoveredGroup);
    });

    window.triggerNodeFly = function(modalId) {
        const found = nodeObjects.find(n => n.data.id === modalId);
        if (found) flyToNode(found);
    };

    window.resetCyberCamera = function() {
        gsap.to(camera.position, {
            x: initialCamPos.x,
            y: initialCamPos.y,
            z: initialCamPos.z,
            duration: 1.4,
            ease: "power3.inOut"
        });

        gsap.to(controls.target, {
            x: 0, y: 0, z: 0,
            duration: 1.4,
            ease: "power3.inOut",
            onUpdate: () => controls.update(),
            onComplete: () => {
                if(window.innerWidth >= 992) controls.enableRotate = true;
                
                controls.enabled = true;
                isCinematicFlying = false;
                hoveredGroup = null;
                hudTargetName.innerText = (!isDesktop) ? "SÉLECTIONNEZ UN PROJET" : "SURVOLEZ UN PROJET";
                hudImgContainer.style.display = 'none';
                hudTargetTeam.style.display = "none";
                if(hudTargetRoles) hudTargetRoles.innerHTML = "";
            }
        });
    };

    // --- BOUCLE D'ANIMATION THREE.JS ---
    const clock = new THREE.Clock();

    function renderLoop() {
        requestAnimationFrame(renderLoop);
        const time = clock.getElapsedTime();

        // Sur mobile, la scène tourne toute seule pour que le recruteur puisse tout voir facilement
        if(window.innerWidth < 992 && !isCinematicFlying) {
            scene.rotation.y += 0.0015;
        }

        const positions = cyberOcean.geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const vx = positions.getX(i);
            const vy = positions.getY(i);
            const wave = Math.sin(vx * 0.18 + time) * 0.45 + Math.cos(vy * 0.18 + time) * 0.45;
            positions.setZ(i, oceanBaseZ[i] + wave);
        }
        positions.needsUpdate = true;

        nodeObjects.forEach((item, idx) => {
            const speed = item.data.isLocked ? 1 : 2;
            item.group.position.y = item.baseY + Math.sin(time * speed + idx) * 0.3;
            item.crystal.rotation.y += 0.015;
            item.crystal.rotation.x = Math.sin(time + idx) * 0.15;
            item.ring.rotation.z -= 0.02;
        });

        partSystem.rotation.y = time * 0.025;
        partSystem.position.y = (time * 0.6) % 15;

        controls.update();
        renderer.render(scene, camera);
    }
    renderLoop();

    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
        
        if(window.innerWidth < 992) {
            controls.enableRotate = false;
        } else {
            controls.enableRotate = true;
            scene.rotation.y = 0; 
        }
    });
});