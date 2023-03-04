import {Monorepo} from "roserepo";

import fs from "fs";

Monorepo.loadMonorepo().then(async (monorepo) => {
  const version = monorepo.packageJson.version;

  const workspaces = await monorepo.loadWorkspaces();

  workspaces.forEach((workspace) => {
    if (workspace.packageJson.version !== undefined) {
      workspace.packageJson.version = version;

      Object.keys(workspace.packageJson.peerDependencies ?? {}).forEach((peerDependency) => {
        if (peerDependency === "roserepo") {
          workspace.packageJson.peerDependencies[peerDependency] = version;
        }
      });

      fs.writeFileSync(workspace.resolve("package.json"), JSON.stringify(workspace.packageJson, null, 2));
    }
  });
});