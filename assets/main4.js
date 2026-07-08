//   _  _          _           _   _          
//  | \| |__ ___ _(_)__ _ __ _| |_(_)___ _ _  
//  | .` / _` \ V / / _` / _` |  _| / _ \ ' \ 
//  |_|\_\__,_|\_/|_\__, \__,_|\__|_\___/_||_|
//                  |___/                     

// to top of page
document.getElementById("yuusha").addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

// skillset section
document.getElementById("navSkill").addEventListener("click", () => {
  document.getElementById("skillset").scrollIntoView({
    behavior: "smooth"
  });
});

// to projects section
document.getElementById("navProjects").addEventListener("click", () => {
  document.getElementById("projects").scrollIntoView({
    behavior: "smooth"
  });
});

// to contact section
document.getElementById("navContact").addEventListener("click", () => {
  document.getElementById("contactme").scrollIntoView({
    behavior: "smooth"
  });
});

//    ___          _   ___           _        _            _   _               _ ____
//   / __|___  ___| | | _ ) __ _    /_\  _ _ (_)_ __  __ _| |_(_)___ _ _  ___ (_)__ /
//  | (__/ _ \/ _ \ | | _ \/ _` |  / _ \| ' \| | '  \/ _` |  _| / _ \ ' \(_-<  _ |_ \
//   \___\___/\___/_| |___/\__, | /_/ \_\_||_|_|_|_|_\__,_|\__|_\___/_||_/__/ (_)___/
//                         |___/                                                     

let isDarkMode = true;

const DARK_MODE = 0x121212;
const LIGHT_MODE = 0x989898;

const button = document.getElementById("toggle-darkmode-lightmode");

const effect = VANTA.WAVES({
  el: "#vanta-bg",
  mouseControls: true,
  touchControls: true,
  gyroControls: true,
  minHeight: 200.00,
  minWidth: 200.00,
  scale: 1.00,
  scaleMobile: 1.00,
  color: 0x121212,
  shininess: 70,
  waveSpeed: 0.5,
  zoom: 1.1
});

