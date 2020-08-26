const qiniu = require('qiniu');
const fs = require('fs');
const path = require('path');

const configGlobal = {
  publicPath: 'http://qiniu.liahaoren.com/',
  config: {
    accessKey: 'LHUmMTrNeAjZAnOio7RxdDDfrBOC2FBdA-vyciCZ',
    secretKey: '8p6C_9Tlu4b19-mSqRyzPbu6Rl28w2_sw6sRcycu',
    bucket: 'silenceli',
    exclude: /\.html$/,
  },
};
var fileList = [];
const displayFile = (api, param) => {
  fs.stat(param, (err, stats) => {
    if (stats.isDirectory()) {
      fs.readdir(param, (err, file) => {
        file.forEach(e => {
          //遍历目录得到的文件名称是不含路径的，需要将前面的绝对路径拼接
          if (e.includes('umi')) {
            fileList.push({
              filename: e,
              localFile: path.resolve(path.join(param, e)),
            });
          }
        });
        uploadFun(api, configGlobal, fileList);
      });
    }
  });
};

const uploadFun = (api, configGlobal, fileList) => {
  var mac = new qiniu.auth.digest.Mac(
    configGlobal.config.accessKey,
    configGlobal.config.secretKey,
  );
  var putPolicy = new qiniu.rs.PutPolicy({
    scope: configGlobal.config.bucket,
  });
  var uploadToken = putPolicy.uploadToken(mac);
  let config = new qiniu.conf.Config();
  var formUploader = new qiniu.form_up.FormUploader(config);
  var putExtra = new qiniu.form_up.PutExtra();
  // 文件上传
  // api.logger.info(fileList);
  Array.isArray(fileList) &&
    fileList.forEach((item, key) => {
      formUploader.putFile(
        uploadToken,
        item.filename,
        item.localFile,
        putExtra,
        (respErr, respBody, respInfo) => {
          if (respErr) {
            throw respErr;
          }
          if (respInfo.statusCode == 200) {
            api.logger.info('successs!!');
          } else {
            // api.logger.info(respBody);
          }
        },
      );
    });
};

export default (api, opts) => {
  //打包结束后的
  api.onBuildComplete(async ({ err }) => {
    if (!err) {
      // api.logger.info('onBuildComplete', api, opts);
      displayFile(api, api.paths.absOutputPath);
    }
  });
  //插入HtmL 代码
  api.modifyProdHTMLContent(async (content, args) => {
    const { route } = args;
    // api.logger.info('modifyProdHTMLContent', typeof content);
    let newContent = content
      .replace(/src=\"\//g, 'src="http://qiniu.liahaoren.com/')
      .replace(/href=\"\//g, 'href="http://qiniu.liahaoren.com/');

    return newContent;
  });
};
