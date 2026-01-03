import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAnnouncmentComponent } from './add-announcment.component';

describe('AddAnnouncmentComponent', () => {
  let component: AddAnnouncmentComponent;
  let fixture: ComponentFixture<AddAnnouncmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddAnnouncmentComponent]
    });
    fixture = TestBed.createComponent(AddAnnouncmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
