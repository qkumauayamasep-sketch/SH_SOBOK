(() => {
  const page = document.body.dataset.page;
  const currentLink = document.querySelector(`[data-nav="${page}"]`);
  if (currentLink) currentLink.setAttribute("aria-current", "page");
  const layer = document.querySelector('.snow-layer');
  if (layer && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    for (let i = 0; i < 24; i++) {
      const snow = document.createElement('span');
      snow.className = 'falling-snow'; snow.textContent = i % 4 === 0 ? '❄' : '·';
      snow.style.setProperty('--left', `${Math.random() * 100}%`);
      snow.style.setProperty('--size', `${10 + Math.random() * 10}px`);
      snow.style.setProperty('--duration', `${19 + Math.random() * 19}s`);
      snow.style.setProperty('--delay', `${-Math.random() * 38}s`);
      snow.style.setProperty('--drift', `${Math.random() * 80 - 40}px`);
      layer.append(snow);
    }
  }
})();
