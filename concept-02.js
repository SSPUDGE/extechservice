(function () {
  "use strict";

  /* Мобильное меню */
  var nav = document.getElementById("primary-nav");
  var menuButton = document.querySelector(".menu-btn");

  function closeMenu() {
    if (!nav || !menuButton) return;

    nav.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Открыть меню");
  }

  if (nav && menuButton) {
    menuButton.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");

      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute(
        "aria-label",
        isOpen ? "Закрыть меню" : "Открыть меню"
      );
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });
  }

  /* Плавная прокрутка к разделам */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      var href = link.getAttribute("href");
      var target = href ? document.querySelector(href) : null;

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start"
      });
    });
  });

  /* Загрузка изображения с резервным сообщением */
  document.querySelectorAll("img.media").forEach(function (img) {
    var frame = img.closest(".hero-frame");
    var fallback = frame
      ? frame.querySelector(".media-fallback")
      : null;
    var src = img.getAttribute("data-src");

    function showFallback() {
      if (frame) frame.classList.add("is-fallback");
      if (fallback) fallback.hidden = false;
      img.hidden = true;
    }

    img.addEventListener("error", showFallback);

    if (src) {
      img.src = src;
    } else {
      showFallback();
    }
  });

  /* Проверка основной формы */
  var form = document.getElementById("discuss-form");
  var formStatus = document.getElementById("form-status");

  function clearFormErrors(currentForm) {
    if (!currentForm) return;

    currentForm.querySelectorAll(".field").forEach(function (field) {
      field.classList.remove("is-invalid");
    });

    currentForm.querySelectorAll(".error").forEach(function (error) {
      error.textContent = "";
      error.hidden = true;
    });
  }

  function setFieldError(currentForm, fieldName, message) {
    var field = currentForm.querySelector('[name="' + fieldName + '"]');
    if (!field) return;

    var wrapper = field.closest(".field");
    var error = wrapper ? wrapper.querySelector(".error") : null;

    if (wrapper) wrapper.classList.add("is-invalid");

    if (error) {
      error.textContent = message;
      error.hidden = false;
    }
  }

  function validPhone(value) {
    var digits = value.replace(/\D/g, "");

    return (
      digits.length === 10 ||
      (digits.length === 11 && (digits.charAt(0) === "7" ||
        digits.charAt(0) === "8"))
    );
  }

  if (form && formStatus) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      clearFormErrors(form);
      formStatus.textContent = "";
      formStatus.className = "status";

      var name = form.elements.name.value.trim();
      var phone = form.elements.phone.value.trim();
      var machine = form.elements.machine.value.trim();
      var issue = form.elements.issue.value.trim();
      var valid = true;

      if (!name) {
        setFieldError(form, "name", "Укажите ваше имя.");
        valid = false;
      }

      if (!phone) {
        setFieldError(form, "phone", "Укажите номер телефона.");
        valid = false;
      } else if (!validPhone(phone)) {
        setFieldError(
          form,
          "phone",
          "Проверьте номер телефона: укажите 10 цифр или 11 цифр с +7/8."
        );
        valid = false;
      }

      if (!machine) {
        setFieldError(form, "machine", "Укажите тип и модель техники.");
        valid = false;
      }

      if (!issue) {
        setFieldError(form, "issue", "Опишите неисправность.");
        valid = false;
      }

      if (!valid) {
        formStatus.textContent = "Пожалуйста, заполните обязательные поля.";
        formStatus.classList.add("is-bad");
        return;
      }

      formStatus.textContent =
        "Проверка пройдена. Это демонстрационный режим: заявка не отправлена, " +
        "так как обработчик формы ещё не подключён.";

      formStatus.classList.add("is-ok");
    });
  }

  /* Горизонтальная карусель отзывов */
  var viewport = document.getElementById("reviews-viewport");
  var track = document.getElementById("reviews-track");
  var counter = document.getElementById("reviews-counter");
  var dotsContainer = document.getElementById("reviews-dots");
  var prevButton = document.querySelector(".review-prev");
  var nextButton = document.querySelector(".review-next");

  if (viewport && track && counter && prevButton && nextButton) {
    var cards = Array.from(track.querySelectorAll(".review-card"));
    var dots = dotsContainer
      ? Array.from(dotsContainer.querySelectorAll(".review-dot"))
      : [];

    var currentIndex = 0;
    var resizeTimer;

    function getStep() {
      if (cards.length < 2) return 0;

      var firstCard = cards[0];
      var secondCard = cards[1];

      return secondCard.offsetLeft - firstCard.offsetLeft;
    }

    function getMaxIndex() {
      if (!cards.length) return 0;

      var step = getStep();
      if (!step) return 0;

      var maxScroll = Math.max(0, track.scrollWidth - viewport.clientWidth);

      return Math.max(0, Math.round(maxScroll / step));
    }

    function updateCarousel() {
      var step = getStep();
      var maxIndex = getMaxIndex();

      currentIndex = Math.max(0, Math.min(currentIndex, maxIndex));

      track.style.transform =
        "translateX(-" + (currentIndex * step) + "px)";

      counter.textContent =
        String(currentIndex + 1).padStart(2, "0") +
        " / " +
        String(maxIndex + 1).padStart(2, "0");

      prevButton.disabled = currentIndex === 0;
      nextButton.disabled = currentIndex >= maxIndex;

      dots.forEach(function (dot, index) {
        var active = index === currentIndex;

        dot.classList.toggle("is-active", active);

        if (active) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }

        dot.hidden = index > maxIndex;
      });
    }

    prevButton.addEventListener("click", function () {
      currentIndex = Math.max(0, currentIndex - 1);
      updateCarousel();
    });

    nextButton.addEventListener("click", function () {
      currentIndex = Math.min(getMaxIndex(), currentIndex + 1);
      updateCarousel();
    });

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        currentIndex = Math.min(index, getMaxIndex());
        updateCarousel();
      });
    });

    /* Прокрутка карусели клавишами */
    viewport.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        currentIndex = Math.max(0, currentIndex - 1);
        updateCarousel();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        currentIndex = Math.min(getMaxIndex(), currentIndex + 1);
        updateCarousel();
      }
    });

    /* Пересчёт ширины карточек при изменении окна */
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);

      resizeTimer = window.setTimeout(function () {
        updateCarousel();
      }, 100);
    });

    updateCarousel();
  }
  
  /* Анимация экскаватора при прокрутке блока ремонта */
  var discussSection = document.getElementById("discuss");
  var excavator = document.querySelector(".discuss-excavator");

  if (discussSection && excavator) {
    var lastScrollY = window.scrollY;
    var scrollDirection = "down";
    var discussIsVisible = false;
    var animationFramePending = false;

    function updateExcavator() {
      var currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) {
        scrollDirection = "down";
      } else if (currentScrollY < lastScrollY) {
        scrollDirection = "up";
      }

      lastScrollY = currentScrollY;

      if (discussIsVisible && scrollDirection === "down") {
        excavator.classList.add("is-driving-in");
      } else {
        excavator.classList.remove("is-driving-in");
      }

      animationFramePending = false;
    }

    window.addEventListener("scroll", function () {
      if (!animationFramePending) {
        window.requestAnimationFrame(updateExcavator);
        animationFramePending = true;
      }
    }, { passive: true });

    var discussObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        discussIsVisible = entry.isIntersecting;

        if (!entry.isIntersecting) {
          excavator.classList.remove("is-driving-in");
        } else {
          updateExcavator();
        }
      });
    }, {
      threshold: 0.15
    });

    discussObserver.observe(discussSection);
  }

})();
