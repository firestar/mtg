import { Injectable }     from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class CardIndexService {

  constructor(private http: HttpClient) {
    if (!this.cache) {
      const apiCache = localStorage.getItem('apiCache');
      if (apiCache) {
        this.cache = JSON.parse(apiCache);
      } else {
        this.cache = {};
      }
    }
  }
  setsCache = {};
  cache = {};

  public async save() {
    localStorage.setItem('apiCache', JSON.stringify(this.cache));
  }
  public async findSet(set, func) {
    const self = this;
    const key = 'set_' + set;
    if (!self.cache[key]) {
      this.getJSON(set).subscribe(data => {
        setTimeout(() => {
          self.cache[key] = {data: data, date: new Date()};
          self.save();
          func(data);
        }, 100);
      }, error => {
        setTimeout(() => {
          func(null);
        }, 100);
      });
    } else {
      const date = new Date();
      date.setDate(date.getDate() - 30 / 60 / 24);
      if (self.cache[key].date < date) {
        delete self.cache[key];
        this.findSet(set, func);
      } else {
        func(self.cache[key].data);
      }
    }
  }
  public async findSets(func) {
    const self = this;
    const key = 'sets';
    if (!self.cache[key]) {
      this.getScryFallSets().subscribe(data => {
        setTimeout(() => {
          self.cache[key] = {data: data, date: new Date()};
          self.save();
          func(data);
        }, 100);
      }, error => {
        setTimeout(() => {
          func(null);
        }, 100);
      });
    } else {
      const date = new Date();
      date.setDate(date.getDate() - 5);
      if (self.cache[key].date < date) {
        delete self.cache[key];
        this.findSets(func);
      } else {
        func(self.cache[key].data);
      }
    }
  }
  public async findCard(set, id, func) {
    const self = this;
    const key = 'card_' + set + '_' + id;
    if (!self.cache[key]) {
      this.getScryFall(set, id).subscribe(data => {
        setTimeout(() => {
          self.cache[key] = {data: data, date: new Date()};
          self.save();
          func(data);
        }, 100);
      }, error => {
        setTimeout(() => {
          func(null);
        }, 100);
      });
    } else {
      const date = new Date();
      date.setDate(date.getDate() - 30 / 60 / 24);
      if (self.cache[key].date < date) {
        delete self.cache[key];
        this.findCard(set, id, func);
      } else {
        func(self.cache[key].data);
      }
    }
  }
  public async findCardMTGO(id, func) {
    const self = this;
    const key = 'mtgo_' + id;
    if (!self.cache[key]) {
      this.getScryFallMTGO(id).subscribe(data => {
        setTimeout(() => {
          self.cache[key] = {data: data, date: new Date()};
          self.save();
          func(data);
        }, 100);
      }, error => {
        setTimeout(() => {
          func(null);
        }, 100);
      });
    } else {
      const date = new Date();
      date.setDate(date.getDate() - 30 / 60 / 24);
      if (self.cache[key].date < date) {
        delete self.cache[key];
        this.findCardMTGO(id, func);
      } else {
        func(self.cache[key].data);
      }
    }
  }
  public getScryFall(set, id) {
    return this.http.get('https://api.scryfall.com/cards/' + set + '/' + id);
  }
  public getScryFallMTGO(id) {
    return this.http.get('https://api.scryfall.com/cards/mtgo/' + id);
  }
  public getScryFallSets() {
    return this.http.get('https://api.scryfall.com/sets');
  }
  public getJSON(set) {
    return this.http.get('https://api.scryfall.com/sets/' + set);
  }
}
