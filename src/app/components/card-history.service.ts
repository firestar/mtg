import { Injectable } from '@angular/core';
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
  daysAgo = {};
  yesterday;
  directionCache = {};
  constructor (private cardService: CardIndexService, private storedCards: StoredCardsService) {
    this.today = new Date();
    for (let i = 0; i < 20; i ++) {
      this.daysAgo[i] = new Date();
      this.daysAgo[i].setDate(this.today.getDate() - i);
    }
    this.yesterday = this.daysAgo[1];
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
    this.directionCache = {};
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
          let val = 0;
          if (self.storedCards.prices.current[set][card]) {
            val = count * parseFloat(self.storedCards.prices.current[set][card]);
          }
          let history = self.storedCards.prices.history[set][card];
          if (history) {
            for (let i = 9; i >= 0; i--) {
              try {
                const e = history[history.length - i - 1];
                const date = new Date(e[1]);
                const dayString = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
                const index = self.days.indexOf(dayString);
                if (!obj[index + '_' + card]) {
                  let g = 0;
                  if (e[0]) {
                    g = parseFloat(e[0]);
                  }
                  historyTmp.series[index].value += count * g;
                  totals[index] += count * parseFloat(e[0]);
                  if (index !== totalIndex && totals[totalIndex] < totals[index]) {
                    totalIndex = index;
                  }
                  obj[index + '_' + card] = true;
                }
              } catch (ex) {
              }
            }
          }
          self.value += val;
          tmp.value += val;
          if (self.storedCards.cards[set][card].foil_count) {
            if (self.storedCards.prices.current[set + '_foil'] && self.storedCards.prices.current[set + '_foil'][card]) {
              const foil_count = self.storedCards.cards[set][card].foil_count;
              let val_foil = 0;
              if (self.storedCards.prices.current[set + '_foil'][card]) {
                val_foil = foil_count * parseFloat(self.storedCards.prices.current[set + '_foil'][card]);
              }
              history = self.storedCards.prices.history[set + '_foil'][card];
              if (history) {
                for (let i = 9; i >= 0; i--) {
                  try {
                    const e = history[history.length - i - 1];
                    const date = new Date(e[1]);
                    const dayString = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
                    const index = self.days.indexOf(dayString);
                    if (!obj[index + '_foil_' + card]) {
                      let g = 0;
                      if (e[0]) {
                        g = parseFloat(e[0]);
                      }
                      historyTmp.series[index].value += foil_count * g;
                      totals[index] += foil_count * parseFloat(e[0]);
                      if (index !== totalIndex && totals[totalIndex] < totals[index]) {
                        totalIndex = index;
                      }
                      obj[index + '_foil_' + card] = true;
                    }
                  } catch (ex) {
                  }
                }
              }
              self.value += val_foil;
              tmp.value += val_foil;
            } else {
              if (self.storedCards.cards[set]) {
                const foil_count = self.storedCards.cards[set][card].foil_count;
                let val_foil = 0;
                if (self.storedCards.prices.current[set][card]) {
                  val_foil = foil_count * parseFloat(self.storedCards.prices.current[set][card]);
                }
                history = self.storedCards.prices.history[set][card];
                if (history) {
                  for (let i = 9; i >= 0; i--) {
                    try {
                      const e = history[history.length - i - 1];
                      const date = new Date(e[1]);
                      const dayString = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
                      const index = self.days.indexOf(dayString);
                      if (!obj[index + '_' + card]) {
                        let g = 0;
                        if (e[0]) {
                          g = parseFloat(e[0]);
                        }
                        historyTmp.series[index].value += foil_count * g;
                        totals[index] += foil_count * parseFloat(e[0]);
                        if (index !== totalIndex && totals[totalIndex] < totals[index]) {
                          totalIndex = index;
                        }
                        obj[index + '_' + card] = true;
                      }
                    } catch (ex) {
                    }
                  }
                }
                self.value += val_foil;
                tmp.value += val_foil;
              }
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
  directionTodayDaysAgoCache(card, ago) {
    let priceChange = 0;
    const cacheKey =  'todayDaysAgo_' + card.set + '_' + card.card + '_' + ago;
    if (this.directionCache[cacheKey]) {
      priceChange = this.directionCache[cacheKey];
    } else {
      priceChange = this.directionTodayDaysAgo(card, ago);
      this.directionCache[cacheKey] = priceChange;
    }
    return priceChange;
  }
  directionForDays(card, days) {
    let priceChange = 0;
    const cacheKey = card.set + '_' + card.card + '_' + days;
    if (this.directionCache[cacheKey]) {
      priceChange = this.directionCache[cacheKey];
    } else {
      for (let i = 1; i < days; i++) {
        priceChange += this.directionDaysAgo(card, i - 1, i);
      }
      this.directionCache[cacheKey] = priceChange;
    }
    return priceChange;
  }
  directionDaysAgo(card, start, end) {
    const self = this;
    const history = self.storedCards.prices.history[card.set][card.card];
    let startPrice = 0;
    let endPrice = 0;
    history.forEach((e) => {
      const day = new Date(e[1]);
      if (
        day.getDate() === self.daysAgo[start].getDate()
        && day.getMonth() === self.daysAgo[start].getMonth()
        && day.getFullYear() === self.daysAgo[start].getFullYear()) {
        startPrice = e[0];
      }
      if (
        day.getDate() === self.daysAgo[end].getDate()
        && day.getMonth() === self.daysAgo[end].getMonth()
        && day.getFullYear() === self.daysAgo[end].getFullYear()) {
        endPrice = e[0];
      }
    });
    return startPrice - endPrice;
  }
  directionTodayDaysAgo(card, ago) {
    const self = this;
    const history = self.storedCards.prices.history[card.set][card.card];
    let daysAgo = 0;
    let today = 0;
    history.forEach((e) => {
      const day = new Date(e[1]);
      if (
        day.getDate() === self.today.getDate()
        && day.getMonth() === self.today.getMonth()
        && day.getFullYear() === self.today.getFullYear()) {
        today = e[0];
      }
      if (
        day.getDate() === self.daysAgo[ago].getDate()
        && day.getMonth() === self.daysAgo[ago].getMonth()
        && day.getFullYear() === self.daysAgo[ago].getFullYear()) {
        daysAgo = e[0];
      }
    });
    return today - daysAgo;
  }
  directionTodayToYesterday(card) {
    const self = this;
    const history = self.storedCards.prices.history[card.set][card.card];
    let yesterday = 0;
    let today = 0;
    history.forEach((e) => {
      const day = new Date(e[1]);
      if (
        day.getDate() === self.today.getDate()
        && day.getMonth() === self.today.getMonth()
        && day.getFullYear() === self.today.getFullYear()) {
        today = e[0];
      }
      if (
        day.getDate() === self.yesterday.getDate()
        && day.getMonth() === self.yesterday.getMonth()
        && day.getFullYear() === self.yesterday.getFullYear()) {
        yesterday = e[0];
      }
    });
    return today - yesterday;
  }
}
export interface Element {
  name: string;
  value: number;
  set: string;
}
