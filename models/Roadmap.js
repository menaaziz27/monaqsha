const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const roademapSchema = new Schema({
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: [true, "Please enter the description"],
		trim: true,
	},
  steps: [{
    title: String,
    description:String,
    ref : [String]
  }]

});

module.exports = mongoose.model("Roadmap", roademapSchema);
