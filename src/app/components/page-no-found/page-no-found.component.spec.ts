import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageNoFoundComponent } from './page-no-found.component';

describe('PageNoFoundComponent', () => {
  let component: PageNoFoundComponent;
  let fixture: ComponentFixture<PageNoFoundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageNoFoundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageNoFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
