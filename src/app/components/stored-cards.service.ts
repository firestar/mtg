import { Injectable } from '@angular/core';

@Injectable()
export class StoredCardsService {
  cards = null;
  totals = null;
  constructor() {
    if (!this.cards) {
      const cards = localStorage.getItem('cards');
      if (cards) {
          this.cards = JSON.parse(cards);
      } else {
          this.cards = {};
      }
    }
    if (!this.totals) {
      const totals = localStorage.getItem('totals');
      if (totals) {
        this.totals = JSON.parse(totals);
      } else {
        this.totals = {
            'cards': 0,
            'sets': {}
        };
      }
    }
  }

  public save() {
    localStorage.setItem('cards', JSON.stringify(this.cards));
    localStorage.setItem('totals', JSON.stringify(this.totals));
  }

  public getBySet(set) {
    this.cards[set];
  }

  public addCardBySetAndId(set, id, card, foil) {
    if (!this.cards[set]) {
        this.cards[set] = {};
    }
    if (!this.cards[set][id]) {
        this.cards[set][id] = {
          count: 0,
          foil_count: 0,
          multiverse_ids: card.multiverse_ids,
          mtgo_id: card.mtgo_id,
          usd: card.usd,
          img: 'https://img.scryfall.com/cards/png/en/' + set + '/' + id + '.png'
        };
    }
    if (!this.totals.sets[set]) {
        this.totals.sets[set] = 0;
    }
    if (foil) {
      this.cards[set][id].foil_count++;
    } else {
      this.cards[set][id].count++;
    }
    console.log(this.cards);
    this.totals.sets[set]++;
    this.totals.cards++;
    this.save();
  }

  public getBySetAndId(set, id) {
      this.cards[set][id];
  }
}
