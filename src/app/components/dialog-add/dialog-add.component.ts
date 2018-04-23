import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {CardIndexService} from '../card-index.service';
import {StoredCardsService} from '../stored-cards.service';

@Component({
  selector: 'app-dialog-add',
  templateUrl: './dialog-add.component.html',
  styleUrls: ['./dialog-add.component.scss']
})
export class DialogAddComponent implements OnInit {

  public card;

  constructor(
    private cardService: CardIndexService,
    private storedCards: StoredCardsService,
    public dialogRef: MatDialogRef<DialogAddComponent>, @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.card = storedCards.cards[data.set][data.card];
  }
  add() {
    if (!this.card.count) {
      this.card.count = 0;
    }
    this.card.count++;
    this.storedCards.save();
    this.dialogRef.close();
  }
  addFoil() {
    if (!this.card.foil_count) {
      this.card.foil_count = 0;
    }
    this.card.foil_count++;
    this.storedCards.save();
    this.dialogRef.close();
  }

  ngOnInit() {
  }

}
