const router = require("express").Router();
const validation = require("../handlers/validation");
const tokenHandler = require("../handlers/tokenHandler");
const boardController = require("../controllers/board");
const UserProfile = require("../controllers/useProfile");
const multer = require("multer");

const upload = multer();

router.get('/:UserId', UserProfile.getProfile);

router.patch('/:UserId', 
upload.single("photo"), 
UserProfile.UpdateProfile);





module.exports = router;
