import {Component, OnDestroy, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {CardIndexService} from '../card-index.service';
import { StoredCardsService } from '../stored-cards.service';
import {MatTableDataSource, MatSort} from '@angular/material';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  single: Element[] = [];
  sets = [];

  @ViewChild(MatSort) sort: MatSort;

  setsData = {};
  cards = [];
  singleTableData = new MatTableDataSource(this.single);
  displayedColumns = ['name', 'value', 'set'];
  value = 0.00;
  intervalFunc = null;

  constructor(private cardService: CardIndexService, private storedCards: StoredCardsService) { }

  ngAfterViewInit() {
    this.singleTableData.sort = this.sort;
  }

  ngOnInit() {
    const self = this;
    self.sets = Object.keys(this.storedCards.cards);
    self.sets.forEach(set => {
      if (set !== 'null') {
        self.cardService.findSet(set, (data) => {
          self.setsData[set] = data;
          const tmp: Element = { name: self.setsData[set].name, set: set, value: 0 };
          self.cards = Object.keys(this.storedCards.cards[set]);
          self.cards.forEach(card => {
            const val = this.storedCards.cards[set][card].count * parseFloat(this.storedCards.prices.current[set][card]);
            self.value += val;
            tmp.value += val;
            if (this.storedCards.cards[set][card].foil_count) {
              try {
                const val_foil = this.storedCards.cards[set][card].foil_count *
                  parseFloat(this.storedCards.prices.current[set + '_foil'][card]);
                self.value += val_foil;
                tmp.value += val_foil;
              } catch (e) {
                const val_foil = this.storedCards.cards[set][card].foil_count *
                  parseFloat(this.storedCards.prices.current[set][card]);
                self.value += val_foil;
                tmp.value += val_foil;
              }
            }
          });
          self.single.push(tmp);
        });
      }
    });
    self.intervalFunc = setInterval(() => {
      self.single = [...self.single];
      self.single.sort( (a, b) => b.value - a.value );
      self.singleTableData = new MatTableDataSource(self.single);
      self.value = Math.round(self.value * 100) / 100;
    }, 500);
  }
  ngOnDestroy() {
    clearInterval(this.intervalFunc);
  }
}
export interface Element {
  name: string;
  value: number;
  set: string;
}