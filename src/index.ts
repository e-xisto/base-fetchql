import { join } from 'path';
import { readFileSync, readdir, readFile, createWriteStream, existsSync, mkdirSync, writeFileSync } from 'fs';
import matter, { GrayMatterFile } from 'gray-matter';

import { post } from './request.js';


interface Query extends GrayMatterFile <string> {
	data: QueryData
}


const fetchQL = async (configFile: string, queries: Array <string> | undefined) => {

	const promises: Array <Promise <any>> = [];

	try {
		const config = await importConfig (configFile);

		try {
			const queryFiles: Array <string> = await queryList (config, queries);

			if (! queryFiles.length) return console.error ('\x1b[35mNo se han encontrado consultas\x1b[0m\n');
			validateOutputFolder (config);
			queryFiles.forEach (item => promises.push (runQuery (config, item).catch (err => console.error (err))));
			Promise.all (promises).then (
				async (_: any) => {
					if (! config.plugins) return;
					for (let plugin of config.plugins) {
						await callPlugin (config, plugin);
					}
				}
			);
		} catch (err: any) { //ErrnoException
			showErrors (err, config);
		}
	} catch (err: any) { // ErrnoException)
		if (err.message) console.error (`\x1b[35m${ err.message }\x1b[0m\n`);
		else console.error (err);
	}
}


async function callFunction (config: Config, plugin: PluginQLData) {

	const data: any = {};

	for (let item of plugin.data) {
		const json = readFileSync (join (config.rootPath, config.paths.output, `${ item }.json`)).toString ();
		data [item] = json ? JSON.parse (json) : {};
	};

	const output = await plugin.function (config, data);
	if (plugin.output && output) {
		writeFileSync (
			join (config.rootPath, config.paths.output, `${ plugin.output }.json`),
			JSON.stringify (
				output,
				null,
				plugin?.json_pretty ? 2 : 0
			)
		);
	}
	return void (0);
}


async function callPlugin (config: Config, plugin: PluginQL) {

	if (typeof plugin == 'object') return await callFunction (config, plugin);
	return await plugin (config);
}


function combinaciones (variables: Variables) {

	let result: any = [];
	for (let key in variables) {
	  const values = variables [key].values;
	  const allValues = [];
	  for (let i = 0; i < values.length; i++) {
		for (let j = 0; j < (result.length || 1); j++) {
		  const newResult: any = { ...result [j], [key]: values[i] };
		  allValues.push (newResult);
		}
	  }
	  result = allValues;
	}
	return result;
}


function getQuery (config: Config, queryFile: string): Promise <Query> {

	return new Promise ((resolve, reject) => {
		readFile (join (config.rootPath, config.paths.input, queryFile), 'utf8', (err, data) => {
			if (err) return reject (err);

			const query = <Query> matter (data);

			query.data    = { pagination: true, ...query.data }
			query.content = validateQuery (query.content, query.data);
			return resolve (query);
		});
	});
}


function importConfig (configFile: string): Promise <Config> {

	return new Promise ((resolve, reject) => {

		const rootPath = process.cwd ();

		if (! existsSync (configFile))
			throw new Error (`No existe el fichero de configuración ${ configFile }`);

		import (configFile)
		.then ((module: any) => {
			const config = <Config> {...module.config, rootPath };
			if (! config.server) throw new Error (`No existe el parámetro server en el fichero de configuración ${ join (rootPath, '/fetchql.config.js') }`);
			if (! config.server.host) throw new Error (`No existe el parámetro server.host en el fichero de configuración ${ join (rootPath, '/fetchql.config.js') }`);
			if (! config.paths) throw new Error (`No existe el parámetro paths en el fichero de configuración ${ join (rootPath, '/fetchql.config.js') }`);
			if (! config.paths.input) throw new Error (`No existe el parámetro paths.input en el fichero de configuración ${ join (rootPath, '/fetchql.config.js') }`);
			if (! config.paths.output) throw new Error (`No existe el parámetro paths.output en el fichero de configuración ${ join (rootPath, '/fetchql.config.js') }`);
			return resolve (config);
		})
		.catch ((err: any) => reject (err) );
	});
}


