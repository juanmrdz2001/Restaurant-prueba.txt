let mesasRestaurant = [];

let mesaSeleccionada = null;

 

const pantallaMesero = document.getElementById("pantallaMesero");

 

const contenedorMesas = document.getElementById("contenedorMesas");

 

const detalleMesaSeleccionada = document.getElementById(

  "detalleMesaSeleccionada",

);

 

const nombreMesaSeleccionada = document.getElementById(

  "nombreMesaSeleccionada",

);

 

const btnActualizarMesas = document.getElementById("btnActualizarMesas");

 

const btnAbrirMesa = document.getElementById("btnAbrirMesa");

 

btnActualizarMesas.addEventListener("click", cargarMesas);

 

btnAbrirMesa.addEventListener("click", abrirMesaSeleccionada);

 

async function cargarMesas() {

  contenedorMesas.innerHTML = `

    <p class="cargandoMesas">

      Cargando mesas...

    </p>

  `;

 

  try {

    const respuesta = await fetch("/api/mesas");

 

    const resultado = await respuesta.json();

 

    if (!respuesta.ok || !resultado.ok) {

      throw new Error(resultado.mensaje || "No fue posible cargar las mesas.");

    }

 

    mesasRestaurant = resultado.mesas;

 

    dibujarMesas();

  } catch (error) {

    contenedorMesas.innerHTML = `

      <p class="mensajeErrorMesas">

        ${error.message}

      </p>

    `;

  }

}

 

function dibujarMesas() {

  contenedorMesas.innerHTML = "";

 

  mesasRestaurant.forEach((mesa) => {

    const boton = document.createElement("button");

 

    boton.type = "button";

 

    boton.className = crearClaseMesa(mesa);

 

    boton.dataset.id = mesa.id;

 

    const icono = mesa.tipo === "moto" ? "🏍️" : "🍽️";

 

    boton.innerHTML = `

      <span class="iconoMesa">

        ${icono}

      </span>

 

      <span class="nombreMesa">

        ${mesa.nombre}

      </span>

 

      <span class="estadoMesa">

        ${formatearEstadoMesa(mesa.estado)}

      </span>

    `;

 

    boton.addEventListener("click", () => seleccionarMesa(mesa.id));

 

    contenedorMesas.appendChild(boton);

  });

}

 

function crearClaseMesa(mesa) {

  let clase = `

    tarjetaMesa

    estado-${mesa.estado}

  `;

 

  if (mesa.tipo === "moto") {

    clase += " moto";

  }

 

  if (mesaSeleccionada && mesaSeleccionada.id === mesa.id) {

    clase += " seleccionada";

  }

 

  return clase;

}

 

function seleccionarMesa(mesaId) {

  mesaSeleccionada = mesasRestaurant.find((mesa) => mesa.id === mesaId);

 

  if (!mesaSeleccionada) {

    return;

  }

 

  nombreMesaSeleccionada.textContent = mesaSeleccionada.nombre;

 

  detalleMesaSeleccionada.classList.remove("oculto");

 

  btnAbrirMesa.textContent =

    mesaSeleccionada.estado === "libre" ? "Abrir pedido" : "Ver pedido";

 

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

 

  if (!vistaMesas || !vistaPedidoMesa) {

    alert("Falta la nueva pantalla del pedido en index.html");

    return;

  }

 

  vistaMesas.classList.add("oculto");

  vistaPedidoMesa.classList.remove("oculto");

 

  if (tituloPedidoMesa) tituloPedidoMesa.textContent = mesaSeleccionada.nombre;

  if (estadoPedidoMesa) estadoPedidoMesa.textContent = formatearEstadoMesa(mesaSeleccionada.estado);

 

  // Inicializa el pedido de la mesa y crea el primer comensal.

  // Sin esta llamada, el panel derecho queda vacío y los productos no pueden agregarse.

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

  pantallaMesero.classList.remove("oculto");

 

  cargarMesas();

}

 

function ocultarPantallaMesero() {

  pantallaMesero.classList.add("oculto");

 

  detalleMesaSeleccionada.classList.add("oculto");

 

  mesaSeleccionada = null;

}

 

 

const btnRegresarMesas = document.getElementById("btnRegresarMesas");

if (btnRegresarMesas) {

  btnRegresarMesas.addEventListener("click", regresarVistaMesas);

}

function regresarVistaMesas() {

  const vistaMesas=document.getElementById("vistaMesas");

  const vistaPedidoMesa=document.getElementById("vistaPedidoMesa");

  if(vistaPedidoMesa) vistaPedidoMesa.classList.add("oculto");

  if(vistaMesas) vistaMesas.classList.remove("oculto");

}