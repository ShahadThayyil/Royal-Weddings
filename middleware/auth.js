const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }
  res.redirect('/admin/login');
};

const isNotAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.isAuthenticated) {
    return next();
  }
  res.redirect('/admin/dashboard');
};

module.exports = {
  isAuthenticated,
  isNotAuthenticated
};