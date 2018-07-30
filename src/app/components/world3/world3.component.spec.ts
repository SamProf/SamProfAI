import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { World3Component } from './world3.component';

describe('World3Component', () => {
  let component: World3Component;
  let fixture: ComponentFixture<World3Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ World3Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(World3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
