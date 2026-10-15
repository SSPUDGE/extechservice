(function () {
  var nav = document.getElementById("primary-nav");
  var toggle = document.querySelector(".menu-btn");
  var form = document.getElementById("discuss-form");
  var statusEl = document.getElementById("form-status");

  function loadMedia() {
    document.querySelectorAll(".media").forEach(function (img) {
      var src = img.getAttribute("data-src");
      var frame = img.closest(".hero-frame, .inset-frame");
      var fallback = frame ? frame.querySelector(".media-fallback") : null;

      if (!src) {
        showFallback(frame, img, fallback);
        return;
      }

      img.addEventListener("error", function () {
        showFallback(frame, img, fallback);
      });

      img.src = src;
    });
  }

  function showFallback(frame, img, fallback) {
    if (frame) frame.classList.add("is-fallback");
    if (img) img.setAttribute("hidden", "hidden");
    if (fallback) fallback.hidden = false;
  }

  function closeNav() {
    if (!nav || !toggle) return;

    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Открыть меню");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");

      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute(
        "aria-label",
        open ? "Закрыть меню" : "Открыть меню"
      );
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      var id = link.getAttribute("href");
      var target = id ? document.querySelector(id) : null;

      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });

  function initDigger() {
    var track = document.querySelector(".dig");
    if (!track) return;

    var reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce || !("IntersectionObserver" in window)) return;

    track.classList.add("is-armed");

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (
            entry.isIntersecting &&
            entry.intersectionRatio >= 0.35
          ) {
            track.classList.add("is-in");
          } else if (!entry.isIntersecting) {
            track.classList.remove("is-in");
          }
        });
      },
      {
        threshold: [0, 0.35]
      }
    );

    observer.observe(track);
  }

  function setError(name, message) {
    if (!form) return;

    var input = form.querySelector('[name="' + name + '"]');
    if (!input) return;

    var field = input.closest(".field");
    var error = document.getElementById(name + "-error");

    if (field) field.classList.add("is-invalid");

    if (error) {
      error.hidden = false;
      error.textContent = message;
    }
  }

  function clearErrors() {
    if (!form || !statusEl) return;

    form.querySelectorAll(".field").forEach(function (field) {
      field.classList.remove("is-invalid");
    });

    form.querySelectorAll(".error").forEach(function (error) {
      error.hidden = true;
      error.textContent = "";
    });

    statusEl.textContent = "";
    statusEl.className = "status";
  }

  function isPhoneValid(value) {
    var digits = value.replace(/\D/g, "");

    if (
      digits.length === 11 &&
      (digits[0] === "7" || digits[0] === "8")
    ) {
      return true;
    }

    return digits.length === 10;
  }

  if (form && statusEl) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      clearErrors();

      var name = form.elements.name.value.trim();
      var phone = form.elements.phone.value.trim();
      var machine = form.elements.machine.value.trim();
      var issue = form.elements.issue.value.trim();

      var valid = true;

      if (!name) {
        setError("name", "Укажите имя.");
        valid = false;
      }

      if (!phone) {
        setError("phone", "Укажите телефон.");
        valid = false;
      } else if (!isPhoneValid(phone)) {
        setError(
          "phone",
          "Проверьте номер: 10 цифр либо 11 цифр с +7 или 8."
        );
        valid = false;
      }

      if (!machine) {
        setError("machine", "Укажите тип техники.");
        valid = false;
      }

      if (!issue) {
        setError("issue", "Опишите неисправность.");
        valid = false;
      }

      if (!valid) {
        statusEl.textContent = "Заполните обязательные поля.";
        statusEl.classList.add("is-bad");
        return;
      }

      form.reset();

      statusEl.textContent =
        "Демонстрационная заявка сохранена только в браузере. " +
        "Данные никуда не отправлены: сервер не подключён.";

      statusEl.classList.add("is-ok");
    });
  }

  loadMedia();
  initDigger();
})();
