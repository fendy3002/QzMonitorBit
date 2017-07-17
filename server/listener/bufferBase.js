import dateFormat from 'dateformat';

var getFilename = (date) => {
    return dateFormat(getMonday(date), "yyyymmdd") + "-" +
        dateFormat(addDays(getMonday(date), 6), "yyyymmdd") + ".log";
};
var getMonday = (d) => {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
    return new Date(d.setDate(diff));
};

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
};

var getGroup = function(buffer, getTime, onNew, onExisting){
    var group = {};
    for(var i = 0; i < buffer.length; i++){
        var currentBuffer = buffer[i];
        var time = getTime(currentBuffer);
        var hour = time.start.getHours();
        var minute = Math.floor(time.start.getMinutes() / 10) * 10;

        var key = "_" + pad(hour, 2).toString() + pad(minute, 2).toString();

        if(!group[key]){
            group[key] = onNew(currentBuffer);
        }
        else{
            group[key] = onExisting(group[key], currentBuffer);
        }
    }
    return group;
};

export default {
    getFilename,
    getMonday,
    getGroup,
    addDays,
    pad
};