// =============================================

// cocina.js

// Pantalla sencilla de cocina para tablet o computadora

// =============================================

const CLAVE_PEDIDOS_COCINA = "restaurantPedidosCocina";

const pantallaCocina = document.getElementById("pantallaCocina");

const vistaPedidosCocina = document.getElementById("vistaPedidosCocina");

const vistaHistoricoCocina = document.getElementById("vistaHistoricoCocina");

const contenedorPedidosCocina = document.getElementById(
  "contenedorPedidosCocina",
);

const contenedorHistoricoCocina = document.getElementById(
  "contenedorHistoricoCocina",
);

const btnVerHistoricoCocina = document.getElementById("btnVerHistoricoCocina");

const btnVolverPedidosCocina = document.getElementById(
  "btnVolverPedidosCocina",
);

let intervaloBordesCocina = null;

btnVerHistoricoCocina?.addEventListener("click", mostrarHistoricoCocina);

btnVolverPedidosCocina?.addEventListener("click", mostrarPedidosActivosCocina);

window.addEventListener("pedidosCocinaActualizados", actualizarPantallaCocina);

window.addEventListener("storage", (evento) => {
  if (evento.key === CLAVE_PEDIDOS_COCINA) actualizarPantallaCocina();
});

function mostrarPantallaCocina() {
  if (!pantallaCocina) return;

  pantallaCocina.classList.remove("oculto");

  mostrarPedidosActivosCocina();

  actualizarPantallaCocina();

  detenerIntervaloBordesCocina();

  intervaloBordesCocina = window.setInterval(actualizarPantallaCocina, 15000);
}

function ocultarPantallaCocina() {
  pantallaCocina?.classList.add("oculto");

  detenerIntervaloBordesCocina();
}

function detenerIntervaloBordesCocina() {
  if (!intervaloBordesCocina) return;

  window.clearInterval(intervaloBordesCocina);

  intervaloBordesCocina = null;
}

function mostrarPedidosActivosCocina() {
  vistaHistoricoCocina?.classList.add("oculto");

  vistaPedidosCocina?.classList.remove("oculto");

  btnVerHistoricoCocina?.classList.remove("oculto");

  dibujarPedidosActivosCocina();
}

function mostrarHistoricoCocina() {
  vistaPedidosCocina?.classList.add("oculto");

  vistaHistoricoCocina?.classList.remove("oculto");

  btnVerHistoricoCocina?.classList.add("oculto");

  dibujarHistoricoCocina();
}

function actualizarPantallaCocina() {
  if (!pantallaCocina || pantallaCocina.classList.contains("oculto")) return;

  if (!vistaHistoricoCocina?.classList.contains("oculto"))
    dibujarHistoricoCocina();
  else dibujarPedidosActivosCocina();
}

function leerPedidosCocina() {
  try {
    const pedidos = JSON.parse(
      localStorage.getItem(CLAVE_PEDIDOS_COCINA) || "[]",
    );

    return Array.isArray(pedidos) ? pedidos : [];
  } catch {
    return [];
  }
}

function guardarPedidosCocina(pedidos) {
  localStorage.setItem(CLAVE_PEDIDOS_COCINA, JSON.stringify(pedidos));

  window.dispatchEvent(new CustomEvent("pedidosCocinaActualizados"));
}

function dibujarPedidosActivosCocina() {
  if (!contenedorPedidosCocina) return;

  const activos = leerPedidosCocina().filter(
    (pedido) => pedido.estado !== "TERMINADO",
  );

  if (activos.length === 0) {
    contenedorPedidosCocina.innerHTML = crearMensajeCocina(
      "✅",
      "No hay pedidos pendientes",
      "Los nuevos platillos aparecerán aquí.",
    );

    return;
  }

  contenedorPedidosCocina.innerHTML = "";

  activos.forEach((pedido) =>
    contenedorPedidosCocina.appendChild(crearTarjetaCocina(pedido, false)),
  );
}

function dibujarHistoricoCocina() {
  if (!contenedorHistoricoCocina) return;

  const terminados = leerPedidosCocina()
    .filter((pedido) => pedido.estado === "TERMINADO")

    .sort((a, b) => new Date(b.fechaTerminado) - new Date(a.fechaTerminado));

  if (terminados.length === 0) {
    contenedorHistoricoCocina.innerHTML = crearMensajeCocina(
      "📚",
      "El histórico está vacío",
      "Aquí aparecerán los pedidos terminados.",
    );

    return;
  }

  contenedorHistoricoCocina.innerHTML = "";

  terminados.forEach((pedido) =>
    contenedorHistoricoCocina.appendChild(crearTarjetaCocina(pedido, true)),
  );
}

