import {AfterViewInit, Component, OnInit} from '@angular/core';
import {StoredCardsService} from '../stored-cards.service';
import {CardIndexService} from '../card-index.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, AfterViewInit  {

  constructor(private cardService: CardIndexService, private storedCards: StoredCardsService) { }

  page = 0;
  pages = [];
  limit = 15;
  sets = [];
  cards = [];
  cardSets = {};
  count = 0;
  selectedSet = '*';
  setInfo = {};

  width = (wid) => {
    this.limit = Math.floor(wid / 220) * 3;
    this.pages = this.createRange(Math.ceil(this.cards.length / this.limit));
  };

  setPage(p) {
    this.page = p;
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
  recalculateList() {
      this.cards = [];
      this.cardSets = {};
      this.count = 0;
      const self = this;
      let sets = [];
      if (this.selectedSet === '*') {
          sets = Object.keys(this.storedCards.cards);
          self.setInfo = {
              name: 'All Sets'
          };
      } else {
          this.cardService.findSet(this.selectedSet, data => {
              self.setInfo = data;
              console.log(data);
          });
          sets = [this.selectedSet];
      }
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
      this.pages = this.createRange(Math.ceil(this.cards.length / this.limit));
  }
  ngOnInit() {
    this.recalculateList();
  }

}
