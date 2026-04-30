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
    
    // Custom merge: Survey Data & Prompt -> Processing -> 3D Generation
    const pRodin = getEdgePoint('card-rodin', 'right', svg1);
    const pColor = getEdgePoint('card-color', 'right', svg1);
    const pProcessingLeft = getEdgePoint('card-processing', 'left', svg1);
    const pProcessingRight = getEdgePoint('card-processing', 'right', svg1);
    const pStableLeft = getEdgePoint('card-stable', 'left', svg1);

    if (pRodin && pColor && pProcessingLeft && pProcessingRight && pStableLeft) {
      // Draw from left cards to the processing box
      drawLine(pRodin, pProcessingLeft, svg1, NS, 'right', 'left');
      drawLine(pColor, pProcessingLeft, svg1, NS, 'right', 'left');
      
      // Draw from the processing box to the 3D Generation card
      drawLine(pProcessingRight, pStableLeft, svg1, NS, 'right', 'left');
    }

    // Standard connections for the rest
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


/* ── Bridge Components Interaction ───────────────────────────────────────── */
const bridgeData = {
  "open-web-girder": {
    name: "Open Web Girder",
    mainImage: "assets/Bridges/open-web-girder.jpeg",
    views: [
      { label: "Soffit", src: "assets/Bridges/open-web-girder.jpeg" },
      { label: "Elevation", src: "assets/Bridges/bridges/owg/Elevation.png" },
      { label: "Plan", src: "assets/Bridges/bridges/owg/Plan.png" },
      { label: "Cross Section", src: "assets/Bridges/bridges/owg/Cross Section.png" },
      { label: "Half Top / Half Bottom", src: "assets/Bridges/bridges/owg/Top-Bottom.png" }
    ]
  },
  "road-over-bridge": {
    name: "Road Over Bridge",
    mainImage: "assets/Bridges/road-over-bridge.jpeg",
    views: [
      { label: "Soffit", src: "assets/Bridges/bridges/rob/soffit.png" },
      { label: "Elevation", src: "assets/Bridges/bridges/rob/elevation (2).png" },
      { label: "Plan", src: "assets/Bridges/bridges/rob/plan.png" },
      { label: "Cross Section", src: "assets/Bridges/bridges/rob/cross section.png" },
      { label: "Half Top / Half Bottom", src: "assets/Bridges/bridges/rob/half top-half bottom.png" }
    ]
  },
  "psc-slab": {
    name: "PSC Slab",
    mainImage: "assets/Bridges/psc-slab.jpeg",
    views: [
      { label: "Soffit", src: "assets/Bridges/bridges/psc/soffit.png" },
      { label: "Elevation", src: "assets/Bridges/bridges/psc/Elevation.png" },
      { label: "Plan", src: "assets/Bridges/bridges/psc/Plan.png" },
      { label: "Cross Section", src: "assets/Bridges/bridges/psc/Cross section.png" },
      { label: "Half Top / Half Bottom", src: "assets/Bridges/bridges/psc/half top-half bottom.png" }
    ]
  },
  "composite-girder": {
    name: "Composite Girder",
    mainImage: "assets/Bridges/composite-girder.jpeg",
    views: [
      { label: "Soffit", src: "assets/Bridges/composite-girder.jpeg" },
      { label: "Elevation", src: "assets/Bridges/bridges/composite/Elevation (2).png" },
      { label: "Plan", src: "assets/Bridges/bridges/composite/Plan.png" },
      { label: "Cross Section", src: "assets/bridge-images/images/ChatGPT Image Apr 23, 2026, 03_21_13 PM.png" },
      { label: "Half Top / Half Bottom", src: "assets/bridge-images/images/ChatGPT Image Apr 23, 2026, 03_24_53 PM.png" }
    ]
  },
  "rcc-box": {
    name: "RCC Box",
    mainImage: "assets/Bridges/rcc-box.jpeg",
    views: [
      { label: "Soffit", src: "assets/Bridges/rcc-box.jpeg" },
      { label: "Elevation", src: "assets/Bridges/bridges/rcc/side elevation.png" },
      { label: "Plan", src: "assets/Bridges/bridges/rcc/Plan Top.png" },
      { label: "Cross Section", src: "assets/Bridges/bridges/rcc/rcc section.png" },
      { label: "Half Top / Half Bottom", src: "assets/Bridges/bridges/rcc/half section.png" }
    ]
  }
};

