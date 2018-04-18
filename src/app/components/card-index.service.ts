import { Injectable }     from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class CardIndexService {

  constructor(private http: HttpClient) {
  }
  setsCache = {};
  public async findSet(set, func) {
    this.getJSON(set).subscribe(data => {
      setTimeout(() => {
        func(data);
      }, 100);
    }, error => {
      setTimeout(() => {
        func(null);
      }, 100);
    });
  }
  public async findCard(set, id, func) {
    this.getScryFall(set, id).subscribe(data => {
      setTimeout(() => {
        func(data);
      }, 100);
    }, error => {
      setTimeout(() => {
        func(null);
      }, 100);
    });
  }
  public async findCardMTGO(id, func) {
      this.getScryFallMTGO(id).subscribe(data => {
        setTimeout(() => {
          func(data);
        }, 100);
      }, error => {
        setTimeout(() => {
          func(null);
        }, 100);
      });
  }
  public getScryFall(set, id) {
      return this.http.get('https://api.scryfall.com/cards/' + set + '/' + id);
  }
  public getScryFallMTGO(id) {
      return this.http.get('https://api.scryfall.com/cards/mtgo/' + id);
  }

  public getJSON(set) {
    return this.http.get('https://api.scryfall.com/sets/' + set);
  }
}
