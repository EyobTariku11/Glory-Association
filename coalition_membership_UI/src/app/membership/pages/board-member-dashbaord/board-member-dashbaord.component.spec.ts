import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardMemberDashbaordComponent } from './board-member-dashbaord.component';

describe('BoardMemberDashbaordComponent', () => {
  let component: BoardMemberDashbaordComponent;
  let fixture: ComponentFixture<BoardMemberDashbaordComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BoardMemberDashbaordComponent]
    });
    fixture = TestBed.createComponent(BoardMemberDashbaordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
