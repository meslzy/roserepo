import { deepMerge } from "@shared/utils";

import Task from "~roserepo/common/task";

import { cacheFile } from "~shared/constants";

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

type BaseCacheConfig<CacheConfig> = CacheConfig;

abstract class BaseCache<CacheConfig> {
	config: BaseCacheConfig<CacheConfig>;
	task: Task;

	constructor( config: BaseCacheConfig<CacheConfig> ) {
		this.config = config;
	}

	protected createHash( ...data: unknown[] ) {
		const hash = crypto.createHash("md5");

		hash.update(data.join(";"));

		return hash.digest("hex");
	}

	protected setHash( hash: string ) {
		const {script, workspace} = this.task;
		const workspaceCacheFile = workspace.resolve(cacheFile);

		fs.mkdirSync(path.dirname(workspaceCacheFile), {
			recursive: true,
		});

		const cache = {
			[ this.constructor.name ]: {
				[ script ]: hash,
			},
		};

		const cacheJson = fs.existsSync(workspaceCacheFile) ? JSON.parse(fs.readFileSync(workspaceCacheFile, "utf-8")) : {};

		fs.writeFileSync(workspaceCacheFile, JSON.stringify(deepMerge(cacheJson, cache), null, 2));
	}

	protected getHash() {
		const {script, workspace} = this.task;
		const workspaceCacheFile = workspace.resolve(cacheFile);

		if ( fs.existsSync(workspaceCacheFile) ) {
			const cacheJson = JSON.parse(fs.readFileSync(workspaceCacheFile, "utf-8"));

			if ( cacheJson[ this.constructor.name ] && cacheJson[ this.constructor.name ][ script ] ) {
				return cacheJson[ this.constructor.name ][ script ];
			}
		}

		return null;
	}

	//

	clone(): BaseCache<unknown> {
		return new (this.constructor as any)(this.config);
	}

	prepare( task: Task ) {
		this.task = task;
	}

	//

	compute = async () => {
		const oldHash = this.getHash();
		const newHash = await this.hash();

		if ( oldHash === newHash ) {
			return false;
		}

		return true;
	};

	save = async () => {
		const hash = await this.hash();
		return this.setHash(hash);
	};

	//

	abstract hash(): (Promise<string> | string);
}

export type {
	BaseCacheConfig,
};

export default BaseCache;