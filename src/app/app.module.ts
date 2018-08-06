import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {RouterModule, Routes} from '@angular/router';

import {PageNoFoundComponent} from './components/page-no-found/page-no-found.component';
import {WorldComponent} from './components/world/world.component';
import {FormsModule} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
  ButtonModule,
  CheckboxModule, DropdownModule,
  ListboxModule,
  MenubarModule,
  SelectButtonModule,
  SidebarModule,
  SliderModule,
  SpinnerModule, TooltipModule
} from 'primeng/primeng';
import {CanvasComponent} from './components/canvas/canvas.component';
import {World2Component} from './components/world2/world2.component';
import {KeysPipe} from './pipes/keys.pipe';
import {World3Component} from './components/world3/world3.component';
import {World4Component} from './components/world4/world4.component';
import {Canvas2Component} from './components/canvas2/canvas2.component';
import {TetrisComponent} from './components/tetris/tetris.component';


const appRoutes: Routes = [
  {path: 'bots', component: WorldComponent},
  {path: 'genesis', component: World2Component},
  {path: 'tetris', component: TetrisComponent},
  // {path: 'world3', component: World3Component},
  // {path: 'world4', component: World4Component,},
  {
    path: '',
    redirectTo: '/genesis',
    pathMatch: 'full',
  },
  {path: '**', redirectTo: '/',}
];


@NgModule({
  declarations: [
    AppComponent,
    WorldComponent,
    World2Component,
    World3Component,
    World4Component,
    PageNoFoundComponent,
    CanvasComponent,
    Canvas2Component,
    KeysPipe,
    TetrisComponent,
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
    MenubarModule,
    ListboxModule,
    TooltipModule,
    DropdownModule,

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
