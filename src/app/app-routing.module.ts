import { HomeComponent } from './components/home/home.component';
import { AddComponent } from './components/add/add.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ListComponent} from './components/list/list.component';
import {OutputComponent} from './components/output/output.component';
import {CardComponent} from './components/card/card.component';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        children: [
            {
                path: '',
                component: DashboardComponent
            },
            {
                path: 'add',
                component: AddComponent
            },
            {
                path: 'dashboard',
                component: DashboardComponent
            },
            {
                path: 'list',
                component: ListComponent
            },
            {
                path: 'output',
                component: OutputComponent
            }
          ,
          {
            path: 'card/:set/:card',
            component: CardComponent
          }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule]
})
export class AppRoutingModule { }
