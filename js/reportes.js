/* ============================================================
   REPORTES DEL RESTAURANTE
   Reporte de ventas por rango de fechas
   ============================================================ */

const CLAVE_CUENTAS_COBRADAS = "restaurant_cuentas_caja";

const fechaInicialReporte = document.getElementById(
  "fechaInicialReporte",
);

const fechaFinalReporte = document.getElementById(
  "fechaFinalReporte",
);

const btnConsultarReporteVentas = document.getElementById(
  "btnConsultarReporteVentas",
);

const btnExportarReporteVentas = document.getElementById(
  "btnExportarReporteVentas",
);

const mensajeReporteVentas = document.getElementById(
  "mensajeReporteVentas",
);

const reporteTotalConsumo = document.getElementById(
  "reporteTotalConsumo",
);

const reporteTotalPropinas = document.getElementById(
  "reporteTotalPropinas",
);

const reporteTotalCobrado = document.getElementById(
  "reporteTotalCobrado",
);

const reporteCantidadTickets = document.getElementById(
  "reporteCantidadTickets",
);

const reportePromedioTicket = document.getElementById(
  "reportePromedioTicket",
);

const cuerpoTablaReporteVentas = document.getElementById(
  "cuerpoTablaReporteVentas",
);

const reporteTotalEfectivo = document.getElementById(
  "reporteTotalEfectivo",
);

const reporteTotalTarjeta = document.getElementById(
  "reporteTotalTarjeta",
);

const reporteTotalTransferencia = document.getElementById(
  "reporteTotalTransferencia",
);

const reporteTotalFormasPago = document.getElementById(
  "reporteTotalFormasPago",
);


/* ============================================================
   VARIABLE QUE GUARDA EL RESULTADO ACTUAL
   ============================================================ */

let ventasReporteActual = [];


/* ============================================================
   EVENTOS
   ============================================================ */

if (fechaInicialReporte) {
  fechaInicialReporte.addEventListener(
    "input",
    aplicarFormatoFechaReporte,
  );
}

if (fechaFinalReporte) {
  fechaFinalReporte.addEventListener(
    "input",
    aplicarFormatoFechaReporte,
  );
}

if (btnConsultarReporteVentas) {
  btnConsultarReporteVentas.addEventListener(
    "click",
    consultarReporteVentas,
  );
}

if (btnExportarReporteVentas) {
  btnExportarReporteVentas.addEventListener(
    "click",
    exportarReporteVentasExcel,
  );
}


/* ============================================================
   FORMATO AUTOMÁTICO DD/MM/AA
   ============================================================ */

function aplicarFormatoFechaReporte(evento) {
  let valor = evento.target.value.replace(/\D/g, "");

  valor = valor.slice(0, 6);

  if (valor.length >= 5) {
    valor =
      valor.slice(0, 2) +
      "/" +
      valor.slice(2, 4) +
      "/" +
      valor.slice(4, 6);
  } else if (valor.length >= 3) {
    valor =
      valor.slice(0, 2) +
      "/" +
      valor.slice(2, 4);
  }

  evento.target.value = valor;
}


/* ============================================================
   CONSULTAR REPORTE
   ============================================================ */

