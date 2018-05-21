import {AfterViewInit, Component, OnInit, OnDestroy} from '@angular/core';
import {StoredCardsService} from '../stored-cards.service';
import {CardIndexService} from '../card-index.service';
import {MatDialog} from '@angular/material';
import {DialogRemoveComponent} from '../dialog-remove-component/dialog-remove.component';
import {DialogAddComponent} from '../dialog-add/dialog-add.component';
import {CardHistoryService} from '../card-history.service';
import {HttpService} from '../http.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy, AfterViewInit  {

  constructor(
    private cardService: CardIndexService,
    private storedCards: StoredCardsService,
    public dialog: MatDialog,
    private httpService: HttpService,
    private cardHistory: CardHistoryService) { }


  pages = [];
  limit = 15;
  sets = [];
  cards = [];
  cardSets = {};
  count = 0;
  setInfo = {};
  sortingTypes = ['Id', 'Set', 'Name', 'Count', 'Price', 'Total', 'Change'];

  width = (wid) => {
    this.limit = Math.floor(wid / 220) * 3;
    this.pages = this.createRange(Math.ceil(this.cards.length / this.limit));
  }

  setPage(p) {
    this.storedCards.page = p;
  }
  createRange(len) {
    len = Math.round(len);
    const tmp = new Array();
    for (let i = 0; i < len; i++) {
      tmp.push(i);
    }
    return tmp;
  }
  imgError(event, card) {
      event.target.src = 'https://img.scryfall.com/cards/normal/en/' + card.set + '/' + card.card + 'a.jpg';
  }
  ngAfterViewInit() {
      this.pages = this.createRange(Math.ceil(this.cards.length / this.limit));
  }
  sort() {
    const self = this;
    if (self.storedCards.sortBy === 'Price') {
      self.cards.sort((a, b) => {
        const aVal = self.storedCards.prices.current[a.set][parseInt(a.card, 10)];
        const bVal = self.storedCards.prices.current[b.set][parseInt(b.card, 10)];
        return bVal - aVal;
      });
    } else if (self.storedCards.sortBy === 'Id') {
      self.cards.sort((a, b) => a.card - b.card);
    } else if (self.storedCards.sortBy === 'Set') {
      self.cards.sort((a, b) => {
        if (a.set > b.set ) {
          return 1;
        } else if (a.set < b.set ) {
          return -1;
        }
        return a.card - b.card;
      });
    } else if (self.storedCards.sortBy === 'Name') {
      self.cards.sort((a, b) => {
        if (a.name > b.name ) {
          return 1;
        } else if (a.name < b.name ) {
          return -1;
        }
        return 0;
      });
    } else if (self.storedCards.sortBy === 'Count') {
      self.cards.sort((a, b) => {
        let aTotal = a.count;
        let bTotal = b.count;
        if (b.foil_count) {
          bTotal += b.foil_count;
        }
        if (a.foil_count) {
          aTotal += a.foil_count;
        }
        return bTotal - aTotal;
      });
    } else if (self.storedCards.sortBy === 'Total') {
      self.cards.sort((a, b) => {
        const aPrice = this.storedCards.prices.current[a.set][a.card];
        const bPrice = this.storedCards.prices.current[b.set][b.card];
        let aTotal = a.count * this.storedCards.prices.current[a.set][a.card];
        let bTotal = b.count * this.storedCards.prices.current[b.set][b.card];
        if (b.foil_count) {
          let price = bPrice;
          if (this.storedCards.prices.current[b.set + '_foil'] && this.storedCards.prices.current[b.set + '_foil'][b.card]) {
            price = this.storedCards.prices.current[b.set + '_foil'][b.card];
          }
          bTotal += b.foil_count * price;
        }
        if (a.foil_count) {
          let price = aPrice;
          if (this.storedCards.prices.current[a.set + '_foil'] && this.storedCards.prices.current[a.set + '_foil'][a.card]) {
            price = this.storedCards.prices.current[a.set + '_foil'][a.card];
          }
          aTotal += a.foil_count * price;
        }
        return bTotal - aTotal;
      });
    } else if (self.storedCards.sortBy === 'Change') {
      self.cards.sort((a, b) => {
        return self.cardHistory.directionTodayDaysAgoCache(b, 2) - self.cardHistory.directionTodayDaysAgoCache(a, 2);
      });
    }
  }
  changedSet() {
    this.storedCards.page = 0;
    this.recalculateList();
  }
  remove(card, set) {
    this.dialog.open(DialogRemoveComponent, {
      backdropClass: 'dialog',
      data: { card: card, set: set }
    }).afterClosed().subscribe(() => {
      this.recalculateList();
      console.log('The dialog was closed');
    });
  }
  add(card, set) {
    this.dialog.open(DialogAddComponent, {
      backdropClass: 'dialog',
      data: { card: card, set: set }
    }).afterClosed().subscribe( () => {
      this.recalculateList();
      console.log('The dialog was closed');
    });
  }
  recalculateList() {
    this.cards = [];
    this.cardSets = {};
    this.count = 0;
    const self = this;
    let sets = [];
    if (this.storedCards.selectedSet === '*') {
      sets = Object.keys(this.storedCards.cards);
      self.setInfo = {
        name: 'All Sets'
      };
    } else {
      if (!self.cardService.setsCache[self.storedCards.selectedSet] ) {
        self.cardService.findSet(self.storedCards.selectedSet, data => {
          self.setInfo = data;
          self.cardService.setsCache[self.storedCards.selectedSet] = data;
        });
      } else {
        self.setInfo = self.cardService.setsCache[self.storedCards.selectedSet];
      }
      sets = [self.storedCards.selectedSet];
    }
    sets.sort();
    this.sets = Object.keys(this.storedCards.cards);
    this.sets.sort();
    sets.forEach(set => {
      if (set !== 'null') {
        const cards = Object.keys(this.storedCards.cards[set]);
        cards.forEach(card => {
          if (!this.cardSets[set]) {
            this.cardSets[set] = [];
          }
          if (self.storedCards.name !== '' && this.storedCards.cards[set][card].name) {
            if (this.storedCards.cards[set][card].name.toLowerCase().indexOf(self.storedCards.name) === -1) {
              return;
            }
          }
          this.storedCards.cards[set][card].set = set;
          this.storedCards.cards[set][card].card = card;
          const val = parseFloat(this.storedCards.cards[set][card].usd);
          this.count += this.storedCards.cards[set][card].count;
          if (this.storedCards.cards[set][card].foil_count) {
            this.count += this.storedCards.cards[set][card].foil_count;
          }
          this.storedCards.cards[set][card].value += this.storedCards.cards[set][card].count * val;
          if (this.storedCards.cards[set][card].foil_count) {
            this.storedCards.cards[set][card].value += this.storedCards.cards[set][card].foil_count * val;
          }
          self.cards.push(this.storedCards.cards[set][card]);
          this.cardSets[set].push(this.storedCards.cards[set][card]);
        });
      }
    });
    this.sort();
    this.pages = this.createRange(Math.ceil(this.cards.length / this.limit));
  }
  ngOnDestroy() {
    this.httpService.events.cardList = () => {};
  }
  ngOnInit() {
    this.recalculateList();
    this.httpService.events.cardList = () => {
      this.recalculateList();
    };
  }

}

