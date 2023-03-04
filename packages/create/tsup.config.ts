import { defineConfig } from "tsup";

export default defineConfig(() => {
	return {
		entry: {
			"index": "bin/index.ts",
		},
		format: [
			"cjs",
		],
		clean: true,
		splitting: true,
		sourcemap: true,
		keepNames: true,
		external: [
			/^roserepo/,
		],
		noExternal: [
			/^@shared/,
		],
	};
});