function consultarReporteVentas() {
  mostrarMensajeReporte("");

  const fechaInicial = convertirFechaTextoAISO(
    fechaInicialReporte?.value,
  );

  const fechaFinal = convertirFechaTextoAISO(
    fechaFinalReporte?.value,
  );

  if (!fechaInicial || !fechaFinal) {
    mostrarMensajeReporte(
      "Escribe las dos fechas con el formato dd/mm/aa.",
    );

    limpiarReporteVentas();

    return;
  }

  if (fechaInicial > fechaFinal) {
    mostrarMensajeReporte(
      "La fecha inicial no puede ser mayor que la fecha final.",
    );

    limpiarReporteVentas();

    return;
  }

  const cuentas = cargarCuentasCobradas();

  ventasReporteActual = cuentas
    .filter((cuenta) => {
      const fechaCuenta = obtenerFechaISODeCuenta(cuenta);

      return (
        fechaCuenta &&
        fechaCuenta >= fechaInicial &&
        fechaCuenta <= fechaFinal
      );
    })
    .sort((a, b) => {
      const fechaA =
        `${obtenerFechaISODeCuenta(a)} ${a.horaPago || ""}`;

      const fechaB =
        `${obtenerFechaISODeCuenta(b)} ${b.horaPago || ""}`;

      return fechaA.localeCompare(fechaB);
    });

  if (ventasReporteActual.length === 0) {
    limpiarReporteVentas();

    mostrarMensajeReporte(
      "No se encontraron ventas en ese rango de fechas.",
    );

    return;
  }

  calcularResumenReporte(ventasReporteActual);

  renderizarTablaReporteVentas(ventasReporteActual);

  btnExportarReporteVentas.disabled = false;

  mostrarMensajeReporte(
    `${ventasReporteActual.length} ${
      ventasReporteActual.length === 1
        ? "ticket encontrado"
        : "tickets encontrados"
    }.`,
    true,
  );
}


/* ============================================================
   CARGAR CUENTAS COBRADAS
   ============================================================ */

function cargarCuentasCobradas() {
  const guardadas = localStorage.getItem(
    CLAVE_CUENTAS_COBRADAS,
  );

  if (!guardadas) {
    return [];
  }

  try {
    const cuentas = JSON.parse(guardadas);

    return Array.isArray(cuentas) ? cuentas : [];
  } catch (error) {
    console.error(
      "No fue posible leer las cuentas cobradas:",
      error,
    );

    return [];
  }
}


/* ============================================================
   CALCULAR RESUMEN GENERAL
   ============================================================ */
function calcularResumenReporte(ventas) {
  let consumo = 0;
  let propinas = 0;
  let totalCobrado = 0;

  let efectivo = 0;
  let tarjeta = 0;
  let transferencia = 0;

  ventas.forEach((venta) => {
    const consumoVenta = numeroSeguro(venta.consumo);

    const propinaVenta = numeroSeguro(venta.propina);

    const totalVenta =
      numeroSeguro(venta.total) ||
      consumoVenta + propinaVenta;

    consumo += consumoVenta;
    propinas += propinaVenta;
    totalCobrado += totalVenta;

    // Si existen montos por forma de pago,
    // se toman directamente.
    const montoEfectivo = numeroSeguro(
      venta.montoEfectivo
    );

    const montoTarjeta = numeroSeguro(
      venta.montoTarjeta
    );

    const montoTransferencia = numeroSeguro(
      venta.montoTransferencia
    );

    const tieneDesglose =
      montoEfectivo > 0 ||
      montoTarjeta > 0 ||
      montoTransferencia > 0;

    if (tieneDesglose) {

      efectivo += montoEfectivo;
      tarjeta += montoTarjeta;
      transferencia += montoTransferencia;

    } else {

      const formaPago = normalizarTextoReporte(
        venta.formaPago
      );

      if (formaPago.includes("efectivo")) {

        efectivo += totalVenta;

      } else if (formaPago.includes("tarjeta")) {

        tarjeta += totalVenta;

      } else if (
        formaPago.includes("transferencia")
      ) {

        transferencia += totalVenta;

      }

    }

  });

  const cantidadTickets = ventas.length;

  const promedio =
    cantidadTickets > 0
      ? totalCobrado / cantidadTickets
      : 0;

  reporteTotalConsumo.textContent =
    formatearDineroReporte(consumo);

  reporteTotalPropinas.textContent =
    formatearDineroReporte(propinas);

  reporteTotalCobrado.textContent =
    formatearDineroReporte(totalCobrado);

  reporteCantidadTickets.textContent =
    cantidadTickets.toLocaleString("es-MX");

  reportePromedioTicket.textContent =
    formatearDineroReporte(promedio);

  reporteTotalEfectivo.textContent =
    formatearDineroReporte(efectivo);

  reporteTotalTarjeta.textContent =
    formatearDineroReporte(tarjeta);

  reporteTotalTransferencia.textContent =
    formatearDineroReporte(transferencia);

  reporteTotalFormasPago.textContent =
    formatearDineroReporte(totalCobrado);
}


