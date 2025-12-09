const periodicReportRepo = require('../repositories/periodic.repo');
const { formatDate } = require('../../../core/utils/date');

const mapDbStatusToUi = (dbStatus) => {
  if (dbStatus === 'completed') return 'completed';
  if (dbStatus === 'rejected') return 'rejected';
  return 'pending';
};

const mapUiStatusToDb = (uiStatus) => {
  if (uiStatus === 'completed') return 'completed';
  if (uiStatus === 'rejected') return 'rejected';
  return 'pending';
};

class PeriodicReportService {
  async getReports(filters = {}) {
    const reports = await periodicReportRepo.find(filters);

    return reports.map((r) => ({
      id: r._id.toString(),
      code: r.maBaoCao,
      period: r.kyBaoCao,
      date: formatDate(r.ngayLap, 'DD/MM/YYYY'),
      status: mapDbStatusToUi(r.trangThaiBaoCao),
      fileName: r.tenFile,
      fileUrl: r.duongDanFile
    }));
  }

  async getReportById(id) {
    const r = await periodicReportRepo.findById(id);
    if (!r) return null;

    return {
      id: r._id.toString(),
      code: r.maBaoCao,
      period: r.kyBaoCao,
      date: formatDate(r.ngayLap, 'DD/MM/YYYY'),
      status: mapDbStatusToUi(r.trangThaiBaoCao),
      fileName: r.tenFile,
      fileUrl: r.duongDanFile
    };
  }

  async createReport(data) {
    if (!data.kyBaoCao || !data.ngayLap) {
      throw new Error('Thiếu kỳ báo cáo hoặc ngày lập');
    }

    const ngayLapParsed = new Date(data.ngayLap);
    if (isNaN(ngayLapParsed.getTime())) {
      throw new Error('Ngày lập không hợp lệ');
    }

    const maBaoCao = `BC-${Date.now()}`;

    return periodicReportRepo.create({
      maBaoCao,
      kyBaoCao: data.kyBaoCao,
      ngayLap: ngayLapParsed,
      trangThaiBaoCao: 'pending',
      tenFile: data.tenFile || '',
      duongDanFile: data.duongDanFile || ''
    });
  }

  async updateReport(id, data) {
    return periodicReportRepo.update(id, {
      kyBaoCao: data.kyBaoCao,
      trangThaiBaoCao: mapUiStatusToDb(data.trangThaiBaoCao)
    });
  }

  async deleteReport(id) {
    return periodicReportRepo.delete(id);
  }

  async exportReport(type = 'pdf') {
    return {
      fileName: `BaoCaoDinhKy.${type}`,
      buffer: Buffer.from('MOCK FILE')
    };
  }
}

module.exports = new PeriodicReportService();
