// This file is required to alleviate an RAF error that appears:
// https://github.com/facebook/jest/issues/4545

global.requestAnimationFrame = (callback) => {
  setTimeout(callback, 0);
};
