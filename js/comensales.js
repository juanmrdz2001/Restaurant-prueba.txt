// =============================================

 

// comensales.js

 

// Productos individuales por comensal y envío a cocina

 

// =============================================

 

 

 

let comensalesMesa = [];

 

let comensalActivoId = null;

 

let mesaComensalesActualId = null;

 

 

 

// Guarda temporalmente el pedido de cada mesa mientras la página esté abierta.

 

const pedidosPorMesa = new Map();

 

 

 

const pestanasComensales = document.getElementById("pestanasComensales");

 

const tituloComensalActivo = document.getElementById("tituloComensalActivo");

 

const listaPedidoComensal = document.getElementById("listaPedidoComensal");

 

const subtotalComensal = document.getElementById("subtotalComensal");

 

const totalMesaPedido = document.getElementById("totalMesaPedido");

 

const btnEnviarCocina = document.getElementById("btnEnviarCocina");

 

 

 

function inicializarComensalesMesa(mesa) {

 

  if (!mesa) return;

 

 

 

  guardarPedidoMesaActual();

 

  mesaComensalesActualId = mesa.id;

 

 

 

  const pedidoGuardado = pedidosPorMesa.get(mesa.id);

 

 

 

  if (pedidoGuardado) {

 

    comensalesMesa = pedidoGuardado.comensales;

 

    comensalActivoId = pedidoGuardado.comensalActivoId;

 

  } else {

 

    comensalesMesa = [crearNuevoComensal(1)];

 

    comensalActivoId = comensalesMesa[0].id;

 

    guardarPedidoMesaActual();

 

  }

 

 

 

  dibujarBarraComensales();

 

  mostrarPedidoComensalActivo();

 

}

 

 

 

function guardarPedidoMesaActual() {

 

  if (!mesaComensalesActualId || comensalesMesa.length === 0) return;

 

 

 

  pedidosPorMesa.set(mesaComensalesActualId, {

 

    comensales: comensalesMesa,

 

    comensalActivoId,

 

  });

 

}

 

 

 

function crearNuevoComensal(numero) {

 

  return {

 

    id: generarId("comensal"),

 

    numero,

 

    nombre: `Comensal ${numero}`,

 

    estado: "vacio",

 

    productos: [],

 

  };

 

}

 

 

 

