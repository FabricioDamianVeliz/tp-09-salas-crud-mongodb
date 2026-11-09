const { conectarBD, desconectarBD } = require("../src/config/base-datos.js");
const Reserva = require("../src/modelos/reserva.js");

async function crearReserva() {
  try {
    await conectarBD();

    // Objeto ficticio fijo para la práctica
    const nuevaReserva = new Reserva({
      estudiante: "Fabricio Veliz",
      email: "fabricio@mail.com",
      sala: "Sala Multimedia",
      fecha: "2026-10-20",
      turno: "Tarde",
      personas: 2,
    });

    const resultado = await nuevaReserva.save();
    console.log("Reserva creada y guardada con éxito en la base de datos.");
    console.log(`ID asignado (_id): ${resultado._id}`);
  } catch (error) {
    console.error("Rechazo al crear la reserva:");
    console.error(`- Tipo: ${error.name}`);
    if (error.errors) {
      Object.keys(error.errors).forEach((campo) => {
        console.error(`  * Campo '${campo}': ${error.errors[campo].message}`);
      });
    } else {
      console.error(`- Mensaje: ${error.message}`);
    }
  } finally {
    await desconectarBD();
  }
}

crearReserva();
