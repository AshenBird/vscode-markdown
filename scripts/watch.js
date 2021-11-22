const execa = require("execa");
const fs = require("fs-extra");
const path = require("path");
const vite = require("vite");

const getPath = (p) => path.resolve(__dirname, "../", p);

fs.ensureDir(getPath("out"));

const watch = async () => {
  const clientWatcher = vite.build({
    root:getPath("src/client/"),
    base:"mcswift://",
    build:{
      outDir:getPath("out/client/"),
      emptyOutDir:true,
      watch:{}
    }
  });

  const hostWatcher = execa("npm", ["run", "watch:host"]);
  hostWatcher.stdout.pipe(process.stdout);

  return { clientWatcher, hostWatcher };
};

watch();
