// Disgusting __DEV__ hack fix
export const isInDebugMode = () => {
  return eval('__DEV__');
};
