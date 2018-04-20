import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {StoredCardsService} from '../stored-cards.service';
import {CardIndexService} from '../card-index.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute, private cardService: CardIndexService, private storedCards: StoredCardsService) { }
  private sub: any;
  private set;
  private card;
  setData = null;
  cardData = null;
  localCardData = null;
  foil_value = 0;
  value = 0;
  count = 0;
  foil_count = 0;
  ngOnInit() {
    const self = this;
    this.sub = this.route.params.subscribe(params => {
      self.set = params['set'];
      self.card = params['card'];
      self.localCardData = self.storedCards.cards[self.set][self.card];
      self.foil_count = (!self.localCardData.foil_count) ? 0 : self.localCardData.foil_count;
      self.count = self.localCardData.count;
      self.value = self.storedCards.prices.current[self.set][self.card] * self.count;
      if (self.foil_count > 0 ) {
        if (self.storedCards.prices.current[self.set + '_foil']) {
          self.foil_value = self.storedCards.prices.current[self.set + '_foil'][self.card] * self.foil_count;
        } else {
          self.foil_value = self.storedCards.prices.current[self.set][self.card] * self.foil_count;
        }
      }
      const func = (data) => {
        self.setData = data;
        self.cardService.findCard(self.set, self.card, (cardData) => self.cardData = cardData);
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
