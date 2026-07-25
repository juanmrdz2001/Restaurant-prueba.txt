document.addEventListener("DOMContentLoaded", () => {
  actualizarFechaHora();

  setInterval(actualizarFechaHora, 1000);
});

function actualizarFechaHora() {
  const ahora = new Date();

  const fecha = ahora.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const hora = ahora.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const fechaLogin = document.getElementById("fechaLogin");

  const horaLogin = document.getElementById("horaLogin");

  if (fechaLogin) {
    fechaLogin.textContent = fecha;
  }

  if (horaLogin) {
    horaLogin.textContent = hora;
  }
}
