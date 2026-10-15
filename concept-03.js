(function () {
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

  var machine = document.querySelector(".hero-machine");

  if (machine) {
    machine.addEventListener("error", function () {
      machine.hidden = true;
    });
  }
})();
