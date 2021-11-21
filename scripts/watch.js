const execa = require("execa");
const fs = require("fs-extra");
const path = require("path");
// const esbuild = require("esbuild");
const vite = require("vite");


const getPath = (p) => path.resolve(__dirname, "../", p);

fs.ensureDir(getPath("out"));
// fs.copySync(getPath("src/template.html"), getPath("out/template.html"));

const watch = async () => {
  // const clientWatcher = await esbuild.build({
  //   entryPoints: [getPath("src/client/index.ts")],
  //   tsconfig: getPath("src/client/tsconfig.json"),
  //   outdir: getPath("out/client"),
  //   bundle: true,
  //   format: "iife",
  //   platform: "browser",
  //   // external: ["vscode"],
  //   watch: true,
  // });

  const clientWatcher = vite.build({
    root:getPath("src/client/"),
    build:{
      outDir:getPath("out/client/"),
      watch:{

      }
    }
  });

  const hostWatcher = execa("npm", ["run", "watch:host"]);
  hostWatcher.stdout.pipe(process.stdout);

  return { clientWatcher, hostWatcher };
};

watch();
