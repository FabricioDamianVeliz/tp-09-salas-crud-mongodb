const { conectarBD, desconectarBD } = require("../src/config/base-datos.js");
const Reserva = require("../src/modelos/reserva.js");

async function listarReservas() {
  try {
    await conectarBD();
    const reservas = await Reserva.find({});

    console.log(
      `\n--- Listado de Reservas (Total recuperado: ${reservas.length}) ---`,
    );

    if (reservas.length === 0) {
      console.log("La colección está vacía. Cantidad: 0.");
    } else {
      reservas.forEach((res, index) => {
        console.log(
          `${index + 1}. ID: ${res._id} | Estudiante: ${res.estudiante} | Sala: ${res.sala} | Turno: ${res.turno} | Estado: ${res.estado}`,
        );
      });
    }
    console.log("----------------------------------------------------------\n");
  } catch (error) {
    console.error("Error al consultar las reservas:", error.message);
    process.exitCode = 1;
  } finally {
    await desconectarBD();
  }
}

listarReservas();
