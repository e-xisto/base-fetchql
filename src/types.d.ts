
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
	env: any,
	plugins: Array <any> | undefined,
    queries: {
        [index: string]: QueryDataConfig
    }
}


interface Plugin {
	function: Function;
	data: Array <string>;
	output?: string;
}


interface QueryData {
	json_pretty?: boolean;
	pagination?: boolean;
}


interface QueryDataConfig extends QueryData {
    map: Function
}


interface Variable {
	pattern: string;
	values: Array <string | number >;
	type: boolean;
}


type Variables = Record <string, Variable>;
