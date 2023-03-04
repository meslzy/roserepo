import { Workspace } from "roserepo";

import { Logger } from "vite";

const createLogger = ( workspace: Workspace ): Logger => {
	return {
		hasWarned: false,
		info( msg: string ) {
			return workspace.logger.info(msg);
		},
		warn( msg: string ): void {
			return workspace.logger.warn(msg);
		},
		error( msg: string ): void {
			return workspace.logger.error(msg);
		},
		warnOnce( msg: string ): void {
			return workspace.logger.warn(msg);
		},
		clearScreen() {
			return;
		},
		hasErrorLogged(): boolean {
			return false;
		},
	};
};

export default createLogger;