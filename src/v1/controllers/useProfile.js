const User = require("../models/user");
const multer = require("multer");
const moment = require("moment");
const Task = require("../models/task");
const Section = require("../models/section");
const { param } = require("../routes/recources");

exports.getProfile = async (req, res) => {
  try {
    const { UserId } = req.params;

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

exports.getAllTaskForDep = async (req, res) => {
  const { UserId } = req.params;

  try {
    const tasks = await Task.find({})
      .populate({
        path: "section",
        populate: {
          path: "board",
          match: { _id: UserId },
        },
      })
      .select("title");

    const taskTitles = tasks
      .filter((task) => task.section && task.section.board) // Фильтруем задачи, у которых есть секция и доска
      .map((task) => ({ id: task._id, title: task.title }));

    res.json(taskTitles);
  } catch (error) {
    console.error(error);
    res.status(500).json("Ошибка");
  }
};

exports.InsertDepend = async (req, res) => {
  const { UserId } = req.params;
  const { IdTask } = req.body;

  if (UserId === IdTask) {
    res.status(400).json("Нельзя добавить саму себя");
  } else {
    try {
      // Найти задачу, в которую нужно добавить зависимость
      const task = await Task.findOne({ _id: UserId });

      if (!task) {
        return res.status(404).json("Задача не найдена");
      }

      // Проверить, что IdTask отсутствует в массиве dependencies
      if (task.dependencies.includes(IdTask)) {
        return res.status(400).json("Задача уже присутствует в зависимостях");
      }

      // Добавить IdTask в массив dependencies
      task.dependencies.push(IdTask);
      await task.save();

      res.status(200).json("Зависимость успешно добавлена");
    } catch (err) {
      res.status(500).json("Ошибка обработки");
    }
  }
};

exports.getAllSection = async (req, res) => {
  const { UserId } = req.params;

  try {
    const sections = await Section.find({ board: UserId });

    res.status(200).json(sections);
  } catch (err) {
    res.status(500).json("Ошибка обработки");
  }
};

exports.getAllTaskFOrDig = async (req, res) => {
  try {
    const { UserId } = req.params;
    console.log(UserId)

    // Получение идентификаторов секций, связанных с доской
    const sections = await Section.find({ board: UserId }).select("_id");

    console.log(sections)
    // Формирование массива идентификаторов секций
    const sectionIds = sections.map((section) => section._id);

    /* Получение всех задач, связанных с секциями 
       Без зависимостей */
       const tasks = await Task.find({ 
        section: { $in: sectionIds }, 
      }, { dependencies: 0 }); // Исключаем поле зависимостей

    console.log(tasks)
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get tasks" });
  }
};
exports.getAllDepen = async (req, res) => {
  const { UserId } = req.params;

  console.log(UserId);

  try {
    // Найти задачу по идентификатору
    const task = await Task.findOne({ _id: UserId }).populate({
      path: "dependencies",
      select: "title",
      populate: {
        path: "section",
        select: "title",
      },
    });

    if (!task) {
      return res.status(404).json("Задача не найдена");
    }

    // Получить массив зависимостей с их id, title и id раздела
    const dependencies = task.dependencies.map((dependency) => ({
      id: dependency._id,
      title: dependency.title,
      sectionId: dependency.section._id,
    }));

    res.status(200).json(dependencies);

    console.log(dependencies);
  } catch (err) {
    res.status(500).json("Ошибка обработки");
  }
};

exports.getAllUserInTask = async (req, res) => {
  const { UserId } = req.params;

  try {
    // Находим задачу по её идентификатору
    const task = await Task.findById(UserId).populate("users");

    if (!task) {
      return res.status(404).json("Задача не найдена");
    }

    // Извлекаем имена пользователей из массива
    const usernames = task.users.map((user) => user.username);

    console.log(usernames);

    res.json(usernames);
  } catch (err) {
    console.error(err);
    res.status(500).json("Произошла ошибка");
  }
};

exports.getAllTaskUser = async (req, res) => {
  const { UserId } = req.params;

  try {
    const tasks = await Task.find({ users: UserId })
      .populate({
        path: "section",
        select: "board title",
        populate: {
          path: "board",
          select: "title",
        },
      })
      .lean();

    console.log(tasks);
    const boards = tasks.map((task) => ({
      board: {
        id: task.section.board._id,
        title: task.section.board.title,
      },
      task: {
        id: task._id,
        title: task.title,
        endDate: task.endDate,
      },
    }));

    console.log(boards);

    res.status(200).json(boards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Произошла ошибка" });
  }
};
