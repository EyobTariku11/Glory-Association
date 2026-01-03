import { Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-donation-highlight',
  standalone: true,
  imports: [TranslocoPipe],
  templateUrl: './donation-highlight.component.html',
  styleUrl: './donation-highlight.component.scss'
})
export class DonationHighlightComponent {

}
