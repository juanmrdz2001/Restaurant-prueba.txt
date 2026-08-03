/* ============================================================

   ADMINISTRACIÓN DE EMPLEADOS

   - Alta de empleados

   - Modificación de empleados

   - No permite eliminar registros

   - Los empleados que dejan de trabajar se marcan como inactivos

   ============================================================ */

const CLAVE_EMPLEADOS = "restaurantEmpleados";

const ID_ADMIN_PRINCIPAL = "EMP-0001";

const pantallaAdmin = document.getElementById("pantallaAdmin");
const botonesModuloAdmin = document.querySelectorAll("[data-modulo-admin]");
const modulosAdmin = {
  resumen: document.getElementById("moduloAdminResumen"),
  empleados: document.getElementById("moduloAdminEmpleados"),
  reportes: document.getElementById("moduloAdminReportes"),
  reporteArticulos: document.getElementById("moduloAdminReporteArticulos"),
  articulos: document.getElementById("moduloAdminArticulos"),
  caja: document.getElementById("moduloAdminCaja"),
  configuracion: document.getElementById("moduloAdminConfiguracion"),
};

const btnNuevoEmpleado = document.getElementById("btnNuevoEmpleado");

const buscarEmpleadoAdmin = document.getElementById("buscarEmpleadoAdmin");

const cuerpoTablaEmpleados = document.getElementById("cuerpoTablaEmpleados");

const totalEmpleadosAdmin = document.getElementById("totalEmpleadosAdmin");

const modalEmpleado = document.getElementById("modalEmpleado");

const formEmpleado = document.getElementById("formEmpleado");

const accionModalEmpleado = document.getElementById("accionModalEmpleado");

const tituloModalEmpleado = document.getElementById("tituloModalEmpleado");

const btnCerrarModalEmpleado = document.getElementById(
  "btnCerrarModalEmpleado",
);

const btnCancelarEmpleado = document.getElementById("btnCancelarEmpleado");

const btnMostrarPasswordEmpleado = document.getElementById(
  "btnMostrarPasswordEmpleado",
);

const btnGuardarEmpleado = document.getElementById("btnGuardarEmpleado");

const numeroEmpleado = document.getElementById("numeroEmpleado");

const nombreEmpleado = document.getElementById("nombreEmpleado");

const usuarioEmpleado = document.getElementById("usuarioEmpleado");

const passwordEmpleado = document.getElementById("passwordEmpleado");

const puestoEmpleado = document.getElementById("puestoEmpleado");

const telefonoEmpleado = document.getElementById("telefonoEmpleado");

const fechaIngresoEmpleado = document.getElementById("fechaIngresoEmpleado");

const estadoEmpleado = document.getElementById("estadoEmpleado");

const mensajeEmpleado = document.getElementById("mensajeEmpleado");

const avisoEmpleadoProtegido = document.getElementById(
  "avisoEmpleadoProtegido",
);

let empleados = cargarEmpleados();

let empleadoEnEdicionId = null;

botonesModuloAdmin.forEach((boton) => {
  boton.addEventListener("click", () =>
    mostrarModuloAdmin(boton.dataset.moduloAdmin),
  );
});

if (btnNuevoEmpleado)
  btnNuevoEmpleado.addEventListener("click", abrirModalNuevoEmpleado);

if (buscarEmpleadoAdmin)
  buscarEmpleadoAdmin.addEventListener("input", renderizarEmpleados);

if (formEmpleado) formEmpleado.addEventListener("submit", guardarEmpleado);

if (btnCerrarModalEmpleado)
  btnCerrarModalEmpleado.addEventListener("click", cerrarModalEmpleado);

if (btnCancelarEmpleado)
  btnCancelarEmpleado.addEventListener("click", cerrarModalEmpleado);

if (btnMostrarPasswordEmpleado)
  btnMostrarPasswordEmpleado.addEventListener(
    "click",
    alternarPasswordEmpleado,
  );

if (modalEmpleado) {
  modalEmpleado
    .querySelectorAll("[data-cerrar-modal-empleado]")
    .forEach((fondo) => {
      fondo.addEventListener("click", cerrarModalEmpleado);
    });
}

if (cuerpoTablaEmpleados) {
  cuerpoTablaEmpleados.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-modificar-empleado]");

    if (boton) abrirModalModificarEmpleado(boton.dataset.modificarEmpleado);
  });
}

if (estadoEmpleado)
  estadoEmpleado.addEventListener("change", protegerAdministradorPrincipal);

document.addEventListener("keydown", (evento) => {
  if (
    evento.key === "Escape" &&
    modalEmpleado &&
    !modalEmpleado.classList.contains("oculto")
  ) {
    cerrarModalEmpleado();
  }
});

function mostrarPantallaAdmin() {
  if (!pantallaAdmin) return;

  pantallaAdmin.classList.remove("oculto");

  mostrarModuloAdmin("empleados");
}

