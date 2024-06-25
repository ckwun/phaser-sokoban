module.exports = {
  extends: 'airbnb-base',
  settings: {
    'import/extensions': ['.js', '.json', '.png'],
    'import/resolver': {
      webpack: {
        config: 'webpack.config.js',
      },
    },
  },
};
