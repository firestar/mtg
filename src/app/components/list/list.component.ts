import {AfterViewInit, Component, OnChanges, OnInit} from '@angular/core';
import {StoredCardsService} from '../stored-cards.service';
import {CardIndexService} from '../card-index.service';
import {EventEmitter} from '@angular/core';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, AfterViewInit  {

  constructor(private cardService: CardIndexService, private storedCards: StoredCardsService) { }


  pages = [];
  limit = 15;
  sets = [];
  cards = [];
  cardSets = {};
  count = 0;
  setInfo = {};
  sortingTypes = ['id', 'name', 'set', 'price', 'count'];

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
    if (self.storedCards.sortBy === 'price') {
      self.cards.sort((a, b) => {
        const aVal = self.storedCards.prices.current[a.set][parseInt(a.card, 10)];
        const bVal = self.storedCards.prices.current[b.set][parseInt(b.card, 10)];
        return bVal - aVal;
      });
    } else if (self.storedCards.sortBy === 'id') {
      self.cards.sort((a, b) => a.card - b.card);
    } else if (self.storedCards.sortBy === 'set') {
      self.cards.sort((a, b) => {
        if (a.set > b.set ) {
          return 1;
        } else if (a.set < b.set ) {
          return -1;
        }
        return a.card - b.card;
      });
    } else if (self.storedCards.sortBy === 'name') {
      self.cards.sort((a, b) => {
        if (a.name > b.name ) {
          return 1;
        } else if (a.name < b.name ) {
          return -1;
        }
        return 0;
      });
    } else if (self.storedCards.sortBy === 'count') {
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
    }
  }
  changedSet() {
    this.storedCards.page = 0;
    this.recalculateList();
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
    sets.forEach(set => {
      if (set !== 'null') {
        const cards = Object.keys(this.storedCards.cards[set]);
        cards.forEach(card => {
          if (!this.cardSets[set]) {
            this.cardSets[set] = [];
            if (this.sets.indexOf(set) === -1) {
              this.sets.push(set);
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
  ngOnInit() {
    this.recalculateList();
  }

}
