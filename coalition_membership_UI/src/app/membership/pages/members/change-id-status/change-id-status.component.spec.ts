import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeIdStatusComponent } from './change-id-status.component';

describe('ChangeIdStatusComponent', () => {
  let component: ChangeIdStatusComponent;
  let fixture: ComponentFixture<ChangeIdStatusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChangeIdStatusComponent]
    });
    fixture = TestBed.createComponent(ChangeIdStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
