// =====================================

// menu.js

// Menú con productos individuales y edición por doble clic

// =====================================

 

const categoriasMenu = [

  {

    id: "antojitos",

    nombre: "🍽️ Antojitos Mexicanos",

    productos: [

      {

        id: "menudo",

        nombre: "Menudo",

        precio: 190,

        observacionesRapidas: [

          "Sin cebolla",

          "Sin tomate",

          "Sin chile",

          "Queso extra",

          "Bien cocida",

        ],

        extras: [],

      },

      {

        id: "pozole",

        nombre: "Pozole",

        precio: 175,

        observacionesRapidas: [

          "Salsa aparte",

          "Sin picante",

          "Picante",

          "Extra aderezo",

        ],

        extras: [],

      },

      {

        id: "enchiladas",

        nombre: "Enchiladas",

        precio: 175,

        observacionesRapidas: [

          "Sin sal",

          "Sal extra",

          "Catsup aparte",

          "Bien doradas",

        ],

        extras: [],

      },
      {

        id: "queso",

        nombre: "Queso",

        precio: 145,

        observacionesRapidas: [

          "Sin sal",

          "Sal extra",

          "Catsup aparte",

          "Bien doradas",

        ],

        extras: [],

      },
      {

        id: "polloyqueso",

        nombre: "Pollo y Queso",

        precio: 140,

        observacionesRapidas: [

          "Sin sal",

          "Sal extra",

          "Catsup aparte",

          "Bien doradas",

        ],

        extras: [],

      },
      {

        id: "suizas ",

        nombre: "Enchiladas Suizas",

        precio: 175,

        observacionesRapidas: [

          "Sin sal",

          "Sal extra",

          "Catsup aparte",

          "Bien doradas",

        ],

        extras: [],

      },

    ],

  },
  {

    id: "tortas",

    nombre: " Tortas",

    productos: [

      {

        id: "pierna",

        nombre: "Pierna",

        precio: 120,

        observacionesRapidas: [

          "Sin crema",

          "Calentar",

          "Para llevar",

          "Con cuchara extra",

        ],

        extras: [],

      },

    ],

  },
  {

    id: "bebidas",

    nombre: "🥤 Bebidas",

    productos: [

      {

        id: "coca-cola",

        nombre: "Coca-Cola",

        precio: 45,

        observacionesRapidas: [

          "Sin hielo",

          "Poco hielo",

          "Hielo extra",

          "Con limón",

        ],

        extras: [],

      },

      {

        id: "agua",

        nombre: "Agua",

        precio: 30,

        observacionesRapidas: [

          "Natural",

          "Fría",

          "Con hielo",

          "Con limón",

        ],

        extras: [],

      },

    ],

  },

  {

    id: "postres",

    nombre: "🍰 Postres",

    productos: [

      {

        id: "pastel",

        nombre: "Pastel",

        precio: 90,

        observacionesRapidas: [

          "Sin crema",

          "Calentar",

          "Para llevar",

          "Con cuchara extra",

        ],

        extras: [],

      },

    ],

  },

  {

    id: "cafe",

    nombre: "☕ Café",

    productos: [

      {

        id: "americano",

        nombre: "Café americano",

        precio: 40,

        observacionesRapidas: [

          "Sin azúcar",

          "Azúcar aparte",

          "Con leche",

          "Muy caliente",

        ],

        extras: [],

      },

    ],

  },

];

 

// Producto del pedido que se está modificando.

let productoPedidoEnEdicionId = null;

 

// Elementos del modal de edición.

const modalProducto = document.getElementById("modalProducto");

const textoAccionProductoModal = document.getElementById(

  "textoAccionProductoModal",

);

const nombreProductoModal = document.getElementById("nombreProductoModal");

const precioProductoModal = document.getElementById("precioProductoModal");

const opcionesObservacionesProducto = document.getElementById(

  "opcionesObservacionesProducto",

);

const seccionExtrasProducto = document.getElementById(

  "seccionExtrasProducto",

);

const opcionesExtrasProducto = document.getElementById(

  "opcionesExtrasProducto",

);

const notaProductoModal = document.getElementById("notaProductoModal");

const btnCerrarModalProducto = document.getElementById(

  "btnCerrarModalProducto",

);

const btnCancelarProducto = document.getElementById("btnCancelarProducto");

const btnEliminarProducto = document.getElementById("btnEliminarProducto");

const btnConfirmarProducto = document.getElementById("btnConfirmarProducto");

 

function inicializarMenu() {

  mostrarCategoriasMenu();

  prepararEventosModalProducto();

}

 

function mostrarCategoriasMenu() {

  const contenedorMenu = document.getElementById("contenedorMenu");

 

  if (!contenedorMenu) return;

 

  contenedorMenu.innerHTML = "";

 

  categoriasMenu.forEach((categoria) => {

    const boton = document.createElement("button");

 

    boton.type = "button";

    boton.className = "categoriaMenu";

    boton.textContent = categoria.nombre;

 

    boton.addEventListener("click", () => {

      mostrarProductosMenu(categoria.id);

    });

 

    contenedorMenu.appendChild(boton);

  });

}

 

