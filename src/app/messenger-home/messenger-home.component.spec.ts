import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessengerHomeComponent } from './messenger-home.component';

describe('MessengerHomeComponent', () => {
  let component: MessengerHomeComponent;
  let fixture: ComponentFixture<MessengerHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MessengerHomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessengerHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
