// reference: https://github.com/motdotla/dotenv

import fs from "node:fs";

const line = /^\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?$/mg;

const dotEnvParse = ( dotEnvFile: string ) => {
	const env: Record<string, string> = {};

	const content = fs.readFileSync(dotEnvFile, "utf-8");

	let lines = content.toString();

	lines = lines.replace(/\r\n?/mg, "\n");

	let match: RegExpExecArray | null;

	while ( (match = line.exec(lines)) !== null ) {
		const key = match[ 1 ];

		let value = (match[ 2 ] || "");

		value = value.trim();

		const maybeQuote = value[ 0 ];

		value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");

		if ( maybeQuote === "\"" ) {
			value = value.replace(/\\n/g, "\n");
			value = value.replace(/\\r/g, "\r");
		}

		env[ key ] = value;
	}

	return env;
};

export {
	dotEnvParse,
};