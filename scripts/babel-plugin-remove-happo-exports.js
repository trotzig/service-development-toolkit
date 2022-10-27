module.exports = () => ({
  name: 'babel-plugin-remove-happo-exports',
  visitor: {
    ExportNamedDeclaration: (path, { opts }) => {
      const { declarations } = path.node.declaration || {};
      if (declarations && declarations[0].id.name.startsWith('Happo')) {
        path.remove();
      }
    }
  }
});
