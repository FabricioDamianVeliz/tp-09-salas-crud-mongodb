# Trabajo Práctico 09 - Actualización y eliminación de reservas de salas

## 1. Origen del Proyecto y Comparación con el TP 08

- **Origen de la copia**: Este proyecto toma como punto de partida una copia funcional del Trabajo Práctico 08 (`tp-08-salas-http-mongodb`), renombrado según la convención a `tp-09-salas-crud-mongodb`.
- **Comparación con el TP 08**: En el TP 08, se implementaron la creación (POST) y la lectura (GET) con persistencia en MongoDB. En este TP 09, se completa el CRUD de la aplicación incorporando las operaciones de reemplazo total (PUT), modificación parcial (PATCH) y eliminación física (DELETE), asegurando que se respeten los contratos HTTP y manteniendo la robustez de las validaciones de Mongoose en los métodos de modificación.

## 2. Entorno y Versiones

- **Base de datos**: MongoDB Atlas (Clúster Free M0), base de datos asignada: `reservas_salas_u9`, colección: `reservas`.
- **Dependencias principales**:
  - `express` (^4.19.2)
  - `mongoose` (^8.0.0)
  - `ejs` (^3.1.10)
  - `express-ejs-layouts` (^2.5.1)
  - `morgan` (^1.10.0)

## 3. Preparación de Atlas, Entorno y DNS

1. Clonar el repositorio y ejecutar `npm install` para instalar las dependencias manteniendo el lockfile.
2. Copiar el archivo `.env.example` y renombrarlo a `.env`. Configurar las variables `PORT`, `NODE_ENV` y `MONGODB_URI` apuntando a la base de datos `reservas_salas_u9`.
3. **Configuración DNS**: Se importó `node:dns` en `src/config/base-datos.js` configurando los resolutores públicos de Google y Cloudflare (`dns.setServers(["8.8.8.8", "1.1.1.1"])`) para evitar errores de resolución `ENOTFOUND` con los registros SRV de MongoDB Atlas.

## 4. Comando de Inicio

Para iniciar el servidor web y la API en modo de desarrollo con carga automática de variables de entorno:

````bash
npm start

## 5. Guía de Postman y Endpoints

La API puede probarse utilizando la colección de Postman incluida. En las peticiones `POST`, `PUT` y `PATCH` se debe usar la pestaña Body, opción raw, formato JSON y comprobar el header `Content-Type: application/json`.

### Endpoints Disponibles

- **GET `/api/reservas`**: Listado general. Admite filtrado (ej. `?sala=Sala Norte`).
- **GET `/api/reservas/:id`**: Consulta el detalle de una reserva por ID.
- **POST `/api/reservas`**: Crea una reserva (estado por defecto: `pendiente`) y retorna el header `Location`.
- **PUT `/api/reservas/:id`**: Reemplazo completo del documento. Exige el envío de los 7 campos obligatorios (incluyendo `estado`).
- **PATCH `/api/reservas/:id`**: Modificación parcial. Sólo permite editar `personas` y/o `estado`.
- **DELETE `/api/reservas/:id`**: Eliminación física de la base de datos. Retorna estado `204 No Content` sin cuerpo.
- **GET `/estado`**: Retorna metadatos del servicio, cantidad de registros y `solicitudId`.

### Ejemplos de Payloads JSON

**Para PUT (Reemplazo total):**
```json
{
  "estudiante": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "sala": "Sala Norte",
  "fecha": "2026-11-20",
  "turno": "Mañana",
  "personas": 4,
  "estado": "confirmada"
}

**Para PATCH (Modificación parcial):**
```json
{
  "personas": 2
}

## 6. Límites de Validación y Arquitectura

- **Validación Estricta Mongoose:** El sistema utiliza la configuración `runValidators: true` en las actualizaciones para garantizar que las reglas del esquema (rangos numéricos, presencia de `@` en el email, enumeraciones permitidas) no se evadan al modificar un registro.
- **Protección contra creaciones accidentales:** Se emplea la configuración `upsert: false`. Si se envía un `PUT` o `PATCH` a un ID inexistente, el sistema responde `404` y no crea un documento fantasma.
- **Filtro de inyecciones:** El middleware de la API rechaza explícitamente peticiones con cuerpos vacíos, atributos no permitidos, o inyecciones de operadores de MongoDB (como `$set`), retornando `400 Bad Request`.
- **Diferencia conceptual:** Eliminar (`DELETE`) borra el documento físicamente (devolviendo `404` en futuras consultas), mientras que cambiar el estado a "pendiente" o "confirmada" (`PATCH`) altera su ciclo de vida lógico conservando el registro (`200`).

## 7. Matriz de Pruebas: Ensayo de Persistencia y Continuidad

Para demostrar la persistencia en MongoDB y el correcto manejo de las nuevas operaciones CRUD, se ejecutó el siguiente flujo de pruebas:

1. **Creación inicial:** Se envió un `POST /api/reservas`. La API respondió con `201 Created` y generó un nuevo recurso en estado `pendiente`. Se copió el `id`.
2. **Reemplazo total:** Se envió un `PUT /api/reservas/:id` utilizando el ID copiado, enviando los 7 campos para cambiar el estado a `confirmada`. Respondió con `200 OK` y el documento modificado. Se ensayó omitir un campo y respondió exitosamente con un `400`.
3. **Modificación parcial:** Se envió un `PATCH /api/reservas/:id` enviando únicamente `{"personas": 2}`. Respondió `200 OK`, alterando solo ese campo y conservando el estado previo. Se intentó modificar la sala en un PATCH y el sistema lo rechazó con un `400`.
4. **Reinicio del servidor:** Se detuvo el proceso de Node.js en la terminal (`Ctrl + C`) y se volvió a arrancar con `npm start`.
5. **Comprobación de persistencia:** Se ejecutó un `GET` sobre el mismo ID. El recurso respondió con estado `200`, manteniendo los cambios realizados en los pasos 2 y 3 intactos, comprobando la persistencia.
6. **Borrado definitivo:** Se envió un `DELETE /api/reservas/:id`. Respondió con `204 No Content`. Al volver a consultar el mismo ID con un `GET` (o repetir el `DELETE`), el sistema respondió con un `404 Not Found`, confirmando la eliminación física.
````
