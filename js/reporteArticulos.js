/* ============================================================

   REPORTE DE VENTAS ACUMULADAS POR ARTÍCULOS

   Archivo: js/reporteArticulos.js

   ============================================================ */

 

(function () {

  "use strict";

 

  const CLAVE_CUENTAS_CAJA = "restaurant_cuentas_caja";

 

  const fechaInicialReporteArticulos = document.getElementById("fechaInicialReporteArticulos");

  const fechaFinalReporteArticulos = document.getElementById("fechaFinalReporteArticulos");

  const btnConsultarReporteArticulos = document.getElementById("btnConsultarReporteArticulos");

  const btnExportarReporteArticulos = document.getElementById("btnExportarReporteArticulos");

  const mensajeReporteArticulos = document.getElementById("mensajeReporteArticulos");

  const totalArticulosDiferentes = document.getElementById("totalArticulosDiferentes");

  const totalUnidadesArticulos = document.getElementById("totalUnidadesArticulos");

  const totalUnidadesExtras = document.getElementById("totalUnidadesExtras");

  const ventaTotalExtras = document.getElementById("ventaTotalExtras");

  const ventaTotalArticulos = document.getElementById("ventaTotalArticulos");

  const cuerpoTablaReporteArticulos = document.getElementById("cuerpoTablaReporteArticulos");

  const granTotalCantidadArticulos = document.getElementById("granTotalCantidadArticulos");

  const granTotalVentaArticulos = document.getElementById("granTotalVentaArticulos");

 

  let resultadoReporteArticulos = [];

 

  fechaInicialReporteArticulos?.addEventListener("input", aplicarFormatoFechaArticulo);

  fechaFinalReporteArticulos?.addEventListener("input", aplicarFormatoFechaArticulo);

  btnConsultarReporteArticulos?.addEventListener("click", consultarReporteArticulos);

  btnExportarReporteArticulos?.addEventListener("click", exportarReporteArticulosExcel);

 

  function aplicarFormatoFechaArticulo(evento) {

    let valor = String(evento.target.value || "").replace(/\D/g, "").slice(0, 6);

 

    if (valor.length >= 5) {

      valor = valor.slice(0, 2) + "/" + valor.slice(2, 4) + "/" + valor.slice(4, 6);

    } else if (valor.length >= 3) {

      valor = valor.slice(0, 2) + "/" + valor.slice(2, 4);

    }

 

    evento.target.value = valor;

  }

 

  function consultarReporteArticulos() {

    mostrarMensajeArticulos("");

 

    const fechaInicial = convertirFechaArticuloAISO(fechaInicialReporteArticulos?.value);

    const fechaFinal = convertirFechaArticuloAISO(fechaFinalReporteArticulos?.value);

 

    if (!fechaInicial || !fechaFinal) {

      limpiarReporteArticulos();

      mostrarMensajeArticulos("Escribe las dos fechas con el formato dd/mm/aa.");

      return;

    }

 

    if (fechaInicial > fechaFinal) {

      limpiarReporteArticulos();

      mostrarMensajeArticulos("La fecha inicial no puede ser mayor que la fecha final.");

      return;

    }

 

    const cuentas = cargarCuentasCaja();

 

    const cuentasDelRango = cuentas.filter((cuenta) => {

      const fechaCuenta = obtenerFechaISODeCuentaArticulo(cuenta);

      return fechaCuenta && fechaCuenta >= fechaInicial && fechaCuenta <= fechaFinal;

    });

 

    if (cuentasDelRango.length === 0) {

      limpiarReporteArticulos();

      mostrarMensajeArticulos("No se encontraron ventas cobradas en ese rango de fechas.");

      return;

    }

 

    const cuentasConProductos = cuentasDelRango.filter(

      (cuenta) => Array.isArray(cuenta.productos) && cuenta.productos.length > 0,

    );

 

    if (cuentasConProductos.length === 0) {

      limpiarReporteArticulos();

      mostrarMensajeArticulos(

        "Las ventas de ese rango no tienen guardado el detalle de artículos. Registra una venta nueva y vuelve a consultar.",

      );

      return;

    }

 

    resultadoReporteArticulos = acumularArticulosYExtras(cuentasConProductos);

 

    if (resultadoReporteArticulos.length === 0) {

      limpiarReporteArticulos();

      mostrarMensajeArticulos("No se encontraron artículos o extras para acumular.");

      return;

    }

 

    renderizarReporteArticulos(resultadoReporteArticulos);

    actualizarIndicadoresArticulos(resultadoReporteArticulos);

 

    btnExportarReporteArticulos.disabled = false;

 

    const ventasSinDetalle = cuentasDelRango.length - cuentasConProductos.length;

    let mensaje =

      `${resultadoReporteArticulos.length} conceptos acumulados en ` +

      `${cuentasConProductos.length} ${cuentasConProductos.length === 1 ? "ticket" : "tickets"}.`;

 

    if (ventasSinDetalle > 0) {

      mensaje += ` ${ventasSinDetalle} ${

        ventasSinDetalle === 1 ? "ticket anterior no tenía" : "tickets anteriores no tenían"

      } detalle de productos.`;

    }

 

    mostrarMensajeArticulos(mensaje, true);

  }

 

  function cargarCuentasCaja() {

    try {

      const datos = JSON.parse(localStorage.getItem(CLAVE_CUENTAS_CAJA) || "[]");

      return Array.isArray(datos) ? datos : [];

    } catch (error) {

      console.error("No fue posible leer las cuentas de Caja:", error);

      return [];

    }

  }

 

  function acumularArticulosYExtras(cuentas) {

    const acumulado = new Map();

 

    cuentas.forEach((cuenta) => {

      const productos = Array.isArray(cuenta.productos) ? cuenta.productos : [];

 

      productos.forEach((producto) => {

        const cantidadProducto = Math.max(1, numeroSeguroArticulo(producto.cantidad || 1));

        const nombreProducto = String(producto.nombre || producto.producto || "Producto").trim();

        const categoriaProducto = String(

          producto.categoria || producto.tipo || "Sin categoría",

        ).trim();

        const extras = Array.isArray(producto.extras) ? producto.extras : [];

 

        const sumaExtrasPorUnidad = extras.reduce((total, extra) => {

          const cantidadExtra = Math.max(

            1,

            numeroSeguroArticulo(typeof extra === "object" ? extra.cantidad || 1 : 1),

          );

          return total + obtenerPrecioExtra(extra) * cantidadExtra;

        }, 0);

 const precioBaseGuardado = numeroSeguroArticulo(
  producto.precioBase ??
    producto.precioOriginal,
);

const precioFinal = numeroSeguroArticulo(
  producto.precioFinal ??
    producto.precio ??
    producto.precioBase,
);

const precioBaseUnitario =
  precioBaseGuardado > 0
    ? precioBaseGuardado
    : Math.max(
        0,
        precioFinal - sumaExtrasPorUnidad,
      );

agregarConceptoAcumulado(acumulado, {
  tipo: "Artículo",
  nombre: nombreProducto,
  categoria: categoriaProducto,
  cantidad: cantidadProducto,
  importe:
    precioBaseUnitario * cantidadProducto,
});


        extras.forEach((extra) => {

          const nombreExtra = obtenerNombreExtra(extra);

          const precioExtra = obtenerPrecioExtra(extra);

          const cantidadExtraPorProducto = Math.max(

            1,

            numeroSeguroArticulo(typeof extra === "object" ? extra.cantidad || 1 : 1),

          );

          const cantidadTotalExtra = cantidadProducto * cantidadExtraPorProducto;

 

          if (!nombreExtra) return;

 

          agregarConceptoAcumulado(acumulado, {

            tipo: "Extra",

            nombre: nombreExtra,

            categoria: "Extras",

            cantidad: cantidadTotalExtra,

            importe: precioExtra * cantidadTotalExtra,

          });

        });

      });

    });

 

    return Array.from(acumulado.values())

      .map((concepto) => ({

        ...concepto,

        precioPromedio: concepto.cantidad > 0 ? concepto.importe / concepto.cantidad : 0,

      }))

      .sort((a, b) => {

        if (a.tipo !== b.tipo) return a.tipo === "Artículo" ? -1 : 1;

        if (b.importe !== a.importe) return b.importe - a.importe;

        return a.nombre.localeCompare(b.nombre, "es");

      });

  }

 

  function agregarConceptoAcumulado(acumulado, datos) {

    const clave = [

      normalizarTextoArticulo(datos.tipo),

      normalizarTextoArticulo(datos.nombre),

      normalizarTextoArticulo(datos.categoria),

    ].join("|");

 

    if (!acumulado.has(clave)) {

      acumulado.set(clave, {

        tipo: datos.tipo,

        nombre: datos.nombre,

        categoria: datos.categoria,

        cantidad: 0,

        importe: 0,

      });

    }

 

    const concepto = acumulado.get(clave);

    concepto.cantidad += numeroSeguroArticulo(datos.cantidad);

    concepto.importe += numeroSeguroArticulo(datos.importe);

  }

 

  function obtenerNombreExtra(extra) {

    if (typeof extra === "string") return extra.trim();

 

    return String(

      extra?.nombre || extra?.descripcion || extra?.extra || "Extra",

    ).trim();

  }

 

  function obtenerPrecioExtra(extra) {

    if (!extra || typeof extra !== "object") return 0;

 

    return numeroSeguroArticulo(extra.precio ?? extra.precioFinal ?? extra.costo ?? 0);

  }

 

  function renderizarReporteArticulos(conceptos) {

    cuerpoTablaReporteArticulos.innerHTML = conceptos

      .map((concepto, indice) => {

        const esExtra = concepto.tipo === "Extra";

 

        return `

          <tr>

            <td>${indice + 1}</td>

            <td>

              <span class="tipoReporteArticulo ${

                esExtra ? "tipoExtraReporte" : "tipoArticuloReporte"

              }">

                ${esExtra ? "Extra" : "Artículo"}

              </span>

            </td>

            <td><strong>${escaparHTMLArticulo(concepto.nombre)}</strong></td>

            <td>${escaparHTMLArticulo(concepto.categoria)}</td>

            <td>${formatearCantidadArticulo(concepto.cantidad)}</td>

            <td>${formatearDineroArticulo(concepto.precioPromedio)}</td>

            <td><strong>${formatearDineroArticulo(concepto.importe)}</strong></td>

          </tr>

        `;

      })

      .join("");

  }

 

  function actualizarIndicadoresArticulos(conceptos) {

    const articulos = conceptos.filter((concepto) => concepto.tipo === "Artículo");

    const extras = conceptos.filter((concepto) => concepto.tipo === "Extra");

 

    const unidadesArticulos = articulos.reduce((total, articulo) => total + articulo.cantidad, 0);

    const unidadesExtras = extras.reduce((total, extra) => total + extra.cantidad, 0);

    const totalVentaArticulos = articulos.reduce((total, articulo) => total + articulo.importe, 0);

    const totalVentaExtras = extras.reduce((total, extra) => total + extra.importe, 0);

 

    const cantidadGeneral = unidadesArticulos + unidadesExtras;

    const ventaGeneral = totalVentaArticulos + totalVentaExtras;

 

    totalArticulosDiferentes.textContent = articulos.length.toLocaleString("es-MX");

    totalUnidadesArticulos.textContent = formatearCantidadArticulo(unidadesArticulos);

    totalUnidadesExtras.textContent = formatearCantidadArticulo(unidadesExtras);

    ventaTotalExtras.textContent = formatearDineroArticulo(totalVentaExtras);

    ventaTotalArticulos.textContent = formatearDineroArticulo(ventaGeneral);

    granTotalCantidadArticulos.textContent = formatearCantidadArticulo(cantidadGeneral);

    granTotalVentaArticulos.textContent = formatearDineroArticulo(ventaGeneral);

  }

 

  function limpiarReporteArticulos() {

    resultadoReporteArticulos = [];

 

    totalArticulosDiferentes.textContent = "0";

    totalUnidadesArticulos.textContent = "0";

    totalUnidadesExtras.textContent = "0";

    ventaTotalExtras.textContent = "$0.00";

    ventaTotalArticulos.textContent = "$0.00";

    granTotalCantidadArticulos.textContent = "0";

    granTotalVentaArticulos.textContent = "$0.00";

    btnExportarReporteArticulos.disabled = true;

 

    cuerpoTablaReporteArticulos.innerHTML = `

      <tr>

        <td colspan="7" class="mensajeTablaReporteArticulos">

          No hay artículos para mostrar.

        </td>

      </tr>

    `;

  }

 

  function exportarReporteArticulosExcel() {

    if (resultadoReporteArticulos.length === 0) {

      mostrarMensajeArticulos("Primero consulta un rango de fechas.");

      return;

    }

 

    if (typeof XLSX === "undefined") {

      mostrarMensajeArticulos("No fue posible cargar la librería de Excel.");

      return;

    }

 

    const articulos = resultadoReporteArticulos.filter((concepto) => concepto.tipo === "Artículo");

    const extras = resultadoReporteArticulos.filter((concepto) => concepto.tipo === "Extra");

 

    const unidadesArticulos = articulos.reduce((total, articulo) => total + articulo.cantidad, 0);

    const unidadesExtras = extras.reduce((total, extra) => total + extra.cantidad, 0);

    const ventaArticulos = articulos.reduce((total, articulo) => total + articulo.importe, 0);

    const ventaExtras = extras.reduce((total, extra) => total + extra.importe, 0);

    const totalVenta = ventaArticulos + ventaExtras;

 

    const filasDetalle = resultadoReporteArticulos.map((concepto, indice) => [

      indice + 1,

      concepto.tipo,

      concepto.nombre,

      concepto.categoria,

      concepto.cantidad,

      concepto.precioPromedio,

      concepto.importe,

    ]);

 

    const datosHoja = [

      ["VENTAS ACUMULADAS POR ARTÍCULOS"],

      [

        "Fecha inicial",

        fechaInicialReporteArticulos.value,

        "",

        "Fecha final",

        fechaFinalReporteArticulos.value,

      ],

      [],

      [

        "N.º",

        "Tipo",

        "Artículo o extra",

        "Categoría",

        "Cantidad",

        "Precio promedio",

        "Venta acumulada",

      ],

      ...filasDetalle,

      [],

      ["RESUMEN GENERAL"],

      ["Artículos diferentes", articulos.length],

      ["Unidades de artículos", unidadesArticulos],

      ["Unidades de extras", unidadesExtras],

      ["Venta de artículos", ventaArticulos],

      ["Venta de extras", ventaExtras],

      ["GRAN TOTAL", totalVenta],

    ];

 

    const hoja = XLSX.utils.aoa_to_sheet(datosHoja);

    const libro = XLSX.utils.book_new();

 

    XLSX.utils.book_append_sheet(libro, hoja, "Ventas por artículos");

 

    const filaResumen = filasDetalle.length + 5;

    hoja["!merges"] = [

      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },

      { s: { r: filaResumen, c: 0 }, e: { r: filaResumen, c: 1 } },

    ];

 

    hoja["!cols"] = [

      { wch: 8 },

      { wch: 14 },

      { wch: 32 },

      { wch: 22 },

      { wch: 13 },

      { wch: 18 },

      { wch: 19 },

    ];

 

    hoja["!rows"] = [{ hpt: 28 }, { hpt: 21 }, {}, { hpt: 25 }];

 

    const estiloTitulo = {

      font: { bold: true, sz: 16, color: { rgb: "000000" } },

      fill: { fgColor: { rgb: "FFD966" } },

      alignment: { horizontal: "center", vertical: "center" },

      border: crearBordesReporteArticulos(),

    };

 

    const estiloEncabezado = {

      font: { bold: true, color: { rgb: "000000" } },

      fill: { fgColor: { rgb: "FFD966" } },

      alignment: { horizontal: "center", vertical: "center", wrapText: true },

      border: crearBordesReporteArticulos(),

    };

 

    const estiloCelda = {

      border: crearBordesReporteArticulos(),

      alignment: { vertical: "center" },

    };

 

    const estiloNumero = {

      border: crearBordesReporteArticulos(),

      numFmt: '#,##0.00',

      alignment: { horizontal: "right", vertical: "center" },

    };

 

    const estiloMoneda = {

      border: crearBordesReporteArticulos(),

      numFmt: '$#,##0.00',

      alignment: { horizontal: "right", vertical: "center" },

    };

 

    const estiloTotal = {

      font: { bold: true, color: { rgb: "000000" } },

      fill: { fgColor: { rgb: "FFD966" } },

      border: crearBordesReporteArticulos(),

    };

 

    hoja["A1"].s = estiloTitulo;

 

    ["A2", "D2"].forEach((referencia) => {

      if (hoja[referencia]) hoja[referencia].s = { font: { bold: true } };

    });

 

    for (let columna = 0; columna <= 6; columna++) {

      const referencia = XLSX.utils.encode_cell({ r: 3, c: columna });

      if (hoja[referencia]) hoja[referencia].s = estiloEncabezado;

    }

 

    const filaInicialDetalle = 4;

    const filaFinalDetalle = filaInicialDetalle + filasDetalle.length - 1;

 

    for (let fila = filaInicialDetalle; fila <= filaFinalDetalle; fila++) {

      for (let columna = 0; columna <= 6; columna++) {

        const referencia = XLSX.utils.encode_cell({ r: fila, c: columna });

        if (!hoja[referencia]) continue;

 

        if (columna === 5 || columna === 6) {

          hoja[referencia].s = estiloMoneda;

        } else if (columna === 4) {

          hoja[referencia].s = estiloNumero;

        } else {

          hoja[referencia].s = estiloCelda;

        }

      }

    }

 

    const referenciaResumen = XLSX.utils.encode_cell({ r: filaResumen, c: 0 });

    if (hoja[referenciaResumen]) hoja[referenciaResumen].s = estiloEncabezado;

 

    for (let fila = filaResumen + 1; fila <= filaResumen + 6; fila++) {

      const etiqueta = XLSX.utils.encode_cell({ r: fila, c: 0 });

      const valor = XLSX.utils.encode_cell({ r: fila, c: 1 });

 

      if (hoja[etiqueta]) {

        hoja[etiqueta].s = {

          font: { bold: true },

          border: crearBordesReporteArticulos(),

        };

      }

 

      if (hoja[valor]) {

        hoja[valor].s = fila >= filaResumen + 4 ? estiloMoneda : estiloNumero;

      }

    }

 

    const filaGranTotal = filaResumen + 6;

    const etiquetaTotal = XLSX.utils.encode_cell({ r: filaGranTotal, c: 0 });

    const valorTotal = XLSX.utils.encode_cell({ r: filaGranTotal, c: 1 });

 

    if (hoja[etiquetaTotal]) {

      hoja[etiquetaTotal].s = {

        ...estiloTotal,

        alignment: { horizontal: "left" },

      };

    }

 

    if (hoja[valorTotal]) {

      hoja[valorTotal].s = {

        ...estiloTotal,

        numFmt: '$#,##0.00',

        alignment: { horizontal: "right" },

      };

    }

 

    hoja["!freeze"] = { xSplit: 0, ySplit: 4 };

 

    const fechaInicialNombre = fechaInicialReporteArticulos.value.replaceAll("/", "-");

    const fechaFinalNombre = fechaFinalReporteArticulos.value.replaceAll("/", "-");

 

    XLSX.writeFile(

      libro,

      `Ventas_Articulos_${fechaInicialNombre}_al_${fechaFinalNombre}.xlsx`,

      { compression: true },

    );

  }

 

  function crearBordesReporteArticulos() {

    const borde = {

      style: "thin",

      color: { rgb: "B7B7B7" },

    };

 

    return {

      top: borde,

      bottom: borde,

      left: borde,

      right: borde,

    };

  }

 

  function convertirFechaArticuloAISO(texto) {

    const partes = String(texto || "").split("/");

 

    if (partes.length !== 3) return null;

 

    const dia = Number(partes[0]);

    const mes = Number(partes[1]);

    const anioCorto = Number(partes[2]);

 

    if (!Number.isInteger(dia) || !Number.isInteger(mes) || !Number.isInteger(anioCorto)) {

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

 

    return `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

  }

 

  function obtenerFechaISODeCuentaArticulo(cuenta) {

    if (cuenta?.fechaPagoISO) {

      return String(cuenta.fechaPagoISO).slice(0, 10);

    }

 

    const fechaPago = String(cuenta?.fechaPago || "");

    if (!fechaPago.includes("/")) return null;

 

    const partes = fechaPago.split("/");

    if (partes.length !== 3) return null;

 

    const anioCorto = String(partes[2]).slice(-2);

 

    return convertirFechaArticuloAISO(

      `${partes[0]}/${partes[1]}/${anioCorto}`,

    );

  }

 

  function numeroSeguroArticulo(valor) {

    const numero = Number(valor);

    return Number.isFinite(numero) ? numero : 0;

  }

 

  function formatearCantidadArticulo(valor) {

    return numeroSeguroArticulo(valor).toLocaleString("es-MX", {

      minimumFractionDigits: 0,

      maximumFractionDigits: 2,

    });

  }

 

  function formatearDineroArticulo(valor) {

    return numeroSeguroArticulo(valor).toLocaleString("es-MX", {

      style: "currency",

      currency: "MXN",

      minimumFractionDigits: 2,

      maximumFractionDigits: 2,

    });

  }

 

  function normalizarTextoArticulo(texto) {

    return String(texto || "")

      .normalize("NFD")

      .replace(/[\u0300-\u036f]/g, "")

      .toLowerCase()

      .trim();

  }

 

  function escaparHTMLArticulo(valor) {

    return String(valor ?? "")

      .replaceAll("&", "&amp;")

      .replaceAll("<", "&lt;")

      .replaceAll(">", "&gt;")

      .replaceAll('"', "&quot;")

      .replaceAll("'", "&#039;");

  }

 

  function mostrarMensajeArticulos(mensaje, exito = false) {

    if (!mensajeReporteArticulos) return;

 

    mensajeReporteArticulos.textContent = mensaje;

    mensajeReporteArticulos.classList.toggle("exito", exito);

  }

})();

