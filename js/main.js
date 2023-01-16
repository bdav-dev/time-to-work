class TimeStamp {

    constructor() {
        this.timeInverval = new TimeInterval(currentTime(), null);
    }

    getTimeDifference() {
        if(this.isOpen()) {
            return TimeDifference.calculateTimeDifference(this.timeInverval.startTime, currentTime());
        }

        return this.timeInverval.getTimeDifference();
    }

    close() {
        this.timeInverval.endTime = currentTime();
    }

    toString() {
        if(this.isOpen()) {
            return this.timeInverval.startTime.toString() + " - ...";
        }
        
        return this.timeInverval.toString();
    }

    isOpen() {
        return this.timeInverval.endTime == null;
    }

}


class TimeDifference {

    constructor(timeDifference) {
        this.timeDifference = timeDifference;
    }

    getTimeDifference() {
        return this.timeDifference;
    }

    toString() {
        return this.timeDifference.toString();
    }

    static calculateTimeDifference(startTime, endTime) {
        return Time.fromMinutes(endTime.asMinutes() - startTime.asMinutes());
    }

}


class TimeInterval {

    constructor(startTime, endTime) {
        this.startTime = startTime;
        this.endTime = endTime;
    }

    static fromTimeInterval(timeInterval) {
        return new TimeInterval(timeInterval.startTime, timeInterval.endTime);
    }

    isValid() {
        if (this.startTime.hours > this.endTime.hours) {
            return false;
        } else if (this.startTime.hours == this.endTime.hours) {
            if (this.startTime.minutes > this.endTime.minutes) {
                return false;
            }
        }

        return true;
    }

    toString() {
        return this.startTime.toString() + " - " + this.endTime.toString();
    }

    getTimeDifference() {
        return TimeDifference.calculateTimeDifference(this.startTime, this.endTime);
    }

}

class Time {

    constructor(hours, minutes) {
        this.hours = hours;
        this.minutes = minutes;
    }

    static fromTime(time) {
        return new Time(time.hours, time.minutes);
    }

    static fromMinutes(minutes) {
        return new Time(Math.floor(minutes / 60), minutes % 60);
    }

    static fromString(string) {
        const seperated = string.split(":");
        return new Time(parseInt(seperated[0]), parseInt(seperated[1]));
    }

    isValidTimeOfDay() {
        if(this.hours < 0 || this.hours > 23) {
            return false;
        }

        if(this.minutes < 0 || this.minutes > 59) {
            return false;
        }

        return true;
    }

    perfromModulo() {
        this.hours = this.hours % 24;
    }

    toString() {
        let timeAsString = ""

        if (this.hours.toString().length == 1) {
            timeAsString += "0" + this.hours.toString();
        } else {
            timeAsString += this.hours.toString();
        }

        timeAsString += ":";

        if (this.minutes.toString().length == 1) {
            timeAsString += "0" + this.minutes.toString();
        } else {
            timeAsString += this.minutes.toString();
        }

        return timeAsString;
    }

    asMinutes() {
        return this.minutes + 60 * this.hours;
    }

}


//table entries structure: [index, item]
class TimeTableController {

    constructor(tableElement) {
        this.table = tableElement;
        this.tableEntries = [];
    }

    updateTable() {
        for(let i = 0; i < this.tableEntries.length; i++) {
            let tableEntry = this.tableEntries[i];

            if(tableEntry[1] instanceof TimeStamp && tableEntry[1].isOpen() && i != this.tableEntries.length - 1) {
                let openTimeStamp = tableEntry[1];
                this.tableEntries.splice(i, 1);
                this.tableEntries.push([this.getHightestIndex() + 1, openTimeStamp]);
                this.updateTable();
                return;
            }
        }

        let tableInnerHTML = `<thead>
                                <tr class="header">
                                    <td scope="col">Zeitintervall</td>
                                    <td scope="col">Zeitdifferenz</td>
                                    <td scope="col">Aktionen</td>
                                </tr>
                              </thead>
                              <tbody class="cells">`;

        if(this.tableEntries.length == 0) {
            tableInnerHTML += `<tr>
                                <th colspan="3" scope="row">[Tabelle leer]</th>
                               </tr>`;
        }

        for(let i = 0; i < this.tableEntries.length; i++) {
            let tableEntry = this.tableEntries[i];
            tableEntry[0] = i;

            let timeInvervalText = "";
            let timeDifferenceText = "";

            if(tableEntry[1] instanceof TimeInterval) {
                timeInvervalText = tableEntry[1].toString();
                timeDifferenceText = tableEntry[1].getTimeDifference().toString();

            } else if(tableEntry[1] instanceof TimeDifference) {
                timeDifferenceText = tableEntry[1].getTimeDifference().toString();

            } else if(tableEntry[1] instanceof TimeStamp) {
                timeInvervalText = tableEntry[1].toString();
                timeDifferenceText = tableEntry[1].getTimeDifference().toString();
            }

            tableInnerHTML += `<tr>
                               <td scope="row">${timeInvervalText}</td>
                               <td>${timeDifferenceText}</td>
                               <td><Button onClick="deleteFromTable(${i})">Löschen</Button></td>
                               </tr>`;
        }

        tableInnerHTML += `</tbody>`;

        this.table.innerHTML = tableInnerHTML;
    }

