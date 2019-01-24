import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { World5Component } from './world5.component';

describe('World3Component', () => {
  let component: World5Component;
  let fixture: ComponentFixture<World5Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ World5Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(World5Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
