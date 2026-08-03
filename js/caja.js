/* =========================================

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

   MÓDULO DE CAJA

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

   Archivo: js/caja.js

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

   ========================================= */

(function () {
  "use strict";

  /* =========================================

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

     CONFIGURACIÓN Y DATOS

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

     ========================================= */

  const CLAVE_CAJA = "restaurant_caja_actual";

  const CLAVE_HISTORIAL_CAJAS = "restaurant_historial_cajas";

  let cajaActual = cargarCajaActual();

  /* =========================================

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

     REFERENCIAS DEL HTML

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

     ========================================= */

  const pantallaCaja = document.getElementById("pantallaCaja");

  const estadoCajaActual = document.getElementById("estadoCajaActual");

  const fondoInicialCaja = document.getElementById("fondoInicialCaja");

  const totalEntradasCaja = document.getElementById("totalEntradasCaja");

  const totalSalidasCaja = document.getElementById("totalSalidasCaja");

  const efectivoEsperadoCaja = document.getElementById("efectivoEsperadoCaja");

  const btnAbrirCaja = document.getElementById("btnAbrirCaja");

  const btnEntradaCaja = document.getElementById("btnEntradaCaja");

  const btnSalidaCaja = document.getElementById("btnSalidaCaja");

  const btnMovimientosCaja = document.getElementById("btnMovimientosCaja");

  const btnTarjetasCaja = document.getElementById("btnTarjetasCaja");

  const btnTransferenciasCaja = document.getElementById(
    "btnTransferenciasCaja",
  );

  const modalListadoTarjetasCaja = document.getElementById(
    "modalListadoTarjetasCaja",
  );

  const modalListadoTransferenciasCaja = document.getElementById(
    "modalListadoTransferenciasCaja",
  );

  const btnCerrarListadoTarjetasCaja = document.getElementById(
    "btnCerrarListadoTarjetasCaja",
  );

  const btnCerrarListadoTransferenciasCaja = document.getElementById(
    "btnCerrarListadoTransferenciasCaja",
  );

  const cuerpoListadoTarjetasCaja = document.getElementById(
    "cuerpoListadoTarjetasCaja",
  );

  const cuerpoListadoTransferenciasCaja = document.getElementById(
    "cuerpoListadoTransferenciasCaja",
  );

  const totalListadoTarjetasCaja = document.getElementById(
    "totalListadoTarjetasCaja",
  );

  const totalListadoTransferenciasCaja = document.getElementById(
    "totalListadoTransferenciasCaja",
  );

  const btnCerrarCaja = document.getElementById("btnCerrarCaja");

  const tablaMovimientosCaja = document.getElementById("tablaMovimientosCaja");

  // Referencias para los pedidos que llegan automáticamente desde Cocina.

  const contenedorMesasPendientesCaja = document.getElementById(
    "contenedorMesasPendientesCaja",
  );

  const contadorMesasPendientesCaja = document.getElementById(
    "contadorMesasPendientesCaja",
  );

  const btnActualizarMesasCaja = document.getElementById(
    "btnActualizarMesasCaja",
  );

  const modalCobroCaja = document.getElementById("modalCobroCaja");

  const tituloModalCobroCaja = document.getElementById("tituloModalCobroCaja");

  const detalleModalCobroCaja = document.getElementById(
    "detalleModalCobroCaja",
  );

  const btnCerrarModalCobroCaja = document.getElementById(
    "btnCerrarModalCobroCaja",
  );

  const btnCancelarCobroCaja = document.getElementById("btnCancelarCobroCaja");

  const btnConfirmarCobroCaja = document.getElementById(
    "btnConfirmarCobroCaja",
  );

  const propinaPagoCaja = document.getElementById("propinaPagoCaja");

  const formaPagoCaja = document.getElementById("formaPagoCaja");

  const bloqueEntregaEfectivoCaja = document.getElementById(
    "bloqueEntregaEfectivoCaja",
  );

  const entregaEfectivoCaja = document.getElementById("entregaEfectivoCaja");

  const cambioPagoCaja = document.getElementById("cambioPagoCaja");

  const totalConPropinaCaja = document.getElementById("totalConPropinaCaja");

  const bloquePagoMixtoCaja = document.getElementById("bloquePagoMixtoCaja");

  const montoEfectivoMixtoCaja = document.getElementById(
    "montoEfectivoMixtoCaja",
  );

  const montoTarjetaMixtoCaja = document.getElementById(
    "montoTarjetaMixtoCaja",
  );

  const montoTransferenciaMixtoCaja = document.getElementById(
    "montoTransferenciaMixtoCaja",
  );

  const totalCapturadoMixtoCaja = document.getElementById(
    "totalCapturadoMixtoCaja",
  );

  const diferenciaPagoMixtoCaja = document.getElementById(
    "diferenciaPagoMixtoCaja",
  );

  const CLAVE_PEDIDOS_COCINA = "restaurantPedidosCocina";

  const CLAVE_PEDIDOS_CAJA = "restaurantPedidosCaja";

  const CLAVE_CUENTAS_CAJA = "restaurant_cuentas_caja";

  const CLAVE_FOLIOS_MESAS = "restaurant_folios_mesas";

  let pedidoSeleccionadoCaja = null;

  let eventosCajaConectados = false;

  let intervaloActualizacionPedidosCaja = null;

  /* =========================================

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

     FUNCIONES GENERALES

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

     ========================================= */

  function mostrarPantallaCaja() {
    const pantallaCaja = document.getElementById("pantallaCaja");

    if (!pantallaCaja) {
      console.error("No se encontró #pantallaCaja");

      return;
    }

    pantallaCaja.classList.remove("oculto");

    if (typeof inicializarCaja === "function") {
      inicializarCaja();
    }
  }

  function ocultarPantallaCaja() {
    const pantallaCaja = document.getElementById("pantallaCaja");

    if (pantallaCaja) {
      pantallaCaja.classList.add("oculto");
    }
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
    const numero = Number(cantidad) || 0;

    return numero.toLocaleString("es-MX", {
      style: "currency",

      currency: "MXN",

      minimumFractionDigits: 2,

      maximumFractionDigits: 2,
    });
  }

  function convertirCantidad(valor) {
    if (typeof valor === "number") {
      return Number.isFinite(valor) ? valor : 0;
    }

    const limpio = String(valor || "")
      .replace(/[$,\s]/g, "")

      .trim();

    const numero = Number(limpio);

    return Number.isFinite(numero) ? numero : 0;
  }

  function escaparHTML(texto) {
    return String(texto ?? "")
      .replace(/&/g, "&amp;")

      .replace(/</g, "&lt;")

      .replace(/>/g, "&gt;")

      .replace(/"/g, "&quot;")

      .replace(/'/g, "&#039;");
  }

  function obtenerNombreCajero() {
    try {
      const usuarioActivo = JSON.parse(
        localStorage.getItem("usuarioActivo") || "null",
      );

      return usuarioActivo?.nombre || usuarioActivo?.usuario || "Cajero";
    } catch (error) {
      return "Cajero";
    }
  }

  /* =========================================

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

     GUARDADO Y CARGA

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

     ========================================= */

  function cargarCajaActual() {
    try {
      const guardada = localStorage.getItem(CLAVE_CAJA);

      if (!guardada) {
        return null;
      }

      const caja = JSON.parse(guardada);

      if (!caja || caja.estado !== "abierta") {
        return null;
      }

      caja.movimientos = Array.isArray(caja.movimientos)
        ? caja.movimientos
        : [];

      return caja;
    } catch (error) {
      console.error("No se pudo cargar la caja:", error);

      return null;
    }
  }

  function guardarCajaActual() {
    if (!cajaActual) {
      localStorage.removeItem(CLAVE_CAJA);

      return;
    }

    localStorage.setItem(CLAVE_CAJA, JSON.stringify(cajaActual));
  }

  function guardarCajaEnHistorial(cajaCerrada) {
    let historial = [];

    try {
      historial = JSON.parse(
        localStorage.getItem(CLAVE_HISTORIAL_CAJAS) || "[]",
      );

      if (!Array.isArray(historial)) {
        historial = [];
      }
    } catch (error) {
      historial = [];
    }

    historial.unshift(cajaCerrada);

    localStorage.setItem(CLAVE_HISTORIAL_CAJAS, JSON.stringify(historial));
  }

  /* =========================================

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

     CÁLCULOS DE CAJA

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

     ========================================= */

  function calcularTotales() {
    if (!cajaActual) {
      return {
        fondoInicial: 0,

        entradas: 0,

        salidas: 0,

        efectivoEsperado: 0,
      };
    }

    const movimientos = Array.isArray(cajaActual.movimientos)
      ? cajaActual.movimientos
      : [];

    const entradas = movimientos

      .filter((movimiento) => movimiento.tipo === "entrada")

      .reduce((total, movimiento) => total + Number(movimiento.monto || 0), 0);

    const salidas = movimientos

      .filter((movimiento) => movimiento.tipo === "salida")

      .reduce((total, movimiento) => total + Number(movimiento.monto || 0), 0);

    const fondoInicial = Number(cajaActual.fondoInicial || 0);

    const efectivoEsperado = fondoInicial + entradas - salidas;

    return {
      fondoInicial,

      entradas,

      salidas,

      efectivoEsperado,
    };
  }

  function calcularSaldoPorMovimiento() {
    if (!cajaActual) {
      return [];
    }

    let saldo = 0;

    return cajaActual.movimientos.map((movimiento) => {
      if (movimiento.tipo === "apertura") {
        saldo = Number(movimiento.monto || 0);
      }

      if (movimiento.tipo === "entrada") {
        saldo += Number(movimiento.monto || 0);
      }

      if (movimiento.tipo === "salida") {
        saldo -= Number(movimiento.monto || 0);
      }

      return {
        ...movimiento,

        saldo,
      };
    });
  }

  /* =========================================

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

     ACTUALIZACIÓN DE LA PANTALLA

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

     ========================================= */

  function actualizarPantallaCaja() {
    // Sincroniza la caja en memoria con los cambios realizados por otros

    // módulos, por ejemplo cajaGastos.js al registrar o cancelar un gasto.

    cajaActual = cargarCajaActual();

    if (!pantallaCaja) {
      return;
    }

    const cajaAbierta = Boolean(cajaActual && cajaActual.estado === "abierta");

    const totales = calcularTotales();

    if (estadoCajaActual) {
      estadoCajaActual.textContent = cajaAbierta
        ? "🟢 Caja Abierta"
        : "🔴 Caja Cerrada";

      estadoCajaActual.parentElement?.classList.toggle(
        "cajaEstadoAbierta",

        cajaAbierta,
      );
    }

    if (fondoInicialCaja) {
      fondoInicialCaja.textContent = formatearDinero(totales.fondoInicial);
    }

    if (totalEntradasCaja) {
      totalEntradasCaja.textContent = formatearDinero(totales.entradas);
    }

    if (totalSalidasCaja) {
      totalSalidasCaja.textContent = formatearDinero(totales.salidas);
    }

    if (efectivoEsperadoCaja) {
      efectivoEsperadoCaja.textContent = formatearDinero(
        totales.efectivoEsperado,
      );
    }

    if (btnAbrirCaja) {
      btnAbrirCaja.disabled = cajaAbierta;
    }

    if (btnEntradaCaja) {
      btnEntradaCaja.disabled = !cajaAbierta;
    }

    if (btnSalidaCaja) {
      btnSalidaCaja.disabled = !cajaAbierta;
    }

    if (btnMovimientosCaja) {
      btnMovimientosCaja.disabled = !cajaAbierta;
    }

    if (btnTarjetasCaja) btnTarjetasCaja.disabled = !cajaAbierta;

    if (btnTransferenciasCaja) btnTransferenciasCaja.disabled = !cajaAbierta;

    if (btnCerrarCaja) {
      btnCerrarCaja.disabled = !cajaAbierta;
    }

    mostrarMovimientosCaja();

    mostrarPedidosEnCaja();
  }

  function mostrarMovimientosCaja() {
    if (!tablaMovimientosCaja) {
      return;
    }

    if (!cajaActual || cajaActual.movimientos.length === 0) {
      tablaMovimientosCaja.innerHTML = `

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

        <tr>

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

          <td colspan="5" class="mensajeSinMovimientosCaja">

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

            No hay movimientos registrados.

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

          </td>

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

        </tr>

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

      `;

      return;
    }

    const movimientosConSaldo = calcularSaldoPorMovimiento();

    tablaMovimientosCaja.innerHTML = movimientosConSaldo

      .slice()

      .reverse()

      .map((movimiento) => {
        const clase = obtenerClaseMovimiento(movimiento.tipo);

        const entrada =
          movimiento.tipo === "entrada" || movimiento.tipo === "apertura"
            ? formatearDinero(movimiento.monto)
            : "—";

        const salida =
          movimiento.tipo === "salida"
            ? formatearDinero(movimiento.monto)
            : "—";

        return `

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

          <tr class="${clase}">

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

            <td>${escaparHTML(movimiento.hora)}</td>

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

            <td>

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

              <strong>${escaparHTML(movimiento.concepto)}</strong>

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

              ${
                movimiento.detalle
                  ? `<br><small>${escaparHTML(movimiento.detalle)}</small>`
                  : ""
              }

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

            </td>

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

            <td>${entrada}</td>

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

            <td>${salida}</td>

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

            <td><strong>${formatearDinero(movimiento.saldo)}</strong></td>

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

          </tr>

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

        `;
      })

      .join("");
  }

  function obtenerClaseMovimiento(tipo) {
    const clases = {
      apertura: "movimientoAperturaCaja",

      entrada: "movimientoEntradaCaja",

      salida: "movimientoSalidaCaja",

      cierre: "movimientoCierreCaja",

      venta_digital: "movimientoEntradaCaja",
    };

    return clases[tipo] || "";
  }

  /* =========================================

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

     MOVIMIENTOS

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

     ========================================= */

  function crearMovimiento(tipo, concepto, monto, detalle = "") {
    const fechaHora = obtenerFechaHora();

    return {
      id: `MOV-${Date.now()}-${Math.random().toString(16).slice(2)}`,

      tipo,

      concepto,

      detalle,

      monto: Number(monto || 0),

      fecha: fechaHora.fecha,

      hora: fechaHora.hora,

      fechaISO: fechaHora.fechaISO,

      usuario: obtenerNombreCajero(),
    };
  }

  function registrarMovimiento(tipo, concepto, monto, detalle = "") {
    if (!cajaActual || cajaActual.estado !== "abierta") {
      alert("Primero debes abrir la caja.");

      return false;
    }

    const cantidad = convertirCantidad(monto);

    if (cantidad <= 0) {
      alert("La cantidad debe ser mayor que cero.");

      return false;
    }

    cajaActual.movimientos.push(
      crearMovimiento(tipo, concepto, cantidad, detalle),
    );

    guardarCajaActual();

    actualizarPantallaCaja();

    return true;
  }

  /* =========================================

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

     APERTURA DE CAJA

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

     ========================================= */

  function abrirCaja() {
    if (cajaActual && cajaActual.estado === "abierta") {
      alert("La caja ya está abierta.");

      return;
    }

    const fondoCapturado = prompt(
      "Escribe el fondo inicial de la caja:",

      "1000",
    );

    if (fondoCapturado === null) {
      return;
    }

    const fondo = convertirCantidad(fondoCapturado);

    if (fondo < 0) {
      alert("El fondo inicial no puede ser negativo.");

      return;
    }

    const fechaHora = obtenerFechaHora();

    cajaActual = {
      id: `CAJA-${Date.now()}`,

      estado: "abierta",

      cajero: obtenerNombreCajero(),

      fondoInicial: fondo,

      fechaApertura: fechaHora.fecha,

      horaApertura: fechaHora.hora,

      fechaAperturaISO: fechaHora.fechaISO,

      movimientos: [
        crearMovimiento(
          "apertura",

          "Apertura de caja",

          fondo,

          `Fondo inicial registrado por ${obtenerNombreCajero()}`,
        ),
      ],
    };

    guardarCajaActual();

    actualizarPantallaCaja();

    alert(`Caja abierta con ${formatearDinero(fondo)}.`);
  }

  /* =========================================

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

     ENTRADA MANUAL

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

     ========================================= */

  function registrarEntradaCaja() {
    if (!cajaActual) {
      alert("Primero debes abrir la caja.");

      return;
    }

    const concepto = prompt(
      "Escribe el concepto de la entrada:",

      "Entrada de efectivo",
    );

    if (concepto === null) {
      return;
    }

    if (!concepto.trim()) {
      alert("Debes escribir un concepto.");

      return;
    }

    const montoCapturado = prompt("Escribe la cantidad de la entrada:", "0");

    if (montoCapturado === null) {
      return;
    }

    const monto = convertirCantidad(montoCapturado);

    if (registrarMovimiento("entrada", concepto.trim(), monto)) {
      alert(`Entrada registrada por ${formatearDinero(monto)}.`);
    }
  }

  /* =========================================

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

     GASTO O SALIDA

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

     ========================================= */

  function registrarSalidaCaja() {
    if (!cajaActual) {
      alert("Primero debes abrir la caja.");

      return;
    }

    const concepto = prompt(
      "Escribe el concepto del gasto:",

      "Gasto de operación",
    );

    if (concepto === null) {
      return;
    }

    if (!concepto.trim()) {
      alert("Debes escribir un concepto.");

      return;
    }

    const montoCapturado = prompt("Escribe la cantidad del gasto:", "0");

    if (montoCapturado === null) {
      return;
    }

    const monto = convertirCantidad(montoCapturado);

    const totales = calcularTotales();

    if (monto > totales.efectivoEsperado) {
      const continuar = confirm(
        "El gasto es mayor que el efectivo esperado. ¿Deseas registrarlo de todos modos?",
      );

      if (!continuar) {
        return;
      }
    }

    if (registrarMovimiento("salida", concepto.trim(), monto)) {
      alert(`Gasto registrado por ${formatearDinero(monto)}.`);
    }
  }

  /* =========================================

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

     MOSTRAR HISTORIAL

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

     ========================================= */

  function verMovimientosCaja() {
    if (!cajaActual) {
      alert("No hay una caja abierta.");

      return;
    }

    const totales = calcularTotales();

    alert(
      [
        `Caja de: ${cajaActual.cajero}`,

        `Apertura: ${cajaActual.fechaApertura} ${cajaActual.horaApertura}`,

        `Movimientos: ${cajaActual.movimientos.length}`,

        `Entradas: ${formatearDinero(totales.entradas)}`,

        `Salidas: ${formatearDinero(totales.salidas)}`,

        `Efectivo esperado: ${formatearDinero(totales.efectivoEsperado)}`,
      ].join("\n"),
    );
  }

  /* =========================================

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

     CIERRE DE CAJA

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

     ========================================= */

  function cerrarCaja() {
    if (!cajaActual || cajaActual.estado !== "abierta") {
      alert("No hay una caja abierta.");

      return;
    }

    const totales = calcularTotales();

    const efectivoCapturado = prompt(
      `Efectivo esperado: ${formatearDinero(totales.efectivoEsperado)}\n\n` +
        "Escribe el efectivo contado:",

      totales.efectivoEsperado.toFixed(2),
    );

    if (efectivoCapturado === null) {
      return;
    }

    const efectivoContado = convertirCantidad(efectivoCapturado);

    if (efectivoContado < 0) {
      alert("El efectivo contado no puede ser negativo.");

      return;
    }

    const diferencia = efectivoContado - totales.efectivoEsperado;

    let mensajeDiferencia = "Caja exacta";

    if (diferencia > 0) {
      mensajeDiferencia = `Sobrante de ${formatearDinero(diferencia)}`;
    }

    if (diferencia < 0) {
      mensajeDiferencia = `Faltante de ${formatearDinero(Math.abs(diferencia))}`;
    }

    const confirmarCierre = confirm(
      [
        "RESUMEN DEL CIERRE",

        "",

        `Fondo inicial: ${formatearDinero(totales.fondoInicial)}`,

        `Entradas: ${formatearDinero(totales.entradas)}`,

        `Salidas: ${formatearDinero(totales.salidas)}`,

        `Efectivo esperado: ${formatearDinero(totales.efectivoEsperado)}`,

        `Efectivo contado: ${formatearDinero(efectivoContado)}`,

        `${mensajeDiferencia}`,

        "",

        "¿Confirmas el cierre de caja?",
      ].join("\n"),
    );

    if (!confirmarCierre) {
      return;
    }

    const fechaHora = obtenerFechaHora();

    const cajaCerrada = {
      ...cajaActual,

      estado: "cerrada",

      fechaCierre: fechaHora.fecha,

      horaCierre: fechaHora.hora,

      fechaCierreISO: fechaHora.fechaISO,

      totalEntradas: totales.entradas,

      totalSalidas: totales.salidas,

      efectivoEsperado: totales.efectivoEsperado,

      efectivoContado,

      diferencia,

      resultadoCierre: mensajeDiferencia,
    };

    guardarCajaEnHistorial(cajaCerrada);

    cajaActual = null;

    guardarCajaActual();

    actualizarPantallaCaja();

    alert(`Caja cerrada correctamente.\n\n${mensajeDiferencia}.`);
  }

  /* =========================================

 

 

 

 

 

 

 

     PEDIDOS ENVIADOS A COCINA Y COBRO

 

 

 

 

 

 

 

     ========================================= */

  function leerArregloCaja(clave) {
    try {
      const datos = JSON.parse(localStorage.getItem(clave) || "[]");

      return Array.isArray(datos) ? datos : [];
    } catch {
      return [];
    }
  }

  function guardarCuentasCaja(cuentas) {
    localStorage.setItem(CLAVE_CUENTAS_CAJA, JSON.stringify(cuentas));
  }

  function buscarCuentaDelPedido(cuentas, pedido) {
    const folioPedido = String(pedido?.folio || "").trim();

    // El folio identifica una venta concreta. La mesa puede reutilizarse muchas veces.

    if (folioPedido) {
      return cuentas.find(
        (cuenta) => String(cuenta.folio || "").trim() === folioPedido,
      );
    }

    // Compatibilidad únicamente para pedidos antiguos que todavía no tengan folio.

    return cuentas.find(
      (cuenta) =>
        !String(cuenta.folio || "").trim() &&
        String(cuenta.mesaId) === String(pedido?.mesaId),
    );
  }

  function leerFoliosMesasCaja() {
    try {
      const datos = JSON.parse(
        localStorage.getItem(CLAVE_FOLIOS_MESAS) || "{}",
      );

      return datos && typeof datos === "object" ? datos : {};
    } catch {
      return {};
    }
  }

  function imprimirDocumentoTicket(titulo, contenidoHTML) {
    const ventana = window.open("", "ticketRestaurant", "width=420,height=720");

    if (!ventana) {
      alert(
        "El navegador bloqueó la ventana de impresión. Permite ventanas emergentes para imprimir.",
      );

      return;
    }

    ventana.document.write(`<!DOCTYPE html>

 

 

 

 

 

 

 

      <html lang="es"><head><meta charset="UTF-8"><title>${escaparHTML(titulo)}</title>

 

 

 

 

 

 

 

      <style>

 

 

 

 

 

 

 

        @page { size: 80mm auto; margin: 3mm; }

 

 

 

 

 

 

 

        body { width: 74mm; margin: 0 auto; font-family: Arial, sans-serif; font-size: 12px; color: #000; }

 

 

 

 

 

 

 

        h1, h2, p { margin: 4px 0; }

 

 

 

 

 

 

 

        h1 { text-align: center; font-size: 17px; }

 

 

 

 

 

 

 

        .centro { text-align: center; }

 

 

 

 

 

 

 

        .linea { border-top: 1px dashed #000; margin: 7px 0; }

 

 

 

 

 

 

 

        .fila { display: flex; justify-content: space-between; gap: 8px; margin: 3px 0; }

 

 

 

 

 

 

 

        .producto { max-width: 52mm; }

 

 

 

 

 

 

 

        .total { font-size: 15px; font-weight: 700; }

 

 

 

 

 

 

 

        .qrPendiente { margin-top: 10px; text-align: center; font-size: 10px; }

 

 

 

 

 

 

 

      </style></head><body>${contenidoHTML}</body></html>`);

    ventana.document.close();

    ventana.focus();

    setTimeout(() => {
      ventana.print();

      ventana.close();
    }, 250);
  }

  function imprimirCuentaPedidoCaja(mesaId) {
    const pedido = obtenerPedidosAgrupadosCaja().find(
      (item) => String(item.mesaId) === String(mesaId),
    );

    if (!pedido) return;

    const productosAgrupados = agruparProductosCaja(pedido.productos);

    const productos = productosAgrupados.length
      ? productosAgrupados

          .map(
            (producto) =>
              `<div class="fila"><span class="producto">${producto.cantidad} × ${escaparHTML(producto.nombre)}</span><strong>${formatearDinero(producto.importe)}</strong></div>`,
          )

          .join("")
      : "<p>Consumo registrado en la mesa.</p>";

    imprimirDocumentoTicket(
      "Cuenta",

      `

 

 

 

 

 

 

 

      <h1>RESTAURANT</h1>

 

 

 

 

 

 

 

      <p class="centro">Cuenta de consumo</p>

 

 

 

 

 

 

 

      <div class="linea"></div>

 

 

 

 

 

 

 

      <div class="fila"><span>Folio</span><strong>${escaparHTML(pedido.folio || "—")}</strong></div>

 

 

 

 

 

 

 

      <div class="fila"><span>Mesa</span><strong>${escaparHTML(pedido.mesaNombre)}</strong></div>

 

 

 

 

 

 

 

      <div class="linea"></div>

 

 

 

 

 

 

 

      ${productos}

 

 

 

 

 

 

 

      <div class="linea"></div>

 

 

 

 

 

 

 

      <div class="fila total"><span>TOTAL</span><strong>${formatearDinero(pedido.total)}</strong></div>

 

 

 

 

 

 

 

      <div class="linea"></div>

 

 

 

 

 

 

 

      <p class="centro">Gracias por su visita</p>

 

 

 

 

 

 

 

    `,
    );
  }

  function imprimirPagoPedidoCaja(mesaId) {
    const pedidoActual = obtenerPedidosAgrupadosCaja().find(
      (item) => String(item.mesaId) === String(mesaId),
    );

    const cuenta = buscarCuentaDelPedido(
      leerArregloCaja(CLAVE_CUENTAS_CAJA),

      pedidoActual || { mesaId, folio: "" },
    );

    if (!cuenta || cuenta.estadoPago !== "pagado") {
      alert("Primero debe registrarse el pago para imprimir este comprobante.");

      return;
    }

    imprimirDocumentoTicket(
      "Comprobante de pago",

      `

 

 

 

 

 

 

 

      <h1>RESTAURANT</h1>

 

 

 

 

 

 

 

      <p class="centro">Comprobante para factura</p>

 

 

 

 

 

 

 

      <div class="linea"></div>

 

 

 

 

 

 

 

      <div class="fila"><span>Folio</span><strong>${escaparHTML(cuenta.folio || "—")}</strong></div>

 

 

 

 

 

 

 

      <div class="fila"><span>Mesa</span><strong>${escaparHTML(cuenta.mesaNombre)}</strong></div>

 

 

 

 

 

 

 

      <div class="fila"><span>Fecha</span><strong>${escaparHTML(cuenta.fechaPago || "")}</strong></div>

 

 

 

 

 

 

 

      <div class="fila"><span>Hora</span><strong>${escaparHTML(cuenta.horaPago || "")}</strong></div>

 

 

 

 

 

 

 

      <div class="linea"></div>

 

 

 

 

 

 

 

      <div class="fila"><span>Consumo</span><strong>${formatearDinero(cuenta.consumo)}</strong></div>

 

 

 

 

 

 

 

      <div class="fila"><span>Propina</span><strong>${formatearDinero(cuenta.propina)}</strong></div>

 

 

 

 

 

 

 

      <div class="linea"></div>

 

 

 

 

 

 

 

      <div class="fila total"><span>TOTAL PAGADO</span><strong>${formatearDinero(cuenta.total)}</strong></div>

 

 

 

 

 

 

 

      <div class="fila"><span>Forma de pago</span><strong>${escaparHTML(cuenta.formaPago)}</strong></div>

 

      ${
        cuenta.formaPago === "Mixto"
          ? `

 

        <div class="fila"><span>Efectivo</span><strong>${formatearDinero(cuenta.montoEfectivo || 0)}</strong></div>

 

        <div class="fila"><span>Tarjeta</span><strong>${formatearDinero(cuenta.montoTarjeta || 0)}</strong></div>

 

        <div class="fila"><span>Transferencia</span><strong>${formatearDinero(cuenta.montoTransferencia || 0)}</strong></div>

 

      `
          : ""
      }

 

 

 

 

 

 

 

      <div class="linea"></div>

 

 

 

 

 

 

 

      <p class="centro">Conserve este comprobante para solicitar su factura.</p>

 

 

 

 

 

 

 

      <!-- Aquí se agregará el QR cuando exista la dirección del módulo de facturación. -->

 

 

 

 

 

 

 

    `,
    );
  }

  function actualizarResumenPagoCaja() {
    if (!pedidoSeleccionadoCaja) return;

    const consumo = Number(pedidoSeleccionadoCaja.total || 0);

    const propina = Math.max(0, convertirCantidad(propinaPagoCaja?.value));

    const total = consumo + propina;

    const formaPago = formaPagoCaja?.value || "Efectivo";

    if (totalConPropinaCaja)
      totalConPropinaCaja.textContent = formatearDinero(total);

    const esEfectivo = formaPago === "Efectivo";

    const esMixto = formaPago === "Mixto";

    bloqueEntregaEfectivoCaja?.classList.toggle("oculto", !esEfectivo);

    bloquePagoMixtoCaja?.classList.toggle("oculto", !esMixto);

    const entrega = convertirCantidad(entregaEfectivoCaja?.value);

    if (cambioPagoCaja) {
      cambioPagoCaja.textContent = formatearDinero(
        esEfectivo ? Math.max(0, entrega - total) : 0,
      );
    }

    const efectivo = Math.max(
      0,

      convertirCantidad(montoEfectivoMixtoCaja?.value),
    );

    const tarjeta = Math.max(
      0,

      convertirCantidad(montoTarjetaMixtoCaja?.value),
    );

    const transferencia = Math.max(
      0,

      convertirCantidad(montoTransferenciaMixtoCaja?.value),
    );

    const capturado = efectivo + tarjeta + transferencia;

    const diferencia = total - capturado;

    if (totalCapturadoMixtoCaja)
      totalCapturadoMixtoCaja.textContent = formatearDinero(capturado);

    if (diferenciaPagoMixtoCaja) {
      diferenciaPagoMixtoCaja.classList.toggle(
        "pagoMixtoCorrectoCaja",

        esMixto && Math.abs(diferencia) < 0.005,
      );

      diferenciaPagoMixtoCaja.classList.toggle(
        "pagoMixtoExcedidoCaja",

        esMixto && diferencia < -0.005,
      );

      diferenciaPagoMixtoCaja.textContent =
        Math.abs(diferencia) < 0.005
          ? "✓ Total completo"
          : diferencia > 0
            ? `Faltan ${formatearDinero(diferencia)}`
            : `Excede por ${formatearDinero(Math.abs(diferencia))}`;
    }
  }

  function liberarMesaDespuesDelPago(mesaId) {
    // Se elimina de Cocina y del mapa de folios para que deje de mostrarse como ocupada.

    const restantes = leerArregloCaja(CLAVE_PEDIDOS_COCINA).filter(
      (item) => String(item.mesaId) !== String(mesaId),
    );

    localStorage.setItem(CLAVE_PEDIDOS_COCINA, JSON.stringify(restantes));

    const pedidosCajaRestantes = leerArregloCaja(CLAVE_PEDIDOS_CAJA).filter(
      (item) => String(item.mesaId) !== String(mesaId),
    );

    localStorage.setItem(
      CLAVE_PEDIDOS_CAJA,

      JSON.stringify(pedidosCajaRestantes),
    );

    const folios = leerFoliosMesasCaja();

    delete folios[String(mesaId)];

    localStorage.setItem(CLAVE_FOLIOS_MESAS, JSON.stringify(folios));

    // Intento de actualización en el servidor. Si el endpoint todavía no existe,

    // el flujo local continúa y después se puede conectar al backend definitivo.

    fetch(`/api/mesas/${encodeURIComponent(mesaId)}/liberar`, {
      method: "PUT",
    }).catch(() => {});
  }

  function obtenerPedidosAgrupadosCaja() {
    const pedidosPersistidos = leerArregloCaja(CLAVE_PEDIDOS_CAJA);

    const tarjetasCocina = leerArregloCaja(CLAVE_PEDIDOS_COCINA);

    const cuentas = leerArregloCaja(CLAVE_CUENTAS_CAJA);

    const foliosMesas = leerFoliosMesasCaja();

    const grupos = new Map();

    pedidosPersistidos.forEach((pedido) => {
      const mesaId = String(pedido.mesaId ?? "");

      if (!mesaId) return;

      grupos.set(mesaId, {
        mesaId,

        mesaNombre: pedido.mesaNombre || `Mesa ${mesaId}`,

        tarjetas: [],

        comensales: Array.isArray(pedido.comensales) ? pedido.comensales : [],

        productos: Array.isArray(pedido.productos) ? pedido.productos : [],

        total: Number(pedido.total || 0),

        estadoCocina: "EN_COCINA",

        estadoPago: pedido.estadoPago || "pendiente",

        folio: String(pedido.folio || foliosMesas[mesaId]?.folio || ""),
      });
    });

    // Compatibilidad con pedidos anteriores que todavía no tienen el nuevo respaldo de Caja.

    tarjetasCocina.forEach((tarjeta) => {
      const mesaId = String(tarjeta.mesaId ?? "");

      if (!mesaId) return;

      if (!grupos.has(mesaId)) {
        const pedidoMemoria = obtenerPedidoMemoriaCaja(mesaId);

        grupos.set(mesaId, {
          mesaId,

          mesaNombre: tarjeta.mesaNombre || `Mesa ${mesaId}`,

          tarjetas: [],

          comensales: pedidoMemoria.comensales,

          productos: pedidoMemoria.productos,

          total: pedidoMemoria.total,

          estadoCocina: "EN_COCINA",

          estadoPago: "pendiente",

          folio: foliosMesas[mesaId]?.folio || "",
        });
      }

      grupos.get(mesaId).tarjetas.push(tarjeta);
    });

    grupos.forEach((grupo) => {
      grupo.estadoCocina = grupo.tarjetas.length
        ? calcularEstadoCocinaCaja(grupo.tarjetas)
        : calcularEstadoProductosCaja(grupo.productos);

      const cuenta = buscarCuentaDelPedido(cuentas, grupo);

      if (cuenta) {
        grupo.estadoPago = cuenta.estadoPago || "pendiente";

        grupo.formaPago = cuenta.formaPago || "";

        grupo.fechaPago = cuenta.fechaPago || "";

        // El monto de consumo se conserva; cuenta.total puede incluir propina.

        grupo.total = Number(cuenta.consumo ?? grupo.total ?? 0);
      }
    });

    return Array.from(grupos.values());
  }

  function calcularEstadoProductosCaja(productos) {
    const estados = (productos || []).map((producto) =>
      String(producto.estadoCocina || "").toUpperCase(),
    );

    if (estados.some((estado) => estado === "PREPARANDO")) return "PREPARANDO";

    if (
      estados.length &&
      estados.every((estado) =>
        ["LISTO", "TERMINADO", "REGISTRADO_MESERO"].includes(estado),
      )
    ) {
      return "LISTO";
    }

    return "EN_COCINA";
  }

  function obtenerPedidoMemoriaCaja(mesaId) {
    const vacio = { comensales: [], productos: [], total: 0 };

    try {
      if (typeof pedidosPorMesa === "undefined" || !pedidosPorMesa?.get)
        return vacio;

      const pedido =
        pedidosPorMesa.get(mesaId) || pedidosPorMesa.get(Number(mesaId));

      if (!pedido || !Array.isArray(pedido.comensales)) return vacio;

      const productos = [];

      let total = 0;

      pedido.comensales.forEach((comensal) => {
        (comensal.productos || []).forEach((producto) => {
          const precio = Number(producto.precioFinal ?? producto.precio ?? 0);

          total += precio;

          productos.push({
            nombre: producto.nombre || "Producto",

            comensal: comensal.nombre || `Comensal ${comensal.numero || ""}`,

            precio,

            observaciones: producto.observaciones || "",

            extras: Array.isArray(producto.extras) ? producto.extras : [],
          });
        });
      });

      return { comensales: pedido.comensales, productos, total };
    } catch (error) {
      console.warn("No fue posible leer el consumo de la mesa:", error);

      return vacio;
    }
  }

  function agruparProductosCaja(productos) {
    const grupos = new Map();

    (productos || []).forEach((producto) => {
      const nombre = String(producto.nombre || "Producto").trim();

      const precio = Number(producto.precioFinal ?? producto.precio ?? 0);

      const extras = Array.isArray(producto.extras)
        ? producto.extras

            .map((extra) => {
              const nombreExtra =
                typeof extra === "string" ? extra : extra?.nombre || "";

              const precioExtra =
                typeof extra === "string" ? 0 : Number(extra?.precio || 0);

              if (!nombreExtra) return "";

              return `${nombreExtra} (${precioExtra > 0 ? "+" : ""}${formatearDinero(precioExtra)})`;
            })

            .filter(Boolean)

            .join(", ")
        : "";

      const observaciones = String(producto.observaciones || "").trim();

      const clave = `${nombre.toLowerCase()}|${precio}|${extras.toLowerCase()}|${observaciones.toLowerCase()}`;

      if (!grupos.has(clave)) {
        grupos.set(clave, {
          nombre,

          cantidad: 0,

          precioUnitario: precio,

          importe: 0,

          extras,

          observaciones,
        });
      }

      const grupo = grupos.get(clave);

      grupo.cantidad += 1;

      grupo.importe += precio;
    });

    return Array.from(grupos.values());
  }

  function calcularEstadoCocinaCaja(tarjetas) {
    const estados = tarjetas.map((tarjeta) =>
      String(tarjeta.estado || "NUEVO").toUpperCase(),
    );

    if (estados.some((estado) => estado === "PREPARANDO")) return "PREPARANDO";

    if (
      estados.length > 0 &&
      estados.every((estado) => estado === "TERMINADO" || estado === "LISTO")
    )
      return "LISTO";

    return "EN_COCINA";
  }

  function mostrarPedidosEnCaja() {
    if (!contenedorMesasPendientesCaja) return;

    const pedidos = obtenerPedidosAgrupadosCaja();

    const pendientes = pedidos.filter(
      (pedido) => pedido.estadoPago !== "pagado",
    ).length;

    if (contadorMesasPendientesCaja) {
      contadorMesasPendientesCaja.textContent = `${pedidos.length} pedido${pedidos.length === 1 ? "" : "s"} · ${pendientes} por cobrar`;
    }

    if (pedidos.length === 0) {
      contenedorMesasPendientesCaja.innerHTML = `

 

 

 

 

 

 

 

        <div class="sinMesasPendientesCaja">

 

 

 

 

 

 

 

          <span>✅</span>

 

 

 

 

 

 

 

          <strong>No hay pedidos enviados a cocina</strong>

 

 

 

 

 

 

 

          <p>Aparecerán aquí automáticamente al presionar “Enviar a cocina”.</p>

 

 

 

 

 

 

 

        </div>

 

 

 

 

 

 

 

      `;

      return;
    }

    contenedorMesasPendientesCaja.innerHTML = pedidos

      .map((pedido) => crearTarjetaPedidoCaja(pedido))

      .join("");

    contenedorMesasPendientesCaja

      .querySelectorAll("[data-detalle-pedido]")

      .forEach((boton) => {
        boton.addEventListener("click", () =>
          abrirDetallePedidoCaja(boton.dataset.detallePedido, false),
        );
      });

    contenedorMesasPendientesCaja

      .querySelectorAll("[data-imprimir-cuenta]")

      .forEach((boton) => {
        boton.addEventListener("click", () =>
          imprimirCuentaPedidoCaja(boton.dataset.imprimirCuenta),
        );
      });

    contenedorMesasPendientesCaja

      .querySelectorAll("[data-pagar-pedido]")

      .forEach((boton) => {
        boton.addEventListener("click", () =>
          abrirDetallePedidoCaja(boton.dataset.pagarPedido, true),
        );
      });

    contenedorMesasPendientesCaja

      .querySelectorAll("[data-imprimir-pago]")

      .forEach((boton) => {
        boton.addEventListener("click", () =>
          imprimirPagoPedidoCaja(boton.dataset.imprimirPago),
        );
      });
  }

  function crearTarjetaPedidoCaja(pedido) {
    const pagado = pedido.estadoPago === "pagado";

    const claseCocina =
      pedido.estadoCocina === "LISTO"
        ? "estadoCocinaListo"
        : "estadoCocinaPreparando";

    const textoCocina =
      pedido.estadoCocina === "LISTO"
        ? "🟢 Listo"
        : pedido.estadoCocina === "PREPARANDO"
          ? "🟡 Preparando"
          : "🟠 En cocina";

    return `

 

 

 

 

 

 

 

      <article class="tarjetaPedidoCaja ${pagado ? "pedidoPagadoCaja" : ""}">

 

 

 

 

 

 

 

        <div class="cabeceraPedidoCaja">

 

 

 

 

 

 

 

          <div><h3>🍽️ ${escaparHTML(pedido.mesaNombre)}</h3><small>Folio: ${escaparHTML(pedido.folio || "Pendiente")}</small></div>

 

 

 

 

 

 

 

          <span class="totalPedidoCaja">${formatearDinero(pedido.total)}</span>

 

 

 

 

 

 

 

        </div>

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

        <div class="datosPedidoCaja">

 

 

 

 

 

 

 

          <div class="filaEstadoPedidoCaja"><span>Comensales</span><strong>${pedido.comensales.length || "—"}</strong></div>

 

 

 

 

 

 

 

          <div class="filaEstadoPedidoCaja"><span>Cocina</span><strong class="insigniaEstadoCaja ${claseCocina}">${textoCocina}</strong></div>

 

 

 

 

 

 

 

          <div class="filaEstadoPedidoCaja"><span>Pago</span><strong class="insigniaEstadoCaja ${pagado ? "estadoPagoPagado" : "estadoPagoPendiente"}">${pagado ? "✅ Pagado" : "🔴 Pendiente"}</strong></div>

 

 

 

 

 

 

 

        </div>

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

        <div class="botonesOperacionCaja">

 

 

 

 

 

 

 

          <button class="btnDetalleCaja" type="button" data-detalle-pedido="${escaparHTML(pedido.mesaId)}">📋 Detalle</button>

 

 

 

          <button class="btnCuentaCaja" type="button" data-imprimir-cuenta="${escaparHTML(pedido.mesaId)}">🧾 Cobrar</button>

 

 

 

 

 

 

 

          <button class="btnPagarCaja" type="button" data-pagar-pedido="${escaparHTML(pedido.mesaId)}" ${pagado ? "disabled" : ""}>${pagado ? "✅ Pagado" : "💳 Pagar"}</button>

 

 

 

 

 

 

 

          <button class="btnImprimirPagoCaja" type="button" data-imprimir-pago="${escaparHTML(pedido.mesaId)}" title="Imprimir comprobante de pago" aria-label="Imprimir comprobante de pago" ${pagado ? "" : "disabled"}>🖨️</button>

 

 

 

 

 

 

 

        </div>

 

 

 

 

 

 

 

      </article>

 

 

 

 

 

 

 

    `;
  }

  function abrirDetallePedidoCaja(mesaId, iniciarCobro = false) {
    pedidoSeleccionadoCaja = obtenerPedidosAgrupadosCaja().find(
      (pedido) => String(pedido.mesaId) === String(mesaId),
    );

    if (!pedidoSeleccionadoCaja || !modalCobroCaja) return;

    if (tituloModalCobroCaja)
      tituloModalCobroCaja.textContent = pedidoSeleccionadoCaja.mesaNombre;

    const productosAgrupados = agruparProductosCaja(
      pedidoSeleccionadoCaja.productos,
    );

    const lista = productosAgrupados.length
      ? productosAgrupados

          .map((producto) => {
            const detalles = [producto.extras, producto.observaciones]

              .filter(Boolean)

              .join(" · ");

            return `

 

          <li>

 

            <span><strong>${producto.cantidad} × ${escaparHTML(producto.nombre)}</strong>${detalles ? `<br><small>${escaparHTML(detalles)}</small>` : ""}</span>

 

            <strong>${formatearDinero(producto.importe)}</strong>

 

          </li>

 

        `;
          })

          .join("")
      : "<li><span>No hay productos registrados.</span><strong>—</strong></li>";

    if (detalleModalCobroCaja) {
      detalleModalCobroCaja.innerHTML = `

 

 

 

 

 

 

 

        <p><strong>Estado de cocina:</strong> ${escaparHTML(pedidoSeleccionadoCaja.estadoCocina)}</p>

 

 

 

 

 

 

 

        <p><strong>Estado del pago:</strong> ${pedidoSeleccionadoCaja.estadoPago === "pagado" ? "Pagado" : "Pendiente"}</p>

 

 

 

 

 

 

 

        <ul class="listaConsumoCaja">${lista}</ul>

 

 

 

 

 

 

 

        <div class="resumenCobroCaja"><span>Total del pedido</span><strong>${formatearDinero(pedidoSeleccionadoCaja.total)}</strong></div>

 

 

 

 

 

 

 

      `;
    }

    if (propinaPagoCaja) propinaPagoCaja.value = "0";

    if (formaPagoCaja) formaPagoCaja.value = "Efectivo";

    if (entregaEfectivoCaja) entregaEfectivoCaja.value = "0";

    if (montoEfectivoMixtoCaja) montoEfectivoMixtoCaja.value = "0";

    if (montoTarjetaMixtoCaja) montoTarjetaMixtoCaja.value = "0";

    if (montoTransferenciaMixtoCaja) montoTransferenciaMixtoCaja.value = "0";

    actualizarResumenPagoCaja();

    if (btnConfirmarCobroCaja) {
      const pagado = pedidoSeleccionadoCaja.estadoPago === "pagado";

      btnConfirmarCobroCaja.disabled = pagado;

      btnConfirmarCobroCaja.textContent = pagado
        ? "✓ Pedido pagado"
        : "💳 Confirmar pago";
    }

    modalCobroCaja.classList.remove("oculto");

    modalCobroCaja.setAttribute("aria-hidden", "false");

    document.body.classList.add("modalAbierto");

    // iniciarCobro solo abre el modal; el cajero captura propina y forma de pago.

    if (iniciarCobro) propinaPagoCaja?.focus();
  }

  function cerrarModalCobroCaja() {
    modalCobroCaja?.classList.add("oculto");

    modalCobroCaja?.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modalAbierto");

    pedidoSeleccionadoCaja = null;
  }

  function confirmarCobroPedidoCaja() {
    if (!pedidoSeleccionadoCaja) return;

    if (!cajaActual || cajaActual.estado !== "abierta") {
      alert("Primero debes abrir la caja para registrar el pago.");

      return;
    }

    if (pedidoSeleccionadoCaja.estadoPago === "pagado") return;

    const consumo = Number(pedidoSeleccionadoCaja.total || 0);

    const propina = Math.max(0, convertirCantidad(propinaPagoCaja?.value));

    const total = consumo + propina;

    const formaPago = formaPagoCaja?.value || "Efectivo";

    let montoEfectivo = formaPago === "Efectivo" ? total : 0;

    let montoTarjeta = formaPago === "Tarjeta" ? total : 0;

    let montoTransferencia = formaPago === "Transferencia" ? total : 0;

    if (formaPago === "Mixto") {
      montoEfectivo = Math.max(
        0,

        convertirCantidad(montoEfectivoMixtoCaja?.value),
      );

      montoTarjeta = Math.max(
        0,

        convertirCantidad(montoTarjetaMixtoCaja?.value),
      );

      montoTransferencia = Math.max(
        0,

        convertirCantidad(montoTransferenciaMixtoCaja?.value),
      );
    }

    if (consumo <= 0) {
      alert("El pedido todavía no tiene un consumo disponible.");

      return;
    }

    if (formaPago === "Efectivo") {
      const entrega = convertirCantidad(entregaEfectivoCaja?.value);

      if (entrega < total) {
        alert(
          `El efectivo entregado debe ser por lo menos ${formatearDinero(total)}.`,
        );

        return;
      }
    }

    if (formaPago === "Mixto") {
      const importes = [montoEfectivo, montoTarjeta, montoTransferencia];

      const metodosUsados = importes.filter(
        (importe) => importe > 0.005,
      ).length;

      const suma = importes.reduce(
        (acumulado, importe) => acumulado + importe,

        0,
      );

      if (metodosUsados < 2) {
        alert("Un pago mixto debe utilizar por lo menos dos formas de pago.");

        return;
      }

      if (Math.abs(suma - total) >= 0.005) {
        alert(
          `La suma de efectivo, tarjeta y transferencia debe ser exactamente ${formatearDinero(total)}.`,
        );

        return;
      }
    }

    const lineasMixtas =
      formaPago === "Mixto"
        ? [
            montoEfectivo > 0
              ? `Efectivo: ${formatearDinero(montoEfectivo)}`
              : "",

            montoTarjeta > 0 ? `Tarjeta: ${formatearDinero(montoTarjeta)}` : "",

            montoTransferencia > 0
              ? `Transferencia: ${formatearDinero(montoTransferencia)}`
              : "",
          ].filter(Boolean)
        : [];

    const confirmar = confirm(
      [
        pedidoSeleccionadoCaja.mesaNombre,

        `Folio: ${pedidoSeleccionadoCaja.folio || "—"}`,

        `Consumo: ${formatearDinero(consumo)}`,

        `Propina: ${formatearDinero(propina)}`,

        `Total: ${formatearDinero(total)}`,

        `Forma de pago: ${formaPago}`,

        ...lineasMixtas,

        "",

        "¿Confirmas el pago y la liberación de la mesa?",
      ].join("\n"),
    );

    if (!confirmar) return;

    const fechaHora = obtenerFechaHora();

    const folioPedido = String(pedidoSeleccionadoCaja.folio || "").trim();

    const cuentas = leerArregloCaja(CLAVE_CUENTAS_CAJA).filter((cuenta) => {
      if (folioPedido) return String(cuenta.folio || "").trim() !== folioPedido;

      return !(
        !String(cuenta.folio || "").trim() &&
        String(cuenta.mesaId) === String(pedidoSeleccionadoCaja.mesaId)
      );
    });

cuentas.unshift({
  folio: pedidoSeleccionadoCaja.folio || "",

  mesaId: pedidoSeleccionadoCaja.mesaId,

  mesaNombre: pedidoSeleccionadoCaja.mesaNombre,

  /* Guardamos el detalle de los artículos vendidos */
  productos: Array.isArray(
    pedidoSeleccionadoCaja.productos,
  )
    ? pedidoSeleccionadoCaja.productos.map(
        (producto) => ({
          id:
            producto.id ||
            producto.productoId ||
            "",

          nombre:
            producto.nombre ||
            producto.producto ||
            "Producto",

          categoria:
            producto.categoria ||
            producto.tipo ||
            "",

          precio: numeroSeguroCajaReporte(
            producto.precio,
          ),

          precioFinal: numeroSeguroCajaReporte(
            producto.precioFinal ??
              producto.precio,
          ),

          cantidad: Math.max(
            1,
            numeroSeguroCajaReporte(
              producto.cantidad || 1,
            ),
          ),

          extras: Array.isArray(producto.extras)
  ? producto.extras.map((extra) => ({
      id:
        typeof extra === "object"
          ? extra.id || extra.extraId || ""
          : "",

      nombre:
        typeof extra === "object"
          ? extra.nombre || extra.descripcion || "Extra"
          : String(extra),

      precio:
        typeof extra === "object"
          ? numeroSeguroCajaReporte(extra.precio)
          : 0,

      cantidad:
        typeof extra === "object"
          ? Math.max(
              1,
              numeroSeguroCajaReporte(extra.cantidad || 1),
            )
          : 1,
    }))
  : [],

          observaciones:
            producto.observaciones ||
            producto.nota ||
            "",
        }),
      )
    : [],

  consumo,

  propina,

  total,

  estadoPago: "pagado",

  formaPago,

  esPagoMixto: formaPago === "Mixto",

  montoEfectivo,

  montoTarjeta,

  montoTransferencia,

  fechaPago: fechaHora.fecha,

  horaPago: fechaHora.hora,

  fechaPagoISO: fechaHora.fechaISO,

  cajero: obtenerNombreCajero(),
});

    guardarCuentasCaja(cuentas);

    const detalleBase = `Consumo ${formatearDinero(consumo)} + propina ${formatearDinero(propina)}.`;

    if (montoEfectivo > 0) {
      cajaActual.movimientos.push(
        crearMovimiento(
          "entrada",

          `Venta ${pedidoSeleccionadoCaja.mesaNombre} - efectivo`,

          montoEfectivo,

          formaPago === "Mixto" ? `Pago mixto. ${detalleBase}` : detalleBase,
        ),
      );
    }

    if (montoTarjeta > 0) {
      cajaActual.movimientos.push(
        crearMovimiento(
          "venta_digital",

          `Venta ${pedidoSeleccionadoCaja.mesaNombre} - tarjeta`,

          montoTarjeta,

          formaPago === "Mixto"
            ? `Pago mixto. ${detalleBase}`
            : `Tarjeta. ${detalleBase}`,
        ),
      );
    }

    if (montoTransferencia > 0) {
      cajaActual.movimientos.push(
        crearMovimiento(
          "venta_digital",

          `Venta ${pedidoSeleccionadoCaja.mesaNombre} - transferencia`,

          montoTransferencia,

          formaPago === "Mixto"
            ? `Pago mixto. ${detalleBase}`
            : `Transferencia. ${detalleBase}`,
        ),
      );
    }

    guardarCajaActual();

    actualizarPantallaCaja();

    liberarMesaDespuesDelPago(pedidoSeleccionadoCaja.mesaId);

    alert(`Pago registrado correctamente por ${formatearDinero(total)}.`);

    cerrarModalCobroCaja();

    mostrarPedidosEnCaja();

    window.dispatchEvent(new CustomEvent("cobrosCajaActualizados"));

    window.dispatchEvent(new CustomEvent("pedidosCocinaActualizados"));
  }

  function numeroSeguroCajaReporte(valor) {
  const numero = Number(valor);

  return Number.isFinite(numero)
    ? numero
    : 0;
}

  function obtenerCuentasDelTurno() {
    const apertura = cajaActual?.fechaAperturaISO
      ? new Date(cajaActual.fechaAperturaISO).getTime()
      : 0;

    return leerArregloCaja(CLAVE_CUENTAS_CAJA).filter((cuenta) => {
      if (!apertura || !cuenta.fechaPagoISO) return true;

      return new Date(cuenta.fechaPagoISO).getTime() >= apertura;
    });
  }

  function llenarListadoPagosCaja(tipo) {
    const esTarjeta = tipo === "tarjeta";

    const cuerpo = esTarjeta
      ? cuerpoListadoTarjetasCaja
      : cuerpoListadoTransferenciasCaja;

    const totalElemento = esTarjeta
      ? totalListadoTarjetasCaja
      : totalListadoTransferenciasCaja;

    if (!cuerpo || !totalElemento) return;

    const cuentas = obtenerCuentasDelTurno().filter((cuenta) =>
      esTarjeta
        ? Number(cuenta.montoTarjeta || 0) > 0
        : Number(cuenta.montoTransferencia || 0) > 0,
    );

    if (!cuentas.length) {
      cuerpo.innerHTML = `<tr><td colspan="4" class="mensajeSinPagosCaja">No hay pagos registrados.</td></tr>`;

      totalElemento.textContent = formatearDinero(0);

      return;
    }

    cuerpo.innerHTML = cuentas

      .map((cuenta) => {
        const asterisco =
          cuenta.esPagoMixto || cuenta.formaPago === "Mixto" ? "*" : "";

        return `<tr>

 

        <td>${escaparHTML(cuenta.horaPago || "—")}</td>

 

        <td>${escaparHTML(cuenta.mesaNombre || cuenta.mesaId || "—")}</td>

 

        <td>${escaparHTML(cuenta.folio || "—")}</td>

 

        <td><strong>${formatearDinero(cuenta.total || 0)}${asterisco}</strong></td>

 

      </tr>`;
      })

      .join("");

    const total = cuentas.reduce(
      (suma, cuenta) => suma + Number(cuenta.total || 0),

      0,
    );

    totalElemento.textContent = formatearDinero(total);
  }

  function abrirListadoTarjetasCaja() {
    llenarListadoPagosCaja("tarjeta");

    modalListadoTarjetasCaja?.classList.remove("oculto");

    modalListadoTarjetasCaja?.setAttribute("aria-hidden", "false");

    document.body.classList.add("modalAbierto");
  }

  function abrirListadoTransferenciasCaja() {
    llenarListadoPagosCaja("transferencia");

    modalListadoTransferenciasCaja?.classList.remove("oculto");

    modalListadoTransferenciasCaja?.setAttribute("aria-hidden", "false");

    document.body.classList.add("modalAbierto");
  }

  function cerrarListadoPagosCaja(modal) {
    modal?.classList.add("oculto");

    modal?.setAttribute("aria-hidden", "true");

    document.body.classList.remove("modalAbierto");
  }

  function iniciarActualizacionAutomaticaPedidosCaja() {
    if (intervaloActualizacionPedidosCaja) return;

    intervaloActualizacionPedidosCaja = window.setInterval(() => {
      if (!pantallaCaja?.classList.contains("oculto")) mostrarPedidosEnCaja();
    }, 5000);
  }

  /* =========================================

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

     EVENTOS

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

     ========================================= */

  function conectarEventosCaja() {
    if (eventosCajaConectados) return;

    eventosCajaConectados = true;

    btnAbrirCaja?.addEventListener("click", abrirCaja);

    btnEntradaCaja?.addEventListener("click", registrarEntradaCaja);

    // El botón de Gasto se conecta desde cajaGastos.js para evitar duplicar eventos.

    btnMovimientosCaja?.addEventListener("click", verMovimientosCaja);

    btnTarjetasCaja?.addEventListener("click", abrirListadoTarjetasCaja);

    btnTransferenciasCaja?.addEventListener(
      "click",

      abrirListadoTransferenciasCaja,
    );

    btnCerrarListadoTarjetasCaja?.addEventListener("click", () =>
      cerrarListadoPagosCaja(modalListadoTarjetasCaja),
    );

    btnCerrarListadoTransferenciasCaja?.addEventListener("click", () =>
      cerrarListadoPagosCaja(modalListadoTransferenciasCaja),
    );

    modalListadoTarjetasCaja

      ?.querySelector("[data-cerrar-listado-tarjetas]")

      ?.addEventListener("click", () =>
        cerrarListadoPagosCaja(modalListadoTarjetasCaja),
      );

    modalListadoTransferenciasCaja

      ?.querySelector("[data-cerrar-listado-transferencias]")

      ?.addEventListener("click", () =>
        cerrarListadoPagosCaja(modalListadoTransferenciasCaja),
      );

    btnCerrarCaja?.addEventListener("click", cerrarCaja);

    btnActualizarMesasCaja?.addEventListener("click", mostrarPedidosEnCaja);

    btnCerrarModalCobroCaja?.addEventListener("click", cerrarModalCobroCaja);

    btnCancelarCobroCaja?.addEventListener("click", cerrarModalCobroCaja);

    btnConfirmarCobroCaja?.addEventListener("click", confirmarCobroPedidoCaja);

    propinaPagoCaja?.addEventListener("input", actualizarResumenPagoCaja);

    formaPagoCaja?.addEventListener("change", actualizarResumenPagoCaja);

    entregaEfectivoCaja?.addEventListener("input", actualizarResumenPagoCaja);

    montoEfectivoMixtoCaja?.addEventListener(
      "input",

      actualizarResumenPagoCaja,
    );

    montoTarjetaMixtoCaja?.addEventListener("input", actualizarResumenPagoCaja);

    montoTransferenciaMixtoCaja?.addEventListener(
      "input",

      actualizarResumenPagoCaja,
    );

    modalCobroCaja

      ?.querySelector("[data-cerrar-cobro-caja]")

      ?.addEventListener("click", cerrarModalCobroCaja);

    window.addEventListener("pedidosCocinaActualizados", mostrarPedidosEnCaja);

    window.addEventListener("cobrosCajaActualizados", mostrarPedidosEnCaja);

    window.addEventListener("storage", (evento) => {
      if (
        [CLAVE_PEDIDOS_COCINA, CLAVE_PEDIDOS_CAJA, CLAVE_CUENTAS_CAJA].includes(
          evento.key,
        )
      ) {
        mostrarPedidosEnCaja();
      }
    });
  }

  /* =========================================

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

     INICIALIZACIÓN

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

     ========================================= */

  function inicializarCaja() {
    conectarEventosCaja();

    actualizarPantallaCaja();

    iniciarActualizacionAutomaticaPedidosCaja();
  }

  document.addEventListener("DOMContentLoaded", inicializarCaja);

  /* Se deja disponible para que login.js pueda actualizar la pantalla

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

     cuando el cajero inicie sesión. */

  window.actualizarPantallaCaja = actualizarPantallaCaja;

  // Funciones disponibles para los demás archivos.

  window.mostrarPantallaCaja = mostrarPantallaCaja;

  window.ocultarPantallaCaja = ocultarPantallaCaja;

  window.inicializarCaja = inicializarCaja;
})();