/* ============================================================
   RENDERIZAR TABLA
   ============================================================ */

function renderizarTablaReporteVentas(ventas) {
  if (!cuerpoTablaReporteVentas) {
    return;
  }

  cuerpoTablaReporteVentas.innerHTML = ventas
    .map((venta) => {
      const consumo = numeroSeguro(venta.consumo);

      const propina = numeroSeguro(venta.propina);

      const total =
        numeroSeguro(venta.total) ||
        consumo + propina;

      const formaPago = obtenerNombreFormaPago(venta);

      return `
        <tr>

          <td>
            <strong>
              ${escaparHTMLReporte(venta.folio || "—")}
            </strong>
          </td>

          <td>
            ${escaparHTMLReporte(
              obtenerFechaVisibleDeCuenta(venta),
            )}
          </td>

          <td>
            ${escaparHTMLReporte(venta.horaPago || "—")}
          </td>

          <td>
            ${escaparHTMLReporte(
              venta.mesaNombre ||
              venta.mesaId ||
              "—",
            )}
          </td>

          <td>
            ${escaparHTMLReporte(
              obtenerNombreCajero(venta),
            )}
          </td>

          <td>
            ${escaparHTMLReporte(formaPago)}
          </td>

          <td>
            ${formatearDineroReporte(consumo)}
          </td>

          <td>
            ${formatearDineroReporte(propina)}
          </td>

          <td>
            <strong>
              ${formatearDineroReporte(total)}
            </strong>
          </td>

        </tr>
      `;
    })
    .join("");
}


/* ============================================================
   NOMBRE DEL CAJERO
   ============================================================ */

function obtenerNombreCajero(venta) {
  if (!venta.cajero) {
    return "—";
  }

  if (typeof venta.cajero === "string") {
    return venta.cajero;
  }

  return (
    venta.cajero.nombre ||
    venta.cajero.usuario ||
    venta.cajero.id ||
    "—"
  );
}


/* ============================================================
   NOMBRE DE LA FORMA DE PAGO
   ============================================================ */

function obtenerNombreFormaPago(venta) {
  if (venta.esPagoMixto === true) {
    const partes = [];

    if (numeroSeguro(venta.montoEfectivo) > 0) {
      partes.push(
        `Efectivo ${formatearDineroReporte(
          venta.montoEfectivo,
        )}`,
      );
    }

    if (numeroSeguro(venta.montoTarjeta) > 0) {
      partes.push(
        `Tarjeta ${formatearDineroReporte(
          venta.montoTarjeta,
        )}`,
      );
    }

    if (
      numeroSeguro(venta.montoTransferencia) > 0
    ) {
      partes.push(
        `Transferencia ${formatearDineroReporte(
          venta.montoTransferencia,
        )}`,
      );
    }

    return partes.length > 0
      ? partes.join(" + ")
      : "Pago mixto";
  }

  return venta.formaPago || "—";
}


/* ============================================================
   LIMPIAR REPORTE
   ============================================================ */

function limpiarReporteVentas() {
  ventasReporteActual = [];

  if (reporteTotalConsumo) {
    reporteTotalConsumo.textContent = "$0.00";
  }

  if (reporteTotalPropinas) {
    reporteTotalPropinas.textContent = "$0.00";
  }

  if (reporteTotalCobrado) {
    reporteTotalCobrado.textContent = "$0.00";
  }

  if (reporteCantidadTickets) {
    reporteCantidadTickets.textContent = "0";
  }

  if (reportePromedioTicket) {
    reportePromedioTicket.textContent = "$0.00";
  }

  if (reporteTotalEfectivo) {
    reporteTotalEfectivo.textContent = "$0.00";
  }

  if (reporteTotalTarjeta) {
    reporteTotalTarjeta.textContent = "$0.00";
  }

  if (reporteTotalTransferencia) {
    reporteTotalTransferencia.textContent =
      "$0.00";
  }

  if (reporteTotalMixto) {
    reporteTotalMixto.textContent = "$0.00";
  }

  if (reporteTotalFormasPago) {
    reporteTotalFormasPago.textContent = "$0.00";
  }

  if (btnExportarReporteVentas) {
    btnExportarReporteVentas.disabled = true;
  }

  if (cuerpoTablaReporteVentas) {
    cuerpoTablaReporteVentas.innerHTML = `
      <tr>
        <td
          colspan="9"
          class="mensajeTablaReporte"
        >
          No hay ventas para mostrar.
        </td>
      </tr>
    `;
  }
}


