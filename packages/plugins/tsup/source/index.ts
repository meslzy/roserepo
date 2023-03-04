import { BaseExecutor, Executor } from "roserepo";
import fs from "fs";

const possibleConfigFiles = [
	"tsup.config.ts",
	"tsup.config.js",
	"tsup.config.cjs",
	"tsup.config.json",
];

interface TsupExecutorConfig {
	input: string;
	outdir?: string;
	format?: ("esm" | "cjs" | "iife")[];
	external?: string[];
	noExternal?: string[];
	dts?: boolean;
	watch?: boolean;
	sourcemap?: boolean | "inline";
	minify?: boolean;
	splitting?: boolean;
	treeshake?: boolean;
	shims: boolean;
	legacyOutput?: boolean;
	clean?: boolean;
	extraArgs?: string[];
}

class TsupExecutor extends BaseExecutor<TsupExecutorConfig> {
	getTsupArgs = () => {
		if ( (this.task.workspace.packageJson as any)?.[ "tsup" ] !== undefined ) {
			return [];
		}

		const configFile = possibleConfigFiles.find(( file ) => {
			return fs.existsSync(this.task.workspace.resolve(file));
		});

		if ( configFile ) {
			return [];
		}

		const args = this.getScriptArgs();

		const buildArgs: string[] = [];

		if ( this.config.input ) {
			buildArgs.push(this.config.input);
		}

		if ( this.config.dts ) {
			buildArgs.push("--dts");
		}

		//

		if ( this.config.outdir ) {
			buildArgs.push(`--out-dir ${this.config.outdir}`);
		}

		if ( this.config.format ) {
			buildArgs.push(`--format ${this.config.format.join(",")}`);
		}

		//

		if ( this.config.splitting ) {
			buildArgs.push("--splitting");
		}

		if ( this.config.treeshake ) {
			buildArgs.push("--treeshake");
		}

		if ( this.config.minify ) {
			buildArgs.push("--minify");
		}

		if ( this.config.shims ) {
			buildArgs.push("--shims");
		}

		if ( this.config.clean ) {
			buildArgs.push("--clean");
		}

		//

		if ( this.config.watch || args.w || args.watch ) {
			buildArgs.push("--watch");
		}

		if ( this.config.sourcemap ) {
			if ( typeof this.config.sourcemap === "string" ) {
				buildArgs.push(`--sourcemap ${this.config.sourcemap}`);
			} else {
				buildArgs.push("--sourcemap");
			}
		}

		if ( this.config.legacyOutput ) {
			buildArgs.push("--legacy-output");
		}

		//

		if ( this.config.external ) {
			buildArgs.push(`--external ${this.config.external.join(",")}`);
		}

		return [ ...buildArgs, ...this.config.extraArgs ?? [] ];
	};

	execute = () => {
		const tsupCli = require.resolve("tsup/dist/cli-default.js", {
			paths: [
				this.task.workspace.location,
				require.main?.path ?? process.cwd(),
				__dirname,
			],
		});
		const tsupArgs = this.getTsupArgs();

		const nodeExecutor = Executor.node({
			file: tsupCli,
			args: tsupArgs,
		});

		nodeExecutor.prepare(this.task);

		return nodeExecutor.execute();
	};
}

export type {
	TsupExecutorConfig,
};

export {
	TsupExecutor,
};