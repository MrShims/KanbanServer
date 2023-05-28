const Board = require("../models/board");
const Resource = require("../models/resource");
const Task = require("../models/task");

exports.createRes = async (req, res) => {
  const { boardId } = req.params;
  const { nameres, resourceq, renewable } = req.body;

  try {
    const existingResource = await Resource.findOne({
      name: { $regex: new RegExp(`^${nameres}$`, "i") },
      board: boardId,
    });

    if (existingResource) {
      // Ресурс с таким названием уже существует в данной доске
      return res
        .status(400)
        .json("Ресурс с таким названием уже существует в данной доске");
    }

    const newResource = new Resource({
      name: nameres,
      quantity: resourceq,
      currentQuantity: resourceq,
      board: boardId,
      renewable: renewable,
    });

    const savedResource = await newResource.save();
    res.status(201).json(savedResource);
  } catch (err) {
    res.status(500).json("Ошибка");
  }
};

exports.getTaskResource = async (req, res) => {
    const { boardId } = req.params;
  
    try {
      const task = await Task.findById(boardId).populate("resources.resource");
  
      if (!task) {
        return res.status(404).json({ message: "Задача не найдена" });
      }
  
      const resources = task.resources.map((item) => ({
        resource: item.resource,
        quantity: item.quantity,
      }));
  
      res.json({ resources });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
  };

exports.getResource = async (req, res) => {
  const { boardId } = req.params;

  try {
    const resources = await Resource.find({ board: boardId });
   

    res.status(200).json(resources);
  } catch (err) {
    res.status(500).json("Ошибка");
  }
};

exports.SetResourceTotask = async (req, res) => {
  const { boardId } = req.params;
  const { IDres } = req.body;
  const { quantity } = req.body;

  try {
    // Поиск задачи по идентификатору
    const task = await Task.findById(boardId);

    // Проверка, существует ли ресурс с указанным ID
    const resource = await Resource.findById(IDres);

    if (!resource) {
      // Ресурс не существует, создаем новый ресурс и добавляем его в массив ресурсов задачи
      const newResource = await Resource.create({ _id: IDres });
      task.resources.push({ resource: newResource, quantity: quantity });
    } else {
      // Ресурс существует, проверяем, есть ли он уже в массиве ресурсов задачи
      const existingResource = task.resources.find(
        (item) => item.resource.toString() === resource._id.toString()
      );
      if (existingResource) {
        // Ресурс уже есть в массиве, обновляем его количество
        existingResource.quantity = quantity;
      } else {
        // Ресурс не найден в массиве, добавляем его
        task.resources.push({ resource: resource, quantity: quantity });
      }
    }

    // Сохранение изменений в задаче
    await task.save();

    res.status(200).json({ message: "Ресурс добавлен к задаче" });
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
};
