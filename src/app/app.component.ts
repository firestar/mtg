import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from './app.config';
import {ElectronService} from 'ngx-electron';

import {CardIndexService} from './components/card-index.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public electronService: ElectronService, private cards: CardIndexService,
    private translate: TranslateService) {

    translate.setDefaultLang('en');
    console.log('AppConfig', AppConfig);

    if (electronService.isElectronApp) {
      console.log('Mode electron');
      console.log('Electron ipcRenderer', electronService.ipcRenderer);
        console.log(electronService);
    } else {
      console.log('Mode web');
    }
  }
}
