const roseDir = ".rose";

const configFile = `${roseDir}/config.json`;
const cacheFile = `${roseDir}/cache.json`;

const packageJsonFile = "package.json";

const monorepoConfigFiles = [
	"monorepo.ts",
	"monorepo.js",
	"monorepo.mjs",
	"monorepo.cjs",
];

const workspaceConfigFiles = [
	"workspace.ts",
	"workspace.js",
	"workspace.mjs",
	"workspace.cjs",
];

const dotEnvFiles = [
	".env",
	".env.local",
];

export {
	roseDir,
	configFile,
	cacheFile,
	packageJsonFile,
	monorepoConfigFiles,
	workspaceConfigFiles,
	dotEnvFiles,
};