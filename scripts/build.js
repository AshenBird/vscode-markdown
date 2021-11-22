const execa = require("execa");
const fs = require("fs-extra");
const path = require("path");
const vite = require("vite");

const getPath = (p) => path.resolve(__dirname, "../", p);

fs.ensureDir(getPath("out"));

const build = async () => {
  const clientBuilder = vite.build({
    root:getPath("src/client/"),
    base:"mcswift://",
    build:{
      outDir:getPath("out/client/"),
      emptyOutDir:true,
    }
  });

  const hostBuilder = execa("npm", ["run", "build:host"]);
  hostBuilder.stdout.pipe(process.stdout);

  return { clientBuilder, hostBuilder };
};

build();
