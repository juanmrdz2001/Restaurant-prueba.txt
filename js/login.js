const pantallaLogin = document.getElementById("pantallaLogin");

const pantallaSistema = document.getElementById("pantallaSistema");

const formLogin = document.getElementById("formLogin");

const inputUsuario = document.getElementById("usuario");

const inputPassword = document.getElementById("password");

const mensajeLogin = document.getElementById("mensajeLogin");

const btnEntrar = document.getElementById("btnEntrar");

const btnMostrarPassword = document.getElementById("btnMostrarPassword");

const btnCerrarSesion = document.getElementById("btnCerrarSesion");

const nombreUsuarioActivo = document.getElementById("nombreUsuarioActivo");

const rolUsuarioActivo = document.getElementById("rolUsuarioActivo");

const tituloBienvenida = document.getElementById("tituloBienvenida");

formLogin.addEventListener("submit", iniciarSesion);

btnMostrarPassword.addEventListener("click", alternarPassword);

btnCerrarSesion.addEventListener("click", cerrarSesion);

document.querySelectorAll(".usuarioPrueba").forEach((boton) => {
  boton.addEventListener("click", () => {
    inputUsuario.value = boton.dataset.usuario;

    inputPassword.value = "1234";

    inputPassword.focus();
  });
});

async function iniciarSesion(evento) {
  evento.preventDefault();

  const usuario = inputUsuario.value.trim();

  const password = inputPassword.value.trim();

  if (!usuario || !password) {
    mostrarMensajeLogin("Escribe el usuario y la contraseña.");

    return;
  }

  bloquearFormulario(true);

  mostrarMensajeLogin("Comprobando datos...", true);

  try {
    const respuesta = await fetch("/api/login", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        usuario,
        password,
      }),
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok || !resultado.ok) {
      throw new Error(resultado.mensaje || "No fue posible iniciar sesión.");
    }

    guardarSesion(resultado.usuario);

    mostrarSistema(resultado.usuario);
  } catch (error) {
    mostrarMensajeLogin(error.message);
  } finally {
    bloquearFormulario(false);
  }
}

function mostrarSistema(usuario) {
  pantallaLogin.classList.add("oculto");

  pantallaSistema.classList.remove("oculto");

  nombreUsuarioActivo.textContent = usuario.nombre;

  rolUsuarioActivo.textContent = usuario.rol;

  tituloBienvenida.textContent = `Bienvenido, ${usuario.nombre}`;

  const pantallaBienvenida = document.getElementById("pantallaBienvenida");

  pantallaBienvenida.classList.add("oculto");

  if (typeof ocultarPantallaMesero === "function") {
    ocultarPantallaMesero();
  }

  if (usuario.rol === "mesero" || usuario.rol === "admin") {
    if (typeof mostrarPantallaMesero === "function") {
      mostrarPantallaMesero();
    }
  } else {
    pantallaBienvenida.classList.remove("oculto");
  }
}

function guardarSesion(usuario) {
  localStorage.setItem(
    "restaurantUsuario",

    JSON.stringify(usuario),
  );
}

function recuperarSesion() {
  const sesionGuardada = localStorage.getItem("restaurantUsuario");

  if (!sesionGuardada) {
    return;
  }

  try {
    const usuario = JSON.parse(sesionGuardada);

    mostrarSistema(usuario);
  } catch {
    localStorage.removeItem("restaurantUsuario");
  }
}

function cerrarSesion() {
  localStorage.removeItem("restaurantUsuario");

  if (typeof ocultarPantallaMesero === "function") {
    ocultarPantallaMesero();
  }

  pantallaSistema.classList.add("oculto");

  pantallaLogin.classList.remove("oculto");

  formLogin.reset();

  mostrarMensajeLogin("");

  inputUsuario.focus();
}

function alternarPassword() {
  const visible = inputPassword.type === "text";

  inputPassword.type = visible ? "password" : "text";

  btnMostrarPassword.textContent = visible ? "👁️" : "🙈";
}

function bloquearFormulario(bloqueado) {
  btnEntrar.disabled = bloqueado;

  btnEntrar.textContent = bloqueado ? "Entrando..." : "Entrar";
}

function mostrarMensajeLogin(mensaje, exito = false) {
  mensajeLogin.textContent = mensaje;

  mensajeLogin.classList.toggle("exito", exito);
}

recuperarSesion();
