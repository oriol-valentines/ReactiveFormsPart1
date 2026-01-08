import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Booking } from './booking/booking';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Booking],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ReactiveFormsPart1');
}
