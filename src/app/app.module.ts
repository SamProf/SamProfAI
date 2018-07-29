import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {RouterModule, Routes} from '@angular/router';

import {PageNoFoundComponent} from './components/page-no-found/page-no-found.component';
import {WorldComponent} from './components/world/world.component';
import {FormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ButtonModule, CheckboxModule, SelectButtonModule, SidebarModule, SliderModule, SpinnerModule} from 'primeng/primeng';
import {CanvasComponent} from './components/canvas/canvas.component';
import {World2Component} from './components/world2/world2.component';


const appRoutes: Routes = [
  {path: 'world', component: WorldComponent},
  {path: 'world2', component: World2Component},
  {
    path: '',
    redirectTo: '/world',
    pathMatch: 'full',
  },
  {path: '**', component: PageNoFoundComponent}
];


@NgModule({
  declarations: [
    AppComponent,
    WorldComponent,
    World2Component,
    PageNoFoundComponent,
    CanvasComponent,
  ],
  imports: [
    SidebarModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    SelectButtonModule,
    CheckboxModule,
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
