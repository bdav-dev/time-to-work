# time-to-work 
 Work time dashboard / calculator

```Project language: German```


## Kurzbeschreibung
Halte mit dem Arbeitszeitdashboard "TimeToWork" deine Arbeitsstunden im Blick.

## TimeToWork starten
1. Lade das Repository herunter (als .zip Datei oder via `git clone`).
2. Starte die Applikation, in dem du die Datei `timeToWork.html` in deinem Browser öffnest.

## Benutzeroberfläche
![Time-To-Work-1-1-User-Interface](https://github.com/bdav-dev/time-to-work/assets/122749166/bfbf5ee2-f027-446d-bc32-57c95907499d)

## Features
### <ins>Neumorphic Design</ins>
TimeToWork hat eine schöne und moderne Benutzeroberfläche im Neumorphic-Stil.

### <ins>Light- und Dark-Mode</ins>
Du kannst zwischen Light- und Dark-Mode wechseln, in dem du den Button oben links anklickst.

### <ins>Zeiterfassung</ins>
Du kannst deine Arbeitszeit über 3 Wege erfassen:
1. **Zeiterfassung via Zeitstempel**<br/>
   Wenn du auf den Button "Zeitstempel erfassen" klickst, wird eine neuer Zeitstempel mit der aktuellen Zeit erstellt. Falls bereits ein offener Zeitstempel vorhanden ist, wird dieser mit der aktuellen Zeit geschlossen.

2. **Zeiterfassung via Eingabe eines Zeitintervalls**<br/>
   Du kannst ein Zeitintervall (duch Angabe von Start- und Endzeit) erstellen.

3. **Erstellen eines offenen Zeitstempels bei angegebener Startzeit**<br/>
   Falls du ein Zeitintervall ohne Endzeit angibst wird, statt eines Zeitintervalls, ein offener Zeitstempel mit deiner angegeben Zeit erstellt.

Deine erstellten Zeitintervalle bzw. Zeitstempel werden in einer Tabelle angezeit.<br/>
Dort siehst du auch den Zeitunterschied von jedem Zeitintervall / Zeitstempel.

### <ins>Arbeitszeitberechungen</ins>
Durch die Angabe von:
1. **Arbeitszeit**<br/>
   Hier kannst du eintragen, wie lange du am Tag arbeiten musst.
2. **Zeitsaldo (Überstunden)**<br/>
   Trage hier deinen Überstundenkontostand ein (Unterstunden werden auch unterstützt).
3. **Mindestpause**<br/>
   Hier kannst du die gesetzliche Mindestpause eintragen.

berechnet dir TimeToWork folgende Werte:

1. **Summe der Arbeitszeit**<br/>
   So lange hast du heute schon gearbeitet.
2. **restliche Arbeitszeit**<br/>
   Ein Blick auf dieses Feld verrät dir, wie viel du noch zu arbeiten hast.
3. **Arbeitsende**<br/>
   Dieses Feld zeigt dir an, wann du Feierabend hast. Dabei wird davon ausgeganen, dass du exakt die Zeit arbeitest, die du in dem Feld "Arbeitszeit" angegeben hast (keine Über- / Unterstunden). Es werden auch die Pausen (in Kombination mit der Mindestpause) miteinberechnet.
4. **neuer Zeitsaldo**<br/>
   Falls du jetzt deinen Arbeitsplatz verlassen solltest, zeigt dir dieses Feld an, wie dein Überstundenkonto dann aussehen würde.
5. **Summe der eingelegete Pausen**<br/>
   So lange hast du heute schon Pause gemacht.

### <ins>Zugberechungen</ins>
Wenn du mit dem Zug zur Arbeit kommst, kannst du bei Angabe von:
1. **Startzeitpunkt**<br/>
   Hier trägst du ein, was der Startzeitpunkt des Zugplans ist.<br/>
   Beispiel: Wenn der Zug z.B. jeden Tag um 14:04, 14:34, 15:04, ... abfährt, trägst du hier `00:04` ein.
2. **jede**<br/>
   Hier gibst du an, in welchem Intervall dein Zug regelmäßig kommt.<br/>
   Beispiel: Wenn der Zug z.B. jeden Tag um 14:04, 14:34, 15:04, ... abfährt, trägst du hier `00:30` ein.
3. **Wegzeit**<br/>
   In diesem Feld kannst du eintragen, wie lange du brauchst, um von deinem Arbeitsplatz zum Bahnhof zu gelangen.

folgendes sehen:

1. **Zeitpunkt zum Verlassen des Arbeitsplatzes**<br/>
   Hier siehst du, wann du deinen Arbeitsplatz verlassen musst, damit du den nächsten Zug pünklich erreichst.
2. **Abfahrt des nächsten Zugs**<br/>
   Dieses Feld zeigt dir an, wann der nächste Zug abfährt (und in wie vielen Minuten das ist).

### <ins>Speichern</ins>
Der gesamte Zustand der Applikation wird beim Schließen des Tabs (bei dir lokal via `localStorage`) gesichert. Dieser Zustand wird wiederherstellt, wenn du die Appliaktion wieder öffnest.<br/>
Wenn du aber die Applikation an einem neuen Tag öffnest, werden die Zeitstempel und Zeitintervalle vom Vortag nicht geladen und der am Vortag berechnete neue Zeitsaldo wird als aktueller Zeitsaldo übernommen.

## Änderungsprotokoll
### Version 1.1
- Informationen zum Projekt können über den Button "Info" oben rechts aufgerufen werden.
- Implementierung von Modals, die die standardmäßigen `alert()`-Aufrufe ersetzen.
- Feld "Arbeitsende" hinzugefügt, welches die Feierabendzeit anzeigt.
- Die Werte werden jetzt automatisch aktualisiert, wenn der Benutzer auf den Tab wechselt.
- Möglichkeit zum Hinzufügen von Zeitdifferenzen entfernt.
### Version 1.2
- "Laufzeit" wurde zu "Wegzeit" umbenannt.
- Button "Daten aktualisieren" entfernt, da jetzt automatisch die Benutzeroberfläche aktualisiert wird, wenn sich die Minute ändert.
- Diverse Anpassungen in der README.md Datei.