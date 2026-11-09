const mongoose = require("mongoose");
const Reserva = require("../modelos/reserva.js");

function mapearDocumento(doc) {
  return {
    id: doc._id.toString(),
    estudiante: doc.estudiante,
    email: doc.email,
    sala: doc.sala,
    fecha: doc.fecha,
    turno: doc.turno,
    personas: doc.personas,
    estado: doc.estado,
  };
}

function crearServicioReservas() {
  return {
    obtenerTodas: async (filtroSala) => {
      const criterio = {};
      if (filtroSala !== undefined) {
        criterio.sala = String(filtroSala);
      }
      const docs = await Reserva.find(criterio);
      return docs.map(mapearDocumento);
    },

    obtenerPorId: async (id) => {
      if (!mongoose.isValidObjectId(id)) {
        const error = new Error("ID de reserva mal formado");
        error.tipo = "ID_INVALIDO";
        throw error;
      }
      const doc = await Reserva.findById(id);
      if (!doc) {
        return null;
      }
      return mapearDocumento(doc);
    },

    contar: async () => {
      return await Reserva.countDocuments();
    },

    crear: async (datos) => {
      // Copiamos explícitamente solo los 6 campos admitidos (ignora estado o _id del cliente)
      const camposPermitidos = {
        estudiante: datos.estudiante,
        email: datos.email,
        sala: datos.sala,
        fecha: datos.fecha,
        turno: datos.turno,
        personas: datos.personas,
      };
      const nueva = new Reserva(camposPermitidos);
      const guardada = await nueva.save();
      return mapearDocumento(guardada);
    },
    actualizar: async (id, datosValidados) => {
      if (!mongoose.isValidObjectId(id)) {
        const error = new Error("ID de reserva mal formado");
        error.tipo = "ID_INVALIDO";
        throw error;
      }
      // Reemplazo completo (PUT). runValidators obliga a Mongoose a chequear las reglas de nuevo.
      const doc = await Reserva.findByIdAndUpdate(id, datosValidados, {
        new: true,
        runValidators: true,
        upsert: false,
      });
      return doc ? mapearDocumento(doc) : null;
    },

    modificarParcial: async (id, datosValidados) => {
      if (!mongoose.isValidObjectId(id)) {
        const error = new Error("ID de reserva mal formado");
        error.tipo = "ID_INVALIDO";
        throw error;
      }
      // Modificación parcial (PATCH) usando $set.
      const doc = await Reserva.findByIdAndUpdate(
        id,
        { $set: datosValidados },
        { new: true, runValidators: true, upsert: false },
      );
      return doc ? mapearDocumento(doc) : null;
    },

    eliminar: async (id) => {
      if (!mongoose.isValidObjectId(id)) {
        const error = new Error("ID de reserva mal formado");
        error.tipo = "ID_INVALIDO";
        throw error;
      }
      // Borrado físico (DELETE)
      const resultado = await Reserva.findByIdAndDelete(id);
      return resultado !== null; // Retorna true si encontró y borró, false si ya no existía
    },
  };
}

module.exports = { crearServicioReservas };
