# Decisiones técnicas y estrategia de escalabilidad

## ¿Cómo encaré el problema?

Para procesar el archivo de clientes, usé un enfoque bien simple y robusto: leo el archivo línea por línea usando streams, así no me quedo sin memoria aunque el archivo sea grande. Cada registro lo voy validando y, si está bien, lo meto en un batch para después insertarlo en la base por paquetes de a 1000 registros. Si alguna línea viene mal, la salto y dejo un log para saber qué pasó.

## Performance y robustez

- El uso de streams y batches hace que el consumo de memoria sea bajo, ideal para correr en un entorno con pocos recursos como pide el enunciado.
- Los logs ayudan a ver el avance y a detectar si algo falla, sin frenar todo el proceso por un error aislado.
- Si la base tira un error en algún batch, lo registro y sigo con el resto, así no pierdo todo el trabajo por un problema puntual.

## Cuellos de botella y decisiones

- El principal límite está en la velocidad de lectura del disco y en la escritura a la base. Por eso, los inserts van en lote y no de a uno.
- No hago inserts en paralelo para no saturar la base, pero si hiciera falta se puede ajustar.

## ¿Cómo escalaría para archivos mucho más grandes?

- Se puede partir el archivo y procesar varias partes en paralelo (con workers o varios pods en Kubernetes).
- Otra opción es usar una cola de mensajes para repartir el trabajo entre varias instancias.
- Si el formato lo permite, se puede usar el `BULK INSERT` de SQL Server para cargar todo de una.

## Si esto fuera producción...

Mirando el código que escribí, hay varias cosas que se podrían mejorar para que sea más robusto y eficiente:

### Del lado del rendimiento

- **Transacciones en el repository**: Ahora cada batch se guarda de a uno, pero si uso transacciones explícitas podría ganar entre 40-60% de velocidad. SQL Server es mucho más rápido cuando le das todo junto.

- **Bulk insert nativo**: Para archivos realmente grandes, podría usar `INSERT ... VALUES` con múltiples filas o directamente el `BULK INSERT` de SQL Server. Esto puede ser hasta 3 veces más rápido que el método actual.

- **Procesamiento paralelo**: Si el archivo es enorme, se podría dividir en chunks y procesarlos en paralelo. Con worker threads o una cola como Redis podría distribuir la carga.

### Del lado de la robustez

- **Validaciones más especificas**: Ahora solo chequeo que estén los campos, pero podría validar el formato del email con regex, que la edad esté en un rango razonable, etc.

- **Manejo de errores más específico**: Ahora todos los errores van al mismo lugar. Sería bueno distinguir entre errores de validación, errores de base, archivos inexistentes, etc.

- **Estado inmutable**: El estado del procesamiento lo modifico directamente, lo cual puede dar problemas. Mejor sería hacerlo inmutable y más predecible.

- **ETA en tiempo real**: Ahora muestro el progreso, pero sería copado calcular cuánto tiempo falta basándome en la velocidad actual.

### Del lado de la mantenibilidad

- **Separar responsabilidades**: El service hace muchas cosas (parsea, valida, guarda, loguea). Estaría bueno separar el parser en una clase aparte, y el manejo de estado en otra.

- **DTOs más completos**: Los DTOs que uso son básicos. Podría agregarles validaciones con decorators y mejor documentación para Swagger.

- **Configuración más prolija**: Ahora leo las variables de entorno medio desprolijo. Podría hacer una config más estructurada con validaciones.

### Infraestructura

- **Logging estructurado**: Los logs van a console directamente. Con Winston o similar podría tener logs más estructurados, con levels, rotación, etc.

- **Métricas**: Con Prometheus podría exponer métricas de uso de memoria, velocidad de procesamiento, errores, etc.

- **Rate limiting**: Para proteger la aplicación de uso excesivo o abusivo de los endpoints. Especialmente importante para `/process` que consume muchos recursos, y `/status` que podría ser consultado muy frecuentemente por clientes o sistemas de monitoreo.

### Testing (que es fundamental)

- **Tests unitarios**: Para el parser, las validaciones, el repository, etc.
- **Tests de integración**: Para probar el flujo completo con una base de prueba.
- **Tests de performance**: Para saber si las mejoras realmente mejoran algo.

### CI/CD

- **Pipeline automático**: GitHub Actions o similar para que corra los tests, el linting, y haga deploy automático.
- **Docker mejorado**: Multi-stage build para que la imagen sea más chica.

El código actual cumple con los requerimientos del challenge y funciona correctamente para el procesamiento de archivos de clientes. Sin embargo, dado que esto es una prueba de concepto desarrollada en tiempo limitado, hay varias mejoras que se podrían implementar con más tiempo de desarrollo para llevarlo a un nivel productivo empresarial.

Esta lista de mejoras no refleja limitaciones del desarrollo actual, sino oportunidades de evolución que permitirían escalar la solución y hacerla más robusta para un entorno de producción real. La priorización dependería del contexto específico del negocio y los tiempos disponibles.

---
