import { defineConfig } from "tsup";

export default defineConfig(() => {
	return {
		outDir: "dist",
		entry: [
			"source/index.ts",
		],
		dts: true,
		clean: true,
		sourcemap: true,
	};
});