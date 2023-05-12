const Task = require("../models/task");
const Section = require("../models/section");
const User = require("../models/user");

exports.create = async (req, res) => {
  const { sectionId } = req.body;
  try {
    const section = await Section.findById(sectionId);
    const tasksCount = await Task.find({ section: sectionId }).count();
    const task = await Task.create({
      section: sectionId,
      position: tasksCount > 0 ? tasksCount : 0,
    });
    task._doc.section = section;
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.update = async (req, res) => {
  const { taskId } = req.params;
  try {
    const task = await Task.findByIdAndUpdate(taskId, { $set: req.body });
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.delete = async (req, res) => {
  const { taskId } = req.params;
  try {
    const currentTask = await Task.findById(taskId);
    await Task.deleteOne({ _id: taskId });
    const tasks = await Task.find({ section: currentTask.section }).sort(
      "postition"
    );
    for (const key in tasks) {
      await Task.findByIdAndUpdate(tasks[key].id, { $set: { position: key } });
    }
    res.status(200).json("deleted");
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.updatePosition = async (req, res) => {
  const {
    resourceList,
    destinationList,
    resourceSectionId,
    destinationSectionId,
  } = req.body;
  const resourceListReverse = resourceList.reverse();
  const destinationListReverse = destinationList.reverse();
  try {
    if (resourceSectionId !== destinationSectionId) {
      for (const key in resourceListReverse) {
        await Task.findByIdAndUpdate(resourceListReverse[key].id, {
          $set: {
            section: resourceSectionId,
            position: key,
          },
          $push: {
            updatedAt: Date.now(),
          },
        });
      }
    }
    for (const key in destinationListReverse) {
      await Task.findByIdAndUpdate(destinationListReverse[key].id, {
        $set: {
          section: destinationSectionId,
          position: key,
        },
        $push: {
          updatedAt: Date.now(),
        },
      });
    }
    res.status(200).json("updated");
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.addUserToTask = async (req, res) => {
  const { taskId } = req.params;
  const { UserN } = req.body;

  try {
    // Находим задачу по идентификатору
    const task = await Task.findById(taskId);
    if (!task) {
      throw new Error("Задача не найдена");
    }

    // Находим пользователя по username
    const user = await User.findOne({ username: UserN });
    const existingUser = await User.findOne({ username: UserN });
    if (!user) {
      throw new Error("Пользователь не найден");
    }

    const userAlreadyExists = task.users.some((userId) => userId.toString() === existingUser._id.toString());

    if(userAlreadyExists)
    {
      res.status(400).json("Пользователь уже прикреплен")
    }
    else{
      task.users.push(user._id);
      // Сохраняем изменения в задаче
      await task.save();
      console.log("Пользователь успешно добавлен в задачу");
    }
 
    
  } catch (error) {
    console.error(error.message);
  }
};

exports.getListUserTask = async(req,res)=>{

  const { taskId } = req.params;

  
  try {
    // Находим задачу по идентификатору
    const task = await Task.findById(taskId).populate('users');
    if (!task) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }
    // Извлекаем массив пользователей из задачи
    const userList = task.users;
    res.status(200).json({ userList });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Произошла ошибка' });
  }
}

exports.setEndDate = async (req, res) => {
  const { taskId } = req.params;
  const { dateEnd } = req.body;

  try {
    // Обновляем задачу по идентификатору
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { endDate: dateEnd },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: 'Задача не найдена' });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Произошла ошибка' });
  }
};