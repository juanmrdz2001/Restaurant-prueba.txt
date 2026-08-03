/* =========================================

   MÓDULO DE GASTOS DE CAJA

   Archivo: js/cajaGastos.js

   ========================================= */

 

(function () {

  "use strict";

 

  const CLAVE_CAJA = "restaurant_caja_actual";

  const CLAVE_GASTOS = "restaurant_gastos_caja";

  const CLAVE_BITACORA = "restaurant_bitacora_caja";

 

  let gastoSeleccionado = null;

  let guardandoGasto = false;

 

  const btnSalidaCaja = document.getElementById("btnSalidaCaja");

  const btnVerGastosCaja = document.getElementById("btnVerGastosCaja");

 

  const modalGastoCaja = document.getElementById("modalGastoCaja");

  const formGastoCaja = document.getElementById("formGastoCaja");

  const conceptoGastoCaja = document.getElementById("conceptoGastoCaja");

  const descripcionGastoCaja = document.getElementById("descripcionGastoCaja");

  const entregadoAGastoCaja = document.getElementById("entregadoAGastoCaja");

  const importeGastoCaja = document.getElementById("importeGastoCaja");

  const observacionesGastoCaja = document.getElementById("observacionesGastoCaja");

  const btnCerrarModalGastoCaja = document.getElementById("btnCerrarModalGastoCaja");

  const btnCancelarCapturaGastoCaja = document.getElementById("btnCancelarCapturaGastoCaja");

  const btnGuardarImprimirGastoCaja = document.getElementById("btnGuardarImprimirGastoCaja");

 

  const modalListadoGastosCaja = document.getElementById("modalListadoGastosCaja");

  const btnCerrarListadoGastosCaja = document.getElementById("btnCerrarListadoGastosCaja");

  const cuerpoListadoGastosCaja = document.getElementById("cuerpoListadoGastosCaja");

  const totalListadoGastosCaja = document.getElementById("totalListadoGastosCaja");

 

  const modalDetalleGastoCaja = document.getElementById("modalDetalleGastoCaja");

  const btnCerrarDetalleGastoCaja = document.getElementById("btnCerrarDetalleGastoCaja");

  const contenidoDetalleGastoCaja = document.getElementById("contenidoDetalleGastoCaja");

  const btnReimprimirGastoCaja = document.getElementById("btnReimprimirGastoCaja");

  const btnCancelarGastoCaja = document.getElementById("btnCancelarGastoCaja");

 

  const modalAutorizarCancelacionGasto = document.getElementById("modalAutorizarCancelacionGasto");

  const formAutorizarCancelacionGasto = document.getElementById("formAutorizarCancelacionGasto");

  const motivoCancelacionGasto = document.getElementById("motivoCancelacionGasto");

  const usuarioAutorizaGasto = document.getElementById("usuarioAutorizaGasto");

  const passwordAutorizaGasto = document.getElementById("passwordAutorizaGasto");

  const btnCerrarAutorizarCancelacionGasto = document.getElementById("btnCerrarAutorizarCancelacionGasto");

  const btnCancelarAutorizacionGasto = document.getElementById("btnCancelarAutorizacionGasto");

  const btnConfirmarCancelacionGasto = document.getElementById("btnConfirmarCancelacionGasto");

 

  function leerJSON(clave, valorInicial) {

    try {

      const valor = JSON.parse(localStorage.getItem(clave) || "null");

      return valor ?? valorInicial;

    } catch (error) {

      console.error(`No se pudo leer ${clave}:`, error);

      return valorInicial;

    }

  }

 

  function guardarJSON(clave, valor) {

    localStorage.setItem(clave, JSON.stringify(valor));

  }

 

  function obtenerCajaActual() {

    return leerJSON(CLAVE_CAJA, null);

  }

 

  function obtenerGastos() {

    const gastos = leerJSON(CLAVE_GASTOS, []);

    return Array.isArray(gastos) ? gastos : [];

  }

 

  function guardarGastos(gastos) {

    guardarJSON(CLAVE_GASTOS, gastos);

  }

 

  function obtenerUsuarioActivo() {

    return leerJSON("usuarioActivo", null) || {};

  }

 

  function obtenerNombreCajero() {

    const usuario = obtenerUsuarioActivo();

    return usuario.nombre || usuario.usuario || "Cajero";

  }

 

  function obtenerFechaHora() {

    const ahora = new Date();

    return {

      fechaISO: ahora.toISOString(),

      fecha: ahora.toLocaleDateString("es-MX"),

      hora: ahora.toLocaleTimeString("es-MX", {

        hour: "2-digit",

        minute: "2-digit",

      }),

    };

  }

 

  function formatearDinero(cantidad) {

    return (Number(cantidad) || 0).toLocaleString("es-MX", {

      style: "currency",

      currency: "MXN",

      minimumFractionDigits: 2,

      maximumFractionDigits: 2,

    });

  }

 

  function escaparHTML(texto) {

    return String(texto ?? "")

      .replace(/&/g, "&amp;")

      .replace(/</g, "&lt;")

      .replace(/>/g, "&gt;")

      .replace(/"/g, "&quot;")

      .replace(/'/g, "&#039;");

  }

 

  function obtenerFolioGasto() {

    const hoy = new Date();

    const yy = String(hoy.getFullYear()).slice(-2);

    const mm = String(hoy.getMonth() + 1).padStart(2, "0");

    const dd = String(hoy.getDate()).padStart(2, "0");

    const prefijo = `G-${yy}${mm}${dd}-`;

 

    const consecutivo = obtenerGastos()

      .filter((gasto) => String(gasto.folio || "").startsWith(prefijo))

      .reduce((mayor, gasto) => {

        const numero = Number(String(gasto.folio).split("-").pop()) || 0;

        return Math.max(mayor, numero);

      }, 0) + 1;

 

    return `${prefijo}${String(consecutivo).padStart(4, "0")}`;

  }

 

  function registrarBitacora(accion, detalle, referencia = "") {

    const bitacora = leerJSON(CLAVE_BITACORA, []);

    const fechaHora = obtenerFechaHora();

    bitacora.unshift({

      id: `BIT-${Date.now()}-${Math.random().toString(16).slice(2)}`,

      accion,

      detalle,

      referencia,

      usuario: obtenerNombreCajero(),

      fecha: fechaHora.fecha,

      hora: fechaHora.hora,

      fechaISO: fechaHora.fechaISO,

    });

    guardarJSON(CLAVE_BITACORA, bitacora);

  }

 

  function abrirModal(modal) {

    if (!modal) return;

    modal.classList.remove("oculto");

    modal.setAttribute("aria-hidden", "false");

    document.body.classList.add("modalAbierto");

  }

 

  function cerrarModal(modal) {

    if (!modal) return;

    modal.classList.add("oculto");

    modal.setAttribute("aria-hidden", "true");

 

    const existeOtroModalAbierto = document.querySelector(

      ".modalGastoCaja:not(.oculto), .modalListadoGastosCaja:not(.oculto), .modalDetalleGastoCaja:not(.oculto), .modalAutorizarCancelacionGasto:not(.oculto)"

    );

 

    if (!existeOtroModalAbierto) {

      document.body.classList.remove("modalAbierto");

    }

  }

 

  function limpiarFormularioGasto() {

    formGastoCaja?.reset();

    if (importeGastoCaja) importeGastoCaja.value = "";

  }

 

  function abrirModalGastoCaja() {

    const caja = obtenerCajaActual();

 

    if (!caja || caja.estado !== "abierta") {

      alert("Primero debes abrir la caja.");

      return;

    }

 

    limpiarFormularioGasto();

    abrirModal(modalGastoCaja);

    setTimeout(() => conceptoGastoCaja?.focus(), 50);

  }

 

  function cerrarModalGastoCaja() {

    cerrarModal(modalGastoCaja);

    limpiarFormularioGasto();

  }

 

  function validarDatosGasto() {

    const concepto = conceptoGastoCaja?.value.trim() || "";

    const descripcion = descripcionGastoCaja?.value.trim() || "";

    const entregadoA = entregadoAGastoCaja?.value.trim() || "";

    const importe = Number(importeGastoCaja?.value || 0);

    const observaciones = observacionesGastoCaja?.value.trim() || "";

 

    if (!concepto) {

      alert("Escribe el concepto del gasto.");

      conceptoGastoCaja?.focus();

      return null;

    }

 

    if (!descripcion) {

      alert("Escribe la descripción del gasto.");

      descripcionGastoCaja?.focus();

      return null;

    }

 

    if (!entregadoA) {

      alert("Escribe el nombre de la persona que recibe el dinero.");

      entregadoAGastoCaja?.focus();

      return null;

    }

 

    if (!Number.isFinite(importe) || importe <= 0) {

      alert("El importe debe ser mayor que cero.");

      importeGastoCaja?.focus();

      return null;

    }

 

    return { concepto, descripcion, entregadoA, importe, observaciones };

  }

 

  function guardarMovimientoEnCaja(gasto) {

    const caja = obtenerCajaActual();

 

    if (!caja || caja.estado !== "abierta") {

      throw new Error("La caja ya no está abierta.");

    }

 

    caja.movimientos = Array.isArray(caja.movimientos) ? caja.movimientos : [];

    caja.movimientos.push({

      id: `MOV-${Date.now()}-${Math.random().toString(16).slice(2)}`,

      tipo: "salida",

      concepto: `Gasto ${gasto.folio}: ${gasto.concepto}`,

      detalle: `Entregado a: ${gasto.entregadoA}. ${gasto.descripcion}`,

      monto: gasto.importe,

      fecha: gasto.fecha,

      hora: gasto.hora,

      fechaISO: gasto.fechaISO,

      usuario: gasto.cajero,

      gastoId: gasto.id,

      folioGasto: gasto.folio,

      estado: "activo",

    });

 

    guardarJSON(CLAVE_CAJA, caja);

  }

 

  function guardarEImprimirGasto(evento) {

    evento?.preventDefault();

 

    if (guardandoGasto) return;

 

    const datos = validarDatosGasto();

    if (!datos) return;

 

    const confirmar = confirm(

      `Se registrará un gasto por ${formatearDinero(datos.importe)}.\n\n` +

      "Después de imprimirlo no podrá editarse y para cancelarlo se requerirá autorización.\n\n" +

      "¿Deseas guardar e imprimir el vale?"

    );

 

    if (!confirmar) return;

 

    guardandoGasto = true;

    if (btnGuardarImprimirGastoCaja) btnGuardarImprimirGastoCaja.disabled = true;

 

    try {

      const fechaHora = obtenerFechaHora();

      const caja = obtenerCajaActual();

 

      if (!caja || caja.estado !== "abierta") {

        throw new Error("La caja ya no está abierta.");

      }

 

      const gasto = {

        id: `GASTO-${Date.now()}-${Math.random().toString(16).slice(2)}`,

        folio: obtenerFolioGasto(),

        cajaId: caja.id,

        concepto: datos.concepto,

        descripcion: datos.descripcion,

        entregadoA: datos.entregadoA,

        importe: datos.importe,

        observaciones: datos.observaciones,

        cajero: obtenerNombreCajero(),

        fecha: fechaHora.fecha,

        hora: fechaHora.hora,

        fechaISO: fechaHora.fechaISO,

        estado: "activo",

        impreso: true,

        fechaImpresionISO: fechaHora.fechaISO,

        cancelacion: null,

      };

 

      const gastos = obtenerGastos();

      gastos.unshift(gasto);

      guardarGastos(gastos);

      guardarMovimientoEnCaja(gasto);

      registrarBitacora(

        "REGISTRO_GASTO",

        `Se registró e imprimió el gasto ${gasto.folio} por ${formatearDinero(gasto.importe)}.`,

        gasto.id

      );

 

      cerrarModalGastoCaja();

      imprimirValeGasto(gasto);

      window.actualizarPantallaCaja?.();

      window.dispatchEvent(new CustomEvent("gastosCajaActualizados"));

 

      alert(`Gasto ${gasto.folio} registrado correctamente.`);

    } catch (error) {

      console.error(error);

      alert(error.message || "No se pudo registrar el gasto.");

    } finally {

      guardandoGasto = false;

      if (btnGuardarImprimirGastoCaja) btnGuardarImprimirGastoCaja.disabled = false;

    }

  }

 

  function obtenerGastosCajaActual() {

    const caja = obtenerCajaActual();

    const gastos = obtenerGastos();

 

    if (!caja) return [];

 

    return gastos.filter((gasto) => gasto.cajaId === caja.id);

  }

 

  function abrirListadoGastosCaja() {

    const caja = obtenerCajaActual();

 

    if (!caja || caja.estado !== "abierta") {

      alert("No hay una caja abierta.");

      return;

    }

 

    renderizarListadoGastos();

    abrirModal(modalListadoGastosCaja);

  }

 

  function renderizarListadoGastos() {

    if (!cuerpoListadoGastosCaja) return;

 

    const gastos = obtenerGastosCajaActual();

    const totalActivo = gastos

      .filter((gasto) => gasto.estado === "activo")

      .reduce((total, gasto) => total + Number(gasto.importe || 0), 0);

 

    if (totalListadoGastosCaja) {

      totalListadoGastosCaja.textContent = formatearDinero(totalActivo);

    }

 

    if (gastos.length === 0) {

      cuerpoListadoGastosCaja.innerHTML = `

        <tr>

          <td colspan="7" class="mensajeSinGastosCaja">

            No hay gastos registrados en este turno.

          </td>

        </tr>

      `;

      return;

    }

 

    cuerpoListadoGastosCaja.innerHTML = gastos

      .map((gasto) => `

        <tr class="${gasto.estado === "cancelado" ? "filaGastoCancelado" : ""}">

          <td>${escaparHTML(gasto.folio)}</td>

          <td>${escaparHTML(gasto.hora)}</td>

          <td>${escaparHTML(gasto.concepto)}</td>

          <td>${escaparHTML(gasto.entregadoA)}</td>

          <td>${formatearDinero(gasto.importe)}</td>

          <td>

            <span class="estadoGastoCaja estadoGasto${gasto.estado === "cancelado" ? "Cancelado" : "Activo"}">

              ${gasto.estado === "cancelado" ? "Cancelado" : "Activo"}

            </span>

          </td>

          <td>

            <button

              type="button"

              class="btnDetalleGastoCaja"

              data-gasto-id="${escaparHTML(gasto.id)}"

            >

              Ver detalle

            </button>

          </td>

        </tr>

      `)

      .join("");

  }

 

  function abrirDetalleGasto(gastoId) {

    const gasto = obtenerGastos().find((item) => item.id === gastoId);

    if (!gasto) {

      alert("No se encontró el gasto.");

      return;

    }

 

    gastoSeleccionado = gasto;

 

    if (contenidoDetalleGastoCaja) {

      contenidoDetalleGastoCaja.innerHTML = `

        <div class="detalleGastoGrid">

          <p><span>Folio</span><strong>${escaparHTML(gasto.folio)}</strong></p>

          <p><span>Fecha y hora</span><strong>${escaparHTML(gasto.fecha)} ${escaparHTML(gasto.hora)}</strong></p>

          <p><span>Cajero</span><strong>${escaparHTML(gasto.cajero)}</strong></p>

          <p><span>Estado</span><strong>${gasto.estado === "cancelado" ? "CANCELADO" : "ACTIVO"}</strong></p>

          <p><span>Concepto</span><strong>${escaparHTML(gasto.concepto)}</strong></p>

          <p><span>Entregado a</span><strong>${escaparHTML(gasto.entregadoA)}</strong></p>

          <p class="detalleGastoAncho"><span>Descripción</span><strong>${escaparHTML(gasto.descripcion)}</strong></p>

          <p class="detalleGastoAncho"><span>Observaciones</span><strong>${escaparHTML(gasto.observaciones || "Sin observaciones")}</strong></p>

          <p class="detalleGastoImporte"><span>Importe</span><strong>${formatearDinero(gasto.importe)}</strong></p>

          ${

            gasto.cancelacion

              ? `

                <div class="datosCancelacionGasto">

                  <h3>Datos de la cancelación</h3>

                  <p><span>Autorizó</span><strong>${escaparHTML(gasto.cancelacion.autorizo)}</strong></p>

                  <p><span>Fecha y hora</span><strong>${escaparHTML(gasto.cancelacion.fecha)} ${escaparHTML(gasto.cancelacion.hora)}</strong></p>

                  <p><span>Motivo</span><strong>${escaparHTML(gasto.cancelacion.motivo)}</strong></p>

                </div>

              `

              : ""

          }

        </div>

      `;

    }

 

    if (btnCancelarGastoCaja) {

      btnCancelarGastoCaja.disabled = gasto.estado === "cancelado";

      btnCancelarGastoCaja.textContent =

        gasto.estado === "cancelado" ? "Gasto cancelado" : "🚫 Cancelar con autorización";

    }

 

    abrirModal(modalDetalleGastoCaja);

  }

 

  function reimprimirGastoSeleccionado() {

    if (!gastoSeleccionado) return;

 

    registrarBitacora(

      "REIMPRESION_GASTO",

      `Se reimprimió el vale ${gastoSeleccionado.folio}.`,

      gastoSeleccionado.id

    );

 

    imprimirValeGasto(gastoSeleccionado, true);

  }

 

  function abrirAutorizacionCancelacion() {

    if (!gastoSeleccionado || gastoSeleccionado.estado === "cancelado") return;

 

    const caja = obtenerCajaActual();

    if (!caja || caja.estado !== "abierta") {

      alert("No se puede cancelar un gasto después del cierre de caja.");

      return;

    }

 

    formAutorizarCancelacionGasto?.reset();

    abrirModal(modalAutorizarCancelacionGasto);

    setTimeout(() => motivoCancelacionGasto?.focus(), 50);

  }

 

  async function validarAutorizacion(usuario, password) {

    try {

      const respuesta = await fetch("/api/login", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ usuario, password }),

      });

 

      const datos = await respuesta.json();

 

      if (!respuesta.ok || !datos.ok) {

        return { ok: false, mensaje: datos.mensaje || "Usuario o contraseña incorrectos." };

      }

 

      const rol = String(datos.usuario?.rol || "").toLowerCase();

      if (!["administrador", "admin", "gerente"].includes(rol)) {

        return { ok: false, mensaje: "El usuario no tiene permiso para autorizar cancelaciones." };

      }

 

      return {

        ok: true,

        nombre: datos.usuario.nombre || datos.usuario.usuario || usuario,

        usuario: datos.usuario.usuario || usuario,

        rol,

      };

    } catch (error) {

      console.error(error);

      return {

        ok: false,

        mensaje: "No se pudo validar la autorización con el servidor.",

      };

    }

  }

 

  async function confirmarCancelacionGasto(evento) {

    evento?.preventDefault();

 

    if (!gastoSeleccionado || gastoSeleccionado.estado === "cancelado") return;

 

    const motivo = motivoCancelacionGasto?.value.trim() || "";

    const usuario = usuarioAutorizaGasto?.value.trim() || "";

    const password = passwordAutorizaGasto?.value || "";

 

    if (!motivo) {

      alert("Escribe el motivo de la cancelación.");

      motivoCancelacionGasto?.focus();

      return;

    }

 

    if (!usuario || !password) {

      alert("Escribe el usuario y la contraseña de quien autoriza.");

      usuarioAutorizaGasto?.focus();

      return;

    }

 

    if (btnConfirmarCancelacionGasto) btnConfirmarCancelacionGasto.disabled = true;

 

    try {

      const autorizacion = await validarAutorizacion(usuario, password);

 

      if (!autorizacion.ok) {

        alert(autorizacion.mensaje);

        return;

      }

 

      const confirmar = confirm(

        `Se cancelará el gasto ${gastoSeleccionado.folio} por ${formatearDinero(gastoSeleccionado.importe)}.\n\n` +

        "El registro permanecerá visible y se imprimirá un vale de cancelación.\n\n" +

        "¿Deseas continuar?"

      );

 

      if (!confirmar) return;

 

      const fechaHora = obtenerFechaHora();

      const gastos = obtenerGastos();

      const indice = gastos.findIndex((item) => item.id === gastoSeleccionado.id);

 

      if (indice < 0) {

        throw new Error("No se encontró el gasto.");

      }

 

      gastos[indice] = {

        ...gastos[indice],

        estado: "cancelado",

        cancelacion: {

          motivo,

          autorizo: autorizacion.nombre,

          usuario: autorizacion.usuario,

          rol: autorizacion.rol,

          fecha: fechaHora.fecha,

          hora: fechaHora.hora,

          fechaISO: fechaHora.fechaISO,

        },

      };

 

      guardarGastos(gastos);

      cancelarMovimientoEnCaja(gastos[indice]);

 

      registrarBitacora(

        "CANCELACION_GASTO",

        `Se canceló el gasto ${gastos[indice].folio}. Autorizó: ${autorizacion.nombre}. Motivo: ${motivo}`,

        gastos[indice].id

      );

 

      gastoSeleccionado = gastos[indice];

      cerrarModal(modalAutorizarCancelacionGasto);

      cerrarModal(modalDetalleGastoCaja);

      renderizarListadoGastos();

      imprimirValeCancelacion(gastoSeleccionado);

      window.actualizarPantallaCaja?.();

      window.dispatchEvent(new CustomEvent("gastosCajaActualizados"));

 

      alert(`Gasto ${gastoSeleccionado.folio} cancelado correctamente.`);

    } catch (error) {

      console.error(error);

      alert(error.message || "No se pudo cancelar el gasto.");

    } finally {

      if (btnConfirmarCancelacionGasto) btnConfirmarCancelacionGasto.disabled = false;

      if (passwordAutorizaGasto) passwordAutorizaGasto.value = "";

    }

  }

 

  function cancelarMovimientoEnCaja(gasto) {

    const caja = obtenerCajaActual();

 

    if (!caja || caja.estado !== "abierta") {

      throw new Error("No se puede cancelar porque la caja está cerrada.");

    }

 

    caja.movimientos = Array.isArray(caja.movimientos) ? caja.movimientos : [];

 

    const movimiento = caja.movimientos.find(

      (item) => item.gastoId === gasto.id && item.tipo === "salida"

    );

 

    if (movimiento) {

      movimiento.estado = "cancelado";

      movimiento.detalle = `${movimiento.detalle} | CANCELADO: ${gasto.cancelacion.motivo}`;

      movimiento.montoOriginal = movimiento.monto;

      movimiento.monto = 0;

      movimiento.cancelacion = gasto.cancelacion;

    }

 

    guardarJSON(CLAVE_CAJA, caja);

  }

 

  function crearVentanaImpresion(titulo, contenido) {

    const ventana = window.open("", "_blank", "width=420,height=720");

 

    if (!ventana) {

      alert("El navegador bloqueó la ventana de impresión. Permite ventanas emergentes y usa Reimprimir.");

      return;

    }

 

    ventana.document.write(`

      <!DOCTYPE html>

      <html lang="es">

      <head>

        <meta charset="UTF-8">

        <title>${escaparHTML(titulo)}</title>

        <style>

          @page { size: 80mm auto; margin: 4mm; }

          * { box-sizing: border-box; }

          body { width: 72mm; margin: 0 auto; font-family: Arial, sans-serif; color: #000; font-size: 12px; }

          h1, h2, p { margin: 0; }

          .centrado { text-align: center; }

          .titulo { font-size: 17px; font-weight: 800; margin-bottom: 3px; }

          .subtitulo { font-size: 14px; font-weight: 800; margin: 8px 0; }

          .linea { border-top: 1px dashed #000; margin: 8px 0; }

          .dato { margin: 5px 0; }

          .dato span { display: block; font-size: 10px; }

          .dato strong { display: block; font-size: 12px; }

          .importe { margin: 10px 0; text-align: center; font-size: 20px; font-weight: 900; }

          .firma { margin-top: 30px; text-align: center; }

          .firma::before { content: ""; display: block; border-top: 1px solid #000; margin-bottom: 5px; }

          .cancelado { padding: 8px; border: 3px double #000; font-size: 19px; font-weight: 900; text-align: center; }

          .reimpresion { margin-top: 5px; font-weight: 900; text-align: center; }

        </style>

      </head>

      <body>${contenido}</body>

      </html>

    `);

 

    ventana.document.close();

    ventana.focus();

 

    setTimeout(() => {

      ventana.print();

    }, 250);

  }

 

  function imprimirValeGasto(gasto, esReimpresion = false) {

    crearVentanaImpresion(

      `Vale ${gasto.folio}`,

      `

        <div class="centrado">

          <div class="titulo">RESTAURANT</div>

          <div class="subtitulo">VALE DE GASTO</div>

          ${esReimpresion ? '<div class="reimpresion">REIMPRESIÓN</div>' : ""}

        </div>

        <div class="linea"></div>

        <p class="dato"><span>Folio</span><strong>${escaparHTML(gasto.folio)}</strong></p>

        <p class="dato"><span>Fecha y hora</span><strong>${escaparHTML(gasto.fecha)} ${escaparHTML(gasto.hora)}</strong></p>

        <p class="dato"><span>Cajero</span><strong>${escaparHTML(gasto.cajero)}</strong></p>

        <div class="linea"></div>

        <p class="dato"><span>Concepto</span><strong>${escaparHTML(gasto.concepto)}</strong></p>

        <p class="dato"><span>Descripción</span><strong>${escaparHTML(gasto.descripcion)}</strong></p>

        <p class="dato"><span>Entregado a</span><strong>${escaparHTML(gasto.entregadoA)}</strong></p>

        ${

          gasto.observaciones

            ? `<p class="dato"><span>Observaciones</span><strong>${escaparHTML(gasto.observaciones)}</strong></p>`

            : ""

        }

        <div class="importe">${formatearDinero(gasto.importe)}</div>

        <div class="firma">Recibió el dinero</div>

        <div class="firma">Cajero</div>

      `

    );

  }

 

  function imprimirValeCancelacion(gasto) {

    crearVentanaImpresion(

      `Cancelación ${gasto.folio}`,

      `

        <div class="centrado">

          <div class="titulo">RESTAURANT</div>

          <div class="subtitulo">CANCELACIÓN DE GASTO</div>

        </div>

        <div class="cancelado">CANCELADO</div>

        <div class="linea"></div>

        <p class="dato"><span>Folio original</span><strong>${escaparHTML(gasto.folio)}</strong></p>

        <p class="dato"><span>Importe</span><strong>${formatearDinero(gasto.importe)}</strong></p>

        <p class="dato"><span>Motivo</span><strong>${escaparHTML(gasto.cancelacion?.motivo || "")}</strong></p>

        <p class="dato"><span>Autorizó</span><strong>${escaparHTML(gasto.cancelacion?.autorizo || "")}</strong></p>

        <p class="dato"><span>Fecha y hora</span><strong>${escaparHTML(gasto.cancelacion?.fecha || "")} ${escaparHTML(gasto.cancelacion?.hora || "")}</strong></p>

        <div class="firma">Firma de quien autoriza</div>

        <div class="firma">Cajero</div>

      `

    );

  }

 

  function conectarEventos() {

    btnSalidaCaja?.addEventListener("click", abrirModalGastoCaja);

    btnVerGastosCaja?.addEventListener("click", abrirListadoGastosCaja);

 

    formGastoCaja?.addEventListener("submit", guardarEImprimirGasto);

    btnCerrarModalGastoCaja?.addEventListener("click", cerrarModalGastoCaja);

    btnCancelarCapturaGastoCaja?.addEventListener("click", cerrarModalGastoCaja);

    modalGastoCaja?.querySelector("[data-cerrar-modal-gasto]")?.addEventListener("click", cerrarModalGastoCaja);

 

    btnCerrarListadoGastosCaja?.addEventListener("click", () => cerrarModal(modalListadoGastosCaja));

    modalListadoGastosCaja?.querySelector("[data-cerrar-listado-gastos]")?.addEventListener(

      "click",

      () => cerrarModal(modalListadoGastosCaja)

    );

 

    cuerpoListadoGastosCaja?.addEventListener("click", (evento) => {

      const boton = evento.target.closest("[data-gasto-id]");

      if (boton) abrirDetalleGasto(boton.dataset.gastoId);

    });

 

    btnCerrarDetalleGastoCaja?.addEventListener("click", () => cerrarModal(modalDetalleGastoCaja));

    modalDetalleGastoCaja?.querySelector("[data-cerrar-detalle-gasto]")?.addEventListener(

      "click",

      () => cerrarModal(modalDetalleGastoCaja)

    );

    btnReimprimirGastoCaja?.addEventListener("click", reimprimirGastoSeleccionado);

    btnCancelarGastoCaja?.addEventListener("click", abrirAutorizacionCancelacion);

 

    formAutorizarCancelacionGasto?.addEventListener("submit", confirmarCancelacionGasto);

    btnCerrarAutorizarCancelacionGasto?.addEventListener(

      "click",

      () => cerrarModal(modalAutorizarCancelacionGasto)

    );

    btnCancelarAutorizacionGasto?.addEventListener(

      "click",

      () => cerrarModal(modalAutorizarCancelacionGasto)

    );

    modalAutorizarCancelacionGasto

      ?.querySelector("[data-cerrar-autorizacion-gasto]")

      ?.addEventListener("click", () => cerrarModal(modalAutorizarCancelacionGasto));

  }

 

  document.addEventListener("DOMContentLoaded", conectarEventos);

 

  window.abrirModalGastoCaja = abrirModalGastoCaja;

  window.abrirListadoGastosCaja = abrirListadoGastosCaja;

})();