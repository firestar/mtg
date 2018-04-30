import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class HttpService {
  serviceURL = 'localhost:3000';
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
      setInterval(() => {
        if (this.session) {
          this.checkLogin();
        } else if (!this.forceLogged) {
          this.login();
          console.log('session lost, re-logging in');
        } else {
          console.log('force logged out, not re-logging in');
        }
      }, 5000);
    }
  }

  save() {
    localStorage.setItem('account', JSON.stringify(this.account));
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
    this.http.post('http://' + this.serviceURL + '/authentication/login', {}, httpOptions).subscribe(data => {
      if (data.status === 'success') {
        this.session = data.session;
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
    this.http.post('http://' + this.serviceURL + '/auth/logout', {}, httpOptions).subscribe(data => {
      if (data.status === 'success') {
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
    this.http.post('http://' + this.serviceURL + '/auth/loggedin', {}, httpOptions).subscribe(data => {
      if (data.status === 'success') {
        console.log('still logged in');
      } else {
        this.session = null;
      }
    }, error => {
      console.log(error);
    });
  }

}
