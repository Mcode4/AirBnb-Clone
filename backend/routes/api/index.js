const router = require('express').Router();
const { restoreUser } = require('../../utils/auth.js');
const { setTokenCookie } = require('../../utils/auth.js');
const { User } = require('../../db/models');
const { requireAuth } = require('../../utils/auth.js');

const sessionRouter = require('./sessions.js');
const usersRouter = require('./users.js');

router.use(restoreUser);
router.use('/session', sessionRouter);
router.use('/users', usersRouter);

router.use('/review-images', require('./reviewimages.js'))
router.use('/reviews', require('./reviews.js'))

router.get(
  '/restore-user',
  (req, res) => {
    return res.json(req.user);
  }
);


router.post('/test', function(req, res) {
    res.json({ requestBody: req.body });
});


router.get('/set-token-cookie', async (_req, res) => {
  const user = await User.findOne({
    where: {
      username: 'Demo-lition'
    }
  });
  setTokenCookie(res, user);
  return res.json({ user: user });
});


router.get(
  '/require-auth',
  requireAuth,
  (req, res) => {
    return res.json(req.user);
  }
);

module.exports = router;