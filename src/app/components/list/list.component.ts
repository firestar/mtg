import { Component, OnInit } from '@angular/core';
import {StoredCardsService} from '../stored-cards.service';
import {CardIndexService} from '../card-index.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  constructor(private cardService: CardIndexService, private storedCards: StoredCardsService) { }
  value;
  cards = [];
  page = 0;
  pages = [];
  cardSets = {};

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
  ngOnInit() {
      const self = this;
      const sets = Object.keys(this.storedCards.cards);
      sets.forEach(set => {
          if (set !== 'null') {
              const cards = Object.keys(this.storedCards.cards[set]);
              cards.forEach(card => {
                  self.cards.push(this.storedCards.cards[set][card]);
                  this.storedCards.cards[set][card].set = set;
                  this.storedCards.cards[set][card].card = card;
                  self.value += this.storedCards.cards[set][card].count * parseFloat(this.storedCards.cards[set][card].usd);
                  self.value += this.storedCards.cards[set][card].foil_count * parseFloat(this.storedCards.cards[set][card].usd);
              });
          }
      });
      self.pages = self.createRange(self.cards.length / 15);
  }

}
