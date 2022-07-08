const CracoAlias = require('craco-alias');
// const {
//   addAfterLoader,
//   removeLoaders,
//   loaderByName,
//   getLoaders,
//   throwUnexpectedConfigError,
// } = require('@craco/craco');

// const throwError = (message) =>
//   throwUnexpectedConfigError({
//     packageName: 'craco',
//     githubRepo: 'gsoft-inc/craco',
//     message,
//     githubIssueQuery: 'webpack',
//   });

module.exports = {
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: 'tsconfig',
        // baseUrl SHOULD be specified
        // plugin does not take it from tsconfig
        baseUrl: './src',
        /* tsConfigPath should point to the file where "baseUrl" and "paths"
        are specified*/
        tsConfigPath: './tsconfig.paths.json'
      }
    }
  ],
  devtool: true,

  // webpack: {
  // configure: (webpackConfig, {paths}) => {
  //   const {hasFoundAny, matches} = getLoaders(
  //     webpackConfig,
  //     loaderByName('babel-loader')
  //   );
  //   if (!hasFoundAny) throwError('failed to find babel-loader');
  //
  //   console.log('removing babel-loader');
  //   const {hasRemovedAny, removedCount} = removeLoaders(
  //     webpackConfig,
  //     loaderByName('babel-loader')
  //   );
  //   if (!hasRemovedAny) throwError('no babel-loader to remove');
  //   if (removedCount !== 2)
  //     throwError('had expected to remove 2 babel loader instances');
  //
  //   console.log('adding ts-loader');
  //
  //   const tsLoader = {
  //     test: /\.(js|mjs|jsx|ts|tsx)$/,
  //     include: paths.appSrc,
  //     loader: require.resolve('ts-loader'),
  //     options: {transpileOnly: true},
  //   };
  //
  //   const {isAdded: tsLoaderIsAdded} = addAfterLoader(
  //     webpackConfig,
  //     loaderByName('url-loader'),
  //     tsLoader
  //   );
  //   if (!tsLoaderIsAdded) throwError('failed to add ts-loader');
  //   console.log('added ts-loader');
  //
  //   console.log('adding non-application JS babel-loader back');
  //   const {isAdded: babelLoaderIsAdded} = addAfterLoader(
  //     webpackConfig,
  //     loaderByName('ts-loader'),
  //     matches[1].loader // babel-loader
  //   );
  //   if (!babelLoaderIsAdded)
  //     throwError('failed to add back babel-loader for non-application JS');
  //   console.log('added non-application JS babel-loader back');
  //
  //   return webpackConfig;
  // },
  // },
  style: {
    postcssOptions: {
      plugins: [require('tailwindcss'), require('autoprefixer')]
    }
  }
};
