import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-jersey',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslocoPipe],
  templateUrl: './jersey.component.html',
  styleUrl: './jersey.component.scss'
})
export class JerseyComponent {
  selectedClub: string = 'All Clubs';
  clubs: string[] = ['All Clubs', 'St. George', 'Fasil Kenema', 'Ethiopian Coffee', 'Adama City', 'Hawassa City', 'Bahir Dar City', 'Dire Dawa City'];

  jerseys = [
    { club: 'St. George', name: 'Home Jersey 2024', price: 1200, image: 'assets/images/jerseys/st-george-home.jpg' },
    { club: 'St. George', name: 'Away Jersey 2024', price: 1200, image: 'assets/images/jerseys/st-george-away.jpg' },
    { club: 'Fasil Kenema', name: 'Home Jersey 2024', price: 1100, image: 'assets/images/jerseys/fasil-home.jpg' },
    { club: 'Fasil Kenema', name: 'Away Jersey 2024', price: 1100, image: 'assets/images/jerseys/fasil-away.jpg' },
    { club: 'Ethiopian Coffee', name: 'Home Jersey 2024', price: 1000, image: 'assets/images/jerseys/coffee-home.jpg' },
    { club: 'Ethiopian Coffee', name: 'Away Jersey 2024', price: 1000, image: 'assets/images/jerseys/coffee-away.jpg' },
    { club: 'Adama City', name: 'Home Jersey 2024', price: 900, image: 'assets/images/jerseys/adama-home.jpg' },
    { club: 'Hawassa City', name: 'Home Jersey 2024', price: 900, image: 'assets/images/jerseys/hawassa-home.jpg' }
  ];

  get filteredJerseys() {
    if (this.selectedClub === 'All Clubs') {
      return this.jerseys;
    }
    return this.jerseys.filter(jersey => jersey.club === this.selectedClub);
  }

  selectClub(club: string) {
    this.selectedClub = club;
  }
}