function mostrarProductosMenu(categoriaId) {

  const contenedorMenu = document.getElementById("contenedorMenu");

  const categoria = categoriasMenu.find((item) => item.id === categoriaId);

 

  if (!contenedorMenu || !categoria) return;

 

  contenedorMenu.innerHTML = "";

 

  const botonRegresar = document.createElement("button");

 

  botonRegresar.type = "button";

  botonRegresar.className = "categoriaMenu";

  botonRegresar.textContent = "← Categorías";

  botonRegresar.addEventListener("click", mostrarCategoriasMenu);

 

  contenedorMenu.appendChild(botonRegresar);

 

  categoria.productos.forEach((producto) => {

    const tarjeta = document.createElement("article");

 

    tarjeta.className = "tarjetaProducto";

 

    tarjeta.innerHTML = `

      <h3>${producto.nombre}</h3>

      <p>${formatearPrecioMenu(producto.precio)}</p>

      <button type="button">Elegir</button>

    `;

 

    tarjeta.querySelector("button").addEventListener("click", () => {

      if (typeof agregarProductoAlComensalActivo !== "function") {

        alert("No se encontró la función para agregar productos al pedido.");

        return;

      }

 

      // Cada clic agrega exactamente un producto independiente.

      agregarProductoAlComensalActivo(producto);

    });

 

    contenedorMenu.appendChild(tarjeta);

  });

}

 

function prepararEventosModalProducto() {

  if (!modalProducto || modalProducto.dataset.eventosListos === "si") {

    return;

  }

 

  modalProducto.dataset.eventosListos = "si";

 

  btnCerrarModalProducto?.addEventListener("click", cerrarModalProducto);

  btnCancelarProducto?.addEventListener("click", cerrarModalProducto);

  btnConfirmarProducto?.addEventListener(

    "click",

    guardarCambiosProductoPedido,

  );

  btnEliminarProducto?.addEventListener(

    "click",

    eliminarProductoPedidoDesdeModal,

  );

 

  modalProducto

    .querySelectorAll("[data-cerrar-modal-producto]")

    .forEach((elemento) => {

      elemento.addEventListener("click", cerrarModalProducto);

    });

 

  document.addEventListener("keydown", (evento) => {

    if (

      evento.key === "Escape" &&

      !modalProducto.classList.contains("oculto")

    ) {

      cerrarModalProducto();

    }

  });

}

 

// Esta función es llamada desde comensales.js cuando se hace doble clic.

function abrirModalEdicionProducto(idPedido) {

  if (!modalProducto) return;

 

  if (typeof buscarProductoPedido !== "function") {

    alert("No se encontró el producto que se desea modificar.");

    return;

  }

 

  const encontrado = buscarProductoPedido(idPedido);

 

  if (!encontrado) {

    alert("No se encontró el producto que se desea modificar.");

    return;

  }

 

  const productoPedido = encontrado.producto;

 

  // Los productos enviados a cocina quedan bloqueados.

  if (productoPedido.estadoCocina !== "CAPTURADO") {

    alert("Este producto ya fue enviado a cocina y no puede modificarse.");

    return;

  }

 

  const productoCatalogo = buscarProductoCatalogo(productoPedido.productoId);

 

  productoPedidoEnEdicionId = idPedido;

 

  if (textoAccionProductoModal) {

    textoAccionProductoModal.textContent = "Modificar producto";

  }

 

  if (nombreProductoModal) {

    nombreProductoModal.textContent = productoPedido.nombre;

  }

 

  if (precioProductoModal) {

    precioProductoModal.textContent = formatearPrecioMenu(

      productoPedido.precioBase,

    );

  }

 

  if (notaProductoModal) {

    notaProductoModal.value = productoPedido.observaciones || "";

  }

 

  dibujarObservacionesRapidas(

    productoCatalogo?.observacionesRapidas || [],

    productoPedido.observaciones || "",

  );

 

  dibujarExtrasProducto(

    productoCatalogo?.extras || [],

    productoPedido.extras || [],

  );

 

  modalProducto.classList.remove("oculto");

  modalProducto.setAttribute("aria-hidden", "false");

  document.body.classList.add("modalAbierto");

 

  window.setTimeout(() => {

    btnConfirmarProducto?.focus();

  }, 50);

}

 

function cerrarModalProducto() {

  if (!modalProducto) return;

 

  modalProducto.classList.add("oculto");

  modalProducto.setAttribute("aria-hidden", "true");

  document.body.classList.remove("modalAbierto");

 

  productoPedidoEnEdicionId = null;

 

  if (opcionesObservacionesProducto) {

    opcionesObservacionesProducto.innerHTML = "";

  }

 

  if (opcionesExtrasProducto) {

    opcionesExtrasProducto.innerHTML = "";

  }

 

  if (notaProductoModal) {

    notaProductoModal.value = "";

  }

}

 

