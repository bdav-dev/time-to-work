const tableController = new TimeTableController(document.getElementById("timeTable"));
const combinedTime = document.getElementById("combinedTime");
const timeToWork = document.getElementById("timeToWork");
const breakTime = document.getElementById("breakTime");
const breakActive = document.getElementById("breakActive");
const infoTableController = new InfoTableController(document.getElementById("infoTable"));
const displayTime = document.getElementById("time");
const trainStartTime = document.getElementById("train_startTime");
const trainEvery = document.getElementById("train_every");
const trainWalkTime = document.getElementById("train_walktime");
const toggleLightDarkModeButton = document.getElementById("toggleLightDarkModeButton");
const interval_from = document.getElementById("interval_from");
const interval_to = document.getElementById("interval_to");
const interval_display = document.getElementById("interval_display");
const useOvertime = document.getElementById("useOvertime");
const overtime = document.getElementById("overtime");

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

function getTimeToWork() {
    
    let minutes = Time.fromString(timeToWork.value).asMinutes() - getCombinedTime().asMinutes();
    
    if(useOvertime.checked && overtime.value != '') {
        minutes -= Time.fromString(overtime.value).asMinutes();
    }

    let ttW = Time.fromMinutes(minutes);

    if (!ttW.isValidTimeOfDay()) {
        ttW.toString = function toString() {
            return "-";
        };
    }

    return ttW;
}

function timestamp() {
    tableController.timestamp();
}

function getLeaveTime() {
    let leaveTime = Time.fromMinutes(currentTime().asMinutes() + getTimeToWork().asMinutes());

    if (breakActive.checked && breakTime.value != '') {
        leaveTime = Time.fromMinutes(leaveTime.asMinutes() + Time.fromString(breakTime.value).asMinutes());
    }

    if (!getTimeToWork().isValidTimeOfDay()) {
        leaveTime.toString = function toString() {
            return "-";
        };
    }

    leaveTime.perfromModulo();

    return leaveTime;
}


function getLeaveTimeToCatchTrain() {
    let nextTrain = getNextTrain();

    if (!nextTrain.isValidTimeOfDay()) {
        let returnTime = new Time(-1, -1);
        returnTime.toString = function toString() {
            return "-"
        };

        return returnTime;
    }

    let walkTime;

    if (trainWalkTime.value == '') {
        walkTime = 0;
    } else {
        walkTime = Time.fromString(trainWalkTime.value).asMinutes();
    }

    return Time.fromMinutes(nextTrain.asMinutes() - walkTime);
}

function getNextTrain() {
    if (trainStartTime.value == '' || trainEvery.value == '') {
        let returnTime = new Time(-1, -1);
        returnTime.toString = function toString() {
            return "-"
        };

        return returnTime;
    }

    let startTime = Time.fromString(trainStartTime.value).asMinutes();
    let every = Time.fromString(trainEvery.value).asMinutes();
    let currentTimeVar = currentTime().asMinutes();
    let counter = startTime;


    while (counter < currentTimeVar) {
        counter += every;
    }

    return Time.fromMinutes(counter);
}

function getNextTrainTimeDifference() {
    return Time.fromMinutes(getNextTrain().asMinutes() - currentTime().asMinutes());
}



function deleteFromTable(index) {
    tableController.remove(index);
}

function updateTime() {
    displayTime.innerText = currentTime().toString();
}

function replaceByCurrentTime(timeFieldID) {
    document.getElementById(timeFieldID).value = currentTime().toString();
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

    if (startTimeFieldValue == '' || endTimeFieldValue == '') {
        alert("Mindestens eins der Zeitfelder ist leer.");
        return;
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


// IDEEN:
//  Arbeitszeit anzeigen, sodass Überstunden / Pluszeit am aktuellen Tag auch angezeigt wird.
//  Bei Aufbrechzeit um Zug zu erreichen soll angezeigt werden, wie viele Plus oder Minusstunden man gemacht hat.
//  Aufbrachzeit um Zug zu erreichen zeigt aktuell den aktuellen Zug an, nicht den bei Feierabend. Das muss evtl. so sein, da nicht bekannt ist wie viel Plus/Minusstunden gemacht werden.

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



//DATA TO SAVE
//table entries
//timetowork
//breaktime
//breakset

function loadFromLocalStorage() {
    timeToWork.value = "08:12";
    breakTime.value = "00:45";
    trainStartTime.value = "00:04";
    trainEvery.value = "00:30";
    trainWalkTime.value = "00:15";



    if (currentTime().hours < 13) {
        breakActive.checked = true;
    }
}

function onLoad() {
    timeToWork.addEventListener("input", function (e) {
        updateUI();
    });

    breakTime.addEventListener("input", function (e) {
        updateUI();
    });

    trainStartTime.addEventListener("input", function (e) {
        updateUI();
    });

    trainEvery.addEventListener("input", function (e) {
        updateUI();
    });

    interval_from.addEventListener("input", function (e) {
        updateIntervalDisplay();
    });

    interval_to.addEventListener("input", function (e) {
        updateIntervalDisplay();
    });

    overtime.addEventListener("input", function (e) {
        updateUI();
    });

    useOvertime.addEventListener("input", function (e) {
        updateUI();
    });

    loadFromLocalStorage();
    updateUI();
}

//IDEEN: feld für plus zeit, Zug


onLoad();