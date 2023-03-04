import { defineConfig } from "tsup";

export default defineConfig(() => {
	return [
		{
			entry: {
				"roserepo": "lib/roserepo/index.ts",
				"bin": "lib/bin/index.ts",
			},
			dts: {
				entry: "lib/roserepo/index.ts",
				resolve: [
					/^@shared/,
				],
			},
			format: [
				"cjs",
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
		},
	];
});