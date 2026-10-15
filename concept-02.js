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
      toggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
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
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ===== Экскаватор в блоке «Обсудить ремонт» =====
     Положение экскаватора зависит от того, где блок находится на экране:
     1) блок поднимается снизу: экскаватор въезжает с левого края экрана;
     2) блок в середине экрана: экскаватор стоит под описанием;
     3) блок уходит вверх: экскаватор уезжает вправо за край колонки.
     При прокрутке назад всё происходит в обратном порядке. */
  function initDigger() {
    var track = document.querySelector(".dig");
    var machine = track ? track.querySelector(".dig-machine") : null;
    if (!track || !machine) return;

    // Если у человека включено «уменьшить движение», экскаватор просто стоит
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    var ticking = false;
    var idleTimer = null;
    var lastX = null;

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    }

    function easeOut(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function easeIn(t) {
      return t * t * t;
    }

    function update() {
      ticking = false;

      var rect = track.getBoundingClientRect();
      var viewport = window.innerHeight || document.documentElement.clientHeight;

      // 0 — центр блока у верхнего края экрана, 1 — у нижнего
      var pos = (rect.top + rect.height / 2) / viewport;

      // Въезд: пока pos идёт от 1.00 до 0.72
      var enter = easeOut(clamp((1 - pos) / 0.28, 0, 1));
      // Стоит: pos от 0.72 до 0.32
      // Отъезд: pos от 0.32 до 0.08
      var exit = easeIn(clamp((0.32 - pos) / 0.24, 0, 1));

      var width = machine.offsetWidth;
      var x =
        -(1 - enter) * (rect.left + width + 10) + exit * track.offsetWidth;

      machine.style.transform = "translate3d(" + x.toFixed(1) + "px, 0, 0)";

      // Пока экскаватор едет, крутятся гусеницы
      if (lastX !== null && Math.abs(x - lastX) > 0.3) {
        machine.classList.add("is-moving");
        machine.classList.toggle("is-reverse", x < lastX);
        clearTimeout(idleTimer);
        idleTimer = setTimeout(function () {
          machine.classList.remove("is-moving");
        }, 180);
      }
      lastX = x;
    }

    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    update();
  }

  function setError(name, message) {
    var input = form.querySelector('[name="' + name + '"]');
    var field = input.closest(".field");
    var error = document.getElementById(name + "-error");
    field.classList.add("is-invalid");
    error.hidden = false;
    error.textContent = message;
  }

  function clearErrors() {
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
    if (digits.length === 11 && (digits[0] === "7" || digits[0] === "8")) return true;
    return digits.length === 10;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearErrors();

    var name = form.name.value.trim();
    var phone = form.phone.value.trim();
    var machine = form.machine.value.trim();
    var issue = form.issue.value.trim();
    var valid = true;

    if (!name) {
      setError("name", "Укажите имя.");
      valid = false;
    }
    if (!phone) {
      setError("phone", "Укажите телефон.");
      valid = false;
    } else if (!isPhoneValid(phone)) {
      setError("phone", "Проверьте номер: 10 цифр либо 11 цифр с +7 или 8.");
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
      "Демонстрационная заявка сохранена только в браузере. Данные никуда не отправлены: сервер не подключён.";
    statusEl.classList.add("is-ok");
  });

  loadMedia();
  initDigger();
})();
