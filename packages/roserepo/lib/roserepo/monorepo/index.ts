import glob from "fast-glob";

import { WorkspaceFilter } from "@shared/types";

import { fileLoader } from "~shared/file";
import { locateMonorepo } from "~shared/utils/root";

import { monorepoConfigFiles } from "~shared/constants";

import Workspace, { WorkspaceConfig, PackageJson } from "~/roserepo/workspace";

import BaseRunner from "./runner/base";

import path from "node:path";
import fs from "node:fs";

interface MonorepoConfig {
	env?: {
		[ variable: string ]: string | boolean | number;
	};
	runner?: {
		[ script: string ]: BaseRunner<any>;
	};
	include?: WorkspaceFilter[];
	exclude?: WorkspaceFilter[];
}

const defaultMonorepoConfig: MonorepoConfig = {};

class Monorepo extends Workspace {
	config: MonorepoConfig;

	constructor( index: number, location: string, directory: string, packageJson: PackageJson, workspaceConfig: WorkspaceConfig, monorepoConfig: MonorepoConfig ) {
		super(index, location, directory, packageJson, workspaceConfig);
		this.config = monorepoConfig;
	}

	protected static getMonorepoConfig = async ( location: string, root: string ): Promise<MonorepoConfig> => {
		const possibleMonorepoConfigFiles = monorepoConfigFiles.map(( file ) => path.join(location, file));

		const monorepoConfigFile = possibleMonorepoConfigFiles.find(fs.existsSync);

		if ( monorepoConfigFile ) {
			return fileLoader<MonorepoConfig>(monorepoConfigFile, root);
		}

		return {};
	};

	static loadMonorepo = async () => {
		const location = locateMonorepo();

		const packageJson = await this.getPackageJson(location, location);
		const workspaceConfig = await this.getWorkspaceConfig(location, location);
		const monorepoConfig = await this.getMonorepoConfig(location, location);

		return new Monorepo(0, location, "/", packageJson, workspaceConfig, monorepoConfig);
	};

	//

	loadWorkspaces = async (): Promise<Workspace[]> => {
		const workspaces = Array.isArray(this.packageJson.workspaces) ? this.packageJson.workspaces : this.packageJson.workspaces?.packages;

		if ( ! workspaces ) {
			throw new Error("No workspaces found in monorepo package.json");
		}

		if ( ! Array.isArray(workspaces) ) {
			throw new Error("Invalid workspaces in monorepo package.json");
		}

		const workspacesLocations: string[] = [];
		const hasPackageJson = ( location: string ) => fs.existsSync(path.join(location, "package.json"));

		for ( const workspace of workspaces ) {
			if ( glob.isDynamicPattern(workspace) ) {
				const workspaceLocations = await glob(workspace, {
					cwd: this.location,
					onlyDirectories: true,
					absolute: true,
					ignore: [
						"**/node_modules/**",
					],
				});

				for ( const workspaceLocation of workspaceLocations ) {
					if ( hasPackageJson(workspaceLocation) ) {
						workspacesLocations.push(workspaceLocation);
					}
				}
			} else {
				const workspaceLocation = path.join(this.location, workspace);

				if ( hasPackageJson(workspaceLocation) ) {
					workspacesLocations.push(workspaceLocation);
				}
			}
		}

		return Promise.all(workspacesLocations.map(( workspaceLocation, index ) => {
			return Workspace.loadWorkspace(this.index + index, workspaceLocation, this.location);
		}));
	};

	//

	hasRunner = ( script: string ) => {
		return this.config.runner?.[ script ] !== undefined;
	};

	getRunner = ( script: string ) => {
		return this.config.runner?.[ script ];
	};
}

const defineMonorepo = async ( config: MonorepoConfig ) => {
	return {
		...defaultMonorepoConfig,
		...config,
	};
};

export type {
	MonorepoConfig,
};

export {
	defineMonorepo,
};

export default Monorepo;