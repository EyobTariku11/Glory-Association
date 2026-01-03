import { Component, Input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [TranslocoPipe],
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss'
})
export class FeaturesComponent {
  @Input() title: string = '';
}
