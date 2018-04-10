import { Component, OnInit } from '@angular/core';
import {CardIndexService} from '../card-index.service';
import { StoredCardsService } from '../stored-cards.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(private cardService: CardIndexService, private storedCards: StoredCardsService) { }
  value = 0.00;
  ngOnInit() {
      const self = this;
      const sets = Object.keys(this.storedCards.cards);
      sets.forEach(set => {
        if (set !== 'null') {
            const cards = Object.keys(this.storedCards.cards[set]);
            cards.forEach(card => {
                self.value += this.storedCards.cards[set][card].count * parseFloat(this.storedCards.cards[set][card].usd);
                if (this.storedCards.cards[set][card].foil_count) {
                    self.value += this.storedCards.cards[set][card].foil_count * parseFloat(this.storedCards.cards[set][card].usd);
                }
            });
        }
      });
  }

}
