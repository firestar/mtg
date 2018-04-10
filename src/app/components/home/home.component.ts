import { Component, OnInit } from '@angular/core';
import {ElectronService} from 'ngx-electron';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  electronService;
  constructor(public _electronService: ElectronService) {
    this.electronService = _electronService;
  }

  max() {
      console.log(this._electronService.remote.getCurrentWindow().maximize());
  }
  res() {
      console.log(this._electronService.remote.getCurrentWindow().restore());
  }
  min() {
      console.log(this._electronService.remote.getCurrentWindow().minimize());
  }
  close() {
      console.log(this._electronService.remote.getCurrentWindow().close());
  }
  ngOnInit() {
  }

}
