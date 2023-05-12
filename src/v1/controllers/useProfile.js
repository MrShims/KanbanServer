const User = require("../models/user");
const multer = require("multer");
const moment = require("moment");
const Task = require("../models/task");

exports.getProfile = async (req, res) => {
  try {
    const { UserId } = req.params;

    console.log(UserId);
    // Находим пользователя по указанному идентификатору
    const user = await User.findById(UserId);

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    // Отправляем данные профиля на клиент
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
};
 
exports.UpdateProfile = async (req, res) => {
  try {
    const { UserId } = req.params;
    const { fullName, phone, email, dataBirth } = req.body;

    const formattedDateOfBirth = moment(dataBirth, "DD-MM-YYYY").format(
      "YYYY-MM-DD"
    );
    // Обновляем профиль пользователя в базе данных
    const updatedUser = await User.findByIdAndUpdate(UserId, {
      fullName,
      phone,
      email,
      dateOfBirth: formattedDateOfBirth,
    });

    if (req.file) {
      // Получаем файл из запроса
      const photo = req.file;
      console.log(photo);

      // Преобразуем содержимое файла в Buffer
      const photoBuffer = Buffer.from(photo.buffer);

      // Сохраняем содержимое файла в поле profilePhoto
      updatedUser.profilePhoto = photoBuffer;

      // Сохраняем обновленный профиль пользователя с содержимым загруженного файла
      await updatedUser.save();
    }

    res.status(200).json({ message: "Профиль пользователя успешно обновлен" });
  } catch (err) {
    console.error("Ошибка при обновлении профиля пользователя:", err);
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
};



exports.getAllUserInTask = async (req, res) => {
  const { UserId } = req.params;

  try {
    // Находим задачу по её идентификатору
    const task = await Task.findById(UserId).populate('users');

    if (!task) {
      return res.status(404).json('Задача не найдена');
    }

    // Извлекаем имена пользователей из массива
    const usernames = task.users.map((user) => user.username);

    console.log(usernames)

    res.json(usernames);
  } catch (err) {
    console.error(err);
    res.status(500).json('Произошла ошибка');
  }
};

exports.getAllTaskUser = async (req, res) => {
  const { UserId } = req.params;

  try {
    const tasks = await Task.find({ users: UserId })
    .populate({
      path: 'section',
      select: 'board title',
      populate: {
        path: 'board',
        select: 'title'
      }
    })
    .lean();

    console.log(tasks)
    const boards = tasks.map(task => ({
      board: {
        id: task.section.board._id,
        title: task.section.board.title
      },
      task: {
        id: task._id,
        title: task.title,
        endDate: task.endDate
      
      },
    
      
    }));

    console.log(boards)

    res.status(200).json(boards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Произошла ошибка' });
  }
};
