const path = require('path');

export default {
  entry: 'src/index.js',
  extraBabelPlugins: [
    ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }],
  ],
  env: {
    development: {
      extraBabelPlugins: ['dva-hmr'],
    },
  },
  alias: {
    components: path.resolve(__dirname, 'src/components/'),
  },
  ignoreMomentLocale: true,
  theme: './src/theme.js',
  html: {
    template: './src/index.ejs',
  },
  disableDynamicImport: true,
  publicPath: '/',
  hash: true,

  proxy:{
    "/api":{
      //"target":"http://localhost:8000/", 
      //"target":'http://172.16.23.246',
      //"target":"172.16.23.253:80",
      //"target":"http://175.30.250.130:8086/",
     "target":"http://localhost:13399/",
      "changeOrigin":true,
      "pathRewrite":{"^/api":""}
    },
    
  },
};
