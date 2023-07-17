class TimeStamp {

    constructor() {
        this.timeInterval = new TimeInterval(currentTime(), null);
        this.classname = 'TimeStamp';
    }

    static fromCustomBeginTime(startTime) {
        let stamp = new TimeStamp();
        stamp.timeInterval.startTime = startTime;

        return stamp;
    }

    static fromTimeStamp(timestamp) {
        let ts = new TimeStamp();
        ts.timeInterval = TimeInterval.fromTimeInterval(timestamp.timeInterval);
        return ts;
    }

    getTimeDifference() {
        if (this.isOpen()) {
            return TimeDifference.calculateTimeDifference(this.timeInterval.startTime, currentTime());
        }

        return this.timeInterval.getTimeDifference();
    }

    close() {
        this.timeInterval.endTime = currentTime();
    }

    toString() {
        if (this.isOpen()) {
            return this.timeInterval.startTime.toString() + " - ...";
        }

        return this.timeInterval.toString();
    }

    isOpen() {
        return this.timeInterval.endTime == null;
    }

    getStartTime() {
        return this.timeInterval.startTime;
    }

}


class TimeDifference {

    constructor(timeDifference) {
        this.timeDifference = timeDifference;
        this.classname = 'TimeDifference';
    }

    static fromTimeDifference(timeDifference) {
        return new TimeDifference(Time.fromTime(timeDifference.timeDifference));
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
        this.classname = 'TimeInterval';
    }

    static fromTimeInterval(timeInterval) {
        return new TimeInterval(Time.fromTime(timeInterval.startTime), Time.fromTime(timeInterval.endTime));
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

    getStartTime() {
        return this.startTime;
    }

}

class Time {

    constructor(hours, minutes) {
        this.hours = hours;
        this.minutes = minutes;
        this.negative = false;
        this.invalid = false;
    }

    static invalid() {
        let t = new Time(0, 0);
        t.invalid = true;
        return t;
    }

    static fromTime(time) {
        if(time == null) {
            return null;
        }
        return new Time(time.hours, time.minutes);
    }

    static fromMinutes(minutes) {
        if (minutes < 0) {
            return Time.invalid();
        }

        return new Time(Math.floor(minutes / 60), minutes % 60);
    }

    static fromMinutesAllowNegative(minutes) {
        if (minutes < 0) {
            minutes = -minutes;
            let time = new Time(Math.floor(minutes / 60), minutes % 60)
            time.negative = true;
            return time;
        }

        return new Time(Math.floor(minutes / 60), minutes % 60);
    }

    static fromMinutesGreaterThanZero(minutes) {
        if(minutes > 0) {
            return Time.fromMinutes(minutes);
        }

        return Time.invalid();
    }

    static fromString(string) {
        if(string == '') {
            return Time.invalid();
        }

        const seperated = string.split(":");
        return new Time(parseInt(seperated[0]), parseInt(seperated[1]));
    }

    isValidTimeOfDay() {
        if (this.hours < 0 || this.hours > 23) {
            return false;
        }

        if (this.minutes < 0 || this.minutes > 59) {
            return false;
        }

        return true;
    }

    perfromModulo() {
        this.hours = this.hours % 24;
    }

    toString() {
        if(this.invalid) {
            return "--:--";
        }

        let timeAsString = "";

        if (this.negative) {
            timeAsString = "- ";
        }

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
        let minutes = this.minutes + 60 * this.hours
        if (this.negative) minutes *= -1;
        return minutes;
    }

}



class TimeTableController {

    constructor(tableElement) {
        this.table = tableElement;
        this.tableEntries = [];
    }

    updateTable() {
        this.sortTable();

        let tableInnerHTML = `<thead>
                                <tr>
                                    <td scope="col"><div class="tableHeadline">Zeitintervall</div></td>
                                    <td scope="col"><div class="tableHeadline">Zeitdifferenz</div></td>
                                    <td scope="col"><div class="tableHeadline">Aktionen</div></td>
                                </tr>
                              </thead>
                              <tbody class="tableCell">`;

        if (this.tableEntries.length == 0) {
            tableInnerHTML += `<tr>
                                <th colspan="3" scope="row"><div class="tableCell">[Tabelle leer]</div></th>
                               </tr>`;
        }

        for (let i = 0; i < this.tableEntries.length; i++) {
            let tableEntry = this.tableEntries[i];

            let timeIntervalText = "";
            let timeDifferenceText = "";

            if (tableEntry instanceof TimeInterval) {
                timeIntervalText = tableEntry.toString();
                timeDifferenceText = tableEntry.getTimeDifference().toString();

            } else if (tableEntry instanceof TimeDifference) {
                timeDifferenceText = tableEntry.getTimeDifference().toString();

            } else if (tableEntry instanceof TimeStamp) {
                timeIntervalText = tableEntry.toString();
                timeDifferenceText = tableEntry.getTimeDifference().toString();
            }

            tableInnerHTML += `<tr>
                                <td scope="row"><div class="tableCell">${timeIntervalText}</div></td>
                                <td><div class="tableCell">${timeDifferenceText}</div></td>
                                <td><div class="tableCell"><button class="neumorphicButton_small" onClick="deleteFromTable(${i})">Löschen</button></div></td>
                               </tr>`;
        }

        tableInnerHTML += `</tbody>`;

        this.table.innerHTML = tableInnerHTML;
    }

