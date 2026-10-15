(function () {
  var nav = document.getElementById("site-nav");
  var toggle = document.querySelector(".nav-toggle");

  function setNav(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setNav(!nav.classList.contains("is-open"));
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setNav(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setNav(false);
    });

    // При переходе на широкий экран сбрасываем состояние мобильного меню
    window.addEventListener("resize", function () {
      if (window.innerWidth > 760) setNav(false);
    });
  }

  // Если изображение техники не загрузилось, панель остаётся с подписью и чертёжной сеткой
  var machine = document.querySelector(".hero-machine");
  if (machine) {
    machine.addEventListener("error", function () {
      machine.hidden = true;
    });
  }
})();
