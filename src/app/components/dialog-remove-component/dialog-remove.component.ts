import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {CardIndexService} from '../card-index.service';
import {StoredCardsService} from '../stored-cards.service';

@Component({
  selector: 'app-dialog-remove',
  templateUrl: './dialog-remove.component.html',
  styleUrls: ['./dialog-remove.component.scss']
})
export class DialogRemoveComponent implements OnInit {
  public card;
  constructor(
    private cardService: CardIndexService,
    private storedCards: StoredCardsService,
    public dialogRef: MatDialogRef<DialogRemoveComponent>, @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.card = storedCards.cards[data.set][data.card];
  }
  remove() {
    if (this.card.count) {
      this.card.count--;
      if (this.card.count < 0) {
        this.card.count = 0;
      }
      if (this.card.count === 0 && !this.card.foil_count) {
        delete this.storedCards.cards[this.data.set][this.data.card];
      }
    }

    this.storedCards.save();
    this.dialogRef.close();
  }
  removeFoil() {
    if (this.card.foil_count) {
      this.card.foil_count--;
      if (this.card.foil_count < 0) {
        this.card.foil_count = 0;
      }
      if (this.card.count === 0 && !this.card.foil_count) {
        delete this.storedCards.cards[this.data.set][this.data.card];
      }
    }
    this.storedCards.save();
    this.dialogRef.close();
  }

  ngOnInit() {
  }
}
