const path = require("node:path");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const morgan = require("morgan");

const {
  identificarSolicitud,
  medirDuracion,
} = require("./middleware/solicitudes.js");
const { crearControladorReservas } = require("./controladores/reservas.js");
const { crearRutasReservas } = require("./rutas/reservas.js");
const { crearRutasApiReservas } = require("./rutas/api-reservas.js");

function crearApp(servicio, entorno = "development") {
  const app = express();

  // Configuración de vistas EJS y layout principal
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "..", "views"));
  app.use(expressLayouts);
  app.set("layout", "layouts/main");

  // Middlewares globales y de trazabilidad (define res.locals.solicitudId)
  app.use(identificarSolicitud);
  app.use(medirDuracion);

  if (entorno !== "test") {
    app.use(morgan("dev"));
  }
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "..", "public")));

  // Instanciar controlador único compartido por HTML y API
  const controlador = crearControladorReservas(servicio);

  // Montar rutas API y HTML
  app.use("/api", crearRutasApiReservas(controlador));
  app.use("/", crearRutasReservas(controlador));

  // 404 para rutas no encontradas (JSON para /api, HTML para el resto)
  app.use((req, res) => {
    if (req.originalUrl.startsWith("/api")) {
      return res.status(404).json({ error: "Endpoint de API no encontrado." });
    }
    res.status(404).render("no-encontrado", {
      titulo: "Página no encontrada",
      seccion: "No encontrado",
      mensaje: "La ruta solicitada no existe en el sistema.",
    });
  });

  // Middleware de manejo de errores (4 parámetros)
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      return res
        .status(400)
        .json({ error: "JSON mal formado en el cuerpo de la solicitud." });
    }

    console.error("Error interno:", err.name, err.message);

    if (req.originalUrl.startsWith("/api")) {
      return res.status(500).json({ error: "Error interno del servidor." });
    }

    res.status(500).render("no-encontrado", {
      titulo: "Error interno del servidor",
      seccion: "Error 500",
      mensaje: "Ocurrió un fallo inesperado al procesar la solicitud.",
    });
  });

  return app;
}

module.exports = { crearApp };