function smoothSwitch(from, to, duration = 225) {
  const start = performance.now();

  function animate(now) {
    const t = Math.min((now - start) / duration, 1);

    const r =
      ((from >> 16) & 255) +
      ((((to >> 16) & 255) - ((from >> 16) & 255)) * t);

    const g =
      ((from >> 8) & 255) +
      ((((to >> 8) & 255) - ((from >> 8) & 255)) * t);

    const b =
      (from & 255) +
      (((to & 255) - (from & 255)) * t);

    const color =
      (Math.round(r) << 16) |
      (Math.round(g) << 8) |
      Math.round(b);

    effect.setOptions({ color });

    if (t < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}
        // NOTE: when fixing light/dark mode, remove this code and uncomment code above and below
        // VANTA.WAVES({
        //     el: "#vanta-bg",
        //     mouseControls: true,
        //     touchControls: true,
        //     gyroControls: true,
        //     minHeight: 200.00,
        //     minWidth: 200.00,
        //     scale: 1.00,
        //     scaleMobile: 1.00,
        //     color: 0x121212,
        //     shininess: 70,
        //     waveSpeed: 0.5,
        //     zoom: 1.1
        // });

//    __                     _ _      _   _        _          _     _         _   _            
//   / _|__ _ _ _  __ _  _  | (_)__ _| |_| |_   __| |__ _ _ _| |__ | |__ _  _| |_| |_ ___ _ _  
//  |  _/ _` | ' \/ _| || | | | / _` | ' \  _| / _` / _` | '_| / / | '_ \ || |  _|  _/ _ \ ' \ 
//  |_| \__,_|_||_\__|\_, | |_|_\__, |_||_\__| \__,_\__,_|_| |_\_\ |_.__/\_,_|\__|\__\___/_||_|
//                    |__/      |___/                                                          

// sun/moon SVG icon refs, expects these elements inside the button
const iconCore = document.getElementById("core");
const iconRays = document.getElementById("rays");
const iconCrater = document.getElementById("crater");

function setIconSun() {
  iconCore.style.r = "5";
  iconRays.style.opacity = "1";
  iconRays.style.transform = "rotate(0deg) scale(1)";
  iconCrater.style.opacity = "0";
  iconCrater.setAttribute("cx", "16");
  iconCrater.setAttribute("cy", "9");
  iconCrater.setAttribute("r", "3.5");
  button.setAttribute("aria-label", "Switch to dark mode");
}

function setIconMoon() {
  iconCore.style.r = "7";
  iconRays.style.opacity = "0";
  iconRays.style.transform = "rotate(90deg) scale(0.6)";
  iconCrater.style.opacity = "1";
  iconCrater.setAttribute("cx", "15");
  iconCrater.setAttribute("cy", "8");
  iconCrater.setAttribute("r", "4");
  button.setAttribute("aria-label", "Switch to light mode");
}

button.addEventListener("click", () => {
  const from = isDarkMode ? DARK_MODE : LIGHT_MODE;
  const to = isDarkMode ? LIGHT_MODE : DARK_MODE;

  smoothSwitch(from, to);

  isDarkMode = !isDarkMode;

  isDarkMode ? setIconMoon() : setIconSun();
});

setInterval(cycleText, 3200);

document.addEventListener("DOMContentLoaded", function () {
  setIconMoon(); // start in dark mode

  const navbar = document.querySelector(".mica-navbar");
  const collapse = document.getElementById("navbarNav");

  collapse.addEventListener("show.bs.collapse", function () {
    navbar.classList.add("menu-open");
  });

  collapse.addEventListener("hide.bs.collapse", function () {
    navbar.classList.remove("menu-open");
  });

});

// ah yes, the cycling text
const ctext = document.querySelectorAll(".cycling-text");
let current = 0;

function cycleText() {
  const currentText = ctext[current];

  currentText.classList.remove("c-active");
  currentText.classList.add("c-exit");

  current = (current + 1) % ctext.length;

  const nextText = ctext[current];

  nextText.classList.remove("c-exit");

  setTimeout(() => {
    nextText.classList.add("c-active");
  }, 100);

  setTimeout(() => {
    currentText.classList.remove("c-exit");
  }, 700);
}

//                 _        _                  _                 _    
//   _ __ _ _ ___ (_)___ __| |_ ___  ____ __ _(_)_ __  ___ _ _  (_)___
//  | '_ \ '_/ _ \| / -_) _|  _(_-< (_-< V  V / | '_ \/ -_) '_| | (_-<
//  | .__/_| \___// \___\__|\__/__/ /__/\_/\_/|_| .__/\___|_|(_)/ /__/
//  |_|         |__/                            |_|           |__/    
const projectsSwiper = new Swiper('.projects-section-swiper', {
  slidesPerView: 1,
  spaceBetween: 24,

  loop: true,
  speed: 15000,
  cssEase: 'linear',
  autoplay: {
    delay: 0,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,
  },
  freeMode: {
    enabled: true,
    sticky: false,
  },

  on: {
    touchEnd() {
      this.autoplay.stop();
      setTimeout(() => this.autoplay.start(), 2000); // resume after 2s
    },
  },

  breakpoints: {
    576: { slidesPerView: 1 },
    768: { slidesPerView: 2 },
    992: { slidesPerView: 3 },
  },

  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
});

//   _______    ___               _ _          
//  |__ /   \  | _ \__ _ _ _ __ _| | |__ ___ __
//   |_ \ |) | |  _/ _` | '_/ _` | | / _` \ \ /
//  |___/___/  |_| \__,_|_| \__,_|_|_\__,_/_\_\
// improved tilt handler
document.querySelectorAll('[data-tilt]').forEach((card) => {
  const maxTilt = Number(card.dataset.tiltMax) || 12;
  const scaleOnHover = Number(card.dataset.tiltScale) || 1.02;
  const smooth = Number(card.dataset.tiltSmooth) || 0.12; // lerp factor
  let width = 0, height = 0;
  let cx = 0, cy = 0;
  let targetX = 0, targetY = 0;
  let rafId = null;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function onMove(e) {
    const rect = card.getBoundingClientRect();
    width = rect.width; height = rect.height;
    cx = rect.left + width / 2;
    cy = rect.top + height / 2;
    const x = (e.clientX - cx) / (width / 2); // -1 .. 1
    const y = (e.clientY - cy) / (height / 2); // -1 .. 1
    targetX = clamp(y * -maxTilt, -maxTilt, maxTilt);
    targetY = clamp(x * maxTilt, -maxTilt, maxTilt);
    if (!rafId) tick();
  }

  function tick() {
    rafId = requestAnimationFrame(() => {
      const cur = card._tiltState || { x: 0, y: 0, s: 1 };
      cur.x = lerp(cur.x, targetX, smooth);
      cur.y = lerp(cur.y, targetY, smooth);
      cur.s = lerp(cur.s, scaleOnHover, smooth);
      card.style.transform = `perspective(900px) rotateX(${cur.x}deg) rotateY(${cur.y}deg) scale(${cur.s})`;
      card._tiltState = cur;

      // stop RAF when near target to save work
      if (Math.abs(cur.x - targetX) < 0.01 && Math.abs(cur.y - targetY) < 0.01) {
        rafId = null;
      } else {
        tick();
      }
    });
  }

  function onEnter() {
    card.classList.add('is-hovering');
    // kickstart smoothing
    if (!rafId) tick();
  }

  function onLeave() {
    // animate back to neutral smoothly
    targetX = 0; targetY = 0;
    // scale back to 1
    card.dataset.tiltScale = 1;
    if (!rafId) tick();
    card.classList.remove('is-hovering');
  }

  card.addEventListener('mousemove', onMove, { passive: true });
  card.addEventListener('mouseenter', onEnter);
  card.addEventListener('mouseleave', onLeave);

  // optional: mobile tilt support (device orientation)
  if (window.DeviceOrientationEvent) {
    let enabled = false;
    function handleOrientation(ev) {
      if (!enabled) return;
      const gamma = ev.gamma || 0; // left-to-right tilt [-90,90]
      const beta = ev.beta || 0; // front-to-back tilt [-180,180]
      // normalize and map to small tilt values
      targetY = clamp((gamma / 45) * maxTilt, -maxTilt, maxTilt);
      targetX = clamp((beta / 45) * -maxTilt, -maxTilt, maxTilt);
      if (!rafId) tick();
    }
    // enable on first touch to avoid permission issues
    card.addEventListener('touchstart', () => { enabled = true; }, { once: true });
    window.addEventListener('deviceorientation', handleOrientation);
  }
});

// vanta.js graveyard

// VANTA.NET({
//   el: "#vanta-bg",
//   mouseControls: true,
//   touchControls: true,
//   gyroControls: false,
//   minHeight: 200.00,
//   minWidth: 200.00,
//   scale: 1.0,
//   scaleMobile: 1.0,
//   color: 0x00ffff,
//   backgroundColor: 0x111111
// });

// catppuccin colors
// base: #24273a
// blue: #8aadf4

// testing version
// no longer testing version?!

// VANTA.GLOBE({
//   el: "#vanta-bg",
//   mouseControls: true,
//   touchControls: true,
//   gyroControls: false,
//   minHeight: 200.00,
//   minWidth: 200.00,
//   scale: 1.00,
//   scaleMobile: 1.00,
//   color: 0x7287fd,
//   color2: 0x7287fd,
//   backgroundColor: 0x2d2d2d,
//   size: 0.50
// })

// VANTA.DOTS({
//   el: "#vanta-bg",
//   mouseControls: true,
//   touchControls: true,
//   gyroControls: false,
//   minHeight: 200.00,
//   minWidth: 200.00,
//   scale: 1.00,
//   scaleMobile: 1.00,
//   color: 0x7287fd,
//   backgroundColor: 0x121212,
//   size: 7,
//   showLines: false
// })

// VANTA.NET({
//   el: "#vanta-bg",
//   mouseControls: true,
//   touchControls: true,
//   gyroControls: false,
//   minHeight: 200.00,
//   minWidth: 200.00,
//   scale: 1.00,
//   scaleMobile: 1.00,
//   color: 0x7287fd,
//   backgroundColor: 0x2d2d2d,
//   // spacing: 16,
//   // maxDistance: 20,
//   // points: 10
// })

// VANTA.WAVES({
//   el: "#vanta-bg",
//   mouseControls: true,
//   touchControls: true,
//   gyroControls: false,
//   minHeight: 200.00,
//   minWidth: 200.00,
//   scale: 1.00,
//   scaleMobile: 1.00,
//   color: 0x121212,
//   color2: 0x121212,
//   size: 1
// })