const Board = require('../models/board')
const Section = require('../models/section')
const Task = require('../models/task')
const User = require('../models/user')

exports.create = async (req, res) => {
  try {
    const boardsCount = await Board.find().count()
    const board = await Board.create({
      user: req.user._id,
      position: boardsCount > 0 ? boardsCount : 0,
      createdAt: new Date()
    })
    res.status(201).json(board)
  } catch (err) {
    res.status(500).json(err)
  }

}

exports.getAll = async (req, res) => {
  try {
    const boards = await Board.find({ user: req.user._id }).sort('-position')
    res.status(200).json(boards)
   
  } catch (err) {
    res.status(500).json(err)
  }
}

exports.updatePosition = async (req, res) => {
  const { boards } = req.body
  try {
    for (const key in boards.reverse()) {
      const board = boards[key]
      await Board.findByIdAndUpdate(
        board.id,
        { $set: { position: key } }
      )
    }
    res.status(200).json('updated')
  } catch (err) {
    res.status(500).json(err)
  }
}

exports.getOne = async (req, res) => {
  const { boardId } = req.params
  try {
    const board = await Board.findOne({ user: req.user._id, _id: boardId })
    if (!board) return res.status(404).json('Board not found')
    const sections = await Section.find({ board: boardId })
    for (const section of sections) {
      const tasks = await Task.find({ section: section.id }).populate('section').sort('-position')
      section._doc.tasks = tasks
    }
    board._doc.sections = sections
    res.status(200).json(board)
  } catch (err) {
    res.status(500).json(err)
  }
}

exports.update = async (req, res) => {
  const { boardId } = req.params
  const { title, description, favourite } = req.body

  try {
    if (title === '') req.body.title = 'Untitled'
    if (description === '') req.body.description = 'Add description here'
    const currentBoard = await Board.findById(boardId)
    if (!currentBoard) return res.status(404).json('Board not found')

    if (favourite !== undefined && currentBoard.favourite !== favourite) {
      const favourites = await Board.find({
        user: currentBoard.user,
        favourite: true,
        _id: { $ne: boardId }
      }).sort('favouritePosition')
      if (favourite) {
        req.body.favouritePosition = favourites.length > 0 ? favourites.length : 0
      } else {
        for (const key in favourites) {
          const element = favourites[key]
          await Board.findByIdAndUpdate(
            element.id,
            { $set: { favouritePosition: key } }
          )
        }
      }
    }

    const board = await Board.findByIdAndUpdate(
      boardId,
      { $set: req.body }
    )
    res.status(200).json(board)
  } catch (err) {
    res.status(500).json(err)
  }
}

exports.getFavourites = async (req, res) => {
  try {
    const favourites = await Board.find({
      user: req.user._id,
      favourite: true
    }).sort('-favouritePosition')
    res.status(200).json(favourites)
  } catch (err) {
    res.status(500).json(err)
  }
}

exports.updateFavouritePosition = async (req, res) => {
  const { boards } = req.body
  try {
    for (const key in boards.reverse()) {
      const board = boards[key]
      await Board.findByIdAndUpdate(
        board.id,
        { $set: { favouritePosition: key } }
      )
    }
    res.status(200).json('updated')
  } catch (err) {
    res.status(500).json(err)
  }
}

exports.delete = async (req, res) => {
  const { boardId } = req.params
  try {
    const sections = await Section.find({ board: boardId })
    for (const section of sections) {
      await Task.deleteMany({ section: section.id })
    }
    await Section.deleteMany({ board: boardId })

    const currentBoard = await Board.findById(boardId)

    if (currentBoard.favourite) {
      const favourites = await Board.find({
        user: currentBoard.user,
        favourite: true,
        _id: { $ne: boardId }
      }).sort('favouritePosition')

      for (const key in favourites) {
        const element = favourites[key]
        await Board.findByIdAndUpdate(
          element.id,
          { $set: { favouritePosition: key } }
        )
      }
    }

    await Board.deleteOne({ _id: boardId })

    const boards = await Board.find().sort('position')
    for (const key in boards) {
      const board = boards[key]
      await Board.findByIdAndUpdate(
        board.id,
        { $set: { position: key } }
      )
    }

    res.status(200).json('deleted')
  } catch (err) {
    res.status(500).json(err)

   
  }





 






}


exports.addUserToBoard = async (req, res) => {
  const { boardId } = req.params; // Получаем идентификатор доски из параметров маршрута
  const { user } = req.body; // Получаем данные пользователя из тела запроса
  try {
    // Находим доску по идентификатору
    const board = await Board.findById(boardId);
    if (!board) {
      // Доска не найдена
      return res.status(404).json({ error: 'Доска не найдена' });
    }
  
      const userID = await User.findOne({ username: user });
      const existingUser = await User.findOne({ username: user });


      if (userID) {

        const userAlreadyExists = board.user.some((userId) => userId.toString() === existingUser._id.toString());

    

       if(userAlreadyExists)
       {
          res.status(400).json({error:'Пользователь уже добавлен'})
       }
       else{
        board.user.push(userID);
        res.status(200).json({ message: 'User added to board successfully' });
        await board.save();
       }
      }
      else
      {
        res.status(400).json({error:'Пользователь не найден'})
      }





    // Сохраняем изменения в базе данных
  

    // Отправляем успешный ответ

  } catch (error) {
    // Обработка ошибок
    res.status(500).json({ error: 'Internal server error' });
  }
}

exports.getUsersByBoardId= async(req,res) =>{
  try {
    const { boardId } = req.params; // Получаем идентификатор доски из параметров маршрута
 
    const board = await Board.findById(boardId).populate('user', 'username');

    if (!board) {
      throw new Error('Доска не найдена');
    }

    const usernames = board.user.map(user => user.username); // Создайте массив имен пользователей

    res.status(200).json(usernames);
  } catch (error) {
    throw new Error(`Ошибка при получении пользователей доски: ${error.message}`);
  }
}


exports.getAllUserFromBoard = async (req, res) => {
  try {
    const { boardId } = req.params; // Получаем идентификатор доски из параметров маршрута

    const board = await Board.findById(boardId).populate('user');

    if (!board) {
      return res.status(404).json({ error: 'Доска не найдена' });
    }

    // Создание массива пользователей с именами и идентификаторами
    const users = board.user.map((user) => ({
      _id: user._id,
      username: user.username,
    }));

  

    res.status(200).json(users);
  } catch (error) {
    console.error(`Ошибка при получении пользователей доски: ${error.message}`);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};






exports.deleteUserByLogin = async (req, res) => {
  const { boardId } = req.params;
  const { userN } = req.body;


  try {
    const board = await Board.findById(boardId);
    
    if (!board) {
      return res.status(404).json({ error: 'Доска не найдена' });
    }

    const user = await User.findOne({ username: userN });
  
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const userIndex = board.user.findIndex((userId) => userId.equals(user._id));

    if (userIndex === -1) {
      return res.status(404).json({ error: 'Пользователь не найден в доске' });
    }

    board.user.splice(userIndex, 1);

    await board.save();

    res.status(200).json({ message: 'Пользователь успешно удален' });
  } catch (error) {
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

exports.getUserByUsername = async (req, res) => {
  const { userN } = req.body;

  try {
    const user = await User.findOne({ username: userN }); // Найти пользователя по имени пользователя


  


    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const userId = user._id; // Получить _id пользователя


    return res.status(200).json({ userId }); // Отправить _id обратно
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
