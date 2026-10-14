(function () {
  const nav = document.getElementById("site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const form = document.getElementById("request-form");
  const statusEl = document.getElementById("form-status");
  const heroMedia = document.querySelector(".hero-media");

  function setHeroImage() {
    if (!heroMedia) return;
    const src = heroMedia.getAttribute("data-image");
    if (!src) {
      heroMedia.classList.add("is-fallback");
      return;
    }

    const image = new Image();
    image.onload = function () {
      heroMedia.style.backgroundImage = "url('" + src + "')";
    };
    image.onerror = function () {
      heroMedia.classList.add("is-fallback");
    };
    image.src = src;
  }

  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Открыть меню");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  function setError(fieldName, message) {
    const field = form.querySelector('[name="' + fieldName + '"]').closest(".field");
    const error = document.getElementById(fieldName + "-error");
    field.classList.add("is-invalid");
    error.hidden = false;
    error.textContent = message;
  }

  function clearErrors() {
    form.querySelectorAll(".field").forEach(function (field) {
      field.classList.remove("is-invalid");
    });
    form.querySelectorAll(".field-error").forEach(function (error) {
      error.hidden = true;
      error.textContent = "";
    });
    statusEl.textContent = "";
    statusEl.className = "form-status";
  }

  function isPhoneValid(value) {
    const digits = value.replace(/\D/g, "");
    if (digits.length === 11 && (digits[0] === "7" || digits[0] === "8")) return true;
    if (digits.length === 10) return true;
    return false;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearErrors();

    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const machine = form.machine.value.trim();
    const issue = form.issue.value.trim();
    const consent = form.consent.checked;
    let valid = true;

    if (!name) {
      setError("name", "Укажите имя.");
      valid = false;
    }

    if (!phone) {
      setError("phone", "Укажите телефон.");
      valid = false;
    } else if (!isPhoneValid(phone)) {
      setError("phone", "Проверьте номер: нужны 10 цифр либо 11 цифр, начиная с +7 или 8.");
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

    if (!consent) {
      setError("consent", "Подтвердите демонстрационное согласие, чтобы продолжить.");
      valid = false;
    }

    if (!valid) {
      statusEl.textContent = "Проверьте обязательные поля формы.";
      statusEl.classList.add("is-error");
      return;
    }

    form.reset();
    statusEl.textContent =
      "Демонстрационная заявка принята локально. Данные никуда не отправлены: сервер пока не подключён.";
    statusEl.classList.add("is-success");
  });

  setHeroImage();
})();