const img = document.getElementById("mainImage");
const bridgeBtns = document.querySelectorAll('.bridge-btn');
const viewBtns = document.querySelectorAll('.view-btn');

const bridgeKeys = Object.keys(bridgeData);
let currentBridgeIndex = 0;
let currentViewIndex = -1; // -1 means main bridge image, 0-4 means view images
let activeBridgeId = bridgeKeys[0];
let activeViewSrc = null;
let autoSlideInterval = null;
let resumeTimeout = null;

function changeImage(src) {
  if (!img) return;
  const safeSrc = src.trim();
  if (img.src.endsWith(safeSrc)) return; 
  
  img.style.opacity = 0;
  setTimeout(() => {
    img.src = safeSrc;
    img.style.opacity = 1;
  }, 100);
}

function updateActiveBridge(bridgeId, viewIndex = -1) {
  activeBridgeId = bridgeId;
  currentBridgeIndex = bridgeKeys.indexOf(bridgeId);
  currentViewIndex = viewIndex;
  
  const bridge = bridgeData[bridgeId];
  if (!bridge) return;

  // Set active class on bridge buttons
  bridgeBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.bridgeId === bridgeId);
  });

  // Update view buttons texts and data-img
  viewBtns.forEach(btn => {
    const index = parseInt(btn.dataset.viewIndex, 10);
    const viewInfo = bridge.views[index];
    if (viewInfo) {
      btn.textContent = viewInfo.label;
      btn.dataset.img = viewInfo.src;
    }
    // Set active state for views
    btn.classList.toggle('active', index === viewIndex);
  });

  if (viewIndex === -1) {
    activeViewSrc = null;
    changeImage(bridge.mainImage);
  } else {
    activeViewSrc = bridge.views[viewIndex].src;
    changeImage(activeViewSrc);
  }
}

function nextSlide() {
  const bridge = bridgeData[bridgeKeys[currentBridgeIndex]];
  currentViewIndex++;
  
  if (currentViewIndex >= bridge.views.length) {
    // Move to next bridge
    currentBridgeIndex = (currentBridgeIndex + 1) % bridgeKeys.length;
    updateActiveBridge(bridgeKeys[currentBridgeIndex], -1);
  } else {
    // Show next view
    updateActiveBridge(bridgeKeys[currentBridgeIndex], currentViewIndex);
  }
}

function startAutoSlide() {
  stopAutoSlide();
  if (resumeTimeout) {
    clearTimeout(resumeTimeout);
    resumeTimeout = null;
  }
  autoSlideInterval = setInterval(nextSlide, 1500); // Change image every 1.5 seconds
}

function stopAutoSlide() {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval);
    autoSlideInterval = null;
  }
}

function pauseAutoSlide() {
  stopAutoSlide(); // Stop the interval
  if (resumeTimeout) {
    clearTimeout(resumeTimeout);
  }
  // Resume after 5 seconds
  resumeTimeout = setTimeout(() => {
    startAutoSlide();
  }, 5000);
}

// Event listeners for Bridge Buttons
bridgeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    pauseAutoSlide();
    updateActiveBridge(btn.dataset.bridgeId, -1);
  });
});

// Event listeners for View Buttons
viewBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    pauseAutoSlide();
    const index = parseInt(btn.dataset.viewIndex, 10);
    const isActive = btn.classList.contains('active');
    
    if (isActive) {
      // Toggle off -> go back to main bridge image
      updateActiveBridge(activeBridgeId, -1);
    } else {
      // Toggle on -> lock this view
      updateActiveBridge(activeBridgeId, index);
    }
  });
});

// Initialize on load
if (img && bridgeBtns.length > 0) {
  updateActiveBridge(bridgeKeys[0], -1);
  startAutoSlide();
}


function scrollCards(direction) {
  const grid = document.getElementById('cardsGrid');
  const cardWidth = grid.querySelector('.card').offsetWidth + 20;
  grid.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
}






