const router = require("express").Router();
const UserProfile = require("../controllers/useProfile");



router.get(
'/:UserId', 
UserProfile.getAllTaskUser)


;

router.get(
    '/all/:UserId',
    UserProfile.getAllUserInTask
)

module.exports = router