const envelopeLink = document.getElementById("envelopeLink");
const cover = document.querySelector(".cover");
const audioButton = document.querySelector(".audio-toggle");
const introAudio = document.getElementById("introAudio");

const introAssets = [
  "Fondo1.png",
  "mariposa-alas-abiertas.png",
  "mariposa-alas-semicerradas.png",
  "mariposa-alas-cerradas.png"
];

function preloadImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = resolve;
    image.onerror = resolve;
    image.src = src;
  });
}

Promise.all(introAssets.map(preloadImage)).then(() => {
  cover.classList.add("intro-loaded");
});

envelopeLink.addEventListener("click", (event) => {
  event.preventDefault();
  cover.classList.add("opening");

  window.setTimeout(() => {
    window.location.href = envelopeLink.href;
  }, 700);
});

audioButton.addEventListener("click", async () => {
  if (!introAudio.getAttribute("src")) {
    audioButton.textContent = "Sin audio";
    audioButton.setAttribute("aria-pressed", "false");
    return;
  }

  if (introAudio.paused) {
    await introAudio.play();
    audioButton.textContent = "Silenciar";
    audioButton.setAttribute("aria-pressed", "true");
    return;
  }

  introAudio.pause();
  audioButton.textContent = "Sonido";
  audioButton.setAttribute("aria-pressed", "false");
});
