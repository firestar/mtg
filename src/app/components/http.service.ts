import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {CardIndexService} from './card-index.service';
import {StoredCardsService} from './stored-cards.service';

@Injectable()
export class HttpService {
  static singleton;
  static account = {
    username: '',
    password: ''
  };
  static session = '';
  static forceLogged = false;
  static storedCardsService: StoredCardsService = null;

  serviceURL = 'mtg.synload.com';
  events = {
    cardList: () => {}
  };

  account() {
    return HttpService.account;
  }

  session() {
    return HttpService.session;
  }
  loggedIn() {
    if (HttpService.storedCardsService) {
      this.getCardList(data => {
        if (data) {
          if (data.status === 'success') {
            HttpService.storedCardsService.cards = data.data;
            this.events.cardList();
          }
        }
      });
    }
  }

  constructor(private http: HttpClient) {
    const accountString = localStorage.getItem('account');
    if (accountString) {
      HttpService.account = JSON.parse(accountString);
      this.login();
    }
    HttpService.singleton = setInterval(() => {
      if (HttpService.account) {
        if (HttpService.session) {
          this.checkLogin();
        } else if (!HttpService.forceLogged) {
          this.login();
          console.log('session lost, re-logging in');
        } else {
          console.log('force logged out, not re-logging in');
        }
      }
    }, 5000);
  }

  init(storedCardsService) {
    HttpService.storedCardsService = storedCardsService;
  }

  save() {
    localStorage.setItem('account', JSON.stringify(HttpService.account));
  }

  getCardList(func) {
    if (!HttpService.session) {
      return;
    }
    const httpOptions = {
      headers: new HttpHeaders( {
        'Content-Type':  'application/json',
        'session': HttpService.session
      })
    };
    this.http.post('https://' + this.serviceURL + '/cards/list', {}, httpOptions).subscribe(data => {
      func(data);
    }, error => {
      console.log(error);
    });
  }

  saveCardList(cards, func) {
    if (!HttpService.session) {
      return;
    }
    const httpOptions = {
      headers: new HttpHeaders( {
        'Content-Type':  'application/json',
        'session': HttpService.session
      })
    };
    this.http.post('https://' + this.serviceURL + '/cards/save', JSON.stringify(cards), httpOptions).subscribe(data => {
      func(data);
    }, error => {
      console.log(error);
    });
  }

  login() {
    const self = this;
    const httpOptions = {
      headers: new HttpHeaders( {
        'authorization': 'Basic ' + Buffer.from(HttpService.account.username + ':' + HttpService.account.password).toString('base64'),
        'Content-Type':  'application/json'
      })
    };
    self.http.post('https://' + self.serviceURL + '/authentication/login', {}, httpOptions).subscribe(data => {
      if (data && data['status'] === 'success') {
        HttpService.session = data['session'];
        self.loggedIn();
      }
    }, error => {
      console.log(error);
    });
  }
  register() {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    this.http
      .post(
        'https://' + this.serviceURL + '/authentication/register',
        '{"username":"' + HttpService.account.username + '", "password": "' + HttpService.account.password + '"}',
        { headers }
      )
      .subscribe(data => {
      if (data && data['status'] === 'success') {
        HttpService.session = data['session'];
      }
    }, error => {
      console.log(error);
    });
  }
  logout() {
    if (!HttpService.session) {
      return;
    }
    HttpService.forceLogged = true;
    const httpOptions = {
      headers: new HttpHeaders( {
        'Content-Type':  'application/json',
        'session': HttpService.session
      })
    };
    this.http.post('https://' + this.serviceURL + '/auth/logout', {}, httpOptions).subscribe(data => {
      if (data && data['status'] === 'success') {
        HttpService.session = null;
      }
    }, error => {
      console.log(error);
    });
  }
  checkLogin() {
    const httpOptions = {
      headers: new HttpHeaders( {
        'Content-Type':  'application/json',
        'session': HttpService.session
      })
    };
    this.http.post(
      'https://' + this.serviceURL + '/auth/loggedin',
      {},
      httpOptions
    )
    .subscribe(data => {
      if (data && data['status'] === 'success') {
        console.log('still logged in');
      } else {
        HttpService.session = null;
      }
    }, error => {
      console.log(error);
    });
  }

}
