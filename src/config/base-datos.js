const mongoose = require("mongoose");
const dns = require("node:dns");
const { cargarConfiguracion } = require("./entorno.js");

async function conectarBD() {
  const config = cargarConfiguracion();

  if (!config.uri || !config.uri.startsWith("mongodb")) {
    throw new Error("MONGODB_URI faltante o inválida.");
  }

  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  await mongoose.connect(config.uri);
}

async function desconectarBD() {
  await mongoose.disconnect();
}

module.exports = { conectarBD, desconectarBD };
