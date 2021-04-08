# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

---

## [Unreleased]


[0.0.4] - 2021-04-08

### Added
- Se añade la variable pagination en el form-matter de la query para decir si lleva paginación o no.
- Añadir gray-matter para añadir información a las consultas

### Changed
- Añade la variable de iteracción aunque solo tenga un valor.

[0.0.3] - 2021-03-24

### Added

- Añadir opción de plugins en fetchql.config.js
- Añadir el comando help
- Avisar cuando no exista el fichero de configuración
- Avisar cuando no exista el path de entrada
- Avisar si no existen consultas
- Valida carpeta de salida
- Crear la carpeta de salida


### Changed

- Revisión de mensajes texto del CLI
- Actualizado el archivo configuración de ejemplo

### Fix

-- Ejecutar queries sin parametros

[0.0.2] - 2021-02-22

### Changed

- Cambiar dependencia commander de desarrollo a producción
- No inyectar directamente perPage

[0.0.1] - 2021-02-22

### Added

- Primera versión del commando