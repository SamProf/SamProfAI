import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {RouterModule, Routes} from '@angular/router';

import {PageNoFoundComponent} from './components/page-no-found/page-no-found.component';
import {WorldComponent} from './components/world/world.component';
import {FormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ButtonModule, SliderModule, SpinnerModule} from 'primeng/primeng';


const appRoutes: Routes = [
  {path: 'world', component: WorldComponent},
  {
    path: '',
    redirectTo: '/world',
    pathMatch: 'full'
  },
  {path: '**', component: PageNoFoundComponent}
];


@NgModule({
  declarations: [
    AppComponent,
    WorldComponent,
    PageNoFoundComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    RouterModule.forRoot(
      appRoutes,
      {
        useHash: true,
      }
    ),
    SpinnerModule,
    SliderModule,
    ButtonModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