function ocultarPantallaAdmin() {
  if (!pantallaAdmin) return;

  pantallaAdmin.classList.add("oculto");

  cerrarModalEmpleado();
}

function mostrarModuloAdmin(nombreModulo) {
  const moduloSeleccionado = modulosAdmin[nombreModulo];

  if (!moduloSeleccionado) return;

  Object.values(modulosAdmin).forEach((modulo) => {
    if (modulo) modulo.classList.add("oculto");
  });

  moduloSeleccionado.classList.remove("oculto");

  botonesModuloAdmin.forEach((boton) => {
    const estaActivo = boton.dataset.moduloAdmin === nombreModulo;
    boton.classList.toggle("activo", estaActivo);
    boton.setAttribute("aria-pressed", String(estaActivo));
  });

  if (nombreModulo === "empleados") renderizarEmpleados();
}

function cargarEmpleados() {
  const guardados = localStorage.getItem(CLAVE_EMPLEADOS);

  if (guardados) {
    try {
      const lista = JSON.parse(guardados);

      if (Array.isArray(lista) && lista.length > 0) return lista;
    } catch (error) {
      console.error("No fue posible leer los empleados guardados:", error);
    }
  }

  const iniciales = [
    {
      id: ID_ADMIN_PRINCIPAL,

      nombre: "Administrador principal",

      usuario: "admin",

      password: "1234",

      puesto: "admin",

      telefono: "",

      fechaIngreso: fechaHoyISO(),

      estado: "activo",

      protegido: true,
    },
  ];

  localStorage.setItem(CLAVE_EMPLEADOS, JSON.stringify(iniciales));

  return iniciales;
}

function guardarEmpleadosEnDispositivo() {
  localStorage.setItem(CLAVE_EMPLEADOS, JSON.stringify(empleados));
}

function renderizarEmpleados() {
  if (!cuerpoTablaEmpleados) return;

  const filtro = normalizarTexto(buscarEmpleadoAdmin?.value || "");

  const lista = empleados.filter((empleado) => {
    const contenido = normalizarTexto(
      `${empleado.id} ${empleado.nombre} ${nombrePuesto(empleado.puesto)} ${empleado.usuario} ${empleado.telefono || ""}`,
    );

    return contenido.includes(filtro);
  });

  totalEmpleadosAdmin.textContent = `${empleados.length} ${empleados.length === 1 ? "empleado" : "empleados"}`;

  if (lista.length === 0) {
    cuerpoTablaEmpleados.innerHTML =
      '<tr><td colspan="8" class="mensajeTablaEmpleados">No se encontraron empleados.</td></tr>';

    return;
  }

  cuerpoTablaEmpleados.innerHTML = lista
    .map(
      (empleado) => `

    <tr class="${empleado.estado === "inactivo" ? "filaEmpleadoInactivo" : ""}">

      <td><strong>${escaparHTML(empleado.id)}</strong></td>

      <td>${escaparHTML(empleado.nombre)}</td>

      <td>${escaparHTML(nombrePuesto(empleado.puesto))}</td>

      <td>${escaparHTML(empleado.usuario)}</td>

      <td>${escaparHTML(empleado.telefono || "—")}</td>

      <td>${escaparHTML(formatearFecha(empleado.fechaIngreso))}</td>

      <td><span class="estadoEmpleado ${empleado.estado === "activo" ? "estadoEmpleadoActivo" : "estadoEmpleadoInactivo"}">${empleado.estado === "activo" ? "Activo" : "Inactivo"}</span></td>

      <td><button class="btnModificarEmpleado" type="button" data-modificar-empleado="${escaparHTML(empleado.id)}">Modificar</button></td>

    </tr>

  `,
    )
    .join("");
}

function abrirModalNuevoEmpleado() {
  empleadoEnEdicionId = null;

  formEmpleado.reset();

  numeroEmpleado.value = obtenerSiguienteNumeroEmpleado();

  fechaIngresoEmpleado.value = fechaHoyISO();

  estadoEmpleado.value = "activo";

  accionModalEmpleado.textContent = "Alta de empleado";

  tituloModalEmpleado.textContent = "Nuevo empleado";

  btnGuardarEmpleado.textContent = "Guardar empleado";

  estadoEmpleado.disabled = false;

  avisoEmpleadoProtegido.classList.add("oculto");

  mostrarMensajeEmpleado("");

  abrirModalEmpleado();

  nombreEmpleado.focus();
}

