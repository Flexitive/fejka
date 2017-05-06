module.exports = (res, opts) => {
  return new Promise((success) => {
    setTimeout(() => {
      success(res);
    }, 1e3);
  });
}
