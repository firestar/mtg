import {Component, OnInit, HostListener, AfterViewInit} from '@angular/core';
import {ElectronService} from 'ngx-electron';

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
  constructor(public _electronService: ElectronService) {
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
  ngOnInit() {}

}