/* ============================================================
   CONVERTIR DD/MM/AA A AAAA-MM-DD
   ============================================================ */

function convertirFechaTextoAISO(texto) {
  if (!texto) {
    return null;
  }

  const partes = texto.split("/");

  if (partes.length !== 3) {
    return null;
  }

  const dia = Number(partes[0]);

  const mes = Number(partes[1]);

  const anioCorto = Number(partes[2]);

  if (
    !Number.isInteger(dia) ||
    !Number.isInteger(mes) ||
    !Number.isInteger(anioCorto)
  ) {
    return null;
  }

  const anio = 2000 + anioCorto;

  const fecha = new Date(anio, mes - 1, dia);

  if (
    fecha.getFullYear() !== anio ||
    fecha.getMonth() !== mes - 1 ||
    fecha.getDate() !== dia
  ) {
    return null;
  }

  return `${anio}-${String(mes).padStart(
    2,
    "0",
  )}-${String(dia).padStart(2, "0")}`;
}


/* ============================================================
   OBTENER FECHA ISO DE UNA CUENTA
   ============================================================ */

function obtenerFechaISODeCuenta(cuenta) {
  if (cuenta.fechaPagoISO) {
    return String(cuenta.fechaPagoISO).slice(0, 10);
  }

  if (
    cuenta.fechaPago &&
    String(cuenta.fechaPago).includes("/")
  ) {
    return convertirFechaTextoAISO(
      convertirFechaCuatroDigitosADos(
        cuenta.fechaPago,
      ),
    );
  }

  return null;
}


/* ============================================================
   FECHA VISIBLE
   ============================================================ */

function obtenerFechaVisibleDeCuenta(cuenta) {
  const fechaISO = obtenerFechaISODeCuenta(cuenta);

  if (!fechaISO) {
    return cuenta.fechaPago || "—";
  }

  const [anio, mes, dia] = fechaISO.split("-");

  return `${dia}/${mes}/${anio.slice(-2)}`;
}


/* ============================================================
   CONVERTIR DD/MM/AAAA A DD/MM/AA
   ============================================================ */

function convertirFechaCuatroDigitosADos(fecha) {
  const partes = String(fecha).split("/");

  if (partes.length !== 3) {
    return fecha;
  }

  return `${partes[0]}/${partes[1]}/${String(
    partes[2],
  ).slice(-2)}`;
}


/* ============================================================
   EXPORTAR REPORTE
   El archivo CSV abre directamente en Excel
   ============================================================ */

