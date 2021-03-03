import { join } from 'path';
import { readdir, readFile, createWriteStream } from 'fs';

interface Config {
	paths: {
		input: string;
		output: string;
	}
	rootPath: string;
	server: {
		host: string;
		token: string;
	};
	env: any;
}

import { post } from './request';

interface Variable {
	pattern: string;
	values: Array <string | number >;
	type: boolean;
}
type Variables = Record <string, Variable>;


const fetchQL = async (queries: Array <string> | null = null) => {

    try {
		const config = await importConfig ();
		const queryFiles: Array <string> = await queryList (config, queries);

		queryFiles.forEach (item => runQuery (config, item).catch (err => console.error (err)));
	} catch (err) {
		console.error (err);
	}
}


function combinaciones (variables: Variables) {

	let result: any = [];
	for (let key in variables) {
	  const values = variables [key].values;
	  const all = [];
	  for (let i = 0; i < values.length; i++) {
		for (let j = 0; j < (result.length || 1); j++) {
		  const newResult: any = { ...result [j], [key]: values[i] };
		  all.push (newResult);
		}
	  }
	  result = all;
	}
	return result;
}


function getQuery (config: Config, queryFile: string): Promise <string> {

	return new Promise ((resolve, reject) => {
		readFile (join (config.rootPath, config.paths.input, queryFile), 'utf8', (err, data) => {
			if (err) return reject (err);
			return resolve (data);
		});
	});
}


function importConfig (): Promise <Config> {

	return new Promise ((resolve, reject) => {

		const rootPath = process.cwd ();

		import (join (rootPath, '/fetchql.config.js'))
		.then ((config: any) => {
			config.rootPath = rootPath;
			return resolve (config);
		})
		.catch ((err: any) => reject (err));
	});
}


function pageQuery (query: string, page: number = 0, pars: any, variables: Variables): {query: string, page: number } {

	const { parsString, params } = queryParams (query);
	if (! parsString) return { query: '', page: 0 };
	let parameters = parsString [0].trim ();

	for (let variable in variables) {
		if (variables [variable].type) {
			if (typeof pars [variable] == 'string') parameters = parameters.replace (variables [variable].pattern, '"' + pars [variable] + '"');
			else parameters = parameters.replace (variables [variable].pattern, pars [variable]);
		} else parameters = parameters.replace (variables [variable].pattern, pars [variable]);

	}

	if (params.hasOwnProperty ('page')) page = -1;
	else parameters += `${ parameters ? ', ' : '' }page: ${ page }`;

	parameters += `${ parameters ? ', ' : '' }perPage: ${ params.perPage ?? 100 }`;

	return {
		query: query.substr (0, parsString.index) + parameters + query.substring ((parsString.index ?? 0) + parsString [0].length),
		page
	}
}


function pathQuery (config: Config) {

	return join (config.rootPath, config.paths.input);
}


function queryList (config: Config, queries: Array <string> | null): Promise <Array <string>> {

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

	const queryString: string = await getQuery (config, queryFile);
	const dataName = queryFile.replace ('.gql', '');
	let index = 0;

	validateQuery (queryString);
	const stream = createWriteStream (join (config.rootPath, config.paths.output, dataName + '.json'));
	stream.write ("[\n");

	const variables = queryVariables (config, queryString);
	const valores = combinaciones (variables);

	if (valores.length) {
		for (let pars of valores) {
			if (index++) stream.write (",\n");
			await runQueryParameters (stream, config, dataName, queryString, pars, variables);
		}
	} else await runQueryParameters (stream, config, dataName, queryString, {}, variables);

	stream.write ("\n]\n");
	stream.end ();
}


async function runQueryParameters (stream: any, config: Config, dataName: string, queryString: string, pars: any, variables: Variables) {

	let index = 0;
	let page  = 1;

	while (true) {
		console.log (`Importando ${ dataName }, Página ${ page }, Pars: ${ JSON.stringify (pars) }`);

		let { query, page: lastPage } = pageQuery (queryString, page, pars, variables);
		if (! query) break;

		const data = await post (
			config.server.host,
			{
				data: {query: query},
				headers: {
					'Authorization': `Bearer ${ config.server.token }`
				}
			}
		)

		if (data.statusCode >= 200 && data.statusCode < 300) {
			const body = JSON.parse (data.body);

			if (body.errors) {
				console.error (body.errors);
				break;
			}

			if (body.data [Object.keys (body.data) [0]].length) {
				body.data [Object.keys (body.data) [0]].forEach ((item: any) => {
					for (let par in pars) {
						if (variables [par].values.length > 1) item [par] = pars [par];
					}
					stream.write ((index++ ? ",\n" : '') + JSON.stringify (item));
				});
				if (lastPage == -1) break;
				page = ++lastPage;
			} else break;
		} else {
			break;
		}
	}
}


function validateQuery (query: string) {

	const queries: Array <string> | null = query.match (/\w+\s*\([^\)]*\)/g)

	if (! queries) throw new Error ('Es necesario indicar alguna Query.');
	if (queries.length > 1) throw new Error ('Actualmente solo se admite una Query.');
}


export {
    fetchQL
}


//////////////////////////////////
//////////////////////////////////
//////////////////////////////////
//////////////////////////////////

