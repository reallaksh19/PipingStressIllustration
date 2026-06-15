(function () {
  var headerCopy = 'Visual piping stress lessons: loads → stress components → pipe response → B31.3 route awareness.';

  function applyHeaderCopy() {
    var subtitle = document.querySelector('.appHeader .subtitle');
    if (subtitle && subtitle.textContent !== headerCopy) subtitle.textContent = headerCopy;
  }

  window.addEventListener('DOMContentLoaded', function () {
    applyHeaderCopy();
    setTimeout(applyHeaderCopy, 120);
    setTimeout(applyHeaderCopy, 600);
  });
})();
