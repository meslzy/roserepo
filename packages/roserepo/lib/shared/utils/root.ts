import path from "node:path";
import fs from "node:fs";

const roserepoPath = ( dir: string ) => {
	return path.join(dir, "node_modules", "roserepo", "package.json");
};

const locateMonorepo = ( cwd = process.cwd() ): string => {
	const packageJson = path.join(cwd, "package.json");

	const roserepo = roserepoPath(cwd);

	if ( fs.existsSync(roserepo) ) {
		return cwd;
	}

	const parent = path.dirname(cwd);

	if ( parent === cwd ) {
		throw new Error("Unable to locate monorepo root");
	}

	return locateMonorepo(parent);
};

export {
	locateMonorepo,
};