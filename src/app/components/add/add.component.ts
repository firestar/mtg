import { Component, OnInit } from '@angular/core';
import {StoredCardsService} from '../stored-cards.service';
import {CardIndexService} from '../card-index.service';
import {EventEmitter} from '@angular/core';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {

  selectedSetId = null;
  selectedSet = null;
  added = 0;
  selectedCardId = null;
  selectedCard = null;
  backspaceCount = 0;

  public setFocusEmitter = new EventEmitter<boolean>();
  public cardFocusEmitter = new EventEmitter<boolean>();
  setCounter = 0;
  cardCounter = 0;
  checkSet(e) {
    this.setCounter++;
    const x = this.setCounter;
    const self = this;
    setTimeout(() => {
      if (self.setCounter === x) {
          console.log(self.storedCards);
          self.cardService.findSet(self.selectedSetId, set => {
              self.selectedSet = set;
          });
          if (e.key === 'Enter') {
              if (self.selectedSetId) {
                  this.cardFocusEmitter.emit(true);
              }
          }
      }
    }, 200);
  }
  checkCard(e) {
    const self = this;
    if (e.key === '+') {
        self.selectedCardId = self.selectedCardId.substr(0, self.selectedCardId.length - 1);
        self.storedCards.addCardBySetAndId(self.selectedSetId, self.selectedCardId, self.selectedCard, true);
        self.added++;
        self.selectedCardId = null;
        self.selectedCard = null;
        return;
    } else if (e.key === 'Enter') {
      self.storedCards.addCardBySetAndId(self.selectedSetId, self.selectedCardId, self.selectedCard, false);
      self.added++;
      self.selectedCardId = null;
      self.selectedCard = null;
      return;
    } else if (e.key === 'Backspace') {
      if (!self.selectedCardId) {
          if (self.backspaceCount === 1) {
              self.selectedSetId = null;
              self.selectedSet = null;
              this.setFocusEmitter.emit(true);
              self.backspaceCount = 0;
          } else {
              self.selectedCardId = null;
              self.selectedCard = null;
              self.backspaceCount++;
          }
          return;
      }
    }
    self.backspaceCount = 0;
    self.cardCounter++;
    const x = self.cardCounter;
    const self = this;
    setTimeout(() => {
        if (self.cardCounter === x) {
          if (/([0-9]+)/i.test(self.selectedCardId)) {
            self.cardService.findCard(self.selectedSetId, self.selectedCardId, card => {
              if (!card) {
                  self.selectedCard = null;
              } else {
                  self.selectedCard = card;
              }
            });
          }
        }
    }, 300);
  }

  constructor(private cardService: CardIndexService, private storedCards: StoredCardsService) { }

  ngOnInit() {
  }

}
