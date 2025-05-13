module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // plugins: [ ['expo-env', { envFromProject: true }] ],  ← delete or comment out
  };
};
