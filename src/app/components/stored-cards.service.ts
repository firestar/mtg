import { Injectable } from '@angular/core';
import {CardIndexService} from './card-index.service';
const fs = require('fs');

@Injectable()
export class StoredCardsService {
  cards = null;
  totals = null;
  prices = null;
  sortBy = 'Set';
  selectedSet = '*';
  page = 0;
  constructor(private cardIndex: CardIndexService) {
    fs.exists('backups/')
    fs.mkdir('backups/');
    fs.writeFile("/tmp/test", "Hey there!", function(err) {
      if(err) {
        return console.log(err);
      }

      console.log("The file was saved!");
    });
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
    if (!this.prices) {
        const prices = localStorage.getItem('prices');
        if (prices) {
            this.prices = JSON.parse(prices);
        } else {
            this.prices = {
                current: { },
                history: { }
            };
        }
    }
  }

  public save() {
    localStorage.setItem('cards', JSON.stringify(this.cards));
    localStorage.setItem('totals', JSON.stringify(this.totals));
    localStorage.setItem('prices', JSON.stringify(this.prices));
  }

  public getBySet(set) {
    this.cards[set];
  }

  public flatList (beforeTime, limit) {
    let counter = 0;
    const flatListArray = [];
    const self = this;
    const sets = Object.keys(self.cards);
    for (let i = 0; i < sets.length; i++) {
      if (sets[i] && sets[i] !== 'null') {
          const set = self.cards[sets[i]];
          const cardIds = Object.keys(set);
          for (let j = 0; j < cardIds.length; j++) {
              if (counter >= limit) {
                return flatListArray;
              }
              const card = set[cardIds[j]];
              const date = new Date(card.lastCheck);
              if (!card.lastCheck || date.getDate() !== beforeTime) {
                  card.set = sets[i];
                  card.card = cardIds[j];
                  flatListArray.push(card);
                  counter++;
              }
          }
      }
    }
    return flatListArray;
  }

  public setPrice (set, id, price) {
      if (!this.prices.history[set]) {
          this.prices.history[set] = {};
      }
      if (!this.prices.history[set][id]) {
          this.prices.history[set][id] = [];
      }
      this.prices.history[set][id].push([price, new Date()]);

      if (!this.prices.current[set]) {
          this.prices.current[set] = {};
      }
      this.prices.current[set][id] = price;
  }
  public addCardBySetAndId(set, id, foil, func) {
    if (!set || set === 'null' || !id || id === 'null') {
        return;
    }
    if (!this.cards[set]) {
        this.cards[set] = {};
    }
    const add = () => {
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
      func({set: set, id: id, foil: foil});
    }
    if (!this.cards[set][id]) {
      this.cardIndex.findCard( set, id, (card) => {
        this.setPrice(set, id, card.usd);
        this.cards[set][id] = {
          count: 0,
          name: card.name,
          foil_count: 0,
          multiverse_ids: card.multiverse_ids,
          mtgo_id: card.mtgo_id,
          img: 'https://img.scryfall.com/cards/png/en/' + set + '/' + id + '.png'
        };
        add();
      });
    } else {
      add();
    }
  }

  public getBySetAndId(set, id) {
      this.cards[set][id];
  }
}
