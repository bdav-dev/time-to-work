const tableController = new TimeTableController(document.getElementById("timeTable"));
const combinedTime = document.getElementById("combinedTime");
const timeToWork = document.getElementById("timeToWork");
const infoTableController = new InfoTableController(document.getElementById("infoTable"));
const displayTime = document.getElementById("time");
const trainStartTime = document.getElementById("train_startTime");
const trainEvery = document.getElementById("train_every");
const trainWalkTime = document.getElementById("train_walktime");
const toggleLightDarkModeButton = document.getElementById("toggleLightDarkModeButton");
const interval_from = document.getElementById("interval_from");
const interval_to = document.getElementById("interval_to");
const interval_display = document.getElementById("interval_display");
const overtime = document.getElementById("overtime");
const overtimeSign = document.getElementById("overtimeSign");
const minBreak = document.getElementById("minBreak");

const root = document.querySelector(':root');

let isLightMode = true;

function lightMode() {
    const computedStyle = getComputedStyle(root);

    root.style.setProperty('--backgroundColor', computedStyle.getPropertyValue('--light_backgroundColor'));
    root.style.setProperty('--textColor', computedStyle.getPropertyValue('--light_textColor'));
    root.style.setProperty('--lightShadowColor', computedStyle.getPropertyValue('--light_lightShadowColor'));
    root.style.setProperty('--darkShadowColor', computedStyle.getPropertyValue('--light_darkShadowColor'));

    toggleLightDarkModeButton.innerText = "dunkler Modus";
    isLightMode = true;
}

function darkMode() {
    const computedStyle = getComputedStyle(root);

    root.style.setProperty('--backgroundColor', computedStyle.getPropertyValue('--dark_backgroundColor'));
    root.style.setProperty('--textColor', computedStyle.getPropertyValue('--dark_textColor'));
    root.style.setProperty('--lightShadowColor', computedStyle.getPropertyValue('--dark_lightShadowColor'));
    root.style.setProperty('--darkShadowColor', computedStyle.getPropertyValue('--dark_darkShadowColor'));

    toggleLightDarkModeButton.innerText = "heller Modus";
    isLightMode = false;
}

function toggleLightDarkMode() {
    if (isLightMode) {
        darkMode();
    } else {
        lightMode();
    }
}



function getCombinedTime() {
    return tableController.combinedTime();
}

function getRemainingTimeToWork() {
    if (timeToWork.value == '') {
        return Time.invalid();
    }

    return Time.fromMinutesAllowNegative(Time.fromString(timeToWork.value).asMinutes() - getCombinedTime().asMinutes());
}

function getNextOvertime() {
    if (overtime.value == '') {
        return Time.invalid();
    }

    return Time.fromMinutesAllowNegative(getOvertime().asMinutes() - getRemainingTimeToWork().asMinutes());
}

function getBreakText() {
    let currentBreak = getBreak();
    let minBreak = getMinBreak();

    if (currentBreak.invalid || currentBreak.asMinutes() == 0 || minBreak.asMinutes() == 0) {
        return currentBreak.toString();
    }

    let remainingBreaktimeAsMinutes = minBreak.asMinutes() - currentBreak.asMinutes();

    if (remainingBreaktimeAsMinutes < 0) {
        return currentBreak.toString() + " (+" + Time.fromMinutes(-1 * remainingBreaktimeAsMinutes).toString() + ")";
    } else {
        return currentBreak.toString() + " (-" + Time.fromMinutes(remainingBreaktimeAsMinutes).toString() + ")";
    }
}

function getOvertime() {
    let t = Time.fromString(overtime.value);

    if (!t.invalid) {
        return Time.fromMinutesAllowNegative(getOvertimeSign() * t.asMinutes());
    }
}

function getTrainText() {
    let leaveTime = getLeaveTimeToCatchTrain();
    let nextTrain = getNextTrain();
    let nextTrainTimeDiff = getNextTrainTimeDifference();

    if (nextTrain.invalid || nextTrainTimeDiff.invalid) {
        return "--:--";
    }

    if (leaveTime.invalid) {
        return nextTrain.toString() + " (in " + nextTrainTimeDiff.toString() + ")";
    }

    return leaveTime.toString() + " → " + nextTrain.toString() + " (in " + nextTrainTimeDiff.toString() + ")";
}


function getLeaveTimeToCatchTrain() {
    let nextTrain = getNextTrain();

    if (nextTrain.invalid || !nextTrain.isValidTimeOfDay() || trainWalkTime.value == '') {
        return Time.invalid();
    }

    return Time.fromMinutes(nextTrain.asMinutes() - Time.fromString(trainWalkTime.value).asMinutes());
}

function getNextTrain() {
    if (trainStartTime.value == '' || trainEvery.value == '') {
        return Time.invalid();
    }

    let startTime = Time.fromString(trainStartTime.value).asMinutes();
    let every = Time.fromString(trainEvery.value).asMinutes();
    let currentTimeVar = currentTime().asMinutes();

    if (every == 0) {
        return Time.invalid();
    }

    let n = (currentTimeVar - startTime) / every;

    if (n < 0) {
        return Time.fromMinutes(startTime);
    }

    return Time.fromMinutes(startTime + (Math.floor(n) + 1) * every);
}

function getNextTrainTimeDifference() {
    return Time.fromMinutes(getNextTrain().asMinutes() - currentTime().asMinutes());
}

function getBreak() {
    return tableController.calcBreak();
}

function getMinBreak() {
    return Time.fromString(minBreak.value);
}


function timestamp() {
    tableController.timestamp();
}

function deleteFromTable(index) {
    tableController.remove(index);
}

