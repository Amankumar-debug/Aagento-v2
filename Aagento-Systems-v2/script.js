/* ── Hamburger / Mobile Menu ────────────────────────────────────────────────
   Toggles .is-open on both the button and the drawer.
   Also closes the menu when any mobile link is clicked.
   ────────────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!hamburger || !mobileMenu) return;

  function toggleMenu() {
    const isOpen = hamburger.classList.toggle('is-open');
    mobileMenu.classList.toggle('is-open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  }

  function closeMenu() {
    hamburger.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger.addEventListener('click', toggleMenu);

  // Close drawer when a link is tapped
  mobileMenu.querySelectorAll('.mobile-nav-link, .mobile-cta').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close when clicking outside the menu/hamburger
  document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
      closeMenu();
    }
  });
});

/* ── Node thread connections ────────────────────────────────────────────────
   All drawing is inside the SVG overlay — zero impact on card layout/size.
   Each entry: [fromCardId, 'right'|'left', toCardId, 'right'|'left']
   ────────────────────────────────────────────────────────────────────────── */
const NODE_CONNECTIONS = [
  ['card-rodin',  'right', 'card-stable', 'left'],
  ['card-color',  'right', 'card-stable', 'left'],
  ['card-stable', 'right', 'card-text',   'left'],
  ['card-stable', 'right', 'card-flux',   'left'],
  ['card-text',   'right', 'card-video',  'left'],
  ['card-flux',   'right', 'card-video',  'left'],
];

function getEdgePoint(cardId, side, svgElem, offsetFraction = 0.5) {
  const card = document.getElementById(cardId);
  if (!card || !svgElem) return null;
  const svgR  = svgElem.getBoundingClientRect();
  const cardR = card.getBoundingClientRect();
  
  if (side === 'bottom') {
    return {
      x: cardR.left + cardR.width * offsetFraction - svgR.left,
      y: cardR.bottom - svgR.top
    };
  } else if (side === 'top') {
    return {
      x: cardR.left + cardR.width * offsetFraction - svgR.left,
      y: cardR.top - svgR.top
    };
  }
  
  return {
    x: (side === 'right' ? cardR.right : cardR.left) - svgR.left,
    y: cardR.top + cardR.height * offsetFraction - svgR.top,
  };
}

function drawLine(p1, p2, svg, NS, fromSide = 'right', toSide = 'left') {
  if (!p1 || !p2) return;
  const dx = Math.max(Math.abs(p2.x - p1.x) * 0.45, 60);
  
  let cp1x = p1.x + dx;
  let cp2x = p2.x - dx;
  
  if (fromSide === 'left') cp1x = p1.x - dx;
  if (toSide === 'right') cp2x = p2.x + dx;

  const d  = `M ${p1.x} ${p1.y} C ${cp1x} ${p1.y}, ${cp2x} ${p2.y}, ${p2.x} ${p2.y}`;

  const path = document.createElementNS(NS, 'path');
  path.setAttribute('d', d);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', '#aaaaaa');
  path.setAttribute('stroke-width', '1.5');
  path.setAttribute('stroke-dasharray', '5 4');
  path.setAttribute('stroke-dashoffset', '0');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('opacity', '0.85');
  path.classList.add('node-thread');
  svg.appendChild(path);

  [p1, p2].forEach(p => {
    const dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('cx', p.x);
    dot.setAttribute('cy', p.y);
    dot.setAttribute('r', '4');
    dot.setAttribute('fill', '#ffffff');
    dot.setAttribute('stroke', '#999999');
    dot.setAttribute('stroke-width', '1.5');
    svg.appendChild(dot);
  });
}

function drawNodeConnections() {
  const NS = 'http://www.w3.org/2000/svg';

  // First scene
  const svg1 = document.getElementById('node-svg');
  if (svg1) {
    svg1.innerHTML = '';
    NODE_CONNECTIONS.forEach(([fromId, fromSide, toId, toSide]) => {
      const p1 = getEdgePoint(fromId, fromSide, svg1);
      const p2 = getEdgePoint(toId, toSide, svg1);
      drawLine(p1, p2, svg1, NS, fromSide, toSide);
    });
  }

  // Second scene (Why Aagento)
  const svg2 = document.getElementById('node-svg-2');
  if (svg2) {
    svg2.innerHTML = '';
    const isMobile = window.innerWidth <= 768;
    const whyConnections = isMobile 
      ? [
          ['why-card-stable', 'left', 'why-card-text', 'left'],
          ['why-card-stable', 'left', 'why-card-flux', 'left']
        ]
      : [
          ['why-card-stable', 'right', 'why-card-text', 'left'],
          ['why-card-stable', 'right', 'why-card-flux', 'left']
        ];
        
    whyConnections.forEach(([fromId, fromSide, toId, toSide]) => {
      const p1 = getEdgePoint(fromId, fromSide, svg2);
      const p2 = getEdgePoint(toId, toSide, svg2);
      drawLine(p1, p2, svg2, NS, fromSide, toSide);
    });
  }
}

// Draw once layout is painted, redraw on resize
window.addEventListener('load',   drawNodeConnections);
window.addEventListener('resize', drawNodeConnections);

