exports.getCurrentAcademicYear = () => {
    const now = new Date();
    const year = now.getFullYear();

    // Tháng 9 trở đi là năm học mới
    return now.getMonth() >= 8
        ? `${year}-${year + 1}`
        : `${year - 1}-${year}`;
};

exports.isCurrentAcademicYear = (year) => {
    return year === exports.getCurrentAcademicYear();
};
