
interface Config {
	paths: {
		input: string;
		output: string;
	}
	rootPath: string;
	server: {
		host: string;
		token?: string;
		perPage?: number;
	};
	env?: any,
	plugins?: Array <any> | undefined,
    queries?: {
        [index: string]: QueryDataConfig
    }
}


type PluginQL = (config: Config) => void | PluginQLData;


type PluginQLData = {
	function: Function;
	data: Array <string>;
	output?: string;
	json_pretty?: boolean;
}


interface QueryData {
	json_pretty?: boolean;
	pagination?: boolean;
	perPage?: number;
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
