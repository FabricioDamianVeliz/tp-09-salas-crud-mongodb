const SALAS_VALIDAS = ["Sala Norte", "Sala Sur", "Sala Multimedia"];
const TURNOS_VALIDOS = ["Mañana", "Tarde", "Noche"];
const ESTADOS_VALIDOS = ["pendiente", "confirmada"]; // Requerido para TP-09

function extraerYValidarDatos(body) {
  const errores = [];

  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    Object.keys(body).length === 0
  ) {
    return {
      errores: [
        "El cuerpo de la solicitud es obligatorio y debe ser un objeto válido.",
      ],
      datosLimpios: {},
    };
  }

  const estudiante =
    typeof body.estudiante === "string" ? body.estudiante.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const sala = typeof body.sala === "string" ? body.sala.trim() : "";
  const fecha = typeof body.fecha === "string" ? body.fecha.trim() : "";
  const turno = typeof body.turno === "string" ? body.turno.trim() : "";

  const personasRaw = body.personas;
  let personas = NaN;
  if (typeof personasRaw === "number") {
    personas = personasRaw;
  } else if (typeof personasRaw === "string" && personasRaw.trim() !== "") {
    personas = Number(personasRaw.trim());
  }

  if (!estudiante) {
    errores.push("El nombre del estudiante es obligatorio.");
  }
  if (!email || !email.includes("@")) {
    errores.push('El email es obligatorio y debe contener "@".');
  }
  if (!SALAS_VALIDAS.includes(sala)) {
    errores.push("La sala seleccionada no es válida.");
  }
  if (!fecha) {
    errores.push("La fecha es obligatoria.");
  }
  if (!TURNOS_VALIDOS.includes(turno)) {
    errores.push("El turno seleccionado no es válido.");
  }
  if (!Number.isInteger(personas) || personas < 1 || personas > 6) {
    errores.push(
      "La cantidad de personas debe ser un número entero entre 1 y 6.",
    );
  }

  return {
    errores,
    datosLimpios: {
      estudiante,
      email,
      sala,
      fecha,
      turno,
      personas,
    },
  };
}

function validarReservaHTML(req, res, next) {
  const { errores, datosLimpios } = extraerYValidarDatos(req.body);

  if (errores.length > 0) {
    return res.status(400).render("reservas/nueva", {
      titulo: "Reservas de Salas",
      seccion: "Nueva reserva",
      error: errores.join(" "),
      errores,
      valores: req.body || {},
    });
  }

  req.datosReserva = datosLimpios; // Se conserva para el POST web
  next();
}

function validarReservaAPI(req, res, next) {
  const { errores, datosLimpios } = extraerYValidarDatos(req.body);

  if (errores.length > 0) {
    return res.status(400).json({
      error: "Datos de reserva inválidos",
      detalles: errores,
    });
  }

  req.datosReserva = datosLimpios; // Se conserva para el POST de la API
  next();
}

// --- NUEVOS MIDDLEWARES PARA TP-09 ---

function validarPutApi(req, res, next) {
  const body = req.body;
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    Object.keys(body).length === 0
  ) {
    return res.status(400).json({ error: "Cuerpo ausente o mal formado" });
  }

  const permitidos = [
    "estudiante",
    "email",
    "sala",
    "fecha",
    "turno",
    "personas",
    "estado",
  ];
  const claves = Object.keys(body);

  // Rechazar campos desconocidos, _id, o inyecciones como $set
  const extra = claves.filter((c) => !permitidos.includes(c));
  if (extra.length > 0) {
    return res
      .status(400)
      .json({ error: "Campos no permitidos en la solicitud PUT" });
  }

  // Reutilizamos la validación estricta original para los primeros 6 campos
  const { errores, datosLimpios } = extraerYValidarDatos(body);

  // Validamos el séptimo campo obligatorio: estado
  const estado = typeof body.estado === "string" ? body.estado.trim() : "";
  if (!ESTADOS_VALIDOS.includes(estado)) {
    errores.push(
      "El estado es obligatorio y debe ser 'pendiente' o 'confirmada'.",
    );
  }

  if (errores.length > 0) {
    return res
      .status(400)
      .json({ error: "Datos incompletos o inválidos", detalles: errores });
  }

  datosLimpios.estado = estado;
  req.datosValidados = datosLimpios;
  next();
}

function validarPatchApi(req, res, next) {
  const body = req.body;
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    Object.keys(body).length === 0
  ) {
    return res.status(400).json({ error: "Cuerpo ausente o mal formado" });
  }

  const permitidos = ["personas", "estado"];
  const claves = Object.keys(body);

  // Rechazar si mandan estudiante, email, etc.
  const extra = claves.filter((c) => !permitidos.includes(c));
  if (extra.length > 0) {
    return res
      .status(400)
      .json({ error: "PATCH solo permite modificar 'personas' y 'estado'" });
  }

  if (claves.length === 0) {
    return res
      .status(400)
      .json({ error: "Debe enviar al menos 'personas' o 'estado'" });
  }

  const errores = [];
  const datosValidados = {};

  if ("personas" in body) {
    const personasRaw = body.personas;
    let personas = NaN;
    if (typeof personasRaw === "number") {
      personas = personasRaw;
    } else if (typeof personasRaw === "string" && personasRaw.trim() !== "") {
      personas = Number(personasRaw.trim());
    }

    if (!Number.isInteger(personas) || personas < 1 || personas > 6) {
      errores.push(
        "La cantidad de personas debe ser un número entero entre 1 y 6.",
      );
    } else {
      datosValidados.personas = personas;
    }
  }

  if ("estado" in body) {
    const estado = typeof body.estado === "string" ? body.estado.trim() : "";
    if (!ESTADOS_VALIDOS.includes(estado)) {
      errores.push("El estado debe ser 'pendiente' o 'confirmada'.");
    } else {
      datosValidados.estado = estado;
    }
  }

  if (errores.length > 0) {
    return res.status(400).json({
      error: "Datos inválidos para modificación parcial",
      detalles: errores,
    });
  }

  req.datosValidados = datosValidados;
  next();
}

module.exports = {
  validarReservaHTML,
  validarReservaAPI,
  validarReserva: validarReservaHTML,
  validarPutApi,
  validarPatchApi,
};