function crearTarjetaCocina(pedido, historico) {
  const tarjeta = document.createElement("article");

  tarjeta.className = crearClaseTarjetaCocina(pedido, historico);

  tarjeta.dataset.pedidoCocinaId = pedido.id;

  const platillos = pedido.platillos
    .map((platillo) => {
      const extras = (platillo.extras || [])

        .map((extra) => (typeof extra === "string" ? extra : extra?.nombre))

        .filter(Boolean);

      const observaciones = [platillo.observaciones, ...extras].filter(Boolean);

      return `<li class="platilloTarjetaCocina"><strong>${escaparHtmlCocina(platillo.nombre)}</strong>${observaciones.length ? `<span>${escaparHtmlCocina(observaciones.join(" · "))}</span>` : ""}</li>`;
    })
    .join("");

  const estadoVisible =
    pedido.estado === "PREPARANDO" ? "PREPARANDO" : "PEDIDO NUEVO";

  tarjeta.innerHTML = `

    <header class="cabeceraTarjetaCocina"><div><strong>${escaparHtmlCocina(pedido.mesaNombre || "Mesa")}</strong><span>${escaparHtmlCocina(pedido.comensalNombre || "Comensal")}</span></div><time>${formatearHoraCocina(pedido.fechaEnvio)}</time></header>

    <ul class="listaPlatillosCocina">${platillos}</ul>

    ${historico ? `<footer class="pieHistoricoCocina"><span>Terminado</span><strong>${formatearHoraCocina(pedido.fechaTerminado)}</strong></footer>` : `<footer class="pieTarjetaCocina"><span class="estadoTextoCocina">${estadoVisible}</span><button type="button" class="btnAccionCocina" data-accion-cocina="${pedido.estado === "NUEVO" ? "comenzar" : "terminar"}">${pedido.estado === "NUEVO" ? "Comenzar preparación" : "Terminado"}</button></footer>`}

  `;

  if (!historico)
    tarjeta
      .querySelector("[data-accion-cocina]")
      ?.addEventListener("click", () =>
        pedido.estado === "NUEVO"
          ? comenzarPreparacionCocina(pedido.id)
          : terminarPedidoCocina(pedido.id),
      );

  return tarjeta;
}

function crearClaseTarjetaCocina(pedido, historico) {
  const clases = ["tarjetaCocina"];

  if (historico) {
    clases.push("tarjetaTerminadaCocina");
    return clases.join(" ");
  }

  if (pedido.estado === "NUEVO") clases.push("tarjetaNuevaCocina");
  else if (pedido.estado === "PREPARANDO")
    clases.push(
      minutosTranscurridosCocina(pedido.fechaInicio) >= 10
        ? "tarjetaRetrasadaCocina"
        : "tarjetaPreparandoCocina",
    );

  return clases.join(" ");
}

function comenzarPreparacionCocina(pedidoId) {
  const pedidos = leerPedidosCocina();

  const pedido = pedidos.find((item) => item.id === pedidoId);

  if (!pedido || pedido.estado !== "NUEVO") return;

  pedido.estado = "PREPARANDO";

  pedido.fechaInicio = new Date().toISOString();

  guardarPedidosCocina(pedidos);
}

function terminarPedidoCocina(pedidoId) {
  const pedidos = leerPedidosCocina();

  const pedido = pedidos.find((item) => item.id === pedidoId);

  if (!pedido || pedido.estado !== "PREPARANDO") return;

  pedido.estado = "TERMINADO";

  pedido.fechaTerminado = new Date().toISOString();

  guardarPedidosCocina(pedidos);
}

function minutosTranscurridosCocina(fechaInicio) {
  if (!fechaInicio) return 0;

  return Math.floor((Date.now() - new Date(fechaInicio).getTime()) / 60000);
}

function formatearHoraCocina(fecha) {
  if (!fecha) return "--:--";

  return new Date(fecha).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function crearMensajeCocina(icono, titulo, texto) {
  return `<div class="mensajeCocinaVacia"><span>${icono}</span><strong>${titulo}</strong><p>${texto}</p></div>`;
}

function escaparHtmlCocina(texto) {
  const elemento = document.createElement("div");

  elemento.textContent = texto || "";

  return elemento.innerHTML;
}
