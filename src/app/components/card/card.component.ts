import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {StoredCardsService} from '../stored-cards.service';
import {CardIndexService} from '../card-index.service';
import {CardHistoryService} from '../card-history.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit, OnDestroy {

  constructor(
    private route: ActivatedRoute,
    private cardService: CardIndexService,
    private storedCards: StoredCardsService,
    private cardHistory: CardHistoryService) { }

  private sub: any;
  private set;
  private card;
  setData = null;
  cardData = null;
  localCardData = null;
  foil_value = 0;
  value = 0;
  direction = 0;
  direction_foil = 0;
  count = 0;
  foil_count = 0;
  manaCost = [];
  ngOnInit() {
    const self = this;
    this.sub = this.route.params.subscribe(params => {
      self.set = params['set'];
      self.card = params['card'];
      self.localCardData = self.storedCards.cards[self.set][self.card];
      self.foil_count = (!self.localCardData.foil_count) ? 0 : self.localCardData.foil_count;
      self.count = self.localCardData.count;
      self.value = self.storedCards.prices.current[self.set][self.card] * self.count;
      const history = self.storedCards.prices.history[self.set][self.card];

      let yesterday = 0;
      let today = 0;
      history.forEach((e, i) => {
        const day = new Date(e[1]);
        if (
          day.getDate() === self.cardHistory.today.getDate()
          && day.getMonth() === self.cardHistory.today.getMonth()
          && day.getFullYear() === self.cardHistory.today.getFullYear()) {
          today = e[0];
        }
        if (
          day.getDate() === self.cardHistory.yesterday.getDate()
          && day.getMonth() === self.cardHistory.yesterday.getMonth()
          && day.getFullYear() === self.cardHistory.yesterday.getFullYear()) {
          yesterday = e[0];
        }
      });
      this.direction = today - yesterday;
      if (self.storedCards.prices.history[self.set + '_foil']) {
        const history_foil = self.storedCards.prices.history[self.set + '_foil'][self.card];
        history_foil.forEach((e, i) => {
          const day = new Date(e[1]);
          if (
            day.getDate() === self.cardHistory.today.getDate()
            && day.getMonth() === self.cardHistory.today.getMonth()
            && day.getFullYear() === self.cardHistory.today.getFullYear()) {
            today = e[0];
          }
          if (
            day.getDate() === self.cardHistory.yesterday.getDate()
            && day.getMonth() === self.cardHistory.yesterday.getMonth()
            && day.getFullYear() === self.cardHistory.yesterday.getFullYear()) {
            yesterday = e[0];
          }
        });
        this.direction_foil = today - yesterday;
      }
      if (self.foil_count > 0 ) {
        if (self.storedCards.prices.current[self.set + '_foil']) {
          self.foil_value = self.storedCards.prices.current[self.set + '_foil'][self.card] * self.foil_count;
        } else {
          self.foil_value = self.storedCards.prices.current[self.set][self.card] * self.foil_count;
        }
      }
      const func = (data) => {
        self.setData = data;
        self.cardService.findCard(self.set, self.card, (cardData) => {
          self.cardData = cardData;
          if (self.cardData.oracle_text) {
            self.cardData.oracle_text = self.cardData.oracle_text.replace(new RegExp('\n', 'g'), '<br /><br />');
            self.cardData.oracle_text = self.cardData.oracle_text.replace(
              /\{(.*?)\}/g,
              '<abbr class="card-symbol card-symbol-$1 text-size"></abbr>'
            );
          }
          if (self.cardData.mana_cost) {
            const manaCost = self.cardData.mana_cost.match(/\{(.*?)\}/g);
            manaCost.forEach((cost) => {
              self.manaCost.push(cost[1]);
            });
          }
        });
      };
      if (self.cardService.setsCache[self.set]) {
        func(self.cardService.setsCache[self.set]);
      } else {
        self.cardService.findSet(self.set, func);
      }
    });
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
