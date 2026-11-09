const { cargarConfiguracion } = require("./config/entorno.js");
const { conectarBD, desconectarBD } = require("./config/base-datos.js");
const { crearServicioReservas } = require("./servicios/reservas.js");
const { crearApp } = require("./app.js");

async function iniciarServidor() {
  try {
    const config = cargarConfiguracion();

    // 1. Esperar la conexión a MongoDB Atlas antes de escuchar el puerto
    await conectarBD();
    console.log("Conectado a MongoDB Atlas correctamente.");

    // 2. Instanciar servicio persistente y aplicación Express
    const servicio = crearServicioReservas();
    const app = crearApp(servicio, config.entorno);

    // 3. Iniciar servidor HTTP
    const servidor = app.listen(config.puerto, () => {
      console.log(
        `Servidor escuchando en http://localhost:${config.puerto} (Entorno: ${config.entorno})`,
      );
    });

    // 4. Cierre ordenado ante señales SIGINT y SIGTERM
    const cerrarServidor = async (senal) => {
      console.log(
        `\nSeñal ${senal} recibida. Cerrando servidor y conexión a base de datos...`,
      );
      servidor.close(async () => {
        await desconectarBD();
        console.log("Conexión a MongoDB cerrada. Proceso finalizado.");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => cerrarServidor("SIGINT"));
    process.on("SIGTERM", () => cerrarServidor("SIGTERM"));
  } catch (error) {
    console.error(
      "Fallo crítico al arrancar el servidor:",
      error.name,
      "-",
      error.message,
    );
    process.exit(1);
  }
}

iniciarServidor();
