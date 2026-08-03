/* =========================================

   MÓDULO DE MESAS

   Actualiza visualmente la mesa desde que su pedido se envía a cocina.

   El estado de pago se conserva separado del estado de cocina.

   ========================================= */

 

let mesasRestaurant = [];

let mesaSeleccionada = null;

 

const CLAVE_FOLIOS_MESAS = "restaurant_folios_mesas";

const CLAVE_CONSECUTIVO_FOLIOS = "restaurant_consecutivo_folios";

 

const pantallaMesero = document.getElementById("pantallaMesero");

const contenedorMesas = document.getElementById("contenedorMesas");

const detalleMesaSeleccionada = document.getElementById("detalleMesaSeleccionada");

const nombreMesaSeleccionada = document.getElementById("nombreMesaSeleccionada");

const btnActualizarMesas = document.getElementById("btnActualizarMesas");

const btnAbrirMesa = document.getElementById("btnAbrirMesa");

const btnRegresarMesas = document.getElementById("btnRegresarMesas");

 

btnActualizarMesas?.addEventListener("click", cargarMesas);

btnAbrirMesa?.addEventListener("click", abrirMesaSeleccionada);

btnRegresarMesas?.addEventListener("click", regresarVistaMesas);

 

function obtenerFechaFolio() {

  const ahora = new Date();

  const anio = String(ahora.getFullYear()).slice(-2);

  const mes = String(ahora.getMonth() + 1).padStart(2, "0");

  const dia = String(ahora.getDate()).padStart(2, "0");

  return `${anio}${mes}${dia}`;

}

 

function generarFolioDiario() {

  const fecha = obtenerFechaFolio();

  let control = { fecha, consecutivo: 0 };

 

  try {

    const guardado = JSON.parse(localStorage.getItem(CLAVE_CONSECUTIVO_FOLIOS) || "null");

    if (guardado && guardado.fecha === fecha) control = guardado;

  } catch (_) {}

 

  control.consecutivo += 1;

  localStorage.setItem(CLAVE_CONSECUTIVO_FOLIOS, JSON.stringify(control));

  return `${fecha}-${String(control.consecutivo).padStart(4, "0")}`;

}

 

function asegurarFolioMesa(mesa) {

  let folios = {};

  try { folios = JSON.parse(localStorage.getItem(CLAVE_FOLIOS_MESAS) || "{}"); } catch (_) {}

  const clave = String(mesa.id);

  if (!folios[clave]) {

    folios[clave] = {

      folio: generarFolioDiario(),

      mesaId: mesa.id,

      mesaNombre: mesa.nombre,

      fechaAperturaISO: new Date().toISOString(),

    };

    localStorage.setItem(CLAVE_FOLIOS_MESAS, JSON.stringify(folios));

  }

  mesa.folio = folios[clave].folio;

  return mesa.folio;

}

 

async function cargarMesas() {

  if (!contenedorMesas) return;

 

  contenedorMesas.innerHTML = `

    <p class="cargandoMesas">Cargando mesas...</p>

  `;

 

  try {

    const respuesta = await fetch("/api/mesas");

    const resultado = await respuesta.json();

 

    if (!respuesta.ok || !resultado.ok) {

      throw new Error(resultado.mensaje || "No fue posible cargar las mesas.");

    }

 

    mesasRestaurant = Array.isArray(resultado.mesas) ? resultado.mesas : [];

    actualizarEstadosMesasDesdeCocina();

    dibujarMesas();

  } catch (error) {

    contenedorMesas.innerHTML = `

      <p class="mensajeErrorMesas">${escaparHTMLMesas(error.message)}</p>

    `;

  }

}

 

function actualizarEstadosMesasDesdeCocina() {

  const pedidosCocina = leerArregloLocalStorage("restaurantPedidosCocina");

  const cobros = leerArregloLocalStorage("restaurant_cuentas_caja");

 

  mesasRestaurant.forEach((mesa) => {

    const tarjetasMesa = pedidosCocina.filter(

      (pedido) => String(pedido.mesaId) === String(mesa.id),

    );

 

    if (tarjetasMesa.length === 0) return;

 

    const foliosMesas = (() => {

      try {

        return JSON.parse(localStorage.getItem(CLAVE_FOLIOS_MESAS) || "{}");

      } catch (_) {

        return {};

      }

    })();

 

    const folioActual = String(

      foliosMesas[String(mesa.id)]?.folio || mesa.folio || "",

    ).trim();

 

    const cobroMesa = cobros.find((cobro) => {

      if (cobro.estadoPago !== "pagado") return false;

 

      // Cada servicio se identifica por folio, no solamente por número de mesa.

      if (folioActual) {

        return String(cobro.folio || "").trim() === folioActual;

      }

 

      // Compatibilidad para registros antiguos sin folio.

      return (

        !String(cobro.folio || "").trim() &&

        String(cobro.mesaId) === String(mesa.id)

      );

    });

 

    mesa.estadoPago = cobroMesa ? "pagado" : "pendiente";

    mesa.estado = obtenerEstadoCocinaMesa(tarjetasMesa);

  });

}

 

