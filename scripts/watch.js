const execa = require("execa");
const fs = require("fs-extra");
const vite = require("vite");
const viteSSG  =require("vite-ssg");
const { createClientBuildConfig, getPath } = require("./utils");

fs.ensureDir(getPath("out"));

const watch = async () => {
  // const milkdownWatcher = vite.build(createClientBuildConfig("milkdown",{}));
  const clientWatcher = execa("pnpm", ["run", "watch:client"]);
  clientWatcher.stdout.pipe(process.stdout);
  const hostWatcher = execa("pnpm", ["run", "watch:host"]);
  hostWatcher.stdout.pipe(process.stdout);
};

watch();
