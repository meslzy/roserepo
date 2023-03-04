import glob from "fast-glob";

import BaseCache from "~roserepo/common/cache/base";

import Task from "~roserepo/common/task";

import path from "node:path";
import fs from "node:fs";
import roserepo from "~/roserepo";

interface FilesCacheConfig {
	pattern: (string | RegExp)[];
}

interface Disclaimer {
	regex: RegExp;
	value: string;
}

class FilesCache extends BaseCache<FilesCacheConfig> {
	private disclaimer = /{.*}/;
	private disclaimers: Disclaimer[];

	files = new Set<string>();

	hash = async () => {
		const files = Array.from(this.files).map(( file ) => {
			const buffer = fs.readFileSync(file);
			return this.createHash(buffer);
		});

		return this.createHash(files);
	};

	recursiveReaddir = ( dir: string ) => {
		const files = fs.readdirSync(dir);

		const result: string[] = [];

		for ( const file of files ) {
			const fileLocation = path.join(dir, file);
			const fileStat = fs.statSync(fileLocation);

			if ( fileStat.isDirectory() ) {
				const subFiles = this.recursiveReaddir(fileLocation);
				result.push(...subFiles);
				continue;
			}

			if ( fileStat.isFile() ) {
				result.push(fileLocation);
				continue;
			}

			console.log(fileLocation);
			console.log(fileStat);

			throw new Error("Unknown file type");
		}

		return result;
	};

	resolveFile = ( file: string ) => {
		if ( ! fs.existsSync(file) ) {
			return;
		}

		const fileStat = fs.statSync(file);

		if ( fileStat.isDirectory() ) {
			const files = this.recursiveReaddir(file);

			for ( const file of files ) {
				this.files.add(file);
			}

			return;
		}

		if ( fileStat.isFile() ) {
			this.files.add(file);
			return;
		}
	};

	geDisclaimers = () => {
		if ( this.disclaimers ) {
			return this.disclaimers;
		}

		this.disclaimers = [
			{
				regex: new RegExp(/{monorepoDir}/, "g"),
				value: roserepo.monorepo.location,
			}, {
				regex: new RegExp(/{workspaceDir}/, "g"),
				value: this.task.workspace.location,
			},
		];

		return this.disclaimers;
	};

	replaceDisclaimer = ( str: string ) => {
		if ( ! this.disclaimer.test(str) ) {
			return str;
		}

		const disclaimers = this.geDisclaimers();

		for ( const disclaimer of disclaimers ) {
			if ( disclaimer.regex.test(str) ) {
				str = str.replaceAll(disclaimer.regex, disclaimer.value);
			}
		}

		if ( this.disclaimer.test(str) ) {
			throw new Error(`Unknown disclaimer in ${str}`);
		}

		return str;
	};

	resolvePattern = ( pattern: string ) => {
		let file = this.replaceDisclaimer(pattern);

		if ( ! path.isAbsolute(file) ) {
			file = this.task.workspace.resolve(file);
		}

		const files = glob.sync(file);

		if ( files.length === 0 ) {
			this.resolveFile(file);
		} else {
			for ( const file of files ) {
				this.resolveFile(file);
			}
		}
	};

	prepare( task: Task ) {
		super.prepare(task);

		const patterns = this.config.pattern;

		for ( const pattern of patterns ) {
			if ( typeof pattern === "string" ) {
				this.resolvePattern(pattern);
				continue;
			}

			throw new Error("Unknown pattern type, expected string or RegExp");
		}
	}
}

export type {
	FilesCacheConfig,
};

export default FilesCache;