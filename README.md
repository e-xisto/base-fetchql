# FetchQL

Esta librería permite automatizar la generación de archivos de datos en formato JSON a partir de consultas GraphQL.


## Instalación

```bash
npm install @e-xisto/fetchql
```


## Configuración

Para la configuración de la librería es necesario generar un archivo `fetchql.config.js` en el raiz del proyecto, justo donde se encuentra nuestro archivo `package.json`.

A continuación mostramos un ejemplo de archivo de configuración:

```js
module.exports = {
    server: {
        host: "https://graphql.apirocket.io",
        token: "xhaTeZsdsOmI4G7jJdsd2fsZHEjHB0sdYHdrKCsjGHPvayXh_k7lvbPrPwvKUTle0oTO0tqTWM"
    },
    paths: {
        input: "./api/queries",
        output: "./src/_data/api"
    },
  	env: {
		  locale: ['ES', 'EN']
    },
    plugins: [],
    queries: {}
}
```

Las opciones de configuración son las siguientes:

| Propiedad | Tipo | Descripción |
| -- | -- | -- |
| server.host | String | URL del servidor GraphQL al que se lanzarán las queries. |
| server.token | String | Token de autenticación tipo Bearer a incluir en la cabecera de cada petición. |
| paths.input | String | Ruta donde almacenamos los archivos de consulta GraphQL con extensión `.gql`. |
| paths.output | String | Ruta donde se guardarán los archivos tipo JSON generados por las consultas. |
| env | Object | Definición de las diferentes variables sobre las que iterar las consultas. Cada una de estas variables contendrá un Array con sus diferentes valores. |
| plugins | Array | Los plugins son funciones que se ejecutan una vez finalizadas todas las consultas. Esto permite realizar tareas y procesos una vez dispongamos de los datos recibidos. |
| queries | Object | Opcionalmente podemos definir configuraciones específicas para cada query declarándolas en este objeto. |


## Archivos de consulta GraphQL

Cuando ejecutamos FetchQL su primera tarea será buscar en el directorio `input` los diferentes archivos con las consultas a realizar.

Estos archivos de consulta tendrán extensión `gql` y tendrán formato texto.

Cada archivo incluira una única consulta GraphQL tipo `query`. El nombre de cada archivo será el que reciban los datos recibidos y que finalmente serán guardados en formato JSON en el directorio `output`.

Ejemplo de archivo de consulta:

```graphql
query {
  AllBooks(locale: {{ locale }}, orderBy: CREATEDAT_DESC) {
    title
    image {
      url
    }
  }
}
```

### Variables de iteración


### Configuración mediante Front Matter

```graphql
---
json_pretty: true
---
query {
  AllBooks(locale: {{ locale }}, orderBy: CREATEDAT_DESC) {
    title
    image {
      url
    }
  }
}
```

## Plugins

(Pendiente) Definición de plugin y ejemplo 2 tipos de plugin

## Queries

(Pendiente) Opciones de configuración y función de mapeo