function dibujarObservacionesRapidas(opciones, observacionesActuales) {

  if (!opcionesObservacionesProducto) return;

 

  opcionesObservacionesProducto.innerHTML = "";

 

  if (opciones.length === 0) {

    opcionesObservacionesProducto.innerHTML = `

      <p class="sinObservacionesRapidas">

        Este producto no tiene opciones rápidas.

      </p>

    `;

    return;

  }

 

  const observaciones = separarObservaciones(observacionesActuales);

 

  opciones.forEach((opcion, indice) => {

    const etiqueta = document.createElement("label");

    const idOpcion = `observacion-edicion-${indice}`;

    const marcada = observaciones.includes(opcion);

 

    etiqueta.className = "opcionObservacionProducto";

    etiqueta.setAttribute("for", idOpcion);

 

    etiqueta.innerHTML = `

      <input

        id="${idOpcion}"

        type="checkbox"

        value="${opcion}"

        ${marcada ? "checked" : ""}

      >

      <span>${opcion}</span>

    `;

 

    opcionesObservacionesProducto.appendChild(etiqueta);

  });

}

 

function dibujarExtrasProducto(extrasDisponibles, extrasActuales) {

  if (!seccionExtrasProducto || !opcionesExtrasProducto) return;

 

  opcionesExtrasProducto.innerHTML = "";

 

  if (!Array.isArray(extrasDisponibles) || extrasDisponibles.length === 0) {

    seccionExtrasProducto.classList.add("oculto");

    return;

  }

 

  seccionExtrasProducto.classList.remove("oculto");

 

  extrasDisponibles.forEach((extra, indice) => {

    const etiqueta = document.createElement("label");

    const idExtra = `extra-edicion-${indice}`;

    const marcado = extrasActuales.some(

      (extraActual) => extraActual.nombre === extra.nombre,

    );

 

    etiqueta.className = "opcionObservacionProducto";

    etiqueta.setAttribute("for", idExtra);

 

    etiqueta.innerHTML = `

      <input

        id="${idExtra}"

        type="checkbox"

        value="${extra.nombre}"

        data-precio="${Number(extra.precio || 0)}"

        ${marcado ? "checked" : ""}

      >

      <span>

        ${extra.nombre} +${formatearPrecioMenu(extra.precio)}

      </span>

    `;

 

    opcionesExtrasProducto.appendChild(etiqueta);

  });

}

 

function guardarCambiosProductoPedido() {

  if (!productoPedidoEnEdicionId) return;

 

  if (typeof actualizarProductoPedido !== "function") {

    alert("No se encontró la función para guardar los cambios.");

    return;

  }

 

  const observacionesRapidas = [];

 

  opcionesObservacionesProducto

    ?.querySelectorAll('input[type="checkbox"]:checked')

    .forEach((input) => {

      observacionesRapidas.push(input.value);

    });

 

  const notaLibre = notaProductoModal?.value.trim() || "";

  const observaciones = [...observacionesRapidas];

 

  if (notaLibre) {

    observaciones.push(notaLibre);

  }

 

  const extras = [];

 

  opcionesExtrasProducto

    ?.querySelectorAll('input[type="checkbox"]:checked')

    .forEach((input) => {

      extras.push({

        nombre: input.value,

        precio: Number(input.dataset.precio || 0),

      });

    });

 

  const guardado = actualizarProductoPedido(productoPedidoEnEdicionId, {

    observaciones: observaciones.join(" · "),

    extras,

  });

 

  if (!guardado) {

    alert("El producto ya no puede modificarse.");

    cerrarModalProducto();

    return;

  }

 

  cerrarModalProducto();

}

 

function eliminarProductoPedidoDesdeModal() {

  if (!productoPedidoEnEdicionId) return;

 

  if (typeof eliminarProductoPedido !== "function") {

    alert("No se encontró la función para eliminar el producto.");

    return;

  }

 

  const eliminar = window.confirm(

    "¿Deseas eliminar este producto del pedido?",

  );

 

  if (!eliminar) return;

 

  const eliminado = eliminarProductoPedido(productoPedidoEnEdicionId);

 

  if (!eliminado) {

    alert("El producto ya no puede eliminarse.");

  }

 

  cerrarModalProducto();

}

 

function buscarProductoCatalogo(productoId) {

  for (const categoria of categoriasMenu) {

    const producto = categoria.productos.find(

      (item) => item.id === productoId,

    );

 

    if (producto) return producto;

  }

 

  return null;

}

 

function separarObservaciones(texto) {

  if (!texto) return [];

 

  return texto

    .split("·")

    .map((observacion) => observacion.trim())

    .filter(Boolean);

}

 

function formatearPrecioMenu(precio) {

  return Number(precio || 0).toLocaleString("es-MX", {

    style: "currency",

    currency: "MXN",

  });

}