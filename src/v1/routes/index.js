var router = require('express').Router()

router.use('/auth', require('./auth'))
router.use('/boards', require('./board'))
router.use('/boards/:boardId/sections', require('./section'))
router.use('/boards/:boardId/tasks', require('./task'))
router.use('/profile',require('./user'))
router.use('/tasks',require('./taskUser'))
router.use('/depen',require('./Depen'))
router.use('/resource',require('./recources'))
router.use('/diagram',require('./diagram'))


module.exports = router;