/* ── Hero Parallax Mouse Effect ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const hero = document.querySelector('.hero');
  const heroBg = document.getElementById('hero-bg');

  if (hero && heroBg) {
    hero.addEventListener('mousemove', (e) => {
      // Calculate mouse position relative to the center of the viewport
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      
      // Move background slightly in the opposite direction
      // Max displacement is 1.5% of viewport width/height
      const moveX = (x - 0.5) * 2; 
      const moveY = (y - 0.5) * 2;

      heroBg.style.transform = `translate(${-moveX}%, ${-moveY}%)`;
    });

    // Reset when mouse leaves
    hero.addEventListener('mouseleave', () => {
      heroBg.style.transform = `translate(0, 0)`;
    });
  }
});

/* ─────────────────────────────────────────────────────────────────────────── */

// const canvas = document.getElementById("canvas");
// const context = canvas.getContext("2d");


// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;

// const frameCount = 200; // number of images

// const currentFrame = index => 
//   `assets/ezgif-89ca856d59fc8554-png-split/ezgif-frame-${index.toString().padStart(3, '0')}.png`;

// const images = [];
// let currentImage = 0;

// // preload images
// for (let i = 1; i <= frameCount; i++) {
//   const img = new Image();
//   img.src = currentFrame(i);
//   images.push(img);
// }

// // draw first frame
// images[0].onload = () => {
//   context.drawImage(images[0], 0, 0, canvas.width, canvas.height);
// };

// // scroll animation
// window.addEventListener("scroll", () => {
//   const scrollTop = window.scrollY;
//   const maxScroll = document.body.scrollHeight - window.innerHeight;

//   const scrollFraction = scrollTop / maxScroll;
//   const frameIndex = Math.min(
//     frameCount - 1,
//     Math.floor(scrollFraction * frameCount)
//   );

//   if (frameIndex !== currentImage) {
//     currentImage = frameIndex;
//     context.clearRect(0, 0, canvas.width, canvas.height);
//     context.drawImage(images[frameIndex], 0, 0, canvas.width, canvas.height);
//   }
// });

const canvas = document.getElementById("canvas");
if (canvas) {
  const context = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawFrame(currentImage);
  }

  window.addEventListener("resize", resizeCanvas);

  const frameCount = 200;

  const currentFrame = index =>
    `assets/ezgif-89ca856d59fc8554-png-split/ezgif-frame-${index.toString().padStart(3, '0')}.png`;

  const images = [];
  let currentImage = 0;

  for (let i = 1; i <= frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    images.push(img);
  }

  function drawFrame(index) {
    const img = images[index];
    if (!img || !img.complete) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  images[0].onload = () => {
    resizeCanvas();
  };

  function updateOnScroll() {
    const section = document.querySelector(".scroll-section");
    if (!section) return; // Add check just in case
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const scrollY = window.scrollY;

    const start = sectionTop;
    const end = sectionTop + sectionHeight - window.innerHeight;

    let progress = (scrollY - start) / (end - start);
    progress = Math.max(0, Math.min(1, progress));

    const frameIndex = Math.floor(progress * (frameCount - 1));

    if (frameIndex !== currentImage) {
      currentImage = frameIndex;
      requestAnimationFrame(() => drawFrame(frameIndex));
    }
  }

  window.addEventListener("scroll", updateOnScroll);
}




// const img = document.getElementById("mainImage");
// const tools = document.querySelectorAll(".tool");

// const defaultImg = img.src;

// function changeImage(newSrc) {
//   img.style.opacity = 0;

//   setTimeout(() => {
//     img.src = newSrc;
//     img.style.opacity = 1;
//   }, 150);
// }

// tools.forEach(tool => {
//   const newImg = tool.dataset.img;

//   tool.addEventListener("mouseenter", () => {
//     changeImage(newImg);
//   });

//   tool.addEventListener("mouseleave", () => {
//     changeImage(defaultImg);
//   });
// });


const img = document.getElementById("mainImage");
const tools = document.querySelectorAll(".tool");

const defaultState = {
  src: img ? img.src : ''   // capture initial src (full URL)
};

function changeImage(src) {
  if (!img) return;
  img.style.opacity = 0;

  setTimeout(() => {
    img.src = src;
    img.style.opacity = 1;
  }, 150);
}

function resetImage() {
  changeImage(defaultState.src);
}

  tools.forEach(tool => {
    // Desktop hover
    tool.addEventListener("mouseenter", () => {
      changeImage(tool.dataset.img);
    });

    tool.addEventListener("mouseleave", () => {
      resetImage();
    });
  });

/* ── Mobile Tool Pills – image swap ────────────────────────────────────────── */
const mobilePills = document.querySelectorAll('.mobile-tool-pill');

mobilePills.forEach(pill => {

  // Hover (works in resized desktop browser / responsive dev tools)
  pill.addEventListener('mouseenter', () => {
    changeImage(pill.dataset.img);
  });

  pill.addEventListener('mouseleave', () => {
    // Only reset if no pill is "locked" active via click/tap
    const hasActive = [...mobilePills].some(p => p.classList.contains('active'));
    if (!hasActive) resetImage();
  });

  // Click / tap (works on real touch devices)
  pill.addEventListener('click', () => {
    const isActive = pill.classList.contains('active');
    mobilePills.forEach(p => p.classList.remove('active'));

    if (isActive) {
      // Deselect → reset to default image
      resetImage();
    } else {
      pill.classList.add('active');
      changeImage(pill.dataset.img);
    }
  });
});


function scrollCards(direction) {
  const grid = document.getElementById('cardsGrid');
  const cardWidth = grid.querySelector('.card').offsetWidth + 20;
  grid.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
}