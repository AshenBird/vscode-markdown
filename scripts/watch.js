const execa = require("execa");
const fs = require("fs-extra");
const path = require("path");
const vite = require("vite");

const getPath = (p) => path.resolve(__dirname, "../", p);

fs.ensureDir(getPath("out"));

const watch = async () => {
  const vditorWatcher = vite.build({
    root:getPath("src/client/vditor/"),
    // base:"mcswift://",
    base:"./",
    build:{
      outDir:getPath("out/client/vditor/"),
      emptyOutDir:true,
      watch:{}
    }
  });
  const milkdownWatcher = vite.build({
    root:getPath("src/client/milkdown/"),
    // base:"mcswift://",
    base:"./",
    build:{
      outDir:getPath("out/client/milkdown/"),
      emptyOutDir:true,
      watch:{}
    }
  });

  const hostWatcher = execa("npm", ["run", "watch:host"]);
  hostWatcher.stdout.pipe(process.stdout);

  // return { vditorWatcher, hostWatcher };
};

watch();
