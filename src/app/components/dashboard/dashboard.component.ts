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
        self.setsData[set] = data;
        const tmp: Element = { name: self.setsData[set].name, set: set, value: 0 };
        const historyTmp = { name: self.setsData[set].name, series: [] }
        self.cards = Object.keys(self.storedCards.cards[set]);
        self.cards.forEach(card => {
          const val = self.storedCards.cards[set][card].count * parseFloat(self.storedCards.prices.current[set][card]);
          let history = self.storedCards.prices.history[set][card];
          for (let i = 9; i >= 0; i--) {
            try {
              const e = history[history.length - i - 1];
              if (!historyTmp.series[10 - i - 1]) {
                historyTmp.series[10 - i - 1] = { name: String(10 - i), value: 0 };
              }
              if (e) {
                historyTmp.series[10 - i - 1].value += parseFloat(e[0]);
              }
            } catch (ex) {}
          }
          self.value += val;
          tmp.value += val;
          if (self.storedCards.cards[set][card].foil_count) {
            try {
              const val_foil = (
                self.storedCards.cards[set][card].foil_count *
                parseFloat(self.storedCards.prices.current[set + '_foil'][card])
              );
              history = self.storedCards.prices.history[set + '_foil'][card];
              for (let i = 9; i >= 0; i--) {
                try {
                  const e = history[history.length - i - 1];
                  if (!historyTmp.series[10 - i - 1]) {
                    historyTmp.series[10 - i - 1] = { name: String(10 - i), value: 0 };
                  }
                  if (e) {
                    historyTmp.series[10 - i - 1].value += parseFloat(e[0]);
                  }
                } catch (ex) {}
              }
              self.value += val_foil;
              tmp.value += val_foil;
            } catch (e) {
              const val_foil = self.storedCards.cards[set][card].foil_count *
                parseFloat(self.storedCards.prices.current[set][card]);
              history = self.storedCards.prices.history[set][card];
              for (let i = 9; i >= 0; i--) {
                try {
                  const e = history[history.length - i - 1];
                  if (!historyTmp.series[10 - i - 1]) {
                    historyTmp.series[10 - i - 1] = {name: String(10 - i), value: 0};
                  }
                  if (e) {
                    historyTmp.series[10 - i - 1].value += parseFloat(e[0]);
                  }
                } catch (ex) {}
              }
              self.value += val_foil;
              tmp.value += val_foil;
            }
          }
        });
        self.historyTMP.push(historyTmp);
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
    this.calculateForSet( 0 );
    self.intervalFunc = setInterval(() => {
      self.single = [...self.single];
      if ( self.historyChanged) {
        self.historyChanged = false;
        self.history = [...self.historyTMP];
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
