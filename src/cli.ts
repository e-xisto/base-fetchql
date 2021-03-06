#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { Command } from 'commander';

import { fetchQL } from './index';


const program = new Command ();

program.version ('0.0.1', '-v', 'Visualiza la versión actual.');

program.option ('-q, --query <FILE.gql...>', 'Ejecuta las consultas indicadas (no es necesario incluir la extensión del archivo).');


program.command ('init')
	.description ('Crea un archivo de configuración por defecto.')
	.option ('-f, --force', 'Fuerza la creación del archivo de configuración si ya existe.')
	.action ((options) => crearFicheroDeConfiguracion (options.force));


program.action (() => {

	const options = program.opts ();

	if (options.help) console.log (program.helpInformation ())
	else if (options.query) fetchQL (options.query);
	else fetchQL ();
});


console.log ();
program.parse (process.argv);
console.log ();


function crearFicheroDeConfiguracion (sobreescribir: boolean) {

	try {
		if (! sobreescribir && existsSync (join (process.cwd (), 'fetchql.config.js')))
			return console.log ('Ya existe el archivo de configuración, use la opción --force para sobreescribirlo.');

		writeFileSync (
			join (process.cwd (), 'fetchql.config.js'),
			readFileSync (join (__dirname, '../fetchql.config.example.js'))
		);
	} catch (err) {
		console.error (err);
	}
}
