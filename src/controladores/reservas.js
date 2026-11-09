function crearControladorReservas(servicio) {
  return {
    // --- VISTAS HTML ---
    mostrarInicio: (req, res) => {
      res.render("inicio", {
        titulo: "Reservas de Salas",
        seccion: "Inicio",
      });
    },

    listarReservasHTML: async (req, res, next) => {
      try {
        const { sala } = req.query;
        const filtroSala =
          typeof sala === "string" && sala.trim() !== ""
            ? sala.trim()
            : undefined;
        const reservas = await servicio.obtenerTodas(filtroSala);
        res.render("reservas/lista", {
          titulo: "Reservas de Salas",
          seccion: "Listado de reservas",
          reservas,
          salaSeleccionada: filtroSala || "",
        });
      } catch (error) {
        next(error);
      }
    },

    mostrarFormulario: (req, res) => {
      res.render("reservas/nueva", {
        titulo: "Reservas de Salas",
        seccion: "Nueva reserva",
        error: null,
        errores: [],
        valores: {},
      });
    },

    mostrarDetalleHTML: async (req, res, next) => {
      try {
        const { id } = req.params;
        const reserva = await servicio.obtenerPorId(id);

        if (!reserva) {
          return res.status(404).render("no-encontrado", {
            titulo: "Reservas de Salas",
            seccion: "No encontrado",
            mensaje: "La reserva solicitada no existe.",
          });
        }

        res.render("reservas/detalle", {
          titulo: "Reservas de Salas",
          seccion: `Detalle de reserva`,
          reserva,
        });
      } catch (error) {
        if (error.tipo === "ID_INVALIDO" || error.name === "CastError") {
          return res.status(400).render("no-encontrado", {
            titulo: "Reservas de Salas",
            seccion: "ID inválido",
            mensaje:
              "El identificador de la reserva no tiene un formato válido.",
          });
        }
        next(error);
      }
    },

    crearReservaHTML: async (req, res, next) => {
      try {
        const datos = req.datosReserva || req.body;
        await servicio.crear(datos);
        res.redirect(302, "/reservas");
      } catch (error) {
        if (error.name === "ValidationError" || error.name === "CastError") {
          return res.status(400).render("reservas/nueva", {
            titulo: "Reservas de Salas",
            seccion: "Nueva reserva",
            error: "Datos inválidos rechazados por el modelo.",
            errores: ["Datos inválidos rechazados por el modelo."],
            valores: req.body || {},
          });
        }
        next(error);
      }
    },

    obtenerEstado: async (req, res, next) => {
      try {
        const cantidadRegistros = await servicio.contar();
        res.status(200).json({
          servicio: "Reservas de Salas de Estudio",
          cantidades: cantidadRegistros,
          solicitudId: res.locals.solicitudId,
        });
      } catch (error) {
        next(error);
      }
    },

    // --- ENDPOINTS API JSON ---
    listarReservasAPI: async (req, res, next) => {
      try {
        const { sala } = req.query;

        if (sala !== undefined && typeof sala !== "string") {
          return res.status(400).json({
            error: 'El parámetro de filtro "sala" debe ser un texto único.',
          });
        }

        const filtroSala = sala !== undefined ? sala.trim() : undefined;
        const reservas = await servicio.obtenerTodas(filtroSala);
        res.status(200).json(reservas);
      } catch (error) {
        next(error);
      }
    },

    obtenerReservaPorIdAPI: async (req, res, next) => {
      try {
        const { id } = req.params;
        const reserva = await servicio.obtenerPorId(id);

        if (!reserva) {
          return res.status(404).json({
            error: "Reserva no encontrada.",
          });
        }

        res.status(200).json(reserva);
      } catch (error) {
        if (error.tipo === "ID_INVALIDO" || error.name === "CastError") {
          return res.status(400).json({
            error: "El formato del ID proporcionado no es válido.",
          });
        }
        next(error);
      }
    },

    crearReservaAPI: async (req, res, next) => {
      try {
        const datos = req.datosReserva || req.body;
        const creada = await servicio.crear(datos);

        res.status(201).location(`/api/reservas/${creada.id}`).json(creada);
      } catch (error) {
        if (error.name === "ValidationError" || error.name === "CastError") {
          return res.status(400).json({
            error: "Error de validación en los datos enviados.",
          });
        }
        next(error);
      }
    },
    actualizarReservaAPI: async (req, res, next) => {
      try {
        const { id } = req.params;
        const datos = req.datosValidados; // Viene del middleware validarPutApi

        const actualizada = await servicio.actualizar(id, datos);

        if (!actualizada) {
          return res
            .status(404)
            .json({ error: "Reserva no encontrada para actualizar." });
        }

        res.status(200).json(actualizada);
      } catch (error) {
        if (error.tipo === "ID_INVALIDO" || error.name === "CastError") {
          return res
            .status(400)
            .json({ error: "El formato del ID proporcionado no es válido." });
        }
        if (error.name === "ValidationError") {
          return res.status(400).json({
            error: "Datos inválidos rechazados por el modelo.",
            detalles: error.message,
          });
        }
        next(error);
      }
    },

    modificarParcialAPI: async (req, res, next) => {
      try {
        const { id } = req.params;
        const datos = req.datosValidados; // Viene del middleware validarPatchApi

        const modificada = await servicio.modificarParcial(id, datos);

        if (!modificada) {
          return res
            .status(404)
            .json({ error: "Reserva no encontrada para modificar." });
        }

        res.status(200).json(modificada);
      } catch (error) {
        if (error.tipo === "ID_INVALIDO" || error.name === "CastError") {
          return res
            .status(400)
            .json({ error: "El formato del ID proporcionado no es válido." });
        }
        if (error.name === "ValidationError") {
          return res.status(400).json({
            error: "Datos inválidos rechazados por el modelo.",
            detalles: error.message,
          });
        }
        next(error);
      }
    },

    eliminarReservaAPI: async (req, res, next) => {
      try {
        const { id } = req.params;
        const borrado = await servicio.eliminar(id);

        if (!borrado) {
          return res
            .status(404)
            .json({ error: "Reserva no encontrada para eliminar." });
        }

        res.status(204).send(); // Estado 204 exige enviar una respuesta vacía
      } catch (error) {
        if (error.tipo === "ID_INVALIDO" || error.name === "CastError") {
          return res
            .status(400)
            .json({ error: "El formato del ID proporcionado no es válido." });
        }
        next(error);
      }
    },
  };
}

module.exports = { crearControladorReservas };
