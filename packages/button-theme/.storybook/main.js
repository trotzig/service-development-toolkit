const { KEEP_HAPPO_STORY_EXPORTS } = process.env;

module.exports = {
  stories: ['../stories/*.stories.mdx', '../stories/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-a11y'],

  webpackFinal: async (config, { configType }) => {
    const babelLoader = config.module.rules[0].use[0];
    if (!KEEP_HAPPO_STORY_EXPORTS) {
      babelLoader.options.plugins.unshift(require.resolve('../../../scripts/babel-plugin-remove-happo-exports'));
    }
    return config;
  },
};
