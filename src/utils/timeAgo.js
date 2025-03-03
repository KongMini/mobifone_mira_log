function timeAgo(date) {
    const updatedTime = new Date(date);
    const now = new Date();
    const diffMs = now - updatedTime;

    if (diffMs < 60000) return `${Math.floor(diffMs / 1000)} giây`;
    if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)} phút`;
    if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)} giờ`;
    if (diffMs < 2592000000) return `${Math.floor(diffMs / 86400000)} ngày`;
    return `${Math.floor(diffMs / 2592000000)} tháng`;
}

module.exports = { timeAgo };