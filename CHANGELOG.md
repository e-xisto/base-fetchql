# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

[0.1.3] - 2022-03-03

### Added
- Se añade el parameto perPage en la query en el matter, en config.queries y en config server con esa prioridad.

### Fix
- Se validan el parametro server y paths de configuracion

[0.1.2] - 2022-03-02

### Added
- Documentación básica dentro de README.md

### Fix
- Error al crear el JSON cuando itera con más de dos variables
- Error que si no está definido el queries en el config


[0.1.1] - 2022-02-03

### Add

- Añadir json_pretty a la definción del plugin
    `
    plugins: [
		traducciones({}),
		cartas({}),
        {
            function: cesar,
            data: ['cartas', 'chef'],
            output: 'caracola',
            json_pretty: true
        }
	]`
- Convertir todas las llamadas al plugin asincronas.
- Añadida documentacion README.md

### Fix
- Poner mensajes de error más claros.

[0.1.0] - 2022-02-03

### Add
- Se le cambia el nombre del paquete npm de base_fetchql a fetchql
- Se añade la opción de crear un plugin como declaración de un objecto con las siguientes propiedades
    - function, nombre de la función que invocará y que debe estar definida previamente recibe como parámetro la configuración del plugin y un objecto con todos los datos que se hayan indicado
    - data: Array de datos que se quieren pasar a la funcion
    - output: Opcional si se indica escribira un JSON con ese nombre con los datos que se devuelvan en la función
    `
    plugins: [
		traducciones({}),
		cartas({}),
        {
            function: cesar,
            data: ['cartas', 'chef'],
            output: 'caracola'
        }
	]`
- Se añade una nueva propiedad queries al objecto de configuración para configurar las queries. Esta propiedad puede tener los siguientes valores:
    - json_pretty: si quiere que el JSON se imprima pretty
    - map: función que se invocará por cada dato antes de escribirse y mapeará el dato con lo que devuelva la función
- Se añade la opción json_pretty en el FromMatter de la query para indicar si que quiere el json pretty o no, esto sobreescribe lo que diga la configuración.

### Changed
- @types/node de 14.14.28 a 17.0.14
- commander de 7.1.0 a 9.0.0
- gray-matter de 4.0.2 a 4.0.3
- typescript de 4.1.5 a 4.5.5


[0.0.5] 2022-02-03

### changed

- Se cambia el nombre de la libreria por [@e-xisto/fetchql]: https://www.npmjs.com/package/@e-xisto/base-fetchql


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