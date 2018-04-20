import {Component, OnDestroy, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {CardIndexService} from '../card-index.service';
import { StoredCardsService } from '../stored-cards.service';
import {MatTableDataSource, MatSort} from '@angular/material';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  single: Element[] = [];
  sets = [];

  @ViewChild(MatSort) sort: MatSort;

  history = [];
  historyTMP = [];
  setsData = {};
  cards = [];
  singleTableData = new MatTableDataSource(this.single);
  displayedColumns = ['name', 'value', 'set'];
  value = 0.00;
  intervalFunc = null;
  historyChanged = false;
  days = [];
  colorScheme = {
    domain: []
  }

  constructor(private cardService: CardIndexService, private storedCards: StoredCardsService) { }

  ngAfterViewInit() {
    this.singleTableData.sort = this.sort;
  }


  calculateForSet (setNum) {
    const self = this;
    if (self.sets.length <= setNum) {
      return;
    }
    const set = self.sets[setNum];
    if (set === 'null' || !set) {
      this.calculateForSet( setNum + 1 );
      return;
    }
    if (set !== 'null') {
      const setFunc = (data) => {
        const obj = {};
        const totals = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let totalIndex = 0;
        const already = [];
        self.setsData[set] = data;
        const tmp: Element = { name: self.setsData[set].name, set: set, value: 0 };
        const historyTmp = {
          name: self.setsData[set].name,
          series: [],
          total: 0
        };
        for (let j = 9; j >= 0; j--) {
          const d = new Date();
          d.setDate(d.getDate() - j);
          const dayString = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
          self.days.push(dayString);
          historyTmp.series[9 - j] = { name: dayString, value: 0};
        }
        self.cards = Object.keys(self.storedCards.cards[set]);
        self.cards.forEach(card => {
          const count = self.storedCards.cards[set][card].count;
          const val = count * parseFloat(self.storedCards.prices.current[set][card]);
          let history = self.storedCards.prices.history[set][card];
          for (let i = 9; i >= 0; i--) {
            try {
              const e = history[history.length - i - 1];
              const date = new Date(e[1]);
              const dayString = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
              const index = self.days.indexOf(dayString);
              if (!obj[index + '_' + card]) {
                historyTmp.series[index].value += count * parseFloat(e[0]);
                totals[index] += count * parseFloat(e[0]);
                if (index !== totalIndex && totals[totalIndex] < totals[index]) {
                  totalIndex = index;
                }
                obj[index + '_' + card] = true;
              }
            } catch (ex) {
            }
          }
          self.value += val;
          tmp.value += val;
          if (self.storedCards.cards[set][card].foil_count) {
            if (self.storedCards.prices.current[set + '_foil'] && self.storedCards.prices.current[set + '_foil'][card]) {
              const foil_count = self.storedCards.cards[set][card].foil_count;
              const val_foil = foil_count * parseFloat(self.storedCards.prices.current[set + '_foil'][card]);
              history = self.storedCards.prices.history[set + '_foil'][card];
              for (let i = 9; i >= 0; i--) {
                try {
                  const e = history[history.length - i - 1];
                  const date = new Date(e[1]);
                  const dayString = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
                  const index = self.days.indexOf(dayString);
                  if (!obj[index + '_foil_' + card]) {
                    historyTmp.series[index].value += foil_count * parseFloat(e[0]);
                    totals[index] += foil_count * parseFloat(e[0]);
                    if (index !== totalIndex && totals[totalIndex] < totals[index]) {
                      totalIndex = index;
                    }
                    obj[index + '_foil_' + card] = true;
                  }
                } catch (ex) {
                }
              }
              self.value += val_foil;
              tmp.value += val_foil;
            } else {
              const foil_count = self.storedCards.cards[set][card].foil_count;
              const val_foil = foil_count * parseFloat(self.storedCards.prices.current[set][card]);
              history = self.storedCards.prices.history[set][card];
              for (let i = 9; i >= 0; i--) {
                try {
                  const e = history[history.length - i - 1];
                  const date = new Date(e[1]);
                  const dayString = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
                  const index = self.days.indexOf(dayString);
                  if (!obj[index + '_' + card]) {
                    historyTmp.series[index].value += foil_count * parseFloat(e[0]);
                    totals[index] += foil_count * parseFloat(e[0]);
                    if (index !== totalIndex && totals[totalIndex] < totals[index]) {
                      totalIndex = index;
                    }
                    obj[index + '_' + card] = true;
                  }
                } catch (ex) {
                }
              }
              self.value += val_foil;
              tmp.value += val_foil;
            }
          }
        });
        historyTmp.total = totals[totalIndex];
        self.history.push(historyTmp);
        self.historyChanged = true;
        self.single.push(tmp);
        this.calculateForSet( setNum + 1 );
      };
      if (!self.cardService.setsCache[set]) {
        self.cardService.findSet( set, (data) => {
          self.cardService.setsCache[set] = data;
          setFunc(data);
        });
      } else {
        setFunc(self.cardService.setsCache[set]);
      }
    }
  }
  ngOnInit() {
    const self = this;

    self.historyTMP = [];
    self.sets = Object.keys(self.storedCards.cards);
    const len = self.sets.length;
    const start = [153, 0, 0];
    const end = [0, 255, 0];
    const increment = [];
    increment[0] = (end[0] - start[0]) / len;
    increment[1] = (end[1] - start[1]) / len;
    increment[2] = (end[2] - start[2]) / len;
    for (let i = 0; i < len; i++) {
      const r = Math.round(start[0] + i * increment[0]), g = Math.round(start[1] + i * increment[1]), b = Math.round(start[2] + i * increment[2]);
      self.colorScheme.domain.push('rgba(' + r + ', ' + g + ', ' + b + ', 1)');
    }
    console.log(self.colorScheme);
    this.calculateForSet( 0 );
    self.intervalFunc = setInterval(() => {
      self.single = [...self.single];
      if (self.historyChanged) {
        self.history.sort((a, b) => b.total - a.total);
        self.historyChanged = false;
        self.history = [...self.history];
      }
      self.single.sort( (a, b) => b.value - a.value );
      self.singleTableData = new MatTableDataSource(self.single);
      self.value = Math.round(self.value * 100) / 100;
    }, 200);
  }
  ngOnDestroy() {
    clearInterval(this.intervalFunc);
  }
}
export interface Element {
  name: string;
  value: number;
  set: string;
}