function exportarReporteVentasExcel() {
  if (ventasReporteActual.length === 0) {
    mostrarMensajeReporte(
      "Primero consulta un rango de fechas.",
    );

    return;
  }

  if (typeof XLSX === "undefined") {
    mostrarMensajeReporte(
      "No fue posible cargar la librería de Excel.",
    );

    return;
  }

  let totalConsumo = 0;
  let totalPropinas = 0;
  let totalCobrado = 0;

  let totalEfectivo = 0;
  let totalTarjeta = 0;
  let totalTransferencia = 0;

  const filasDetalle = ventasReporteActual.map((venta) => {
    const consumo = numeroSeguro(venta.consumo);
    const propina = numeroSeguro(venta.propina);

    const total =
      numeroSeguro(venta.total) ||
      consumo + propina;

    totalConsumo += consumo;
    totalPropinas += propina;
    totalCobrado += total;

    const montoEfectivo = numeroSeguro(
      venta.montoEfectivo,
    );

    const montoTarjeta = numeroSeguro(
      venta.montoTarjeta,
    );

    const montoTransferencia = numeroSeguro(
      venta.montoTransferencia,
    );

    const tieneDesglose =
      montoEfectivo > 0 ||
      montoTarjeta > 0 ||
      montoTransferencia > 0;

    if (tieneDesglose) {
      totalEfectivo += montoEfectivo;
      totalTarjeta += montoTarjeta;
      totalTransferencia += montoTransferencia;
    } else {
      const formaPago = normalizarTextoReporte(
        venta.formaPago,
      );

      if (formaPago.includes("efectivo")) {
        totalEfectivo += total;
      } else if (formaPago.includes("tarjeta")) {
        totalTarjeta += total;
      } else if (
        formaPago.includes("transferencia")
      ) {
        totalTransferencia += total;
      }
    }

    return [
      venta.folio || "",
      obtenerFechaVisibleDeCuenta(venta),
      venta.horaPago || "",
      venta.mesaNombre || venta.mesaId || "",
      obtenerNombreCajero(venta),
      obtenerNombreFormaPago(venta),
      consumo,
      propina,
      total,
    ];
  });

  const cantidadTickets = ventasReporteActual.length;

  const promedioTicket =
    cantidadTickets > 0
      ? totalCobrado / cantidadTickets
      : 0;

  const datosHoja = [
    ["REPORTE DE VENTAS POR RANGO DE FECHAS"],
    [
      "Fecha inicial",
      fechaInicialReporte.value,
      "",
      "Fecha final",
      fechaFinalReporte.value,
    ],
    [],
    [
      "Folio",
      "Fecha",
      "Hora",
      "Mesa",
      "Cajero",
      "Forma de pago",
      "Consumo",
      "Propina",
      "Total",
    ],
    ...filasDetalle,
    [],
    ["RESUMEN GENERAL"],
    ["Consumo", totalConsumo],
    ["Propinas", totalPropinas],
    ["Total cobrado", totalCobrado],
    ["Tickets", cantidadTickets],
    ["Promedio por ticket", promedioTicket],
    [],
    ["RESUMEN POR FORMA DE PAGO"],
    ["Efectivo", totalEfectivo],
    ["Tarjeta", totalTarjeta],
    ["Transferencia", totalTransferencia],
    ["TOTAL", totalCobrado],
  ];

  const hoja = XLSX.utils.aoa_to_sheet(datosHoja);

  const libro = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    libro,
    hoja,
    "Ventas",
  );

  /* ============================================================
     COMBINAR TÍTULO
     ============================================================ */

  hoja["!merges"] = [
    {
      s: { r: 0, c: 0 },
      e: { r: 0, c: 8 },
    },
  ];

  /* ============================================================
     ANCHO DE COLUMNAS
     ============================================================ */

  hoja["!cols"] = [
    { wch: 18 },
    { wch: 13 },
    { wch: 14 },
    { wch: 14 },
    { wch: 20 },
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];

  /* ============================================================
     ALTURA DE FILAS
     ============================================================ */

  hoja["!rows"] = [
    { hpt: 28 },
    { hpt: 21 },
    {},
    { hpt: 24 },
  ];

  /* ============================================================
     ESTILOS GENERALES
     ============================================================ */

  const estiloTitulo = {
    font: {
      bold: true,
      sz: 16,
      color: {
        rgb: "000000",
      },
    },
    fill: {
      fgColor: {
        rgb: "FFD966",
      },
    },
    alignment: {
      horizontal: "center",
      vertical: "center",
    },
    border: crearBordesExcel(),
  };

  const estiloEncabezado = {
    font: {
      bold: true,
      color: {
        rgb: "000000",
      },
    },
    fill: {
      fgColor: {
        rgb: "FFD966",
      },
    },
    alignment: {
      horizontal: "center",
      vertical: "center",
      wrapText: true,
    },
    border: crearBordesExcel(),
  };

  const estiloEncabezadoResumen = {
    font: {
      bold: true,
      color: {
        rgb: "000000",
      },
    },
    fill: {
      fgColor: {
        rgb: "FFD966",
      },
    },
    alignment: {
      horizontal: "left",
      vertical: "center",
    },
    border: crearBordesExcel(),
  };

  const estiloCelda = {
    border: crearBordesExcel(),
    alignment: {
      vertical: "center",
    },
  };

  const estiloMoneda = {
    border: crearBordesExcel(),
    numFmt: '$#,##0.00',
    alignment: {
      horizontal: "right",
      vertical: "center",
    },
  };

  const estiloTotal = {
    font: {
      bold: true,
      color: {
        rgb: "000000",
      },
    },
    fill: {
      fgColor: {
        rgb: "FFD966",
      },
    },
    numFmt: '$#,##0.00',
    alignment: {
      horizontal: "right",
      vertical: "center",
    },
    border: crearBordesExcel(),
  };

  /* ============================================================
     TÍTULO PRINCIPAL
     ============================================================ */

  hoja["A1"].s = estiloTitulo;

  /* ============================================================
     FECHAS
     ============================================================ */

  ["A2", "D2"].forEach((celda) => {
    if (hoja[celda]) {
      hoja[celda].s = {
        font: {
          bold: true,
        },
      };
    }
  });

  /* ============================================================
     ENCABEZADOS DE LA TABLA
     La fila 4 de Excel corresponde al índice 3.
     ============================================================ */

  for (let columna = 0; columna <= 8; columna++) {
    const referencia = XLSX.utils.encode_cell({
      r: 3,
      c: columna,
    });

    if (hoja[referencia]) {
      hoja[referencia].s = estiloEncabezado;
    }
  }

  /* ============================================================
     DETALLE DE VENTAS
     ============================================================ */

  const filaInicialDetalle = 4;

  const filaFinalDetalle =
    filaInicialDetalle + filasDetalle.length - 1;

  for (
    let fila = filaInicialDetalle;
    fila <= filaFinalDetalle;
    fila++
  ) {
    for (let columna = 0; columna <= 8; columna++) {
      const referencia = XLSX.utils.encode_cell({
        r: fila,
        c: columna,
      });

      if (!hoja[referencia]) {
        continue;
      }

      if (
        columna === 6 ||
        columna === 7 ||
        columna === 8
      ) {
        hoja[referencia].s = estiloMoneda;
      } else {
        hoja[referencia].s = estiloCelda;
      }
    }
  }

  /* ============================================================
     POSICIÓN DE LOS RESÚMENES
     ============================================================ */

  const filaEncabezadoResumenGeneral =
    filaFinalDetalle + 2;

  const filaConsumo =
    filaEncabezadoResumenGeneral + 1;

  const filaPropinas =
    filaEncabezadoResumenGeneral + 2;

  const filaTotalCobrado =
    filaEncabezadoResumenGeneral + 3;

  const filaTickets =
    filaEncabezadoResumenGeneral + 4;

  const filaPromedio =
    filaEncabezadoResumenGeneral + 5;

  const filaEncabezadoFormasPago =
    filaEncabezadoResumenGeneral + 7;

  const filaEfectivo =
    filaEncabezadoFormasPago + 1;

  const filaTarjeta =
    filaEncabezadoFormasPago + 2;

  const filaTransferencia =
    filaEncabezadoFormasPago + 3;

  const filaTotalFormasPago =
    filaEncabezadoFormasPago + 4;

  /* ============================================================
     ENCABEZADOS AMARILLOS DE LOS RESÚMENES
     ============================================================ */

  const celdaResumenGeneral = XLSX.utils.encode_cell({
    r: filaEncabezadoResumenGeneral,
    c: 0,
  });

  const celdaFormasPago = XLSX.utils.encode_cell({
    r: filaEncabezadoFormasPago,
    c: 0,
  });

  hoja[celdaResumenGeneral].s =
    estiloEncabezadoResumen;

  hoja[celdaFormasPago].s =
    estiloEncabezadoResumen;

  hoja["!merges"].push(
    {
      s: {
        r: filaEncabezadoResumenGeneral,
        c: 0,
      },
      e: {
        r: filaEncabezadoResumenGeneral,
        c: 1,
      },
    },
    {
      s: {
        r: filaEncabezadoFormasPago,
        c: 0,
      },
      e: {
        r: filaEncabezadoFormasPago,
        c: 1,
      },
    },
  );

  /* ============================================================
     ESTILOS DE LOS RESÚMENES
     ============================================================ */

  const filasResumenGeneral = [
    filaConsumo,
    filaPropinas,
    filaTotalCobrado,
    filaTickets,
    filaPromedio,
  ];

  filasResumenGeneral.forEach((fila) => {
    const celdaEtiqueta = XLSX.utils.encode_cell({
      r: fila,
      c: 0,
    });

    const celdaValor = XLSX.utils.encode_cell({
      r: fila,
      c: 1,
    });

    if (hoja[celdaEtiqueta]) {
      hoja[celdaEtiqueta].s = {
        font: {
          bold: true,
        },
        border: crearBordesExcel(),
      };
    }

    if (hoja[celdaValor]) {
      hoja[celdaValor].s =
        fila === filaTickets
          ? {
              border: crearBordesExcel(),
              alignment: {
                horizontal: "right",
              },
            }
          : estiloMoneda;
    }
  });

  const filasFormasPago = [
    filaEfectivo,
    filaTarjeta,
    filaTransferencia,
  ];

  filasFormasPago.forEach((fila) => {
    const celdaEtiqueta = XLSX.utils.encode_cell({
      r: fila,
      c: 0,
    });

    const celdaValor = XLSX.utils.encode_cell({
      r: fila,
      c: 1,
    });

    if (hoja[celdaEtiqueta]) {
      hoja[celdaEtiqueta].s = {
        font: {
          bold: true,
        },
        border: crearBordesExcel(),
      };
    }

    if (hoja[celdaValor]) {
      hoja[celdaValor].s = estiloMoneda;
    }
  });

  /* ============================================================
     GRAN TOTAL AMARILLO
     ============================================================ */

  const celdaEtiquetaTotal =
    XLSX.utils.encode_cell({
      r: filaTotalFormasPago,
      c: 0,
    });

  const celdaValorTotal =
    XLSX.utils.encode_cell({
      r: filaTotalFormasPago,
      c: 1,
    });

  hoja[celdaEtiquetaTotal].s = {
    ...estiloTotal,
    alignment: {
      horizontal: "left",
      vertical: "center",
    },
  };

  hoja[celdaValorTotal].s = estiloTotal;

  /* ============================================================
     CONGELAR ENCABEZADOS
     ============================================================ */

  hoja["!freeze"] = {
    xSplit: 0,
    ySplit: 4,
  };

  /* ============================================================
     CREAR ARCHIVO
     ============================================================ */

  const fechaInicialNombre =
    fechaInicialReporte.value.replaceAll("/", "-");

  const fechaFinalNombre =
    fechaFinalReporte.value.replaceAll("/", "-");

  const nombreArchivo =
    `Reporte_Ventas_${fechaInicialNombre}_al_${fechaFinalNombre}.xlsx`;

  XLSX.writeFile(
    libro,
    nombreArchivo,
    {
      compression: true,
    },
  );
}

function crearBordesExcel() {
  const borde = {
    style: "thin",
    color: {
      rgb: "B7B7B7",
    },
  };

  return {
    top: borde,
    bottom: borde,
    left: borde,
    right: borde,
  };
}

/* ============================================================
   ESCAPAR VALORES PARA CSV
   ============================================================ */

function escaparValorCSV(valor) {
  const texto = String(valor ?? "");

  if (
    texto.includes(",") ||
    texto.includes('"') ||
    texto.includes("\n")
  ) {
    return `"${texto.replaceAll('"', '""')}"`;
  }

  return texto;
}


/* ============================================================
   FUNCIONES AUXILIARES
   ============================================================ */

function numeroSeguro(valor) {
  const numero = Number(valor);

  return Number.isFinite(numero) ? numero : 0;
}

function formatearDineroReporte(valor) {
  return Number(valor || 0).toLocaleString(
    "es-MX",
    {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  );
}

function normalizarTextoReporte(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function escaparHTMLReporte(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function mostrarMensajeReporte(
  mensaje,
  exito = false,
) {
  if (!mensajeReporteVentas) {
    return;
  }

  mensajeReporteVentas.textContent = mensaje;

  mensajeReporteVentas.classList.toggle(
    "exito",
    exito,
  );
}