function cargarConfiguracion() {
  const puertoStr = process.env.PORT || "3000";
  const puerto = Number(puertoStr);

  if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
    throw new Error("Puerto inválido.");
  }

  return {
    puerto,
    entorno: process.env.NODE_ENV || "development",
    uri: process.env.MONGODB_URI,
  };
}
module.exports = { cargarConfiguracion };
