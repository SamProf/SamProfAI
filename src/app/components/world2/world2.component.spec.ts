import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { World2Component } from './world2.component';

describe('World2Component', () => {
  let component: World2Component;
  let fixture: ComponentFixture<World2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ World2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(World2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
