var router = require("express").Router();
const Resource = require("../controllers/resource");

router.post(
  "/:boardId/add",

  Resource.createRes
);

router.get(
  "/:boardId/get",

  Resource.getResource
);

router.get(
    "/:boardId/tasksres",
  
    Resource.getTaskResource
  );

router.patch(
  "/:boardId/setres",

  Resource.SetResourceTotask
);

module.exports = router;
