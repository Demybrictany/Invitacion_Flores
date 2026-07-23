const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");
const eventDate = new Date("2026-09-05T16:00:00-06:00");

const navigationEntry = performance.getEntriesByType("navigation")[0];
if (navigationEntry?.type === "reload") {
  window.location.replace("index.html");
}

function formatTimeUnit(value) {
  return String(value).padStart(2, "0");
}

function updateCountdown() {
  const distance = Math.max(0, eventDate.getTime() - Date.now());
  const totalSeconds = Math.floor(distance / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  daysEl.textContent = formatTimeUnit(days);
  hoursEl.textContent = formatTimeUnit(hours);
  minutesEl.textContent = formatTimeUnit(minutes);
  secondsEl.textContent = formatTimeUnit(seconds);
}

updateCountdown();
setInterval(updateCountdown, 1000);
