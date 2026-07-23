const ButterflyConfig = {
  mode: "png",
  maxButterflies: 4,
  minSize: 35,
  maxSize: 90,
  minDuration: 12,
  maxDuration: 22,
  flapSpeed: 80
};

const butterflyScript = document.currentScript;
if (butterflyScript?.dataset.butterflyMode) {
  ButterflyConfig.mode = butterflyScript.dataset.butterflyMode;
}

if (butterflyScript?.dataset.butterflyZone) {
  ButterflyConfig.zone = butterflyScript.dataset.butterflyZone;
}

if (butterflyScript?.dataset.butterflyMax) {
  ButterflyConfig.maxButterflies = Number(butterflyScript.dataset.butterflyMax);
}

(function () {
  const assets = {
    pngOpen: "mariposa-alas-abiertas.png",
    pngSemiClosed: "mariposa-alas-semicerradas.png",
    pngClosed: "mariposa-alas-cerradas.png"
  };

  let field = null;
  let fieldHost = null;
  let butterflies = [];
  let animationFrame = 0;
  let running = false;
  const flapFrames = [assets.pngOpen, assets.pngSemiClosed, assets.pngClosed];
  const flapSequence = [0, 1, 2, 1];

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function randomSign() {
    return Math.random() > 0.5 ? 1 : -1;
  }

  function getFieldHost() {
    return document.querySelector(".invitation") || document.querySelector(".cover-card") || document.body;
  }

  function fieldHeight() {
    const host = fieldHost || getFieldHost();
    const totalHeight = Math.max(host.scrollHeight, host.offsetHeight, window.innerHeight);

    if (ButterflyConfig.zone === "lower") {
      return Math.max(280, totalHeight - zoneTop());
    }

    return totalHeight;
  }

  function fieldWidth() {
    const host = fieldHost || getFieldHost();
    return Math.max(host.clientWidth, host.offsetWidth, 320);
  }

  function ensureField() {
    if (field) return field;

    fieldHost = getFieldHost();
    field = document.createElement("div");
    field.className = "butterfly-field";
    if (ButterflyConfig.zone === "lower") {
      field.classList.add("butterfly-field-lower");
      field.style.setProperty("--butterfly-zone-top", `${zoneTop()}px`);
    }
    field.setAttribute("aria-hidden", "true");
    fieldHost.appendChild(field);
    resizeField();
    return field;
  }

  function preloadFrames() {
    for (const src of flapFrames) {
      const image = new Image();
      image.src = src;
    }
  }

  function resizeField() {
    if (!field) return;
    field.style.height = `${fieldHeight()}px`;
  }

  function makePngButterfly(size) {
    const butterfly = document.createElement("div");
    butterfly.className = "butterfly butterfly-png";
    butterfly.dataset.frame = "0";

    const inner = document.createElement("span");
    inner.className = "butterfly-inner";

    flapFrames.forEach((src, index) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.decoding = "async";
      img.loading = "eager";
      img.className = `butterfly-frame butterfly-frame-${index}`;
      inner.appendChild(img);
    });

    butterfly.appendChild(inner);
    butterfly.style.setProperty("--butterfly-size", `${size}px`);

    return butterfly;
  }

  function createButterfly() {
    const size = randomBetween(ButterflyConfig.minSize, ButterflyConfig.maxSize);
    const element = makePngButterfly(size);
    const depth = Math.random();
    const blur = Math.max(0, (1 - depth) * 0.9);
    const zIndex = Math.round(20 + depth * 45);

    element.classList.add(depth > 0.66 ? "butterfly-near" : "butterfly-far");
    element.style.setProperty("--butterfly-blur", `${blur.toFixed(2)}px`);
    element.style.zIndex = String(zIndex);
    ensureField().appendChild(element);

    const butterfly = {
      element,
      inner: element.querySelector(".butterfly-inner"),
      size,
      depth,
      flapOffset: randomBetween(0, ButterflyConfig.flapSpeed * flapSequence.length),
      flapSpeed: randomBetween(ButterflyConfig.flapSpeed * 0.9, ButterflyConfig.flapSpeed * 1.18),
      currentFrame: 0,
      phase: randomBetween(0, Math.PI * 2)
    };

    resetButterfly(butterfly, true);
    return butterfly;
  }

  function resetButterfly(butterfly, stagger = false) {
    const docHeight = fieldHeight();
    const width = fieldWidth();
    const direction = randomSign();
    const margin = butterfly.size + randomBetween(35, 120);
    const startX = direction > 0 ? -margin : width + margin;
    const endX = direction > 0 ? width + margin : -margin;
    const startY = randomBetween(40, Math.max(80, docHeight - 80));
    const endY = Math.min(
      docHeight - 40,
      Math.max(40, startY + randomBetween(-docHeight * 0.28, docHeight * 0.28))
    );

    butterfly.startTime = performance.now() - (stagger ? randomBetween(0, 9000) : 0);
    butterfly.duration = randomBetween(ButterflyConfig.minDuration, ButterflyConfig.maxDuration) * 1000;
    butterfly.startX = startX;
    butterfly.endX = endX;
    butterfly.startY = startY;
    butterfly.endY = endY;
    butterfly.controlY1 = randomBetween(20, Math.max(80, docHeight - 80));
    butterfly.controlY2 = randomBetween(20, Math.max(80, docHeight - 80));
    butterfly.waveAmplitude = randomBetween(16, 54) * (0.65 + butterfly.depth);
    butterfly.waveFrequency = randomBetween(1.2, 2.7);
    butterfly.rotationBase = randomBetween(-8, 8);
    butterfly.rotationRange = randomBetween(4, 12);
    butterfly.scaleWobble = randomBetween(0.02, 0.07);
    butterfly.phase = randomBetween(0, Math.PI * 2);
  }

  function cubicBezier(a, b, c, d, t) {
    const mt = 1 - t;
    return mt * mt * mt * a + 3 * mt * mt * t * b + 3 * mt * t * t * c + t * t * t * d;
  }

  function moveButterflies(now) {
    for (const butterfly of butterflies) {
      let progress = (now - butterfly.startTime) / butterfly.duration;

      if (progress >= 1) {
        resetButterfly(butterfly);
        progress = 0;
      }

      const eased = progress * progress * (3 - 2 * progress);
      const x = butterfly.startX + (butterfly.endX - butterfly.startX) * eased;
      const curveY = cubicBezier(
        butterfly.startY,
        butterfly.controlY1,
        butterfly.controlY2,
        butterfly.endY,
        eased
      );
      const waveY = Math.sin(progress * Math.PI * 2 * butterfly.waveFrequency + butterfly.phase) * butterfly.waveAmplitude;
      const y = curveY + waveY;
      const rotation = butterfly.rotationBase +
        Math.sin(progress * Math.PI * 2 * (butterfly.waveFrequency + 0.45) + butterfly.phase) * butterfly.rotationRange;
      const scale = 0.92 + butterfly.depth * 0.24 +
        Math.sin(progress * Math.PI * 2 + butterfly.phase) * butterfly.scaleWobble;
      const faceDirection = butterfly.endX > butterfly.startX ? 1 : -1;

      butterfly.element.style.transform =
        `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${rotation.toFixed(2)}deg) scale(${(scale * faceDirection).toFixed(3)}, ${scale.toFixed(3)})`;
      butterfly.inner.style.transform =
        `translateY(${(Math.sin(progress * Math.PI * 8 + butterfly.phase) * 4).toFixed(2)}px)`;

      updateFlapFrame(butterfly, now);
    }

    animationFrame = requestAnimationFrame(moveButterflies);
  }

  function updateFlapFrame(butterfly, now) {
    const sequenceIndex = Math.floor((now + butterfly.flapOffset) / butterfly.flapSpeed) % flapSequence.length;
    const frameIndex = flapSequence[sequenceIndex];

    if (frameIndex !== butterfly.currentFrame) {
      butterfly.currentFrame = frameIndex;
      butterfly.element.dataset.frame = String(frameIndex);
    }
  }

  window.startButterflies = function startButterflies() {
    if (running || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    running = true;
    preloadFrames();
    ensureField();
    butterflies = [];

    const count = Math.max(3, Math.min(7, ButterflyConfig.maxButterflies));
    for (let index = 0; index < count; index += 1) {
      butterflies.push(createButterfly());
    }

    animationFrame = requestAnimationFrame(moveButterflies);
  };

  window.stopButterflies = function stopButterflies() {
    running = false;
    cancelAnimationFrame(animationFrame);

    for (const butterfly of butterflies) {
      butterfly.element.remove();
    }

    butterflies = [];
    if (field) {
      field.remove();
      field = null;
    }
    fieldHost = null;
  };

  window.ButterflyConfig = ButterflyConfig;
  let resizeFrame = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(resizeField);
  });
  window.addEventListener("load", window.startButterflies);

  function zoneTop() {
    const host = fieldHost || getFieldHost();
    const date = host.querySelector(".cover-date");
    const envelope = host.querySelector(".envelope-link");

    if (date && envelope) {
      return Math.round(Math.min(envelope.offsetTop - 42, date.offsetTop + date.offsetHeight + 16));
    }

    return 310;
  }
})();