function generarId(prefijo) {

 

  return `${prefijo}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

 

}

 

 

 

function agregarComensal() {

 

  const nuevoNumero = comensalesMesa.length + 1;

 

  const nuevoComensal = crearNuevoComensal(nuevoNumero);

 

 

 

  comensalesMesa.push(nuevoComensal);

 

  comensalActivoId = nuevoComensal.id;

 

 

 

  guardarPedidoMesaActual();

 

  dibujarBarraComensales();

 

  mostrarPedidoComensalActivo();

 

  desplazarBarraAlFinal();

 

}

 

 

 

function seleccionarComensal(comensalId) {

 

  const existe = comensalesMesa.some((comensal) => comensal.id === comensalId);

 

  if (!existe) return;

 

 

 

  comensalActivoId = comensalId;

 

  guardarPedidoMesaActual();

 

  dibujarBarraComensales();

 

  mostrarPedidoComensalActivo();

 

}

 

 

 

function obtenerComensalActivo() {

 

  return comensalesMesa.find((comensal) => comensal.id === comensalActivoId) || null;

 

}

 

 

 

function dibujarBarraComensales() {

 

  if (!pestanasComensales) return;

 

 

 

  pestanasComensales.innerHTML = "";

 

  pestanasComensales.appendChild(

 

    crearBotonDesplazamiento("◀", "Desplazar comensales a la izquierda", -260),

 

  );

 

 

 

  comensalesMesa.forEach((comensal) => {

 

    const boton = document.createElement("button");

 

    boton.type = "button";

 

    boton.className = crearClaseComensal(comensal);

 

    boton.dataset.comensalId = comensal.id;

 

    boton.innerHTML = crearContenidoComensal(comensal);

 

    boton.addEventListener("click", () => seleccionarComensal(comensal.id));

 

    pestanasComensales.appendChild(boton);

 

  });

 

 

 

  const btnAgregar = document.createElement("button");

 

  btnAgregar.type = "button";

 

  btnAgregar.className = "btnAgregarComensal";

 

  btnAgregar.innerHTML = '<span aria-hidden="true">🟢</span><span aria-hidden="true">➕</span>';

 

  btnAgregar.title = "Agregar comensal";

 

  btnAgregar.setAttribute("aria-label", "Agregar comensal");

 

  btnAgregar.addEventListener("click", agregarComensal);

 

  pestanasComensales.appendChild(btnAgregar);

 

 

 

  pestanasComensales.appendChild(

 

    crearBotonDesplazamiento("▶", "Desplazar comensales a la derecha", 260),

 

  );

 

}

 

 

 

function crearBotonDesplazamiento(texto, etiqueta, distancia) {

 

  const boton = document.createElement("button");

 

  boton.type = "button";

 

  boton.className = "btnMoverComensales";

 

  boton.textContent = texto;

 

  boton.title = etiqueta;

 

  boton.setAttribute("aria-label", etiqueta);

 

 

 

  boton.addEventListener("click", () => {

 

    const contenedor = document.querySelector(".pestanasPedido");

 

    if (contenedor) contenedor.scrollBy({ left: distancia, behavior: "smooth" });

 

  });

 

 

 

  return boton;

 

}

 

 

 

function crearClaseComensal(comensal) {

 

  const clases = ["pestanaComensal", `estado-${comensal.estado}`];

 

  if (comensal.id === comensalActivoId) clases.push("activa");

 

  return clases.join(" ");

 

}

 

 

 

function crearContenidoComensal(comensal) {

 

  const cantidadArticulos = comensal.productos.length;

 

  const contador = cantidadArticulos > 0

 

    ? `<span class="contadorArticulosComensal">${cantidadArticulos}</span>`

 

    : "";

 

 

 

  return `

 

    <span class="indicadorComensal" aria-hidden="true">${obtenerIndicadorEstado(comensal)}</span>

 

    <span class="iconoPersonaComensal" aria-hidden="true">👤</span>

 

    <span class="numeroComensal">${comensal.numero}</span>

 

    ${contador}

 

  `;

 

}

 

 

 

function obtenerIndicadorEstado(comensal) {

 

  if (comensal.id === comensalActivoId) return "🔵";

 

  if (comensal.estado === "enviado") return "🟢";

 

  if (comensal.estado === "capturado") return "⚪";

 

  return "⚫";

 

}

 

 

 

function mostrarPedidoComensalActivo() {

 

  const comensal = obtenerComensalActivo();

 

  if (!comensal) return;

 

 

 

  if (tituloComensalActivo) tituloComensalActivo.textContent = comensal.nombre;

 

  dibujarProductosComensal(comensal);

 

  actualizarTotalesPedido();

 

}

 

 

 

function dibujarProductosComensal(comensal) {

 

  if (!listaPedidoComensal) return;

 

 

 

  if (comensal.productos.length === 0) {

 

    listaPedidoComensal.innerHTML = `

 

      <div class="pedidoVacio">

 

        <span>👤</span>

 

        <strong>${comensal.nombre} todavía no tiene artículos</strong>

 

        <p>Presiona Elegir en un producto para agregarlo.</p>

 

      </div>

 

    `;

 

    return;

 

  }

 

 

 

  listaPedidoComensal.innerHTML = "";

 

 

 

  comensal.productos.forEach((producto) => {

 

    const articulo = document.createElement("article");

 

    const bloqueado = producto.estadoCocina !== "CAPTURADO";

 

 

 

    articulo.className = bloqueado

 

      ? "productoPedidoComensal productoEnviadoCocina"

 

      : "productoPedidoComensal productoCapturado";

 

 

 

    articulo.dataset.productoPedidoId = producto.idPedido;

 

    articulo.title = bloqueado

 

      ? "Producto enviado a cocina"

 

      : "Doble clic para modificar o eliminar";

 

 

 

    const detalles = [];

 

    if (producto.extras?.length) detalles.push(producto.extras.map((extra) => extra.nombre).join(", "));

 

    if (producto.observaciones) detalles.push(producto.observaciones);

 

 

 

    articulo.innerHTML = `

 

      <div>

 

        <strong>${producto.nombre}</strong>

 

        <span>${detalles.join(" · ") || (bloqueado ? "Enviado a cocina" : "Pendiente de enviar")}</span>

 

      </div>

 

      <strong>${formatearMoneda(producto.precioFinal)}</strong>

 

    `;

 

 

 

    if (!bloqueado) {

 

      articulo.addEventListener("dblclick", () => {

 

        if (typeof abrirModalEdicionProducto === "function") {

 

          abrirModalEdicionProducto(producto.idPedido);

 

        }

 

      });

 

    }

 

 

 

    listaPedidoComensal.appendChild(articulo);

 

  });

 

}

 

 

 

function agregarProductoAlComensalActivo(productoBase) {

 

  const comensal = obtenerComensalActivo();

 

  if (!comensal || !productoBase) return;

 

 

 

  // Cada pulsación crea un registro nuevo e independiente.

 

  comensal.productos.push({

 

    idPedido: generarId("producto"),

 

    productoId: productoBase.id,

 

    nombre: productoBase.nombre,

 

    precioBase: Number(productoBase.precio || 0),

 

    precioFinal: Number(productoBase.precio || 0),

 

    observaciones: "",

 

    extras: [],

 

    estadoCocina: "CAPTURADO",

 

    fechaCaptura: new Date().toISOString(),

 

    fechaEnvioCocina: null,

 

  });

 

 

 

  actualizarEstadoComensal(comensal);

 

  guardarPedidoMesaActual();

 

  dibujarBarraComensales();

 

  mostrarPedidoComensalActivo();

 

}

 

 

 

function buscarProductoPedido(idPedido) {

 

  for (const comensal of comensalesMesa) {

 

    const producto = comensal.productos.find((item) => item.idPedido === idPedido);

 

    if (producto) return { comensal, producto };

 

  }

 

  return null;

 

}

 

 

 

function actualizarProductoPedido(idPedido, cambios) {

 

  const encontrado = buscarProductoPedido(idPedido);

 

  if (!encontrado || encontrado.producto.estadoCocina !== "CAPTURADO") return false;

 

 

 

  encontrado.producto.observaciones = cambios.observaciones || "";

 

  encontrado.producto.extras = Array.isArray(cambios.extras) ? cambios.extras : [];

 

  encontrado.producto.precioFinal =

 

    encontrado.producto.precioBase +

 

    encontrado.producto.extras.reduce((total, extra) => total + Number(extra.precio || 0), 0);

 

 

 

  guardarPedidoMesaActual();

 

  mostrarPedidoComensalActivo();

 

  return true;

 

}

 

 

 

function eliminarProductoPedido(idPedido) {

 

  const encontrado = buscarProductoPedido(idPedido);

 

  if (!encontrado || encontrado.producto.estadoCocina !== "CAPTURADO") return false;

 

 

 

  encontrado.comensal.productos = encontrado.comensal.productos.filter(

 

    (producto) => producto.idPedido !== idPedido,

 

  );

 

 

 

  actualizarEstadoComensal(encontrado.comensal);

 

  guardarPedidoMesaActual();

 

  dibujarBarraComensales();

 

  mostrarPedidoComensalActivo();

 

  return true;

 

}

 

 

 

function actualizarEstadoComensal(comensal) {

 

  if (comensal.productos.length === 0) {

 

    comensal.estado = "vacio";

 

  } else if (comensal.productos.some((producto) => producto.estadoCocina === "CAPTURADO")) {

 

    comensal.estado = "capturado";

 

  } else {

 

    comensal.estado = "enviado";

 

  }

 

}

 

 

 

function calcularSubtotalComensal(comensal) {

 

  return comensal.productos.reduce(

 

    (total, producto) => total + Number(producto.precioFinal || 0),

 

    0,

 

  );

 

}

 

 

 

function calcularTotalMesa() {

 

  return comensalesMesa.reduce(

 

    (total, comensal) => total + calcularSubtotalComensal(comensal),

 

    0,

 

  );

 

}

 

 

 

function existenProductosPendientes() {

 

  return comensalesMesa.some((comensal) =>

 

    comensal.productos.some((producto) => producto.estadoCocina === "CAPTURADO"),

 

  );

 

}

 

 

 

function actualizarTotalesPedido() {

 

  const comensal = obtenerComensalActivo();

 

  const subtotal = comensal ? calcularSubtotalComensal(comensal) : 0;

 

  const totalMesa = calcularTotalMesa();

 

 

 

  if (subtotalComensal) subtotalComensal.textContent = formatearMoneda(subtotal);

 

  if (totalMesaPedido) totalMesaPedido.textContent = formatearMoneda(totalMesa);

 

  if (btnEnviarCocina) btnEnviarCocina.disabled = !existenProductosPendientes();

 

}

 

 

 

function enviarProductosPendientesACocina() {

 

  let cantidadEnviada = 0;

 

  const fechaEnvio = new Date().toISOString();

 

 

 

  comensalesMesa.forEach((comensal) => {

 

    comensal.productos.forEach((producto) => {

 

      if (producto.estadoCocina === "CAPTURADO") {

 

        producto.estadoCocina = "ENVIADO_A_COCINA";

 

        producto.fechaEnvioCocina = fechaEnvio;

 

        cantidadEnviada += 1;

 

      }

 

    });

 

    actualizarEstadoComensal(comensal);

 

  });

 

 

 

  if (cantidadEnviada === 0) return;

 

 

 

  guardarPedidoMesaActual();

 

  dibujarBarraComensales();

 

  mostrarPedidoComensalActivo();

 

  alert(`${cantidadEnviada} producto(s) enviado(s) a cocina.`);

 

}

 

 

 

btnEnviarCocina?.addEventListener("click", enviarProductosPendientesACocina);

 

 

 

function formatearMoneda(cantidad) {

 

  return Number(cantidad || 0).toLocaleString("es-MX", {

 

    style: "currency",

 

    currency: "MXN",

 

  });

 

}


function desplazarBarraAlFinal() {

 

  window.requestAnimationFrame(() => {

 

    const contenedor = document.querySelector(".pestanasPedido");

 

    if (contenedor) contenedor.scrollTo({ left: contenedor.scrollWidth, behavior: "smooth" });

 

  });

 

}