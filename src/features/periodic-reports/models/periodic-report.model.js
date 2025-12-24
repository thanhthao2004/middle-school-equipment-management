const { Schema, model } = require('mongoose');
const { getNextCode } = require('../../../core/libs/sequence');

const PeriodicReportSchema = new Schema(
  {
    maBaoCao: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    kyBaoCao: {
      type: String,
      required: true,
      trim: true
    },
    ngayLap: {
      type: Date,
      required: true
    },
    trangThaiBaoCao: {
      type: String,
      enum: ['pending', 'completed', 'rejected'],
      default: 'pending'
    },
    tenFile: {
      type: String,
      default: ''
    },
    duongDanFile: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    collection: 'periodic_reports'
  }
);


PeriodicReportSchema.pre('validate', async function ensureMaBC(next) {
  try {
    if (!this.maBaoCao) {
      this.maBaoCao = await getNextCode('BC', 3); // BC001
    }
    next();
  } catch (e) {
    next(e);
  }
});
module.exports = model('PeriodicReport', PeriodicReportSchema);



//test