// image preload
const hoverImages = [
  "assets/Bridges/open-web-girder.jpeg",
  "assets/Bridges/road-over-bridge.jpeg",
  "assets/Bridges/psc-slab.jpeg",
  "assets/Bridges/composite-girder.jpeg",
  "assets/Bridges/rcc-box.jpeg",
  "assets/bridge-images/images/ChatGPT Image Apr 23, 2026, 03_20_05 PM.png ",
  "assets/bridge-images/images/ChatGPT Image Apr 23, 2026, 03_21_13 PM.png",
  "assets/bridge-images/images/ChatGPT Image Apr 23, 2026, 03_24_53 PM.png",
  "assets/bridge-images/images/owg-elevation.png",
  "assets/bridge-images/images/owg-plan.png"
];

const preloadedHoverImages = [];

// Delay image preloading until after initial page load
window.addEventListener('load', () => {
  hoverImages.forEach(src => {
    const img = new Image();
    img.src = src;
    preloadedHoverImages.push(img);
  });
});

/* ── Lazy Load Videos ─────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  const lazyVideos = document.querySelectorAll("video.lazy-video");

  if ("IntersectionObserver" in window) {
    const lazyVideoObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(video => {
        if (video.isIntersecting) {
          const videoElement = video.target;
          for (let source in videoElement.children) {
            const videoSource = videoElement.children[source];
            if (typeof videoSource.tagName === "string" && videoSource.tagName === "SOURCE") {
              videoSource.src = videoSource.dataset.src;
            }
          }
          videoElement.load();
          videoElement.play();
          videoElement.classList.remove("lazy-video");
          lazyVideoObserver.unobserve(videoElement);
        }
      });
    });

    lazyVideos.forEach(lazyVideo => {
      lazyVideoObserver.observe(lazyVideo);
    });
  }
});

/* ── Bridge Gallery Section ── */
(function(){
const BRIDGES = [
  {
    id:'suspension',
    name:'Open WEb Grider',
    icon:'assets/icon/ICON/ICONS_OWG.svg',
    images:[
      {url:'assets/bridges-2/bridges/owg/Ele 2/elevation_resized_400x300.png',title:'Elevation',desc:'San Francisco, California — opened 1937'},
      {url:'assets/bridges-2/bridges/owg/Half 3/half_top_bottom_resized_400x300.png',title:'Half Top / Half Bottom',desc:'Classic main cable & hanger rod system'},
      {url:'assets/bridges-2/bridges/owg/Plan 4/longitudinal_plan_resized_400x300.png',title:'Plan',desc:'Concrete pylons anchoring 250m main span'},
      {url:'assets/bridges-2/bridges/owg/Cross 1/cross_section_resized_400x300.png',title:'Cross section',desc:'Illuminated hangers reflect on the water below'},
      // {url:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=80',title:'Soffit',desc:'Remote 180m suspension crossing, built 2001'},
    ]
  },
  {
    id:'arch',
    name:'Road Over Bridge',
    icon:'assets/icon/ICON/ICONS_ROB.svg',
    images:[
      {url:'assets/bridges-2/bridges/rob/Ele 2/elevation2_resized_400x300.png',title:'Elevation',desc:'Single-rib through-arch, 305m span'},
      {url:'assets/bridges-2/bridges/rob/Half 3/half_top_bottom2_resized_400x300.png',title:'Half Top / Half Bottom',desc:'Roman masonry arch — still in use after 2,000 years'},
      {url:'assets/bridges-2/bridges/rob/Plan 4/plan3_resized_400x300.png',title:'Plan',desc:'Tied-arch design over an urban waterway'},
      {url:'assets/bridges-2/bridges/rob/Cross 1/cross_section2_resized_400x300.png',title:'Cross Section',desc:'Gorge arch in granite, 92m rise'},
      {url:'assets/bridges-2/bridges/rob/Soffit 5/soffit1_resized_400x300.png',title:'Soffit',desc:'Welded steel half-arch, asymmetric profile'},
    ]
  },
  {
    id:'cable',
    name:'PSC Slab',
    icon:'assets/icon/ICON/ICONS_PSC.svg',
    images:[
      {url:'assets/bridges-2/bridges/psc/Ele 2/elevation1_resized_400x300.png',title:'Elevation',desc:'Millau-inspired harp-fan cable arrangement'},
      {url:'assets/bridges-2/bridges/psc/Half 3/half_top_bottom1_resized_400x300.png',title:'Half Top / Half Bottom',desc:'LED-lit pylons, 220m tall, delta cable pattern'},
      {url:'assets/bridges-2/bridges/psc/Plan 4/plan2_resized_400x300.png',title:'Plan',desc:'Post-tension galvanised wire bundles, 127 stays'},
      {url:'assets/bridges-2/bridges/psc/Cross 1/cross_section1_resized_400x300.png',title:'Cross Section',desc:'A-frame pylon over navigable river channel'},
      {url:'assets/bridges-2/bridges/psc/Soffit 5/soffit_resized_400x300.png',title:'Soffit',desc:'Composite deck, 400m main span, built 2009'},
    ]
  },
  {
    id:'beam',
    name:'RCC Box',
    icon:'assets/icon/ICON/ICONS_RCC.svg',
    images:[
      {url:'assets/bridges-2/bridges/rcc/Side 4/side_elevation_resized_400x300.png',title:'Elevation',desc:'Precast prestressed beams, 38m typical span'},
      {url:'assets/bridges-2/bridges/rcc/Half 1/half_section_resized_400x300.png',title:'Half Top / Half Bottom',desc:'Continuous box-girder over tidal estuary'},
      {url:'assets/bridges-2/bridges/rcc/Plan 2/plan_top_resized_400x300.png',title:'Plan',desc:'12-span beam bridge, cast-in-place slab'},
      {url:'assets/bridges-2/bridges/rcc/RCC 3/rcc_section_resized_400x300.png',title:'Cross Section',desc:'Glulam laminated timber, small rural crossing'},
      // {url:'https://images.unsplash.com/photo-1476304884326-cd2c88572c5f?w=700&q=80',title:'Soffit',desc:'Horizontally curved steel girder, 6-lane urban'},
    ]
  },
  {
    id:'truss',
    name:'Composite Girder',
    icon:'assets/icon/ICON/ICONS_Composite grider.svg',
    images:[
      {url:'assets/bridges-2/bridges/composite/Ele 1/ChatGPT Image Apr 29, 2026, 05_59_41 PM.png',title:'Elevation',desc:'Wrought iron Pratt truss, converted to trail use'},
      {url:'assets/bridges-2/bridges/composite/Half 2/resized_400x300.png',title:'Half Top / Half Bottom',desc:'Equilateral triangles, no verticals, 1880 design'},
      {url:'assets/bridges-2/bridges/composite/Plan 3/plan_resized_400x300.png',title:'Plan',desc:'Sub-divided panels for longer 19th-century spans'},
      // {url:'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&q=80',title:'Cross Section',desc:'Camelback Pratt, varying top-chord elevation'},
      // {url:'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?w=700&q=80',title:'Soffit',desc:'Welded K-truss on urban transit corridor, 2015'},
    ]
  }
];

let activeBridge = 0;
let activeCar    = 2;

const typeBar = document.getElementById('typeBar');
const track   = document.getElementById('track');
const dotsEl  = document.getElementById('dots');

/* ── build type tabs ── */
BRIDGES.forEach((b,i)=>{
  const btn = document.createElement('button');
  btn.className = 'type-btn' + (i===0?' active':'');
  btn.innerHTML = `
    <img class="type-icon" src="${b.icon}" alt="${b.name}">
    <span class="type-name">${b.name}</span>
    <span class="type-count">${b.images.length} views</span>`;
  btn.addEventListener('click',()=>{switchBridge(i);pauseAutoAdvance();});
  typeBar.appendChild(btn);
});

/* ── build cards ── */
function buildCards(){
  track.innerHTML='';
  const imgs = BRIDGES[activeBridge].images;
  imgs.forEach((img,i)=>{
    const c = document.createElement('div');
    c.className='bg-card';
    c.dataset.i=i;
    c.innerHTML=`
      <img src="${img.url}" alt="${img.title}" loading="lazy" draggable="false">
      <span class="card-num">${String(i+1).padStart(2,'0')} / ${imgs.length}</span>
      <div class="cov">
        <span class="cov-num">${BRIDGES[activeBridge].name} bridge &middot; ${img.title} view</span>
      </div>`;
    c.addEventListener('click',()=>{pauseAutoAdvance();goTo(i);});
    track.appendChild(c);
  });
}

/* ── build dots ── */
function buildDots(){
  dotsEl.innerHTML='';
  BRIDGES[activeBridge].images.forEach((_,i)=>{
    const d=document.createElement('div');
    d.className='dot';
    d.addEventListener('click',()=>{pauseAutoAdvance();goTo(i);});
    dotsEl.appendChild(d);
  });
}

/* positions for 5 slots */
const POS=[
  {tx:-420,tz:-200,ry:40,s:0.65,op:0.3,z:1},
  {tx:-210,tz:-95, ry:22,s:0.82,op:0.62,z:3},
  {tx:0,   tz:0,   ry:0, s:1,   op:1,  z:5},
  {tx:210, tz:-95, ry:-22,s:0.82,op:0.62,z:3},
  {tx:420, tz:-200,ry:-40,s:0.65,op:0.3,z:1},
];

function render(){
  const cards=track.querySelectorAll('.bg-card');
  const dots=dotsEl.querySelectorAll('.dot');
  const N=BRIDGES[activeBridge].images.length;

  cards.forEach((c,i)=>{
    let rel=i-activeCar;
    if(rel<-2) rel+=N;
    if(rel>2)  rel-=N;
    const inView=rel>=-2&&rel<=2;
    if(!inView){c.style.opacity='0';c.style.pointerEvents='none';c.style.zIndex='0';return;}
    const {tx,tz,ry,s,op,z}=POS[rel+2];
    c.style.transform=`translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) scale(${s})`;
    c.style.opacity=op;
    c.style.zIndex=z;
    c.style.pointerEvents='all';
    c.classList.toggle('active',rel===0);
  });

  dots.forEach((d,i)=>d.classList.toggle('active',i===activeCar));

  const cur = BRIDGES[activeBridge].images[activeCar];
  document.getElementById('infoTitle').textContent=cur.title;
  document.getElementById('infoDesc').textContent=cur.desc;
}

function goTo(idx){
  const N=BRIDGES[activeBridge].images.length;
  activeCar=((idx%N)+N)%N;
  render();
}

function switchBridge(idx, startCar = 0){
  if(idx===activeBridge) return;
  activeBridge=idx;
  activeCar=startCar;
  track.classList.add('switching');
  setTimeout(()=>{
    buildCards();
    buildDots();
    track.classList.remove('switching');
    render();
  },50);
  document.querySelectorAll('.type-btn').forEach((b,i)=>b.classList.toggle('active',i===idx));
}

document.getElementById('prev').addEventListener('click',()=>{pauseAutoAdvance();goTo(activeCar-1);});
document.getElementById('next').addEventListener('click',()=>{pauseAutoAdvance();goTo(activeCar+1);});
document.addEventListener('keydown',e=>{
  if(e.key==='ArrowLeft')  goTo(activeCar-1);
  if(e.key==='ArrowRight') goTo(activeCar+1);
  if(e.key==='ArrowUp' || e.key==='ArrowDown'){
    const dir = e.key==='ArrowUp'?-1:1;
    switchBridge((activeBridge+dir+BRIDGES.length)%BRIDGES.length);
  }
});

let sx=0;
track.addEventListener('touchstart',e=>{sx=e.touches[0].clientX},{passive:true});
track.addEventListener('touchend',e=>{
  const dx=e.changedTouches[0].clientX-sx;
  if(Math.abs(dx)>40) dx<0?goTo(activeCar+1):goTo(activeCar-1);
});

function autoAdvance() {
  const N = BRIDGES[activeBridge].images.length;
  if (activeCar + 1 >= N) {
    const nextBridgeIdx = (activeBridge + 1) % BRIDGES.length;
    switchBridge(nextBridgeIdx, 0); 
  } else {
    goTo(activeCar + 1);
  }
}

let timer=setInterval(autoAdvance,1000);let resumeTimer=null;

function pauseAutoAdvance(){
  clearInterval(timer);
  timer=null;
  if(resumeTimer) clearTimeout(resumeTimer);
  resumeTimer=setTimeout(()=>{
    timer=setInterval(autoAdvance,1000);
    resumeTimer=null;
  },5000);
}


buildCards();
buildDots();
render();
})();
