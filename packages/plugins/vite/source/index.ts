import roserepo, { BaseExecutor } from "roserepo";

import { InlineConfig, preview, build, createServer, Plugin } from "vite";
import tsconfigPaths, { PluginOptions } from "vite-tsconfig-paths";

import createLogger from "./logger";

interface ViteExecutorConfig {
	type?: "dev" | "build" | "preview";
	config?: InlineConfig;
	pathsConfig?: PluginOptions;
	showNetworkHost?: boolean;
}

class ViteExecutor extends BaseExecutor<ViteExecutorConfig> {
	execute = () => new Promise<void>(async ( resolve, reject ) => {
		const args = this.getScriptArgs();

		const inlineConfig = this.config.config ?? {};
		const pathsConfig = this.config.pathsConfig ?? {};

		inlineConfig.root = this.task.workspace.location;
		inlineConfig.define = this.task.getEnvironmentVariables();
		inlineConfig.plugins = [
			...inlineConfig.plugins ?? [],
			tsconfigPaths(pathsConfig) as Plugin,
		];
		inlineConfig.server = {
			...inlineConfig.server,
			host: this.config.showNetworkHost,
			fs: {
				allow: [
					roserepo.monorepo.location,
				],
			},
		};
		inlineConfig.customLogger = createLogger(this.task.workspace);

		if ( args.d || args.dev || this.config.type === "dev" ) {
			return createServer(inlineConfig).then(( server ) => {
				return server.listen().then(() => {
					this.task.workspace.logger.info("Server started");

					const localUrls = server.resolvedUrls?.local ?? [];
					const networkUrls = server.resolvedUrls?.network ?? [];

					localUrls.forEach(( url ) => {
						this.task.workspace.logger.info(`Local: ${url}`);
					});

					networkUrls.forEach(( url ) => {
						this.task.workspace.logger.info(`Network: ${url}`);
					});

					server.httpServer?.on("error", ( error ) => {
						this.task.workspace.logger.error(`Server error, cause: ${error}`);
						return reject(error);
					});

					server.httpServer?.on("close", () => {
						this.task.workspace.logger.info("Server closed");
						return resolve();
					});
				});
			});
		}

		if ( args.p || args.preview || this.config.type === "preview" ) {
			return preview(inlineConfig).then(( server ) => {
				this.task.workspace.logger.info("Server started");

				const localUrls = server.resolvedUrls?.local ?? [];
				const networkUrls = server.resolvedUrls?.network ?? [];

				localUrls.forEach(( url ) => {
					this.task.workspace.logger.info(`Local: ${url}`);
				});

				networkUrls.forEach(( url ) => {
					this.task.workspace.logger.info(`Network: ${url}`);
				});

				server.httpServer?.on("error", ( error ) => {
					this.task.workspace.logger.error(`Server error, cause: ${error}`);
					return reject(error);
				});

				server.httpServer?.on("close", () => {
					this.task.workspace.logger.info("Server closed");
					return resolve();
				});
			});
		}

		return build(inlineConfig).then(() => {
			return resolve();
		});
	});
}

export type {
	ViteExecutorConfig,
};

export {
	ViteExecutor,
};