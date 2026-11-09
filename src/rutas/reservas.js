const express = require("express");
const { validarReservaHTML } = require("../middleware/reservas.js");

function crearRutasReservas(controlador) {
  const router = express.Router();

  router.get("/", controlador.mostrarInicio);
  router.get("/estado", controlador.obtenerEstado);
  router.get("/reservas", controlador.listarReservasHTML);
  router.get("/reservas/nueva", controlador.mostrarFormulario);
  router.get("/reservas/:id", controlador.mostrarDetalleHTML);
  router.post("/reservas", validarReservaHTML, controlador.crearReservaHTML);

  return router;
}

module.exports = { crearRutasReservas };