function obtenerEstadoCocinaMesa(tarjetasMesa) {

  const estados = tarjetasMesa.map((pedido) => String(pedido.estado || "NUEVO").toUpperCase());

 

  if (estados.some((estado) => estado === "PREPARANDO")) return "preparando";

  if (estados.every((estado) => estado === "TERMINADO" || estado === "LISTO")) return "listo";

  return "en_cocina";

}

 

function dibujarMesas() {

  if (!contenedorMesas) return;

  contenedorMesas.innerHTML = "";

 

  mesasRestaurant.forEach((mesa) => {

    const boton = document.createElement("button");

    boton.type = "button";

    boton.className = crearClaseMesa(mesa);

    boton.dataset.id = mesa.id;

 

    const icono = mesa.tipo === "moto" ? "🏍️" : "🍽️";

    const pago = mesa.estadoPago === "pagado" ? '<span class="estadoPagoMesa">✅ Pagada</span>' : "";

 

    boton.innerHTML = `

      <span class="iconoMesa">${icono}</span>

      <span class="nombreMesa">${escaparHTMLMesas(mesa.nombre)}</span>

      <span class="estadoMesa">${formatearEstadoMesa(mesa.estado)}</span>

      ${pago}

    `;

 

    boton.addEventListener("click", () => seleccionarMesa(mesa.id));

    contenedorMesas.appendChild(boton);

  });

}

 

function crearClaseMesa(mesa) {

  let clase = `tarjetaMesa estado-${mesa.estado}`;

  if (mesa.tipo === "moto") clase += " moto";

  if (mesa.estadoPago === "pagado") clase += " mesaPagada";

  if (mesaSeleccionada && mesaSeleccionada.id === mesa.id) clase += " seleccionada";

  return clase;

}

 

function seleccionarMesa(mesaId) {

  mesaSeleccionada = mesasRestaurant.find((mesa) => mesa.id === mesaId);

  if (!mesaSeleccionada) return;

 

  if (nombreMesaSeleccionada) nombreMesaSeleccionada.textContent = mesaSeleccionada.nombre;

  detalleMesaSeleccionada?.classList.remove("oculto");

 

  if (btnAbrirMesa) {

    btnAbrirMesa.textContent = mesaSeleccionada.estado === "libre" ? "Abrir pedido" : "Ver pedido";

  }

 

  dibujarMesas();

}

 

function abrirMesaSeleccionada() {

  if (!mesaSeleccionada) {

    alert("Selecciona una mesa.");

    return;

  }

 

  const vistaMesas = document.getElementById("vistaMesas");

  const vistaPedidoMesa = document.getElementById("vistaPedidoMesa");

  const tituloPedidoMesa = document.getElementById("tituloPedidoMesa");

  const estadoPedidoMesa = document.getElementById("estadoPedidoMesa");

 

  // El folio nace en la primera apertura de la mesa y se conserva hasta el pago.

  asegurarFolioMesa(mesaSeleccionada);

 

  if (!vistaMesas || !vistaPedidoMesa) {

    alert("Falta la nueva pantalla del pedido en index.html");

    return;

  }

 

  vistaMesas.classList.add("oculto");

  vistaPedidoMesa.classList.remove("oculto");

 

  if (tituloPedidoMesa) {

    tituloPedidoMesa.textContent = `${mesaSeleccionada.nombre} · Folio ${mesaSeleccionada.folio}`;

  }

  if (estadoPedidoMesa) estadoPedidoMesa.textContent = formatearEstadoMesa(mesaSeleccionada.estado);

 

  if (typeof inicializarComensalesMesa === "function") {

    inicializarComensalesMesa(mesaSeleccionada);

  } else {

    console.error("No se encontró inicializarComensalesMesa(). Revisa comensales.js");

  }

}

 

function formatearEstadoMesa(estado) {

  const estados = {

    libre: "Libre",

    ocupada: "Ocupada",

    abierta: "Ocupada",

    en_cocina: "En cocina",

    preparando: "Preparando",

    listo: "Listo",

    por_cobrar: "Por cobrar",

  };

  return estados[estado] || estado;

}

 

function mostrarPantallaMesero() {

  pantallaMesero?.classList.remove("oculto");

  cargarMesas();

}

 

function ocultarPantallaMesero() {

  pantallaMesero?.classList.add("oculto");

  detalleMesaSeleccionada?.classList.add("oculto");

  mesaSeleccionada = null;

}

 

function regresarVistaMesas() {

  const vistaMesas = document.getElementById("vistaMesas");

  const vistaPedidoMesa = document.getElementById("vistaPedidoMesa");

  vistaPedidoMesa?.classList.add("oculto");

  vistaMesas?.classList.remove("oculto");

  cargarMesas();

}

 

function leerArregloLocalStorage(clave) {

  try {

    const datos = JSON.parse(localStorage.getItem(clave) || "[]");

    return Array.isArray(datos) ? datos : [];

  } catch {

    return [];

  }

}

 

function escaparHTMLMesas(texto) {

  return String(texto ?? "")

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

}

 

window.addEventListener("pedidosCocinaActualizados", () => {

  actualizarEstadosMesasDesdeCocina();

  dibujarMesas();

});

 

window.addEventListener("storage", (evento) => {

  if (["restaurantPedidosCocina", "restaurant_cuentas_caja"].includes(evento.key)) {

    actualizarEstadosMesasDesdeCocina();

    dibujarMesas();

  }

});