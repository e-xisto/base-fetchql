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

Cada archivo incluira una única consulta GraphQL tipo `query`.

El nombre de cada archivo será el que reciban los datos recibidos y que finalmente serán guardados en formato JSON en el directorio `output`. Por ejemplo, si tenemos en nuestra carpeta `input` un archivo de consulta llamado `books.gql` esto nos generará en la carpeta `output` un archivo `books.json` con la respuesta en formato JSON.

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

Opcionalmente tenemos la posibilidad de definir variables que posteriormente podemos utilizar dentro de nuestros archivos de consulta.

Las variables se declaran dentro del objeto `env` en nuestro archivo de configuración `fetchql.config.js` y se definen como un Array que contendrá los diferentes valores que esta puede tomar dentro de nuestra consulta.

Para poder utilizar las variables dentro de nuestros archivos de consulta usaremos sintaxis tipo "mustache".

En el ejemplo anterior utilizamos la variable `{{ locale }}`, definida previamente en nuestro archivo de configuración, para generar la iteración de la consulta. Esto nos generará 2 consultas, una por cada valor definido dentro del Array que define a la variable. En este caso lanzará una consulta con `locale = "ES"` y posteriormente volverá a repetir la consulta con `locale = "EN"`. El resultado de ambas consultas se concatenarán dentro del mismo archivo JSON de resultado.

En el caso de utilizar diferentes variables dentro del mismo archivo de consulta, se realizará la iteración combinada de todas variables obteniendo un único archivo JSON que agrupa el resultado de todas las combinaciones posibles.

Cuando utilizamos variables de iteración en nuestras consultas, los valores de estas varaibles son añadidos al modelo de datos del resultado. De esta forma, y siguiendo con el ejemplo anterior, al realizar la iteración se añadirá el valor de `locale` a cada uno de los resultados obtenidos.

El resultado de nuestro ejemplo podría parecerse a algo como esto:


```json
[
  {"title": "The Lord of the Rings", "image": {"url": "https://www.imgix.com" }, "locale": "ES"},
  {"title": "The Name of the Rose", "image": {"url": "https://www.imgix.com" }, "locale": "ES"},
  ...
  {"title": "The Da Vinci Code", "image": {"url": "https://www.imgix.com" }, "locale": "EN"},
  {"title": "The Alchemist", "image": {"url": "https://www.imgix.com" }, "locale": "EN"},
]
```

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