async function mapItemQuery (config: QueryDataConfig | undefined, item: any) {

	if (! config?.map) return item;
	return await config.map (item);
}


async function mapItemsQuery (stream: any, queryConfig: QueryDataConfig | undefined, query: Query, pars: any, body: any, iteration: number) {

	const json_pretty = query.data.json_pretty ?? queryConfig?.json_pretty ?? false;

	for (let item of body.data [Object.keys (body.data) [0]]) {
		for (let par in pars) item [par] = pars [par];
		stream.write (iteration++ ? ",\n" : '');
		stream.write (
			JSON.stringify (
				await mapItemQuery (queryConfig, item),
				null,
				json_pretty ? 2 : 0
			)
		);
	}
}


function pageQuery (
	query: Query,
	page: number = 0,
	pars: any,
	variables: Variables,
	config: Config,
	dataName: string
): {queryQL: string, page: number } {

	const { parsString, params } = queryParams (query.content);

	if (! parsString) return { queryQL: query.content, page: -1 };
	let parameters = parsString [0].trim ();

	for (let variable in variables) {
		if (variables [variable].type) {
			if (typeof pars [variable] == 'string') parameters = parameters.replace (variables [variable].pattern, '"' + pars [variable] + '"');
			else parameters = parameters.replace (variables [variable].pattern, pars [variable]);
		} else parameters = parameters.replace (variables [variable].pattern, pars [variable]);

	}

	if (params.hasOwnProperty ('page')) page = -1;
	else if (query.data.pagination) {
		const pars = [`page: ${ page }`];
		if (params.perPage === undefined) {
			if (query.data.perPage) pars.push (`perPage: ${ query.data.perPage }`);
			else if (config?.queries?.[dataName]?.perPage) pars.push (`perPage: ${ config.queries [dataName].perPage }`);
			else if (config.server?.perPage) pars.push (`perPage: ${ config.server.perPage }`);
		}
		parameters += `${ parameters ? ', ' : '' } ${ pars.join (',') }`;
	} else page = -1;

	return {
		queryQL: query.content.substr (0, parsString.index) + parameters + query.content.substring ((parsString.index ?? 0) + parsString [0].length),
		page
	}
}


function pathQuery (config: Config) {

	return join (config.rootPath, config.paths.input);
}


function queryList (config: Config, queries: Array <string> | undefined): Promise <Array <string>> {

	return new Promise ((resolve, reject) => {

		readdir (pathQuery (config), (err, files) => {
			if (err) return reject (err);

			files = files.filter (item => item.match (/\.gql$/i));

			if (queries)
				return resolve (
					queries.map (item => item.replace (/\.gql$/i, '') + '.gql')
					.filter (item => files.includes (item))
				);
			return resolve (files);
		});
	});
}


function queryParams (query: string): {parsString: RegExpMatchArray | null, params: Record <string, string>} {

	let params: any = {};

	const parsString = query.match (/(?<=\()[^\)]*(?=\))/m);
	if (parsString) {
		let pars = parsString [0].match (/([^,]*)/g);
		if (pars) {
			pars.map (item => item.trim ()).filter (item => item).forEach ((item: string) => {
				const values = item.split (':');
				if (values) params [values.shift () ?? ''] = values.join (':').trim ();
			});
		}
	}
	return { parsString, params };
}


function queryVariables (config: Config, query: string): Variables {

	const variables: Variables = {};
	const { params }           = queryParams (query);

	for (let par in params) {
		const variable = params [par] .match (/{{\s*(\w+)\s*}}/);
		if (variable) {
			variables [variable [1]] = {
				pattern: variable [0],
				values: Array.isArray (config.env [variable [1]]) ? config.env [variable [1]] : [ config.env [variable [1]]],
				type: variable [0].trim () != variable.input?.trim ()
			};
		}
	};
	return variables;
}