    remove(index) {
        this.tableEntries.splice(index, 1);
        updateUI();
    }

    timestamp() {

        for(let i = 0; i < this.tableEntries.length; i++) {
            let tableEntry = this.tableEntries[i];


            if(tableEntry[1] instanceof TimeStamp && tableEntry[1].isOpen()) {
                tableEntry[1].close();
                updateUI();
                return;
            }
        
        }

        this.addTimeStamp(new TimeStamp());
    }

    addTimeStamp(timeStamp) {
        this.tableEntries.push([this.getHightestIndex() + 1, timeStamp]);
        updateUI();
    }

    addTimeInterval(timeInterval) {
        this.tableEntries.push([this.getHightestIndex() + 1, timeInterval]);
        updateUI();
    }

    addTimeDifference(timeDifference) {
        this.tableEntries.push([this.getHightestIndex() + 1, timeDifference]);
        updateUI();
    }

    getHightestIndex() {
        if (this.tableEntries.length == 0) {
            return 0;
        }

        let latestEntry = this.tableEntries[this.tableEntries.length - 1];
        return latestEntry[0];
    }

    combinedTime() {
        let combinedTime = 0;

        for (let i = 0; i < this.tableEntries.length; i++) {
            let tableEntry = this.tableEntries[i];

            combinedTime += tableEntry[1].getTimeDifference().asMinutes();
        }

        return Time.fromMinutes(combinedTime);
    }

}

class InfoTableController {

    constructor(infoTable) {
        this.table = infoTable;
    }

    updateTable() {
        this.table.innerHTML = `<thead>
                                    <tr class="header">
                                        <th scope="col">Summe der Arbeitszeit</th>
                                        <th scope="col">restliche Arbeitszeit</th>
                                        <th scope="col">Uhrzeit zum gehen</th>
                                    </tr>
                                </thead>
                                
                                <tbody class="cells">
                                    <tr">
                                        <th scope="row">${getCombinedTime().toString()}</th>
                                        <th>${getTimeToWork().toString()}</th>
                                        <th>${getLeaveTime().toString()}</th>
                                    </tr>
                            </tbody>`;                        
    }

}


let tableController = new TimeTableController(document.getElementById("timeTable"));
let combinedTime = document.getElementById("combinedTime");
let timeToWork = document.getElementById("timeToWork");
let breakTime = document.getElementById("breakTime");
let breakActive = document.getElementById("breakActive");
let infoTableController = new InfoTableController(document.getElementById("infoTable"));
let displayTime = document.getElementById("time");

function getCombinedTime() {
    return tableController.combinedTime();
}

function getTimeToWork() {
    let ttW = Time.fromMinutes(Time.fromString(timeToWork.value).asMinutes() - getCombinedTime().asMinutes());
    
    if(!ttW.isValidTimeOfDay()) {
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

    if(breakActive.checked) {
        leaveTime = Time.fromMinutes(leaveTime.asMinutes() + Time.fromString(breakTime.value).asMinutes());
    }

    if(!getTimeToWork().isValidTimeOfDay()) {
        leaveTime.toString = function toString() {
            return "-";
        };
    }

    leaveTime.perfromModulo();

    return leaveTime;
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

function updateUI() {
    tableController.updateTable();
    infoTableController.updateTable();
    updateTime();
}


//DATA TO SAVE
//table entries
//timetowork
//breaktime
//breakset

function loadFromLocalStorage() {
    timeToWork.value = "08:12";
    breakTime.value = "01:00";


    if(currentTime().hours < 13) {
        breakActive.checked = true;
    }
}

function onLoad() {
    timeToWork.addEventListener("input", function(e) {
        updateUI();
    });

    breakTime.addEventListener("input", function(e) {
        updateUI();
    });
    

    loadFromLocalStorage();
    updateUI();
}

//IDEEN: feld für plus zeit, Zug


onLoad();