import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { World4Component } from './world4.component';

describe('World3Component', () => {
  let component: World4Component;
  let fixture: ComponentFixture<World4Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ World4Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(World4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
