import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TfTestComponent } from './tf-test.component';

describe('TfTestComponent', () => {
  let component: TfTestComponent;
  let fixture: ComponentFixture<TfTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TfTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TfTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
