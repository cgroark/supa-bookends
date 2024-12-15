import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { FormControl, FormGroup } from '@angular/forms';


@Component({
  selector: 'app-item-form',
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.scss']
})
export class ItemFormComponent implements OnInit {

  protected formatTypes = [
    {
      label: 'Text',
      value: 1,
    },
    {
      label: 'Audio',
      value: 2,
    }
  ]

  protected form: FormGroup = new FormGroup({
    title: new FormControl<string>(''),
    author: new FormControl<string>(''),
    overview: new FormControl<string>(''),
    format: new FormControl<number | null>(null),
    status: new FormControl<number | null>(null),
    rating: new FormControl<number | null>(null),
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
    comments: new FormControl<string>(''),
  })
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    console.warn(this.formatTypes)
  }

  onSubmit() {
    if (this.form.valid) {
      const itemData = this.form.value;
      this.http
        .post('http://127.0.0.1:8000/add-item', itemData)
        .subscribe((response) => {
          console.log('Item added:', response);
          alert('Item added successfully!');
        });
    } else {
      alert('Please fill in all fields!');
    }
  }

}
