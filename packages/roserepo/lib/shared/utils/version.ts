import path from "path";

const roserepoVersion = () => {
	const packageJson = path.join(__dirname, "..", "package.json");
	return require(packageJson).version;
};

const getPackageVersion = ( packagePath: string ): string => {
	const packageJson = require.resolve(`${packagePath}/package.json`);
	return require(packageJson).version;
};

export {
	roserepoVersion,
	getPackageVersion,
};