function updateTime() {
    displayTime.innerText = currentTime().toString();
}

function replaceByCurrentTime(timeFieldID) {
    document.getElementById(timeFieldID).value = currentTime().toString();
    updateUI();
}

function currentTime() {
    return Time.fromString(new Date().toLocaleTimeString('de-DE', {
        hour: "numeric",
        minute: "numeric"
    }));
}

function addTimeInterval(startTimeFieldID, endTimeFieldID) {
    const startTimeFieldValue = document.getElementById(startTimeFieldID).value;
    const endTimeFieldValue = document.getElementById(endTimeFieldID).value;

    if (startTimeFieldValue == '') {
        alert("Das Startzeitfeld ist leer.");
        return;
    }

    if (endTimeFieldValue == '') {
        // add as Timestamp
        if (!tableController.isTimestampPresent()) {
            const customStartTime = Time.fromString(startTimeFieldValue);

            if (customStartTime.asMinutes() > currentTime().asMinutes()) {
                alert("Der Beginn des Zeitstempels liegt in der Zukunft.");
                return;
            }

            tableController.addTimeStamp(TimeStamp.fromCustomBeginTime(customStartTime));
            return;
        } else {
            alert("Das Endzeitfeld ist leer und es ist bereits ein offener Zeitstempel vorhanden.");
            return;
        }
    }

    let timeInterval = new TimeInterval(Time.fromString(startTimeFieldValue), Time.fromString(endTimeFieldValue));

    if (!timeInterval.isValid()) {
        alert("Die Zeitangaben sind nicht gültig.");
        return;
    }

    tableController.addTimeInterval(timeInterval);
}

function addTimeDifference(timeFieldID) {
    const timeFieldValue = document.getElementById(timeFieldID).value;

    if (timeFieldValue != '') {
        tableController.addTimeDifference(new TimeDifference(Time.fromString(timeFieldValue)));
    } else {
        alert("Das Zeitfeld ist leer.");
    }

}

function toggleOvertimeSign() {
    if (overtimeSign.innerText == '-') {
        overtimeSign.innerText = '+';
    } else {
        overtimeSign.innerText = '-';
    }
    updateUI();
}

function getOvertimeSign() {
    if (overtimeSign.innerText == '-') {
        return -1;
    } else {
        return 1;
    }
}

function updateUI() {
    updateTime();
    updateIntervalDisplay();
    tableController.updateTable();
    infoTableController.updateTable();
}


function updateIntervalDisplay() {
    const from = interval_from.value;
    const to = interval_to.value;

    if (from == '' || to == '') {
        interval_display.innerText = "--:--";
        return;
    }

    const timeInterval = new TimeInterval(Time.fromString(from), Time.fromString(to));

    if (!timeInterval.isValid()) {
        interval_display.innerText = "--:--";
        return;
    }

    interval_display.innerText = timeInterval.getTimeDifference().toString();
}


function loadFromLocalStorage() {
    let userdata = JSON.parse(localStorage.getItem("bdav5.timetowork.userdata"));

    if(userdata == null) {
        return;
    }

    let table = userdata[0];
    let tableEntries = [];

    if(table != null) {
        for (let i = 0; i < table.length; i++) {
            let tableEntry = table[i];
    
            if (tableEntry.classname == 'TimeStamp') {
                tableEntries.push(TimeStamp.fromTimeStamp(tableEntry));
            } else if (tableEntry.classname == 'TimeDifference') {
                tableEntries.push(TimeDifference.fromTimeDifference(tableEntry));
            } else if (tableEntry.classname == 'TimeInterval') {
                tableEntries.push(TimeInterval.fromTimeInterval(tableEntry));
            }
        }
    }
    tableController.tableEntries = tableEntries;

    timeToWork.value = userdata[1];
    overtime.value = userdata[2];

    let overtimeSignVar = userdata[3];
    if(overtimeSignVar == '+' || overtimeSignVar == '-') {
        overtimeSign.innerText = overtimeSignVar;
    } else {
        overtimeSign.innerText = '+';
    }

    minBreak.value = userdata[4];
    trainStartTime.value = userdata[5];
    trainEvery.value = userdata[6];
    trainWalkTime.value = userdata[7];
    
    let light = userdata[8];
    if(light == null) {
        isLightMode = true;
    } else {
        isLightMode = light;
    }
}

function removeAll() {
    localStorage.removeItem("bdav5.timetowork.userdata");
}

function saveToLocalStorage() {
    let userdata = [
        tableController.tableEntries,
        timeToWork.value,
        overtime.value,
        overtimeSign.innerText,
        minBreak.value,
        trainStartTime.value,
        trainEvery.value,
        trainWalkTime.value,
        isLightMode,
        Date.now()
    ];

    localStorage.setItem("bdav5.timetowork.userdata", JSON.stringify(userdata));
}

function onLoad() {

    const f = function (e) {
        updateUI();
    }

    const f2 = function (e) {
        updateIntervalDisplay();
    }

    timeToWork.addEventListener("input", f);
    trainStartTime.addEventListener("input", f);
    trainEvery.addEventListener("input", f);
    trainWalkTime.addEventListener("input", f);
    interval_from.addEventListener("input", f2);
    interval_to.addEventListener("input", f2);
    overtime.addEventListener("input", f);
    minBreak.addEventListener("input", f);

    loadFromLocalStorage();
    updateUI();

    if(isLightMode) {
        lightMode();
    } else {
        darkMode();
    }

}

window.onbeforeunload = closeingCode;
function closeingCode() {
    saveToLocalStorage();
    //removeAll();
}

onLoad();