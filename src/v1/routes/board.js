const router = require('express').Router()
const { param } = require('express-validator')
const validation = require('../handlers/validation')
const tokenHandler = require('../handlers/tokenHandler')
const boardController = require('../controllers/board')

router.post(
  '/',
  tokenHandler.verifyToken,
  boardController.create
)

router.get(
  '/',
  tokenHandler.verifyToken,
  boardController.getAll
)

router.put(
  '/',
  tokenHandler.verifyToken,
  boardController.updatePosition
)

router.get(
  '/favourites',
  tokenHandler.verifyToken,
  boardController.getFavourites
)

router.put(
  '/favourites',
  tokenHandler.verifyToken,
  boardController.updateFavouritePosition
)

router.get(
  '/:boardId',
  param('boardId').custom(value => {
    if (!validation.isObjectId(value)) {
      return Promise.reject('invalid id')
    } else return Promise.resolve()
  }),
  validation.validate,
  tokenHandler.verifyToken,
  boardController.getOne
)

router.put(
  '/:boardId',
  param('boardId').custom(value => {
    if (!validation.isObjectId(value)) {
      return Promise.reject('invalid id')
    } else return Promise.resolve()
  }),
  validation.validate,
  tokenHandler.verifyToken,
  boardController.update
)

router.delete(
  '/:boardId',
  param('boardId').custom(value => {
    if (!validation.isObjectId(value)) {
      return Promise.reject('invalid id')
    } else return Promise.resolve()
  }),
  validation.validate,
  tokenHandler.verifyToken,
  boardController.delete
)
router.patch(
  '/:boardId',
  param('boardId').custom(value => {
    if (!validation.isObjectId(value)) {
      return Promise.reject('invalid id')
    } else return Promise.resolve()
  }),
  validation.validate,
  tokenHandler.verifyToken,
  boardController.addUserToBoard,
  )



router.get(
  '/:boardId/users',
  param('boardId').custom(value => {
    if (!validation.isObjectId(value)) {
      return Promise.reject('invalid id')
    } else return Promise.resolve()
  }),
  validation.validate,
  tokenHandler.verifyToken,
  boardController.getUsersByBoardId

)

router.get(
  '/:boardId/usersandID',
  param('boardId').custom(value => {
    if (!validation.isObjectId(value)) {
      return Promise.reject('invalid id')
    } else return Promise.resolve()
  }),
  validation.validate,
  tokenHandler.verifyToken,
  boardController.getAllUserFromBoard

)





router.patch(
  '/:boardId/deleteUser',
  tokenHandler.verifyToken,
  boardController.deleteUserByLogin

)

router.put(
  '/:boardId/getIdUser',

  boardController.getUserByUsername
)





module.exports = router