import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestedIdcardsComponent } from './requested-idcards.component';

describe('RequestedIdcardsComponent', () => {
  let component: RequestedIdcardsComponent;
  let fixture: ComponentFixture<RequestedIdcardsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RequestedIdcardsComponent]
    });
    fixture = TestBed.createComponent(RequestedIdcardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
