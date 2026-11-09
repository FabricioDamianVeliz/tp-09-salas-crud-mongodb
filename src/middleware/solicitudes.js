let contadorSolicitudes = 1;

function identificarSolicitud(req, res, next) {
  const numeroFormateado = String(contadorSolicitudes).padStart(4, "0");
  res.locals.solicitudId = `BIB-${numeroFormateado}`;
  contadorSolicitudes++;
  next();
}

function medirDuracion(req, res, next) {
  const inicio = Date.now();
  res.on("finish", () => {
    const duracion = Date.now() - inicio;
    console.log(
      `[Medición] ID: ${res.locals.solicitudId} | Método: ${req.method} | URL: ${req.originalUrl} | Estado: ${res.statusCode} | Duración: ${duracion}ms`,
    );
  });
  next();
}

module.exports = { identificarSolicitud, medirDuracion };