    sortTable() {
        this.tableEntries.sort((a, b) => {
            if (a instanceof TimeDifference) {
                return -1;
            } else if (b instanceof TimeDifference) {
                return 1;
            }

            return a.getStartTime().asMinutes() - b.getStartTime().asMinutes();
        });
    }

    calcBreak() {
        let br = 0;
        let tempTime;
        let firstRun = true;

        for (let i = 0; i < this.tableEntries.length; i++) {
            let obj = this.tableEntries[i];
            let beg;
            let end;

            if (obj instanceof TimeInterval) {
                beg = obj.startTime;
                end = obj.endTime;
            } else if (obj instanceof TimeStamp) {
                if (!obj.isOpen()) {
                    beg = obj.timeInterval.startTime;
                    end = obj.timeInterval.endTime;
                } else {
                    if (i == this.tableEntries.length - 1) {
                        beg = obj.timeInterval.startTime;
                    } else {
                        return Time.invalid();
                    }
                }
            } else {
                continue;
            }

            if (firstRun) {
                tempTime = end;
                firstRun = false;
            } else {
                br += beg.asMinutes() - tempTime.asMinutes();
                tempTime = end;
            }
        }

        if(br < 0) {
            return Time.invalid();
        }

        return Time.fromMinutes(br);
    }

    remove(index) {
        this.tableEntries.splice(index, 1);
        updateUI();
    }

    timestamp() {

        for (let i = 0; i < this.tableEntries.length; i++) {
            let tableEntry = this.tableEntries[i];


            if (tableEntry instanceof TimeStamp && tableEntry.isOpen()) {
                tableEntry.close();
                updateUI();
                return;
            }

        }

        this.addTimeStamp(new TimeStamp());
    }

    isTimestampPresent() {
        for (let i = 0; i < this.tableEntries.length; i++) {
            let tableEntry = this.tableEntries[i];

            if (tableEntry instanceof TimeStamp && tableEntry.isOpen()) {
                return true;
            }
        }

        return false;
    }


    addTimeStamp(timeStamp) {
        this.tableEntries.push(timeStamp);
        updateUI();
    }

    addTimeInterval(timeInterval) {
        this.tableEntries.push(timeInterval);
        updateUI();
    }

    addTimeDifference(timeDifference) {
        this.tableEntries.push(timeDifference);
        updateUI();
    }

    combinedTime() {
        let combinedTime = 0;

        for (let i = 0; i < this.tableEntries.length; i++) {
            let tableEntry = this.tableEntries[i];

            combinedTime += tableEntry.getTimeDifference().asMinutes();
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
                                    <tr class="tableHeader">
                                        <th scope="col"><div class="tableHeadline">Summe der Arbeitszeit</div></th>
                                        <th scope="col"><div class="tableHeadline">restliche Arbeitszeit</div></th>
                                        <th scope="col"><div class="tableHeadline">neuer Zeitsaldo</div></th>
                                        <th scope="col"><div class="tableHeadline">Pause</div></th>
                                        <th scope="col"><div class="tableHeadline">nächster Zug</div></th>
                                    </tr>
                                </thead>
                                
                                <tbody class="tableCell">
                                    <tr>
                                        <th scope="row"><div class="tableCell">${getCombinedTime().toString()}</div></th>
                                        <th><div class="tableCell">${getRemainingTimeToWork().toString()}</div></th>
                                        <th><div class="tableCell">${getNextOvertime().toString()}</div></th>
                                        <th><div class="tableCell">${getBreakText()}</div></th>
                                        <th><div class="tableCell">${getTrainText()}</div></th>
                                    </tr>
                                </tbody>`;
    }
    //${getNextTrainTimeDifference().toString()})
    // ${getNextTrain().toString()} 
    // ${getLeaveTimeToCatchTrain().toString()}
    //<th><div class="tableCell">${getLeaveTimeToCatchTrain().toString()} → ${getNextTrain().toString()} (in ${getNextTrainTimeDifference().toString()})</div></th>
                                    
}