const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

const rutaBaseDatos = path.join(__dirname, "restaurant.db");

const db = new sqlite3.Database(rutaBaseDatos, (error) => {
  if (error) {
    console.error("Error al abrir la base de datos:", error.message);
    return;
  }

  console.log("Base de datos conectada correctamente.");
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      usuario TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      rol TEXT NOT NULL,
      activo INTEGER NOT NULL DEFAULT 1,
      fecha_creacion TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS mesas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero INTEGER,
      nombre TEXT NOT NULL,
      tipo TEXT NOT NULL DEFAULT 'mesa',
      estado TEXT NOT NULL DEFAULT 'libre',
      activo INTEGER NOT NULL DEFAULT 1
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      activo INTEGER NOT NULL DEFAULT 1
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categoria_id INTEGER NOT NULL,
      nombre TEXT NOT NULL,
      precio REAL NOT NULL DEFAULT 0,
      activo INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mesa_id INTEGER NOT NULL,
      mesero_id INTEGER NOT NULL,
      estado TEXT NOT NULL DEFAULT 'abierto',
      fecha_apertura TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      fecha_cobro TEXT,
      subtotal REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      forma_pago TEXT,
      cajero_id INTEGER,
      numero_ticket TEXT,
      bloqueado INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (mesa_id) REFERENCES mesas(id),
      FOREIGN KEY (mesero_id) REFERENCES usuarios(id),
      FOREIGN KEY (cajero_id) REFERENCES usuarios(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS detalle_pedido (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id INTEGER NOT NULL,
      producto_id INTEGER NOT NULL,
      nombre_producto TEXT NOT NULL,
      cantidad INTEGER NOT NULL DEFAULT 1,
      precio_unitario REAL NOT NULL,
      importe REAL NOT NULL,
      observaciones TEXT,
      estado_cocina TEXT NOT NULL DEFAULT 'pendiente',
      FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
      FOREIGN KEY (producto_id) REFERENCES productos(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS movimientos_caja (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id INTEGER NOT NULL,
      tipo TEXT NOT NULL,
      forma_pago TEXT NOT NULL,
      importe REAL NOT NULL,
      usuario_id INTEGER NOT NULL,
      fecha TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      motivo TEXT,
      FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
  `);

  crearUsuariosIniciales();
  crearMesasIniciales();
  crearCategoriasIniciales();
});

function crearUsuariosIniciales() {
  const usuarios = [
    ["Administrador", "admin", "1234", "admin"],
    ["Cajero Principal", "cajero", "1234", "cajero"],
    ["Mesero 1", "mesero", "1234", "mesero"],
    ["Cocina", "cocina", "1234", "cocina"],
  ];

  const sql = `
    INSERT OR IGNORE INTO usuarios
    (nombre, usuario, password, rol)
    VALUES (?, ?, ?, ?)
  `;

  usuarios.forEach((usuario) => {
    db.run(sql, usuario);
  });
}

function crearMesasIniciales() {
  const sqlMesa = `
    INSERT OR IGNORE INTO mesas
    (id, numero, nombre, tipo, estado)
    VALUES (?, ?, ?, ?, ?)
  `;

  for (let numero = 1; numero <= 30; numero++) {
    db.run(sqlMesa, [numero, numero, `Mesa ${numero}`, "mesa", "libre"]);
  }

  db.run(sqlMesa, [31, null, "Moto Para Llevar", "moto", "libre"]);
}

function crearCategoriasIniciales() {
  const categorias = ["Platillos", "Bebidas", "Entradas", "Postres"];

  categorias.forEach((categoria) => {
    db.run(
      `
        INSERT OR IGNORE INTO categorias (nombre)
        VALUES (?)
      `,
      [categoria],
    );
  });
}

app.get("/api/prueba", (req, res) => {
  res.json({
    ok: true,
    mensaje: "Servidor del restaurante funcionando",
  });
});

app.get("/api/usuarios", (req, res) => {
  db.all(
    `
      SELECT id, nombre, usuario, rol, activo
      FROM usuarios
      ORDER BY id
    `,
    [],
    (error, filas) => {
      if (error) {
        return res.status(500).json({
          ok: false,
          mensaje: "No fue posible obtener los usuarios",
        });
      }

      res.json({
        ok: true,
        usuarios: filas,
      });
    },
  );
});

app.get("/api/mesas", (req, res) => {
  db.all(
    `
      SELECT id, numero, nombre, tipo, estado, activo
      FROM mesas
      WHERE activo = 1
      ORDER BY id
    `,
    [],
    (error, filas) => {
      if (error) {
        return res.status(500).json({
          ok: false,
          mensaje: "No fue posible obtener las mesas",
        });
      }

      res.json({
        ok: true,
        mesas: filas,
      });
    },
  );
});

app.post("/api/login", (req, res) => {
  const usuario = String(req.body.usuario || "").trim();
  const password = String(req.body.password || "").trim();

  if (!usuario || !password) {
    return res.status(400).json({
      ok: false,
      mensaje: "Escribe usuario y contraseña",
    });
  }

  db.get(
    `
      SELECT id, nombre, usuario, rol
      FROM usuarios
      WHERE usuario = ?
        AND password = ?
        AND activo = 1
    `,
    [usuario, password],
    (error, fila) => {
      if (error) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al iniciar sesión",
        });
      }

      if (!fila) {
        return res.status(401).json({
          ok: false,
          mensaje: "Usuario o contraseña incorrectos",
        });
      }

      res.json({
        ok: true,
        usuario: fila,
      });
    },
  );
});

app.put("/api/pedidos/:id", (req, res) => {
  const pedidoId = Number(req.params.id);

  db.get(
    `
      SELECT estado, bloqueado
      FROM pedidos
      WHERE id = ?
    `,
    [pedidoId],
    (error, pedido) => {
      if (error) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al revisar el pedido",
        });
      }

      if (!pedido) {
        return res.status(404).json({
          ok: false,
          mensaje: "Pedido no encontrado",
        });
      }

      if (pedido.estado === "cobrado" || pedido.bloqueado === 1) {
        return res.status(403).json({
          ok: false,
          mensaje: "La venta ya fue cobrada y no puede modificarse",
        });
      }

      res.json({
        ok: true,
        mensaje: "El pedido puede modificarse",
      });
    },
  );
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
