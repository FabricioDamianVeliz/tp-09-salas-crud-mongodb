const { conectarBD, desconectarBD } = require("../src/config/base-datos.js");

async function probarConexion() {
  try {
    await conectarBD();
    console.log("Conexión a MongoDB Atlas establecida con éxito.");
  } catch (error) {
    console.error("Error al conectar a la base de datos:");
    console.error(`- Nombre: ${error.name}`);
    console.error(`- Mensaje: ${error.message}`);
    if (error.code) {
      console.error(
        `- Código/Operación: ${error.code} / ${error.syscall || "N/A"}`,
      );
    }
    process.exitCode = 1; // Retorna un código distinto de cero si falla
  } finally {
    await desconectarBD();
    console.log("Recursos de conexión cerrados.");
  }
}

probarConexion();
