import { Component, OnInit } from '@angular/core';
import {StoredCardsService} from '../stored-cards.service';

@Component({
  selector: 'app-output',
  templateUrl: './output.component.html',
  styleUrls: ['./output.component.scss']
})
export class OutputComponent implements OnInit {

  constructor(private storedCards: StoredCardsService) { }
  stored;
  totals;
  ngOnInit() {
      this.stored = JSON.stringify(this.storedCards.cards);
      this.totals = JSON.stringify(this.storedCards.totals);
  }

}
