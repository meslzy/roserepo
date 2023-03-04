import { escapePath } from "fast-glob";

import { WorkspaceFilter } from "@shared/types";
import { deepMerge } from "@shared/utils";

import Logger, { colors, symbols } from "~shared/logger";

import { fileLoader } from "~shared/file";
import { dotEnvParse } from "~shared/utils/dotenv";

import { packageJsonFile, workspaceConfigFiles, dotEnvFiles } from "~shared/constants";

import BaseExecutor from "./executor/base";

import path from "node:path";
import fs from "node:fs";

interface PackageJson {
	name: string;
	version: string;
	scripts?: {
		[ script: string ]: string;
	};
	//
	dependencies?: {
		[ dependency: string ]: string;
	};
	devDependencies?: {
		[ dependency: string ]: string;
	};
	peerDependencies?: {
		[ dependency: string ]: string;
	};
	//
	workspaces?: string[] | {
		packages?: string[];
	};
	publishConfig?: {
		access?: "public";
	};
	private?: boolean;
}

interface WorkspaceConfig {
	env?: {
		[ variable: string ]: string | boolean | number;
	};
	executor?: {
		[ script: string ]: BaseExecutor<any>;
	};
}

const defaultWorkspaceConfig: WorkspaceConfig = {};

class Workspace {
	index: number;
	location: string;
	directory: string;
	packageJson: PackageJson;
	config: WorkspaceConfig;
	logger: Logger;

	get name() {
		return this.packageJson.name;
	}

	get dependencies() {
		return [
			...Object.keys(this.packageJson.dependencies ?? {}),
			...Object.keys(this.packageJson.devDependencies ?? {}),
			...Object.keys(this.packageJson.peerDependencies ?? {}),
		];
	}

	constructor( index: number, location: string, directory: string, packageJson: PackageJson, workspaceConfig: WorkspaceConfig ) {
		this.index = index;
		this.location = escapePath(location);
		this.directory = escapePath(directory);

		this.packageJson = packageJson;
		this.config = workspaceConfig;

		this.logger = new Logger({
			name: packageJson.name,
			color: colors.workspaces[ index % colors.workspaces.length ],
			symbol: symbols.workspaces[ index % symbols.workspaces.length ],
		});
	}

	protected static getPackageJson = async ( location: string, root: string ) => {
		const packageJsonPath = path.join(location, packageJsonFile);

		const packageJson = await fileLoader<PackageJson>(packageJsonPath, root);

		if ( ! packageJson.name ) {
			throw new Error(`Package name is missing in ${packageJsonPath}`);
		}

		return packageJson;
	};

	protected static getWorkspaceConfig = async ( location: string, root: string ): Promise<WorkspaceConfig> => {
		const possibleWorkspaceConfigFiles = workspaceConfigFiles.map(( file ) => path.join(location, file));

		const workspaceConfigFile = possibleWorkspaceConfigFiles.find(fs.existsSync);

		if ( workspaceConfigFile ) {
			return fileLoader<WorkspaceConfig>(workspaceConfigFile, root);
		}

		return {};
	};

	static loadWorkspace = async ( index: number, location: string, root?: string, directory?: string ) => {
		root = root ?? location;
		directory = directory ?? path.resolve(root, location);

		const packageJson = await this.getPackageJson(location, root);
		const workspaceConfig = await this.getWorkspaceConfig(location, root);

		return new Workspace(index, location, directory, packageJson, workspaceConfig);
	};

	resolve = ( file: string ) => {
		return path.join(this.location, file);
	};

	relative = ( location: string ) => {
		return path.relative(this.location, location);
	};

	//

	hasScript = ( script: string ) => {
		return this.packageJson.scripts?.[ script ] !== undefined;
	};

	hasExecutor = ( script: string ) => {
		return this.config.executor?.[ script ] !== undefined;
	};

	hasScriptOrExecutor = ( script: string ) => {
		return this.hasScript(script) || this.hasExecutor(script);
	};

	getScript = ( script: string ) => {
		return this.packageJson.scripts?.[ script ] ?? "";
	};

	getExecutor = ( script: string ) => {
		return this.config.executor?.[ script ];
	};

	getScriptOrExecutor = ( script: string ) => {
		return this.getScript(script) || this.getExecutor(script);
	};

	//

	nameMatches = ( pattern: (string | RegExp) | (string | RegExp)[] ) => {
		if ( Array.isArray(pattern) ) {
			return pattern.some(this.nameMatches);
		}

		if ( typeof pattern === "string" ) {
			return this.name.match(pattern) !== null;
		}

		return pattern.test(this.name);
	};

	directoryMatches = ( pattern: (string | RegExp) | (string | RegExp)[] ) => {
		if ( Array.isArray(pattern) ) {
			return pattern.some(this.nameMatches);
		}

		if ( typeof pattern === "string" ) {
			return this.directory.match(pattern) !== null;
		}

		return pattern.test(this.directory);
	};

	matchesFilter = ( filter: WorkspaceFilter ) => {
		if ( filter.by !== "directory" ) {
			return this.nameMatches(filter.pattern);
		}

		return this.directoryMatches(filter.pattern);
	};

	//

	getDotEnv = ( script?: string ) => {
		let env: Record<string, string> = {};

		const possibleDotEnvFiles = dotEnvFiles.map(( file ) => {
			return path.join(this.location, file);
		}).filter(fs.existsSync);

		for ( const dotEnvFile of possibleDotEnvFiles ) {
			const parsed = dotEnvParse(dotEnvFile);
			env = deepMerge(env, parsed);
		}

		if ( script ) {
			const possibleScriptDotEnvFiles = dotEnvFiles.map(( file ) => {
				return path.join(this.location, `${file}.${script}`);
			}).filter(fs.existsSync);

			for ( const dotEnvFile of possibleScriptDotEnvFiles ) {
				const parsed = dotEnvParse(dotEnvFile);
				env = deepMerge(env, parsed);
			}
		}

		return env;
	};
}

const defineWorkspace = ( config: WorkspaceConfig ) => {
	return {
		...defaultWorkspaceConfig,
		...config,
	};
};

export type {
	PackageJson,
	WorkspaceConfig,
};

export {
	defineWorkspace,
};

export default Workspace;