function abrirModalModificarEmpleado(id) {
  const empleado = empleados.find((item) => item.id === id);

  if (!empleado) return;

  empleadoEnEdicionId = empleado.id;

  numeroEmpleado.value = empleado.id;

  nombreEmpleado.value = empleado.nombre;

  usuarioEmpleado.value = empleado.usuario;

  passwordEmpleado.value = empleado.password;

  puestoEmpleado.value = empleado.puesto;

  telefonoEmpleado.value = empleado.telefono || "";

  fechaIngresoEmpleado.value = empleado.fechaIngreso;

  estadoEmpleado.value = empleado.estado;

  accionModalEmpleado.textContent = "Modificación de empleado";

  tituloModalEmpleado.textContent = empleado.nombre;

  btnGuardarEmpleado.textContent = "Guardar cambios";

  protegerAdministradorPrincipal();

  mostrarMensajeEmpleado("");

  abrirModalEmpleado();

  nombreEmpleado.focus();
}

function abrirModalEmpleado() {
  modalEmpleado.classList.remove("oculto");

  modalEmpleado.setAttribute("aria-hidden", "false");

  document.body.classList.add("modalEmpleadoAbierto");
}

function cerrarModalEmpleado() {
  if (!modalEmpleado) return;

  modalEmpleado.classList.add("oculto");

  modalEmpleado.setAttribute("aria-hidden", "true");

  document.body.classList.remove("modalEmpleadoAbierto");

  passwordEmpleado.type = "password";

  btnMostrarPasswordEmpleado.textContent = "👁️";

  empleadoEnEdicionId = null;

  mostrarMensajeEmpleado("");
}

function guardarEmpleado(evento) {
  evento.preventDefault();

  const datos = {
    id: numeroEmpleado.value,

    nombre: nombreEmpleado.value.trim(),

    usuario: usuarioEmpleado.value.trim().toLowerCase(),

    password: passwordEmpleado.value,

    puesto: puestoEmpleado.value,

    telefono: telefonoEmpleado.value.trim(),

    fechaIngreso: fechaIngresoEmpleado.value,

    estado: estadoEmpleado.value,
  };

  if (
    !datos.nombre ||
    !datos.usuario ||
    !datos.password ||
    !datos.puesto ||
    !datos.fechaIngreso
  ) {
    mostrarMensajeEmpleado("Completa todos los datos obligatorios.");

    return;
  }

  const usuarioRepetido = empleados.some(
    (empleado) =>
      empleado.usuario.toLowerCase() === datos.usuario &&
      empleado.id !== empleadoEnEdicionId,
  );

  if (usuarioRepetido) {
    mostrarMensajeEmpleado("Ese usuario ya pertenece a otro empleado.");

    usuarioEmpleado.focus();

    return;
  }

  if (empleadoEnEdicionId) {
    const indice = empleados.findIndex(
      (empleado) => empleado.id === empleadoEnEdicionId,
    );

    if (indice === -1) return;

    const eraProtegido =
      empleados[indice].protegido === true ||
      empleados[indice].id === ID_ADMIN_PRINCIPAL;

    if (eraProtegido) {
      datos.estado = "activo";

      datos.protegido = true;
    }

    empleados[indice] = { ...empleados[indice], ...datos };
  } else {
    empleados.push({ ...datos, protegido: false });
  }

  guardarEmpleadosEnDispositivo();

  renderizarEmpleados();

  cerrarModalEmpleado();
}

function protegerAdministradorPrincipal() {
  const protegido = empleadoEnEdicionId === ID_ADMIN_PRINCIPAL;

  estadoEmpleado.disabled = protegido;

  avisoEmpleadoProtegido.classList.toggle("oculto", !protegido);

  if (protegido) estadoEmpleado.value = "activo";
}

function alternarPasswordEmpleado() {
  const visible = passwordEmpleado.type === "text";

  passwordEmpleado.type = visible ? "password" : "text";

  btnMostrarPasswordEmpleado.textContent = visible ? "👁️" : "🙈";
}

function obtenerSiguienteNumeroEmpleado() {
  const mayor = empleados.reduce((numeroMayor, empleado) => {
    const numero = Number(String(empleado.id).replace(/\D/g, ""));

    return Math.max(numeroMayor, Number.isFinite(numero) ? numero : 0);
  }, 0);

  return `EMP-${String(mayor + 1).padStart(4, "0")}`;
}

function nombrePuesto(puesto) {
  const puestos = {
    admin: "Administrador",
    mesero: "Mesero",
    cocina: "Cocina",
    cajero: "Cajero",
    limpieza: "Limpieza",
  };

  return puestos[puesto] || puesto;
}

function fechaHoyISO() {
  const ahora = new Date();

  const compensacion = ahora.getTimezoneOffset() * 60000;

  return new Date(ahora.getTime() - compensacion).toISOString().slice(0, 10);
}

function formatearFecha(fecha) {
  if (!fecha) return "—";

  const [anio, mes, dia] = fecha.split("-");

  return `${dia}/${mes}/${anio}`;
}

function normalizarTexto(texto) {
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function escaparHTML(valor) {
  return String(valor)
    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");
}

function mostrarMensajeEmpleado(mensaje, exito = false) {
  mensajeEmpleado.textContent = mensaje;

  mensajeEmpleado.classList.toggle("exito", exito);
}

renderizarEmpleados();
