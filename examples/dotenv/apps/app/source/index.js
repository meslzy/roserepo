const envs = [
  "monorepo",
  "runner",
  "dotenv",
  "dotenv_start",
  "dotenv_local",
  "dotenv_local_start",
  "workspace",
  "executor",
  "dotenv_1",
  "dotenv_1_start",
  "dotenv_local_1",
  "dotenv_local_1_start"
];

for (const env of envs) {
  console.log(`process.env.${env} = ${process.env[env]}`);

  if (process.env[env] === undefined) {
    throw new Error(`process.env.${env} is undefined`);
  }
}