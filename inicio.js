const envelopeLink = document.getElementById("envelopeLink");
const cover = document.querySelector(".cover");

envelopeLink.addEventListener("click", (event) => {
  event.preventDefault();
  cover.classList.add("opening");

  window.setTimeout(() => {
    window.location.href = envelopeLink.href;
  }, 700);
});
