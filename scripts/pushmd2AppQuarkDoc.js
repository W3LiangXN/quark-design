
const fse = require('fs-extra');
const path = require('path');
const targetBaseUrl = path.resolve(__dirname, '../../quark-design-docs/src/docs_vue/');
const changeLogUrl = path.resolve(__dirname, '../../quark-design-docs/src/docs/');
const copyFile = (from, to) => {
  fse
    .copy(from, to)
    .then(() => {
      console.log('success!>', to);
    })
    .catch((err) => {
      console.error(err);
    });
};

const removeFile = async (url) => {
  return new Promise((res, rej) => {
    fse.remove(url, (err) => {
      if (err) {
        throw err;
      }
      res(true);
    });
  });
};

const copy = async () => {
  const quarkPath = path.resolve(__dirname, '../packages/quark');
  let configPath = path.resolve(__dirname, '../example/src/config.json');
  let configPkgPath = path.resolve(__dirname, `${quarkPath}/package.json`);
  let quarkuiDocsConfigPath = `${targetBaseUrl}/config.json`;
  let changelogPath = path.resolve(__dirname, `${quarkPath}/CHANGELOG.md`);

  // 判断 site_docs 文件是否存在根路径中
  const existsRoot = await fse.pathExists(targetBaseUrl);

  if (existsRoot) await removeFile(`${targetBaseUrl}/docs/`);
  
  // 复制所有组件
  const fromConfig = await fse.readJson(configPath);
  fromConfig.nav.forEach(({ packages }) => {
    console.log(packages, "packages---------->")
    packages.forEach((item) => {
      if (item.show) {
        let cmpName = item.name.toLowerCase();
        let docpath = `${quarkPath}/src/${cmpName}/doc.zh-CN.md`; // 中文md
        let docEnPath = `${quarkPath}/src/${cmpName}/doc.en-US.md`; // 英文md

        let reactDocpath = `packages/quark/src/${cmpName}/doc-react.zh-CN.md`;
        let reactDocEnPath = `packages/quark/src/${cmpName}/doc-react.en-US.md`;

        console.log(docpath, "docpath---------->")
        console.log(docEnPath, "docEnPath---------->")
        fse.readFile(docpath, (err, data) => {
          if (!err) {
            copyFile(docpath, `${targetBaseUrl}/docs/${cmpName}/doc.zh-CN.md`);
          }
        });
        fse.readFile(docEnPath, (err, data) => {
          if (!err) {
            copyFile(docEnPath, `${targetBaseUrl}/docs/${cmpName}/doc.en-US.md`);
          }
        });

        // react docs
        fse.readFile(reactDocpath, (err, data) => {
          if (!err) {
            copyFile(reactDocpath, `${targetBaseUrl}/docs/${cmpName}/doc-react.zh-CN.md`);
          }
        });
        fse.readFile(reactDocEnPath, (err, data) => {
          if (!err) {
            copyFile(reactDocEnPath, `${targetBaseUrl}/docs/${cmpName}/doc-react.en-US.md`);
          }
        });
      }
    });
  });

  // 复制 config.json
  const fromPkgConfig = await fse.readJson(configPkgPath);

  const obj = {
    version: '',
    nav: [],
    docs: []
  };
  fse.outputJSON(quarkuiDocsConfigPath, obj, () => {
    const docsConfig = fse.readJson(quarkuiDocsConfigPath);
    docsConfig.version = fromPkgConfig.version;
    docsConfig.nav = fromConfig.nav;
    docsConfig.docs = fromConfig.docs;
    // for-test
    // todo 开源地址
    docsConfig.demoUrl = '/demo/demo.html#';
    fse
      .writeJson(quarkuiDocsConfigPath, docsConfig, {
        spaces: 2
      })
      .then(() => {
        console.log(`${fromPkgConfig.version} success!`);
      });
  });

  // 复制changelog
  await fse.copyFileSync(changelogPath, `${changeLogUrl}/changelog.zh-CN.md`);
  await fse.copyFileSync(changelogPath, `${changeLogUrl}/changelog.en-US.md`);
};


copy();
