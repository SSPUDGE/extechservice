(function () {
  'use strict';

  /* Галерея фото и видео */
  var gallery = document.getElementById('media-gallery');
  if (gallery) {
    var allSlides = Array.prototype.slice.call(gallery.querySelectorAll('.media-slide'));
    var prev = document.getElementById('media-prev');
    var next = document.getElementById('media-next');
    var counter = document.getElementById('media-counter');
    var slides = [];
    var index = 0;
    var timer = null;
    var delay = 5000;

    function stopVideos() {
      allSlides.forEach(function (slide) {
        var video = slide.querySelector('video');
        if (video) video.pause();
      });
    }

    function updateCounter() {
      if (!counter) return;
      counter.textContent = 'ФОТО / ВИДЕО';
    }

    function showSlide(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      allSlides.forEach(function (slide) { slide.classList.remove('is-active'); });
      stopVideos();
      var active = slides[index];
      active.classList.add('is-active');
      var video = active.querySelector('video');
      if (video) {
        var play = video.play();
        if (play && typeof play.catch === 'function') play.catch(function () {});
      }
      updateCounter();
    }

    function stopTimer() {
      if (timer !== null) { window.clearInterval(timer); timer = null; }
    }

    function startTimer() {
      stopTimer();
      if (slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      timer = window.setInterval(function () { showSlide(index + 1); }, delay);
    }

    function hideSlide(slide) {
      if (slide.dataset.failed === 'true') return;
      slide.dataset.failed = 'true';
      slide.classList.remove('is-active');
      slides = allSlides.filter(function (item) { return item.dataset.failed !== 'true'; });
      if (!slides.length) {
        if (counter) counter.textContent = 'Добавьте фото или видео';
        stopTimer();
        return;
      }
      index = Math.min(index, slides.length - 1);
      showSlide(index);
      startTimer();
    }

    allSlides.forEach(function (slide) {
      var img = slide.querySelector('img');
      var video = slide.querySelector('video');
      var source = slide.querySelector('source');
      if (img) img.addEventListener('error', function () { hideSlide(slide); });
      if (video) video.addEventListener('error', function () { hideSlide(slide); });
      if (source) source.addEventListener('error', function () { hideSlide(slide); });
    });

    slides = allSlides.slice();
    if (prev) prev.addEventListener('click', function () { showSlide(index - 1); startTimer(); });
    if (next) next.addEventListener('click', function () { showSlide(index + 1); startTimer(); });
    gallery.addEventListener('mouseenter', stopTimer);
    gallery.addEventListener('mouseleave', startTimer);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { stopTimer(); stopVideos(); }
      else { startTimer(); if (slides.length) showSlide(index); }
    });
    showSlide(0);
    startTimer();
  }

  /* Горизонтальная карусель производителей */
  var viewport = document.getElementById('manufacturer-window');
  var track = document.getElementById('manufacturer-track');
  var brandPrev = document.getElementById('manufacturer-prev');
  var brandNext = document.getElementById('manufacturer-next');
  var progress = document.getElementById('manufacturer-progress-bar');

  if (viewport && track) {
    function stepSize() {
      var logo = track.querySelector('.manufacturer-logo');
      if (!logo) return 220;
      var style = window.getComputedStyle(track);
      return logo.getBoundingClientRect().width + (parseFloat(style.columnGap) || 16);
    }

    function updateProgress() {
      if (!progress) return;
      var max = viewport.scrollWidth - viewport.clientWidth;
      if (max <= 0) { progress.style.width = '100%'; return; }
      var visible = viewport.clientWidth / viewport.scrollWidth;
      var position = viewport.scrollLeft / max;
      var bar = Math.max(visible * 100, 20);
      progress.style.width = Math.min(100, bar + position * (100 - bar)) + '%';
    }

    if (brandPrev) brandPrev.addEventListener('click', function () { viewport.scrollBy({ left: -stepSize(), behavior: 'smooth' }); });
    if (brandNext) brandNext.addEventListener('click', function () { viewport.scrollBy({ left: stepSize(), behavior: 'smooth' }); });
    viewport.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    viewport.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight') { event.preventDefault(); viewport.scrollBy({ left: stepSize(), behavior: 'smooth' }); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); viewport.scrollBy({ left: -stepSize(), behavior: 'smooth' }); }
    });

    var dragging = false;
    var startX = 0;
    var startScroll = 0;
    viewport.addEventListener('pointerdown', function (event) {
      if (event.pointerType === 'touch' || event.target.closest('button')) return;
      dragging = true;
      startX = event.clientX;
      startScroll = viewport.scrollLeft;
      viewport.style.cursor = 'grabbing';
    });
    window.addEventListener('pointermove', function (event) {
      if (dragging) viewport.scrollLeft = startScroll - (event.clientX - startX);
    });
    function stopDragging() { dragging = false; viewport.style.cursor = ''; }
    window.addEventListener('pointerup', stopDragging);
    window.addEventListener('pointercancel', stopDragging);
    updateProgress();
  }

  /* Демонстрационная форма: не отправляет данные на сервер */
  var form = document.getElementById('visit-form');
  var message = document.getElementById('form-message');
  if (form && message) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      message.textContent = 'Мы свяжемся с вами через 15 минут. Внимание: это демонстрация, заявка пока не отправлена.';
      message.classList.add('is-visible');
    });
    form.querySelectorAll('input, textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        message.classList.remove('is-visible');
        message.textContent = '';
      });
    });
  }
})();
