# Cómo levantar la app (paso a paso)

## Qué necesitás antes de arrancar

- Docker y Docker Compose instalados (si no los tenés, bajalos de la web oficial).
- Node.js (18 o más nuevo) y npm.

## Variables de entorno

En este repositorio se deja el archivo `.env` ya configurado en la raíz del proyecto como excepción, dado que es un challenge técnico. **En proyectos reales no se recomienda versionar archivos `.env`** por contener información sensible. Aquí se incluye solo para facilitar la evaluación y el uso inmediato del proyecto.

## Levantar la base de datos con Docker

1. Parate en la carpeta raíz del proyecto y corré:

```powershell
docker-compose up -d
```

Esto te va a levantar un SQL Server en un contenedor y, apenas esté listo, le mete el esquema y la tabla de clientes usando el script que está en `sql/init-db.sql`. El puerto y la contraseña los toma de las variables de entorno que pusiste antes.

## Instalar dependencias del proyecto

2. Ahora instalá las dependencias de Node.js:

```powershell
npm install
```

## Arrancar la app

3. Una vez que tenés la base y las dependencias, podés levantar el backend en modo desarrollo con:

```powershell
npm run start:dev
```

Esto arranca el NestJS localmente y se conecta a la base que está corriendo en Docker.

## Qué corre en Docker y qué local

- **Docker**: solo la base de datos SQL Server.
- **NestJS**: lo corrés vos local, no está dockerizado.

## Librerías utilizadas

### Framework y Core

- **NestJS**: Framework web moderno para Node.js que sigue el patrón MVC y usa decoradores. Se eligió por su arquitectura modular, soporte nativo para TypeScript y porque facilita la creación de APIs robustas y escalables.
- **TypeScript**: Lenguaje que agrega tipado estático a JavaScript. Mejora la mantenibilidad del código y ayuda a detectar errores en tiempo de compilación.

### Base de datos y ORM

- **TypeORM**: ORM (Object-Relational Mapping) para TypeScript/JavaScript. Se eligió porque:
  - Tiene excelente soporte para TypeScript
  - Funciona bien con SQL Server
  - Permite mapear objetos a tablas de forma intuitiva
  - Facilita las operaciones CRUD y consultas complejas
- **mssql**: Driver nativo para SQL Server. Se usa porque es la librería oficial de Microsoft para conectarse a SQL Server desde Node.js.

### Documentación de API

- **Swagger (@nestjs/swagger)**: Genera documentación automática de la API REST. Se eligió porque:
  - Se integra perfectamente con NestJS usando decoradores
  - Crea una interfaz web interactiva para probar endpoints
  - Mantiene la documentación siempre actualizada con el código

### Herramientas de desarrollo

- **Docker**: Para contenerizar la base de datos SQL Server y evitar instalaciones locales complejas.
- **Jest**: Framework de testing para JavaScript/TypeScript.
- **ESLint + Prettier**: Para mantener un código limpio y consistente.

## Endpoints disponibles

La API tiene los siguientes endpoints:

### GET /health

**URL**: `http://localhost:3000/health`

**Descripción**: Verifica que el servicio esté funcionando correctamente.

**Respuesta exitosa (200)**:

```json
{
  "status": "ok"
}
```

**Para qué sirve**: Endpoint de health check básico, útil para monitoreo y para verificar que la aplicación esté levantada.

---

### POST /process

**URL**: `http://localhost:3000/process`

**Descripción**: Procesa un archivo de clientes con formato delimitado por pipes (|).

**Body esperado**:

```json
{
  "path": "data/CLIENTES_IN_0425_FUSIONADO_PROD_1.dat"
}
```

**IMPORTANTE: sobre el path del archivo**:

- El path debe ser **relativo a la raíz del proyecto** (donde está el `package.json`)
- También podés usar paths absolutos del sistema operativo
- Ejemplos válidos:
  - `"data/archivo.dat"` (relativo desde la raíz del proyecto)
  - `"./data/archivo.dat"` (relativo explícito)
  - `"C:\\Users\\Usuario\\Documents\\archivo.dat"` (absoluto en Windows)
  - `"/home/usuario/archivo.dat"` (absoluto en Linux/Mac)

**Formato esperado del archivo**:
Cada línea debe tener el formato: `id|firstName|lastName|email|age`

Ejemplo de contenido:

```
1|Juan|Pérez|juan.perez@email.com|25
2|María|González|maria.gonzalez@email.com|30
3|Carlos|López|carlos.lopez@email.com|28
```

**Respuesta exitosa (200)**:

```json
{
  "status": "processing completed",
  "path": "data/CLIENTES_IN_0425_FUSIONADO_PROD_1.dat"
}
```

**Respuesta de error (500)**:

```json
{
  "status": "processing failed",
  "path": "data/CLIENTES_IN_0425_FUSIONADO_PROD_1.dat",
  "error": "Error message"
}
```

**Para qué sirve**: Procesa archivos grandes de clientes línea por línea, parseando el formato `id|firstName|lastName|email|age` y guardando los datos en la base de datos en lotes para optimizar el rendimiento.

---

### GET /status

**URL**: `http://localhost:3000/status`

**Descripción**: Devuelve el estado actual del procesamiento de archivos.

**Respuesta**:

```json
{
  "isProcessing": true,
  "filePath": "data/CLIENTES_IN_0425_FUSIONADO_PROD_1.dat",
  "linesProcessed": 15000,
  "totalLines": 4000000,
  "memoryMB": 120,
  "lastLog": "Procesadas: 15000/4000000 (0.4%) | Mem: 120MB"
}
```

**Para qué sirve**: Permite monitorear el progreso del procesamiento de archivos en tiempo real, incluyendo:

- Si hay un procesamiento activo
- Cuántas líneas se procesaron del total
- Uso de memoria actual
- Último mensaje de log

---

## Documentación interactiva

Una vez que la app esté corriendo, podés acceder a la documentación interactiva de Swagger en:

```
http://localhost:3000/api
```

Ahí vas a poder probar todos los endpoints directamente desde el navegador.

## Para frenar todo

Cuando termines, podés bajar los contenedores con:

```powershell
docker-compose down
```

---