async function runQuery (config: Config, queryFile: string) {

	return new Promise (async (resolve, reject) => {

		const query    = await getQuery (config, queryFile);
		const dataName = queryFile.replace ('.gql', '');
		let index = 0;

		const stream = createWriteStream (join (config.rootPath, config.paths.output, dataName + '.json'));
		const log    = config.server.debug ? createWriteStream (join (config.rootPath, config.paths.output, dataName + '.log')) : undefined;
		stream.write ("[\n");

		const variables = queryVariables (config, query.content);
		const valores = combinaciones (variables);

		if (valores.length) {
			for (let pars of valores) {
				if (index++) stream.write (",\n");
				await runQueryParameters (stream, config, dataName, query, pars, variables, log);
			}
		} else await runQueryParameters (stream, config, dataName, query, {}, variables, log);

		stream.write ("\n]\n");
		stream.end (() => resolve ({}));
	});
}


async function runQueryParameters (
	stream: any,
	config: Config,
	dataName: string,
	query: Query,
	pars: any,
	variables: Variables,
	log: any
) {
	let page      = 1;
	let iteration = 0;
	const headers: any = {};

	if (config.server.token) headers ['Authorization'] = `Bearer ${ config.server.token }`;

	while (true) {
		console.info (`Importando ${ dataName }, Página ${ page }, Pars: ${ JSON.stringify (pars) }`);

		let { queryQL, page: lastPage } = pageQuery (query, page, pars, variables, config, dataName);

		if (! queryQL) break;

		if (log) log.write (queryQL + "\n\n");

		const data = await post (
			config.server.host,
			{
				data: {query: queryQL},
				headers
			}
		)

		if (data.statusCode >= 200 && data.statusCode < 300) {
			try {
				const body = JSON.parse (data.body);
				if (body.errors) {
					console.error (body.errors);
					break;
				}

				// De momento solo una consulta
				const key = Object.keys (body.data) [0];
				if (! Array.isArray (body.data [key])) body.data [key] = [ body.data [key]]
				if (body.data [key].length) {
					await mapItemsQuery (stream, config?.queries?.[dataName], query, pars, body, iteration++);
					if (lastPage == -1) break;
					page = ++lastPage;
				} else break;
			} catch (err) {
				console.error (err);
			}
		} else {
			break;
		}
	}
}


function showErrors (err: NodeJS.ErrnoException, config: Config) {

	if (err.errno == -2 && err.code == 'ENOENT' && ! existsSync (join (process.cwd (), config?.paths.input))) {
		console.error (`\x1b[1m\x1b[31m No existe el PATH de entrada: ${ config?.paths.input }\x1b[0m\n`);
	} else console.error (err);
}


function validateOutputFolder (config: Config) {

	const outputFolder = join (config.rootPath, config.paths.output);

	if (! existsSync (outputFolder)) mkdirSync (outputFolder, { recursive: true });
}


function validateQuery (content: string, data: QueryData) {

	const queries: Array <string> | null = content.match (/query[^\{]*\{\s*\w+\s*(\([^\)]*\))?\s*\{/gi);

	if (! queries) throw new Error ('Es necesario indicar alguna Query.');
	if (queries.length > 1) throw new Error ('Actualmente solo se admite una Query.');

	if (content.match (/query[^\{]*\{\s*\w+\s*\{/gi)) {
		return content.replace (queries [0], queries [0].replace (/{$/, data.pagination ? '() {' : ' {'));
	}
	return content;
}


export {
    fetchQL
}


//////////////////////////////////
//////////////////////////////////
//////////////////////////////////
//////////////////////////////////


// const dynamicImport = new Function('specifier', 'return import(specifier)');


