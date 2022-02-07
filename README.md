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
        input: "./queries",
        output: "./data"
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

En nuestros archivos de consulta podemos definir configuraciones específicas y particulares de cada consulta.

Para ello tendremos que añadir a nuestro archivo de consulta un bloque de metadatos estructurado de tipo Front Matter.

Actualmente solo se contempla la opción `json_pretty` como parámetro configurable desde el Front Matter.

Ejemplo:

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

Opciones de configuración desde el Front Matter

| Propiedad | Tipo | Default | Descripción |
| -- | -- | -- | -- |
| json_pretty | Boolean | false | Cuando está activa se formatea el archivo JSON de resultado mediante tabulaciones y saltos de línea antes de ser guardado. |


## Plugins

Mediante la configuración de plugins podemos automatizar procesos y manipular los datos resultado de nuestras consultas.

Un plugin no es más que una función JavaScript que recibe el contexto de configuración de FetchQL y opcionalmente los datos de cualquiera de las consultas realizadas.

Cuando FetchQL finaliza el proceso de lanzar las consultas y de guardado de resultados en formato JSON, procederá a ejecutar los plugins definidos en nuestro archivo de configuración en el mismo orden en que se han definido.

Existen 2 formas diferentes de declarar la función de un plugin:

### Declaración como función (Simplificada)

En la mayoría de los casos utilizamos los plugins para combinar los datos recibidos de las diferentes consultas y construir un nuevo JSON que combina la información de la forma en que nos interesa.

Para este caso de uso la forma más sencilla de crear un plugin es declarándolo como función. Esta es una manera simplificada de resolver el flujo de trabajo habitual para el procesado y la combinación los datos generados por nuestras consultas.

Para declarar nuestro plugin como función añadiremos al Array de plugins de nuestro archivo de configuración un objeto de este tipo:

```js
const myFunction = require('myfunction.js')

module.exports = {
    server: {
        host: "https://graphql.apirocket.io",
        token: "xhaTeZsdsOmI4G7jJdsd2fsZHEjHB0sdYHdrKCsjGHPvayXh_k7lvbPrPwvKUTle0oTO0tqTWM"
    },
    paths: {
        input: "./queries",
        output: "./data"
    },
    env: {
    	locale: ['ES', 'EN']
    },
    plugins: [
        {
            function: myFunction,
            data: ['books', 'authors'],
            output: 'catalog'
        }    
    ],
    queries: {}
}
```

El objeto se compone de 3 parámetros:

| Parámetro | Tipo | Descripción |
| --- | --- | --- | 
| function | Function | Referencia a la función que ejecutaremos como plugin. Esta función debe ser declarada dentro del archivo de configuración o importada desde un archivo externo. |
| data | Array | Este Array contendrá los nombres de las consultas con las que queremos trabajar en nuestro plugin. Deberán corresponderse con el nombre de algún archivo de consulta `.gql`. |
| output | String | Nombre del archivo JSON en el que se guardarán los datos devueltos por la función del plugin a FetchQL. Este archivo se guardará dentro del directorio configurado como `output` en la configuración. |

Como ejemplo, el archivo `myfunction.js` podría ser como este:

```js
module.exports = function myFunction(config, data) {
    const books = data.books
    const authors = data.authors

    let catalog = []
    
    // Aquí podemos combinar y procesar los datos
    
    return catalog
}
```
La estructura de nuestra función es muy sencilla.

Como entrada la función recibirá 2 parámetros: `config` que contiene toda la configuración de FetchQL y `data` que almacena los datos de todas las colecciones declaradas en el Array `data` de nuestro plugin.

Como respuesta nuestra función siempre devolverá un String con los datos que FetchQL guardará en formato JSON en un archivo con el nombre definido en el parámetro `output` de nuestro plugin.


## Queries

(Pendiente) Opciones de configuración y función de mapeo

