import { Injectable } from '@angular/core';
import {Element} from './dashboard/dashboard.component';
import {CardIndexService} from './card-index.service';
import {StoredCardsService} from './stored-cards.service';

@Injectable()
export class CardHistoryService {
  single: Element[] = [];
  sets = [];
  history = [];
  historyTMP = [];
  setsData = {};
  cards = [];
  value = 0.00;
  historyChanged = false;
  days = [];
  direction = {};
  intervalFunc = null;
  today;
  yesterday;
  constructor (private cardService: CardIndexService, private storedCards: StoredCardsService) {
    this.today = new Date();
    this.yesterday = new Date();
    this.yesterday.setDate(this.yesterday.getDate() - 1);
    this.reset();
    this.intervalFunc = setInterval(() => {
      this.reset();
    }, 25 * 60 * 1000);
  }
  reset () {
    this.single = [];
    this.history = [];
    this.sets = Object.keys(this.storedCards.cards);
    this.historyTMP = [];
    this.setsData = {};
    this.cards = [];
    this.value = 0.00;
    this.historyChanged = false;
    this.days = [];
    this.direction = {};
    this.calculateForSet( 0 );
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

        self.today = new Date();
        const dayStringToday = self.today.getFullYear() + '-' + self.today.getMonth() + '-' + self.today.getDate();
        const indexToday = self.days.indexOf(dayStringToday);

        self.yesterday = new Date();
        self.yesterday.setDate(self.yesterday.getDate() - 1);
        const dayStringYesterday = self.yesterday.getFullYear() + '-' + self.yesterday.getMonth() + '-' + self.yesterday.getDate();
        const indexYesterday = self.days.indexOf(dayStringYesterday);
        self.direction[set] = historyTmp.series[indexToday].value - historyTmp.series[indexYesterday].value;
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

}
export interface Element {
  name: string;
  value: number;
  set: string;
}
