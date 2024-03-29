#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Command } from 'commander';

import { fetchQL } from './index.js';


const program = new Command ();


program.version ('0.2.2', '-v', 'Visualiza la versión actual');

program.option ('-c, --config <FILE_CONFIG>', 'Carga el fichero de configuración indicado).');
program.option ('-q, --query <FILE.gql...>', 'Ejecuta las consultas indicadas (no es necesario incluir la extensión del archivo).');


program.command ('init')
	.description ('Crea un archivo de configuración por defecto.')
	.option ('-f, --force', 'Fuerza la creación del archivo de configuración si ya existe.')
	.action ((options: any) => crearFicheroDeConfiguracion (options.force));


program.command ('help')
	.action (() => console.info (program.helpInformation ()));


program.action (() => {

	const options  = program.opts ();
	const rootPath = process.cwd ();

	const configFile = options.config ? join (rootPath, options.config) : join (rootPath, '/fetchql.config.js');
	const query      = options.query ? options.query : undefined;

	if (options.help) return console.info (program.helpInformation ())
	fetchQL (configFile, query);
});


program.parse (process.argv);
console.info ();


function crearFicheroDeConfiguracion (sobreescribir: boolean) {

	try {
		if (! sobreescribir && existsSync (join (process.cwd (), 'fetchql.config.js')))
			return console.error ('Ya existe el archivo de configuración, use la opción --force para sobreescribirlo.');

		writeFileSync (
			join (process.cwd (), 'fetchql.config.js'),
			readFileSync (join (__dirname, '../fetchql.config.example.js'))
		);
	} catch (err) {
		console.error (err);
	}
}
