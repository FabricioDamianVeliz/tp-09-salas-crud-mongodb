const mongoose = require("mongoose");

const reservaSchema = new mongoose.Schema({
  estudiante: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, match: /@/ },
  sala: {
    type: String,
    required: true,
    enum: ["Sala Norte", "Sala Sur", "Sala Multimedia"],
  },
  fecha: {
    type: String,
    required: true,
    trim: true,
    validate: (v) => v.trim().length > 0,
  },
  turno: {
    type: String,
    required: true,
    enum: ["Mañana", "Tarde", "Noche"],
  },
  personas: {
    type: Number,
    required: true,
    min: 1,
    max: 6,
    validate: {
      validator: Number.isInteger,
      message: "Debe ser un número entero",
    },
  },
  estado: {
    type: String,
    default: "pendiente",
    enum: ["pendiente", "confirmada"],
  },
});

const Reserva = mongoose.model("Reserva", reservaSchema, "reservas");

module.exports = Reserva;
