const SupportedControls = {
    PHEP_CHIA: 'PHEP_CHIA',
    PHAN_SO: 'PHAN_SO',
    NHAP: 'NHAP',
    LUA_CHON: 'LUA_CHON',
}

const COLORS = ['#FFDCA9', '#CE7777', '#68B984', '#009EFF', '#5F8D4E', '#BA94D1', '#497174', '#0E5E6F', '#3E6D9C', '#4E6C50'];
const BG_COLOR_CLASS=['t-control-bg-color_1', 't-control-bg-color_2','t-control-bg-color_3', 't-control-bg-color_4', 't-control-bg-color_5', 't-control-bg-color_6', 't-control-bg-color_7', 't-control-bg-color_8', 't-control-bg-color_9', 't-control-bg-color_10']

function randomId() {
    return Date.now();
}
module.exports = {
    ControlType: SupportedControls,
    genId: randomId,
    DefaultColors:COLORS,
    BackgroundColorClass:BG_COLOR_CLASS,
}

