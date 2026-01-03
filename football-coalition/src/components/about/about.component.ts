import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { CoalitionService, CoalitionAbout } from '../../app/services/coalition.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, TranslocoPipe],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() content: string = '';

  coalitionAbout: CoalitionAbout | null = null;
  loading = true;
  error = false;

  constructor(private coalitionService: CoalitionService) { }

  ngOnInit() {
    if (!this.content) {
      this.loadCoalitionAbout();
    } else {
      this.loading = false;
    }
  }

  loadCoalitionAbout() {
    this.loading = true;
    this.coalitionService.getCoalitionAbout().subscribe({
      next: (response) => {
        if (response) {
          this.coalitionAbout = response;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading coalition about:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }
}
