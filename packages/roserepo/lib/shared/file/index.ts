import { register } from "esbuild-register/dist/node";

import path from "node:path";
import url from "node:url";

const useEsmLoader = <T>( filePath: string ): Promise<T> => {
	const esmRequire = new Function("filePath", "return import(filePath)");

	return esmRequire(url.pathToFileURL(filePath).href).then(( module: { default: T } ) => {
		console.log(module);

		if ( module.default ) {
			return module.default;
		}

		if ( module ) {
			return module;
		}

		throw new Error(`No default export found in ${path.basename(filePath)}, located at ${path.dirname(filePath)}`);
	});
};

const useCjsLoader = <T>( filePath: string ): T => {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const module = require(filePath);

	if ( module.default ) {
		return module.default;
	}

	if ( module ) {
		return module;
	}

	throw new Error(`No default export found in ${path.basename(filePath)}, located at ${path.dirname(filePath)}`);
};

const fileLoader = async <T>( file: string, root: string ): Promise<T> => {
	const extension = path.extname(file);

	try {
		if ( extension.endsWith("json") ) {
			return useCjsLoader(file);
		}

		if ( extension.endsWith("js") ) {
			if ( extension.endsWith("mjs") ) {
				return useEsmLoader(file);
			} else {
				return useCjsLoader(file);
			}
		}

		if ( extension.endsWith("ts") ) {
			const {unregister} = register();

			try {
				return useCjsLoader(file);
			} finally {
				unregister();
			}
		}
	} catch ( error ) {
		throw new Error(`Could not load ${path.basename(file)}, located at ${path.relative(root, file)} cause: ${error}`);
	}

	throw new Error(`Could not load ${path.basename(file)}, located at ${path.relative(root, file)}`);
};

export {
	fileLoader,
};