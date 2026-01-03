import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberAnnouncmentsComponent } from './member-announcments.component';

describe('MemberAnnouncmentsComponent', () => {
  let component: MemberAnnouncmentsComponent;
  let fixture: ComponentFixture<MemberAnnouncmentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemberAnnouncmentsComponent]
    });
    fixture = TestBed.createComponent(MemberAnnouncmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
