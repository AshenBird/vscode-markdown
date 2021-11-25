const execa = require("execa");
const fs = require("fs-extra");
const path = require("path");
const vite = require("vite");

const getPath = (p) => path.resolve(__dirname, "../", p);

fs.ensureDir(getPath("out"));

const build = async () => {
  const vditorBuilder = vite.build({
    root:getPath("src/client/vditor/"),
    base:"mcswift://",
    build:{
      outDir:getPath("out/client/vditor/"),
      emptyOutDir:true,
    }
  });
  const milkdownBuilder = vite.build({
    root:getPath("src/client/milkdown/"),
    base:"mcswift://",
    build:{
      outDir:getPath("out/client/milkdown/"),
      emptyOutDir:true,
    }
  });

  const hostBuilder = execa("npm", ["run", "build:host"]);
  hostBuilder.stdout.pipe(process.stdout);

  return { vditorBuilder, milkdownBuilder, hostBuilder };
};

build();
