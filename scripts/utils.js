const path = require("path");

const getPath = (p) => path.resolve(__dirname, "../", p);
// const publicDir = getPath (`src/client/milkdown/public/`);
const createClientBuildConfig = (p, watch=undefined) => ({
  root: getPath(`src/client/${p}/`),
  base: "./",
  // publicDir,
  build: {
    outDir: getPath(`out/client/${p}/`),
    emptyOutDir: true,
    watch,
  },
});

module.exports = {
  getPath,
  createClientBuildConfig
};
