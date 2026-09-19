// Protects admin pages (redirects to login) and admin API routes (403 JSON).
function requireAuth(req, res, next) {
  if (req.session && req.session.adminId) {
    return next();
  }
  return res.redirect('/admin/login');
}

function requireAuthApi(req, res, next) {
  if (req.session && req.session.adminId) {
    return next();
  }
  return res.status(401).json({ error: 'Not authenticated' });
}

module.exports = { requireAuth, requireAuthApi };
