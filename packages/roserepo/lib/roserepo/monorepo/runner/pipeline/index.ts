import { WorkspaceFilter } from "@shared/types";

import { logger } from "~shared/logger";

import Graph from "~shared/utils/graph";

import roserepo from "~/roserepo";
import Workspace from "~roserepo/workspace";

import BaseRunner from "~roserepo/monorepo/runner/base";

import path from "node:path";

interface WorkspaceFilterScript extends WorkspaceFilter {
	script: string;
}

interface ScriptPipeline {
	script: string;
	selfScripts: string[];
	dependencyScripts: string[];
	workspaceScripts: WorkspaceFilterScript[];
	runner: BaseRunner<any>;
}

interface WorkspacePipeline {
	id: string;
	workspace: Workspace;
	scriptPipeline: ScriptPipeline;
	dependsOn: string[];
}

interface PipelineRunnerConfig {
	selfScripts?: string[];
	dependencyScripts?: string[];
	workspaceScripts?: WorkspaceFilterScript[] | WorkspaceFilter[];
}

class PipelineRunner extends BaseRunner<PipelineRunnerConfig> {
	getScriptPipelines = () => {
		const scriptPipelines: ScriptPipeline[] = [];

		const visited = new Set<string>();

		const getScriptPipeline = ( script: string ) => {
			if ( visited.has(script) ) {
				return;
			}

			visited.add(script);

			let runner: BaseRunner<PipelineRunnerConfig> = this;

			if ( script !== this.script ) {
				const monorepoRunner = roserepo.monorepo.getRunner(script);

				if ( monorepoRunner ) {
					runner = monorepoRunner;
				}
			}

			const selfScripts: string[] = (runner.config?.selfScripts || []);
			const dependencyScripts: string[] = (runner.config?.dependencyScripts || []);
			const workspaceScripts: WorkspaceFilterScript[] = (runner.config?.workspaceScripts || []).map(( workspaceScript: any ) => {
				return {
					...workspaceScript,
					script: workspaceScript.script ?? script,
				};
			});

			const scripts = [
				...selfScripts,
				...dependencyScripts,
				...workspaceScripts.map(( workspaceScript ) => workspaceScript.script),
			];

			scripts.forEach(( script ) => {
				getScriptPipeline(script);
			});

			return scriptPipelines.push({
				script,
				selfScripts,
				dependencyScripts,
				workspaceScripts,
				runner,
			});
		};

		getScriptPipeline(this.script);

		return scriptPipelines;
	};

	getWorkspacePipelines = ( scriptPipelines: ScriptPipeline[] ) => {
		const filterWorkspaces = this.getFilteredWorkspaces({
			byScriptOrExecutor: true,
		});

		const workspacePipelines: WorkspacePipeline[] = [];

		const visited = new Set<string>();

		const getWorkspacePipeline = ( workspace: Workspace, script: string ) => {
			const id = `${workspace.name}:${script}`;

			if ( visited.has(id) ) {
				return;
			}

			visited.add(id);

			const scriptPipeline = scriptPipelines.find(( scriptPipeline ) => scriptPipeline.script === script);

			if ( ! scriptPipeline ) {
				return;
			}

			const dependsOn: string[] = [];

			scriptPipeline.selfScripts.forEach(( script ) => {
				dependsOn.push(`${workspace.name}:${script}`);
				return getWorkspacePipeline(workspace, script);
			});

			scriptPipeline.dependencyScripts.forEach(( script ) => {
				const workspaces = workspace.dependencies.reduce<Workspace[]>(( workspaces, dependency ) => {
					const workspace = roserepo.workspaces.find(( workspace ) => {
						return workspace.name === dependency;
					});

					if ( workspace ) {
						workspaces.push(workspace);
					}

					return workspaces;
				}, []);

				return workspaces.forEach(( workspace ) => {
					if ( ! workspace ) {
						return;
					}

					dependsOn.push(`${workspace.name}:${script}`);
					return getWorkspacePipeline(workspace, script);
				});
			});

			scriptPipeline.workspaceScripts.forEach(( workspaceScript ) => {
				const possibleWorkspaces = roserepo.workspaces.filter(( possibleWorkspace ) => {
					if ( workspaceScript.by !== "directory" ) {
						if ( possibleWorkspace.nameMatches(workspaceScript.pattern) ) {
							if ( possibleWorkspace.location === workspace.location ) {
								return workspaceScript.script !== script;
							}

							return true;
						}
					} else {
						return false;
					}

					if ( workspaceScript.by !== "name" ) {
						if ( possibleWorkspace.directoryMatches(workspaceScript.pattern) ) {
							if ( possibleWorkspace.name === workspace.name ) {
								return workspaceScript.script !== script;
							}

							if ( path.dirname(possibleWorkspace.directory) === path.dirname(workspace.directory) ) {
								return workspaceScript.script !== script;
							}

							if ( path.dirname(possibleWorkspace.directory).startsWith(path.dirname(workspace.directory)) ) {
								const possibleWorkspaceDepth = possibleWorkspace.directory.split(path.sep).length;
								const workspaceDepth = workspace.directory.split(path.sep).length;

								if ( possibleWorkspaceDepth > workspaceDepth ) {
									return true;
								}

								return false;
							}

							return true;
						}
					} else {
						return false;
					}

					return false;
				});

				possibleWorkspaces.forEach(( possibleWorkspace ) => {
					dependsOn.push(`${possibleWorkspace.name}:${workspaceScript.script}`);
					getWorkspacePipeline(possibleWorkspace, workspaceScript.script);
				});
			});

			return workspacePipelines.push({
				id,
				workspace,
				scriptPipeline,
				dependsOn,
			});
		};

		filterWorkspaces.forEach(( workspace ) => {
			getWorkspacePipeline(workspace, this.script);
		});

		return workspacePipelines;
	};

	run = async () => {
		const scriptPipelines = this.getScriptPipelines();
		const workspacePipelines = this.getWorkspacePipelines(scriptPipelines);

		if ( workspacePipelines.length === 0 ) {
			return logger.warn(`No workspaces found for script "${logger.mark(this.script)}"`);
		}

		const graph = new Graph<WorkspacePipeline>();

		for ( const workspacePipeline of workspacePipelines ) {
			graph.addVertex({
				id: workspacePipeline.id,
				edges: workspacePipeline.dependsOn,
				data: workspacePipeline,
			});
		}

		const [ isCyclic, cycleVertices ] = graph.findCyclic();

		if ( isCyclic ) {
			const cyclePath = cycleVertices.map(( vertex ) => vertex.id).join(" -> ");
			return logger.error(`Cyclic dependency detected: ${logger.mark(cyclePath)}`);
		}

		const topological2dSort = graph.topological2dSort();

		const tableTasks = topological2dSort.map(( vertices ) => {
			return vertices.map(( vertex ) => {
				const {workspace, scriptPipeline} = vertex.data;
				return this.createTask(scriptPipeline.script, workspace, scriptPipeline.runner);
			});
		});

		logger.info(`Running pipelines for ${tableTasks.flat().length} tasks`, {
			lineAfter: true,
		});

		for ( const tasks of tableTasks ) {
			await this.runTasks(tasks);
		}
	};
}

export type {
	PipelineRunnerConfig,
};

export default PipelineRunner;