import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class HttpService {
  static singleton;
  serviceURL = 'mtg.synload.com';
  account = {
    username: '',
    password: ''
  };
  forceLogged = false;
  session = null;

  constructor(private http: HttpClient) {
    const accountString = localStorage.getItem('account');
    if (accountString) {
      this.account = JSON.parse(accountString);
      this.login();
    }
    HttpService.singleton = setInterval(() => {
      if (this.account) {
        if (this.session) {
          this.checkLogin();
        } else if (!this.forceLogged) {
          this.login();
          console.log('session lost, re-logging in');
        } else {
          console.log('force logged out, not re-logging in');
        }
      }
    }, 5000);
  }

  save() {
    localStorage.setItem('account', JSON.stringify(this.account));
  }

  getCardList(func) {
    this.forceLogged = false;
    this.save();
    const httpOptions = {
      headers: new HttpHeaders( {
        'Content-Type':  'application/json',
        'session': this.session
      })
    };
    this.http.post('https://' + this.serviceURL + '/cards/list', {}, httpOptions).subscribe(data => {
      func(data);
    }, error => {
      console.log(error);
    });
  }

  saveCardList(cards, func) {
    this.forceLogged = false;
    this.save();
    const httpOptions = {
      headers: new HttpHeaders( {
        'Content-Type':  'application/json',
        'session': this.session
      })
    };
    this.http.post('https://' + this.serviceURL + '/cards/save', JSON.stringify(cards), httpOptions).subscribe(data => {
      func(data);
    }, error => {
      console.log(error);
    });
  }

  login() {
    this.forceLogged = false;
    this.save();
    const httpOptions = {
      headers: new HttpHeaders( {
        'authorization': 'Basic ' + Buffer.from(this.account.username + ':' + this.account.password).toString('base64'),
        'Content-Type':  'application/json'
      })
    };
    this.http.post('https://' + this.serviceURL + '/authentication/login', {}, httpOptions).subscribe(data => {
      if (data && data['status'] === 'success') {
        this.session = data['session'];
      }
    }, error => {
      console.log(error);
    });
  }
  register() {
    this.forceLogged = false;
    this.save();
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'application/json');
    this.http
      .post(
        'https://' + this.serviceURL + '/authentication/register',
        '{"username":"' + this.account.username + '", "password": "' + this.account.password + '"}',
        { headers }
      )
      .subscribe(data => {
      if (data && data['status'] === 'success') {
        this.session = data['session'];
      }
    }, error => {
      console.log(error);
    });
  }
  logout() {
    this.forceLogged = true;
    const httpOptions = {
      headers: new HttpHeaders( {
        'Content-Type':  'application/json',
        'session': this.session
      })
    };
    this.http.post('https://' + this.serviceURL + '/auth/logout', {}, httpOptions).subscribe(data => {
      if (data && data['status'] === 'success') {
        this.session = null;
      }
    }, error => {
      console.log(error);
    });
  }
  checkLogin() {
    const httpOptions = {
      headers: new HttpHeaders( {
        'Content-Type':  'application/json',
        'session': this.session
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
        this.session = null;
      }
    }, error => {
      console.log(error);
    });
  }

}
