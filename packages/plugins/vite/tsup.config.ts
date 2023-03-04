import { defineConfig } from "tsup";

export default defineConfig(() => {
	return {
		entry: {
			"index": "source/index.ts",
		},
		dts: {
			entry: "source/index.ts",
			resolve: [
				/^@shared/,
			],
		},
		format: [
			"cjs",
			"esm",
		],
		clean: true,
		splitting: true,
		sourcemap: true,
		keepNames: true,
		shims: true,
		external: [
			/^roserepo/,
		],
		noExternal: [
			/^@shared/,
		],
	};
});