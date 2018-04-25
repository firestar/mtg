import { Component, OnInit } from '@angular/core';
import {StoredCardsService} from '../stored-cards.service';
import {CardIndexService} from '../card-index.service';
import {EventEmitter} from '@angular/core';
import {MatTableDataSource} from '@angular/material';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {

  selectedSetId = null;
  selectedSet = null;
  added = 0;
  setDataList = null;
  setData = null;
  selectedCardId = null;
  selectedCard = null;
  backspaceCount = 0;
  enablePreview = false;
  addSourceTable: Element[]  = [];
  addSource: MatTableDataSource<Element>;
  displayedColumns = ['name', 'foil', 'remove'];

  public setFocusEmitter = new EventEmitter<boolean>();
  public cardFocusEmitter = new EventEmitter<boolean>();
  setCounter = 0;
  cardCounter = 0;
  checkSet(e) {
    this.setCounter++;
    const x = this.setCounter;
    const self = this;
    this.filterSort();
    setTimeout(() => {
      if (self.setCounter === x) {
        self.selectedSet = null;
        if (self.selectedSetId !== '') {
          self.cardService.findSet(self.selectedSetId, set => {
            self.selectedSet = set;
          });
        }
        if (e.key === 'Enter') {
            if (self.selectedSetId) {
                this.cardFocusEmitter.emit(true);
            }
        }
      }
    }, 200);
  }
  async checkCard(e) {
    const self = this;
    if (e.key === '+') {
      e.preventDefault();
      self.storedCards.addCardBySetAndId(self.selectedSetId, self.selectedCardId, true, (data) => {
        const el: Element = {set: data.set, id: data.id, foil: data.foil};
        this.addSourceTable.push(el);
        this.addSource = new MatTableDataSource( this.addSourceTable.slice(0).reverse() );
      });
      self.added++;
      self.selectedCardId = null;
      self.selectedCard = null;
      return;
    } else if (e.key === 'Enter') {
      self.storedCards.addCardBySetAndId(self.selectedSetId, self.selectedCardId, false, (data) => {
        const el: Element = {set: data.set, id: data.id, foil: data.foil};
        this.addSourceTable.push(el);
        this.addSource = new MatTableDataSource( this.addSourceTable.slice(0).reverse() );
      });
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
    if (self.enablePreview) {
      self.cardCounter++;
      const x = self.cardCounter;
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
  }

  remove(set, id, foil, index) {
    this.added--;
    const idx = this.addSourceTable.length - index - 1;
    this.addSourceTable.splice(idx, 1);
    this.addSource = new MatTableDataSource(this.addSourceTable.slice(0).reverse());
    const card = this.storedCards.cards[set][id];
    if (!foil) {
      if (card.count) {
        card.count--;
        if (card.count < 0) {
          card.count = 0;
        }
        if (!card.count && !card.foil_count) {
          delete this.storedCards.cards[card.set][card.card];
        }
      }
    } else {
      if (card.foil_count) {
        card.foil_count--;
        if (card.foil_count < 0) {
          card.foil_count = 0;
        }
        if (!card.count && !card.foil_count) {
          delete this.storedCards.cards[card.set][card.card];
        }
      }
    }
    this.storedCards.save();
  }

  constructor(private cardService: CardIndexService, private storedCards: StoredCardsService) {
    this.addSource = new MatTableDataSource(this.addSourceTable.slice(0).reverse());
    this.cardService.findSets((sets) => {
      this.setDataList = sets.data;
      this.filterSort();
    });
  }
  url(url) {
    return 'url(\'' + url + '\')';
  }

  filterSort() {
    const self = this;
    this.setData = this.setDataList.filter( set => {
      let doesMatch = true;
      if (self.selectedSetId) {
        doesMatch = false;
        if (set.code.indexOf(self.selectedSetId) !== -1) {
          doesMatch = true;
        }
        if (set.name.toLowerCase().indexOf(self.selectedSetId.toLowerCase()) !== -1) {
          doesMatch = true;
        }
      }
      return doesMatch;
    });
    this.setData.sort( (a, b) => {
      const aRelease = new Date(a.released_at);
      const bRelease = new Date(b.released_at);
      if (bRelease > aRelease) {
        return 1;
      } else if (bRelease < aRelease) {
        return -1;
      }
      return 0;
    });
  }

  ngOnInit() {
  }

}
export interface Element {
  id: number;
  set: number;
  foil: boolean;
}
