import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EachConnectionComponent } from './each-connection.component';

describe('EachConnectionComponent', () => {
  let component: EachConnectionComponent;
  let fixture: ComponentFixture<EachConnectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EachConnectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EachConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
