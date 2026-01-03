import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { CoalitionService, CoalitionAbout } from '../../app/services/coalition.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, TranslocoPipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  currentYear = new Date().getFullYear();
  coalitionAbout: CoalitionAbout | null = null;

  constructor(private coalitionService: CoalitionService) {}

  ngOnInit() {
    this.loadCoalitionAbout();
  }

  loadCoalitionAbout() {
    this.coalitionService.getCoalitionAbout().subscribe({
      next: (response) => {
        if (response) {
          this.coalitionAbout = response;
        }
      },
      error: (error) => {
        console.error('Error loading coalition about in footer:', error);
      }
    });
  }
}
