const express = require("express");
const {
  validarReservaAPI,
  validarPutApi,
  validarPatchApi,
} = require("../middleware/reservas.js");

function crearRutasApiReservas(controlador) {
  const router = express.Router();

  router.get("/reservas", controlador.listarReservasAPI);
  router.get("/reservas/:id", controlador.obtenerReservaPorIdAPI);
  router.post("/reservas", validarReservaAPI, controlador.crearReservaAPI);

  // Nuevas rutas para TP-09
  router.put("/reservas/:id", validarPutApi, controlador.actualizarReservaAPI);
  router.patch(
    "/reservas/:id",
    validarPatchApi,
    controlador.modificarParcialAPI,
  );
  router.delete("/reservas/:id", controlador.eliminarReservaAPI);

  return router;
}

module.exports = { crearRutasApiReservas };
