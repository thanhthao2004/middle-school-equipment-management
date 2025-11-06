const { Schema, model } = require('mongoose');

const CounterSchema = new Schema(
	{
		_id: { type: String, required: true }, // prefix
		seq: { type: Number, default: 0 },
	},
	{ versionKey: false }
);

const Counter = model('Counter', CounterSchema);

async function getNextCode(prefix, width = 3) {
	const updated = await Counter.findOneAndUpdate(
		{ _id: prefix },
		{ $inc: { seq: 1 } },
		{ new: true, upsert: true }
	);
	const num = String(updated.seq).padStart(width, '0');
	return `${prefix}${num}`;
}

module.exports = { getNextCode };


