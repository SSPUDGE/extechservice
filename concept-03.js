(function () {
  /* ===== Демонстрационная форма ===== */
  var form = document.getElementById("visit-form");
  var message = document.getElementById("form-message");

  if (form && message) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!form.reportValidity()) {
        return;
      }

      message.textContent =
        "Мы свяжемся с вами через 15 минут. Внимание: это демонстрация, заявка пока не отправлена.";

      message.classList.add("is-visible");
    });

    form.querySelectorAll("input, textarea").forEach(function (field) {
      field.addEventListener("input", function () {
        message.classList.remove("is-visible");
        message.textContent = "";
      });
    });
  }

  /* ===== Автоматическая фото- и видеогалерея ===== */
  var gallery = document.getElementById("media-slides");

  if (!gallery) {
    return;
  }

  var allSlides = Array.prototype.slice.call(
    gallery.querySelectorAll(".media-slide")
  );

  var previousButton = document.getElementById("media-prev");
  var nextButton = document.getElementById("media-next");
  var counter = document.getElementById("media-counter");

  var slides = [];
  var currentIndex = 0;
  var timer = null;
  var delay = 5000;

  function updateCounter() {
    if (!counter) return;

    var current = String(currentIndex + 1).padStart(2, "0");
    var total = String(slides.length).padStart(2, "0");

    counter.textContent = current + " / " + total;
  }

  function stopVideos() {
    allSlides.forEach(function (slide) {
      var video = slide.querySelector("video");

      if (video) {
        video.pause();
      }
    });
  }

  function showSlide(index) {
    if (!slides.length) return;

    currentIndex = (index + slides.length) % slides.length;

    allSlides.forEach(function (slide) {
      slide.classList.remove("is-active");
    });

    stopVideos();

    var activeSlide = slides[currentIndex];
    activeSlide.classList.add("is-active");

    var activeVideo = activeSlide.querySelector("video");

    if (activeVideo) {
      var playPromise = activeVideo.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          /* Браузер может блокировать автовоспроизведение. */
        });
      }
    }

    updateCounter();
  }

  function stopTimer() {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function startTimer() {
    stopTimer();

    if (slides.length < 2) return;

    var reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) return;

    timer = window.setInterval(function () {
      showSlide(currentIndex + 1);
    }, delay);
  }

  function refreshGallery() {
    slides = allSlides.filter(function (slide) {
      return !slide.classList.contains("is-hidden");
    });

    if (!slides.length) {
      if (counter) counter.textContent = "Нет медиафайлов";
      return;
    }

    currentIndex = 0;
    showSlide(0);
    startTimer();
  }

  function hideSlide(slide) {
    slide.classList.add("is-hidden");
    slide.classList.remove("is-active");
    refreshGallery();
  }

  allSlides.forEach(function (slide) {
    var image = slide.querySelector("img");
    var video = slide.querySelector("video");
    var source = slide.querySelector("video source");

    if (image) {
      image.addEventListener("error", function () {
        hideSlide(slide);
      });
    }

    if (video) {
      video.addEventListener("error", function () {
        hideSlide(slide);
      });

      if (source) {
        source.addEventListener("error", function () {
          hideSlide(slide);
        });
      }
    }
  });

  if (previousButton) {
    previousButton.addEventListener("click", function () {
      showSlide(currentIndex - 1);
      startTimer();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", function () {
      showSlide(currentIndex + 1);
      startTimer();
    });
  }

  gallery.addEventListener("mouseenter", stopTimer);
  gallery.addEventListener("mouseleave", startTimer);

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stopTimer();
      stopVideos();
    } else {
      startTimer();
      showSlide(currentIndex);
    }
  });

  /* Если изображение техники не загрузилось, галерея его скроет. */
  refreshGallery();
})();
