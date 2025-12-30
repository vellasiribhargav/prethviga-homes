import * as esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import progress from "esbuild-plugin-progress";
import time from "esbuild-plugin-time";
import sassPlugin from 'esbuild-plugin-sass';
const args = process.argv.slice(2);
const isProduction = args.includes("--production");


const entryPoints = {
  home:"./public/javascript/home.js",
  discoverUs:"./public/javascript/discoverUs.js",
  OnGoingPage:"./public/javascript/OnGoingPage.js",
  ProjectPage:"./public/javascript/ProjectPage.js"
};


const outdir = "public/bundle";

const metafilePath = path.join(outdir, "manifest.json");

function unhash(file_hashed) {
  const file_name = path.parse(file_hashed);
  let file_path =
    file_name.name.lastIndexOf("-") > 1
      ? file_name.name.slice(0, file_name.name.lastIndexOf("-")) + file_name.ext
      : file_name.base;
  return (
    file_name.dir.slice(file_name.dir.indexOf("/"), file_name.dir.length) +
    "/" +
    file_path
  );
}
const outdir_clear={
  name: "OutDir_Clear",
  setup: (build) => {
    const options = build.initialOptions;
    build.onEnd(async(result) => {
      const safelist = new Set(Object.keys(result.metafile.outputs));
      const files = await fs.promises.readdir(options.outdir);
      await Promise.all(
        files
          .filter(
            (filePath) => !safelist.has(path.join(options.outdir, filePath))
          )
          .map((filePath) => {
            try {
              fs.unlinkSync(path.join(options.outdir, filePath));
            } catch (unlinkErr) {
              console.error("Error deleting file:", unlinkErr);
            }
          })
      );
    })
  },
}
const manifestGenerator = {
  name: "manifestGenerator",
  setup(build) {
    build.onEnd(async (result) => {
      const metafile = result.metafile;
      let manifest = {};
      for (const outputFile in metafile.outputs) {
        const entryPoint = unhash(outputFile);
        const file_name = path.parse(outputFile);
        const outputPath =
          file_name.dir.slice(
            file_name.dir.indexOf("/"),
            file_name.dir.length
          ) +
          "/" +
          file_name.base;
        manifest[entryPoint] = outputPath;
      }
      fs.writeFileSync(metafilePath, JSON.stringify(manifest, null, 2));
    });
  },
};


// Build the JavaScript bundles
await esbuild.build({
  entryPoints,
  bundle: true,
  platform: 'browser',
  outdir: outdir,
  logOverride: {
    "duplicate-object-key": "silent",
  },
  entryNames: isProduction ? "[name]-[hash]" : "[name]",
  assetNames: isProduction ? "[name]-[hash]" : "[name]",
  format: "iife",
  minify: isProduction,
  minifyWhitespace: isProduction,
  sourcemap: !isProduction,
  plugins: [sassPlugin(), progress(), time(), manifestGenerator],
  loader: {
    '.scss': 'css',
    ".css": "css",
    ".woff": "file",
    ".woff2": "file",
    ".svg": "file",
    '.webp': 'file',
    '.ttf': "file"
  },
  define: {
    $: '$',
    jQuery: '$',
    'window.jQuery': '$',
  },
  metafile: true,


  });