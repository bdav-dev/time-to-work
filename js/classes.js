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
                                <tr>
                                    <td scope="col"><div class="tableHeadline">Zeitintervall</div></td>
                                    <td scope="col"><div class="tableHeadline">Zeitdifferenz</div></td>
                                    <td scope="col"><div class="tableHeadline">Aktionen</div></td>
                                </tr>
                              </thead>
                              <tbody class="tableCell">`;

        if(this.tableEntries.length == 0) {
            tableInnerHTML += `<tr>
                                <th colspan="3" scope="row"><div class="tableCell">[Tabelle leer]</div></th>
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
                                <td scope="row"><div class="tableCell">${timeInvervalText}</div></td>
                                <td><div class="tableCell">${timeDifferenceText}</div></td>
                                <td><div class="tableCell"><button class="neumorphicButton_small" onClick="deleteFromTable(${i})">Löschen</button></div></td>
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
                                    <tr class="tableHeader">
                                        <th scope="col"><div class="tableHeadline">Summe der Arbeitszeit</div></th>
                                        <th scope="col"><div class="tableHeadline">restliche Arbeitszeit</div></th>
                                        <th scope="col"><div class="tableHeadline">Uhrzeit zum gehen</div></th>
                                        <th scope="col"><div class="tableHeadline">Aufbrechzeit um Zug zu erreichen</div></th>
                                        <th scope="col"><div class="tableHeadline">nächster Zug</div></th>
                                    </tr>
                                </thead>
                                
                                <tbody class="tableCell">
                                    <tr>
                                        <th scope="row"><div class="tableCell">${getCombinedTime().toString()}</div></th>
                                        <th><div class="tableCell">${getTimeToWork().toString()}</div></th>
                                        <th><div class="tableCell">${getLeaveTime().toString()}</div></th>
                                        <th><div class="tableCell">${getLeaveTimeToCatchTrain().toString()}</div></th>
                                        <th><div class="tableCell">${getNextTrain().toString()} <span>(in ${getNextTrainTimeDifference().toString()})</span> </div></th>
                                    </tr>
                                </tbody>`;                        
    }

}