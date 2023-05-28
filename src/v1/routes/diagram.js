var router = require("express").Router();
const UserProfile = require("../controllers/useProfile");

router.get(
  `/gettaskdiag/:UserId`,

  UserProfile.getAllTaskFOrDig
);

module.exports = router;
