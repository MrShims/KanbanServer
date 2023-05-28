const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { schemaOptions } = require("./modelOptions");

const resourceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    board: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
    currentQuantity: {
      type: Number,
      default: 0,
    },
    renewable: {
      type: Boolean,
      default: false,
    },
  },
  schemaOptions
);

module.exports = mongoose.model("Resource", resourceSchema);
