const router = require("express").Router();
const UserProfile = require("../controllers/useProfile");

router.get("/:UserId", UserProfile.getAllTaskUser);

router.get("/all/:UserId", UserProfile.getAllUserInTask);

router.get(
  "/getsall/:UserId",

  UserProfile.getAllTaskForDep
);

router.patch(
  "/addDep/:UserId",

  UserProfile.InsertDepend
);






module.exports = router;
