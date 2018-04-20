import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ElectronService } from './providers/electron.service';

import { WebviewDirective } from './directives/webview.directive';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {NgxElectronModule} from 'ngx-electron';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import {CardIndexService} from './components/card-index.service';
import {StoredCardsService} from './components/stored-cards.service';
import { AddComponent } from './components/add/add.component';
import {MatInputModule} from '@angular/material/input';
import { FocusDirective } from './focus.directive';
import { ListComponent } from './components/list/list.component';
import { BindwidthDirective } from './bindwidth.directive';
import {MatSelectModule} from '@angular/material/select';
import { OutputComponent } from './components/output/output.component';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import { CardComponent } from './components/card/card.component';
import {MatChipsModule} from '@angular/material/chips';
import {CardHistoryService} from './components/card-history.service';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatRadioModule} from '@angular/material/radio';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    WebviewDirective,
    DashboardComponent,
    AddComponent,
    FocusDirective,
    ListComponent,
    BindwidthDirective,
    OutputComponent,
    CardComponent
  ],
  imports: [
    NgxChartsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSlideToggleModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatChipsModule,
    MatSelectModule,
    MatGridListModule,
    MatRadioModule,
    MatInputModule,
    FlexLayoutModule,
    MatButtonModule,
    FormsModule,
    MatFormFieldModule,
    NgxElectronModule,
    MatIconModule,
    HttpClientModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    })
  ],
  providers: [ElectronService, CardIndexService, StoredCardsService, CardHistoryService],
  bootstrap: [AppComponent]
})
export class AppModule { }
