
var router = require('express').Router()
const UserProfile = require('../controllers/useProfile')



router.get(`/getDepend/:UserId`,
 UserProfile.getAllDepen
 );

router.get(
  `/getSection/:UserId`,

  UserProfile.getAllSection
);






module.exports = router;