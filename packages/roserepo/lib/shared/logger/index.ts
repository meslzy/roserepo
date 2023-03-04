import chalk from "chalk";

import { symbols, colors, modifies } from "./helper";

interface Format {
	color?: chalk.Chalk;
	modify?: chalk.Chalk;
	prefix?: string;
	suffix?: string;
	trimix?: boolean;
	affixColor?: chalk.Chalk;
	affixModify?: chalk.Chalk;
}

interface LoggerOptions {
	name: string;
	color: chalk.Chalk;
	symbol: string;
}

interface LogOptions {
	lineAfter?: boolean;
	lineBefore?: boolean;
}

type InfoOptions = LogOptions

type WarnOptions = LogOptions

interface ErrorOptions extends LogOptions {
	exit?: boolean;
	exitCode?: number;
}

class Logger {
	private readonly template: string;

	constructor( options: LoggerOptions ) {
		this.template = this.format(options.name, {
			color: options.color,
			prefix: options.symbol,
			modify: modifies.bold,
		});
	}

	private format = ( text: string, options?: Format ) => {
		const color = options?.color ?? colors.default;
		const modify = options?.modify ?? modifies.default;

		let formatted = modify(color(text));

		const affixColor = options?.affixColor ?? colors.default;
		const affixModify = options?.affixModify ?? modifies.default;

		if ( options?.prefix ) {
			if ( options.trimix ) {
				formatted = `${affixModify(affixColor(options.prefix))}${formatted}`;
			} else {
				formatted = `${affixModify(affixColor(options.prefix))} ${formatted}`;
			}
		}

		if ( options?.suffix ) {
			if ( options.trimix ) {
				formatted = `${formatted}${affixModify(affixColor(options.suffix))}`;
			} else {
				formatted = `${formatted} ${affixModify(affixColor(options.suffix))}`;
			}
		}

		return formatted;
	};

	log = ( message: any, options?: LogOptions ) => {
		const template = [ this.template ];

		template.push(this.format(":", {
			color: colors.default,
		}));

		if ( options?.lineBefore ) {
			console.log();
		}

		let messages: string[] = [];

		if ( typeof message === "string" ) {
			messages = message.split("\n").filter(( message ) => message.length > 0);
		} else if ( Array.isArray(message) ) {
			messages = message;
		} else if ( typeof message === "object" ) {
			messages = [ JSON.stringify(message, null, 4) ];
		} else {
			messages = [ message ];
		}

		for ( const message of messages ) {
			console.log(...template, message);
		}

		if ( options?.lineAfter ) {
			console.log();
		}
	};

	info = ( message: any, options?: InfoOptions ) => {
		const template = [ this.template ];

		template.push(this.format("info", {
			color: colors.info,
			modify: modifies.bold,
			prefix: "[",
			suffix: "]",
			affixColor: colors.roserepo,
			trimix: true,
		}));

		template.push(this.format(":", {
			color: colors.info,
		}));

		if ( options?.lineBefore ) {
			console.log();
		}

		let messages: string[] = [];

		if ( typeof message === "string" ) {
			messages = message.split("\n").filter(( message ) => message.length > 0);
		} else if ( Array.isArray(message) ) {
			messages = message;
		} else if ( typeof message === "object" ) {
			messages = [ JSON.stringify(message, null, 4) ];
		} else {
			messages = [ message ];
		}

		for ( const message of messages ) {
			console.log(...template, message);
		}

		if ( options?.lineAfter ) {
			console.log();
		}
	};

	warn = ( warning: any, options?: WarnOptions ) => {
		const template = [ this.template ];

		template.push(this.format("warn", {
			color: colors.warn,
			modify: modifies.bold,
			prefix: "[",
			suffix: "]",
			affixColor: colors.roserepo,
			trimix: true,
		}));

		template.push(this.format(":", {
			color: colors.warn,
		}));

		if ( options?.lineBefore ) {
			console.log();
		}

		let warnings: string[] = [];

		if ( typeof warning === "string" ) {
			warnings = warning.split("\n").filter(( warning ) => warning.length > 0);
		} else if ( Array.isArray(warning) ) {
			warnings = warning;
		} else if ( typeof warning === "object" ) {
			warnings = [ JSON.stringify(warning, null, 4) ];
		} else {
			warnings = [ warning ];
		}

		for ( const warning of warnings ) {
			console.log(...template, warning);
		}

		if ( options?.lineAfter ) {
			console.log();
		}
	};

	error = ( error: unknown, options?: ErrorOptions ) => {
		const template = [ this.template ];

		template.push(this.format("error", {
			color: colors.error,
			modify: modifies.bold,
			prefix: "[",
			suffix: "]",
			affixColor: colors.roserepo,
			trimix: true,
		}));

		template.push(this.format(":", {
			color: colors.error,
		}));

		if ( options?.lineBefore ) {
			console.log();
		}

		if ( error instanceof Error ) {
			const errors = error.message.split("\n").filter(( error ) => error.length > 0);

			for ( const error of errors ) {
				console.log(...template, error);
			}
		} else if ( typeof error === "string" ) {
			const errors = error.split("\n").filter(( error ) => error.length > 0);

			for ( const error of errors ) {
				console.log(...template, error);
			}
		} else {
			console.error(...template, error);
		}

		if ( options?.lineAfter ) {
			console.log();
		}

		if ( options?.exit ) {
			process.exit(options.exitCode ?? 1);
		}
	};

	mark = ( text: string ) => {
		return chalk.bgBlackBright(chalk.whiteBright(text));
	};
}

const logger = new Logger({
	name: "Roserepo",
	color: colors.roserepo,
	symbol: symbols.roserepo,
});

export {
	logger,
	colors,
	symbols,
	modifies,
};

export default Logger;