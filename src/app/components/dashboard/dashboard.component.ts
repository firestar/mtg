import {Component, OnDestroy, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {CardIndexService} from '../card-index.service';
import { StoredCardsService } from '../stored-cards.service';
import {MatTableDataSource, MatSort} from '@angular/material';
import {CardHistoryService} from '../card-history.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {


  @ViewChild(MatSort) sort: MatSort;


  singleTableData = new MatTableDataSource(this.cardHistory.single);
  displayedColumns = ['name', 'value', 'direction', 'change', 'set'];

  intervalFunc = null;

  colorScheme = {
    domain: []
  }

  constructor(private cardService: CardIndexService, private storedCards: StoredCardsService, private cardHistory: CardHistoryService) { }

  ngAfterViewInit() {
    this.singleTableData.sort = this.sort;
  }

  ngOnInit() {
    const self = this;
    const len = self.cardHistory.sets.length;
    const start = [153, 0, 0];
    const end = [0, 255, 0];
    const increment = [];
    increment[0] = (end[0] - start[0]) / len;
    increment[1] = (end[1] - start[1]) / len;
    increment[2] = (end[2] - start[2]) / len;
    for (let i = 0; i < len; i++) {
      const r = Math.round(start[0] + i * increment[0]), g = Math.round(start[1] + i * increment[1]), b = Math.round(start[2] + i * increment[2]);
      self.colorScheme.domain.push('rgba(' + r + ', ' + g + ', ' + b + ', 1)');
    }

    self.intervalFunc = setInterval(() => {
      self.cardHistory.single = [...self.cardHistory.single];
      if (self.cardHistory.historyChanged) {
        self.cardHistory.history.sort((a, b) => b.total - a.total);
        self.cardHistory.historyChanged = false;
        self.cardHistory.history = [...self.cardHistory.history];
      }
      self.cardHistory.single.sort( (a, b) => b.value - a.value );
      self.singleTableData = new MatTableDataSource(self.cardHistory.single);
      self.cardHistory.value = Math.round(self.cardHistory.value * 100) / 100;
    }, 200);
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
