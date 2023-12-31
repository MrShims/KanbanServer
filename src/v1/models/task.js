const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { schemaOptions } = require("./modelOptions");

const taskSchema = new Schema(
  {
    section: {
      type: Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    title: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    position: {
      type: Number,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: [
      {
        type: Date,
        default: Date.now,
      },
    ],
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },

    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dependencies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
    resources: [
      {
        resource: {
          type: Schema.Types.ObjectId,
          ref: "Resource",
        },
        quantity: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  schemaOptions
);

module.exports = mongoose.model("Task", taskSchema);
