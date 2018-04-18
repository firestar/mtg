import {Component, OnInit, HostListener, AfterViewInit} from '@angular/core';
import {ElectronService} from 'ngx-electron';
import { Observable } from 'rxjs/Rx';
import {HttpClient} from '@angular/common/http';
import {StoredCardsService} from '../stored-cards.service';
import {CardIndexService} from '../card-index.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  electronService;
  win;
  screen;
  isMax;
  constructor(public _electronService: ElectronService, private http: HttpClient, private cardService: CardIndexService, private storedCards: StoredCardsService) {
    this.electronService = _electronService;
    this.win = this._electronService.remote.getCurrentWindow();
    this.screen =  this._electronService.screen.getPrimaryDisplay();
  }

  @HostListener('window:resize', ['$event.target'])
  onResize() {
    console.log('before', this.isMax);
    this.isMax = this.win.isMaximized();
    console.log('after', this.isMax);
  }

  max() {
    this.win.maximize();
  }
  unmax() {
    this.win.unmaximize();
  }
  min() {
    this.win.minimize();
  }
  close() {
    this.win.close();
  }

  ngAfterViewInit() {
    console.log('before', this.isMax);
    this.isMax = this.win.isMaximized();
    console.log('after', this.isMax);
  }
  next (cards, startingId) {
      if (cards.length <= startingId) {
        return;
      }
      const self = this;
      const card = cards[startingId];
      if (!card.mtgo_id) {
          this.cardService.findCard(card.set, card.card, (standard_data) => {
            cards[startingId].mtgo_id = standard_data.mtgo_id;
            self.storedCards.save();
            self.next(cards, startingId);
          });
      } else {
        this.cardService.findCardMTGO(card.mtgo_id, (standard_data) => {
          if (!card.name) {
            card.name = standard_data.name;
          }
          if (!card.type) {
            card.type = standard_data.type_line;
          }
          if (!card.flavor_text) {
            card.flavor_text = standard_data.flavor_text;
          }
          self.storedCards.setPrice(card.set, card.card, standard_data.usd);
          if (card.set === 'rix') {
            console.log(standard_data.mtgo_foil_id);
          }
          if (standard_data.mtgo_foil_id) {
            this.cardService.findCardMTGO(standard_data.mtgo_foil_id, (foil_data) => {
              if (card.set === 'rix') {
                console.log(foil_data);
              }
              self.storedCards.setPrice(card.set + '_foil', card.card, foil_data.usd);
              card.lastCheck = new Date();
              self.storedCards.save();
              self.next(cards, startingId + 1);
            });
          } else {
            card.lastCheck = new Date();
            self.storedCards.save();
            self.next(cards, startingId + 1);
          }
        });
      }
  }

  ngOnInit() {
    const self = this;
    Observable.interval(60 * 60 * 1000).subscribe(() => {
      console.log('updating card data');
      const s = new Date();
      s.setDate(s.getDate() - 1);
      const cards = self.storedCards.flatList(s, 25);
      if (cards) {
          console.log(cards);
          console.log(cards.length);
          self.next (cards, 0);
      }
    });
  }

}
