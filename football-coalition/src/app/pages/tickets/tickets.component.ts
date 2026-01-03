import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslocoPipe],
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.scss'
})
export class TicketsComponent {
  selectedClub: string = 'All Clubs';
  clubNames: string[] = ['All Clubs', 'St. George', 'Fasil Kenema', 'Ethiopian Coffee', 'Adama City', 'Hawassa City', 'Bahir Dar City', 'Dire Dawa City'];

  filteredClubs = [
    {
      name: 'St. George',
      matches: [
        { opponent: 'Fasil Kenema', date: '2024-02-15', venue: 'Addis Ababa Stadium', price: 150 },
        { opponent: 'Ethiopian Coffee', date: '2024-02-22', venue: 'Addis Ababa Stadium', price: 120 }
      ]
    },
    {
      name: 'Fasil Kenema',
      matches: [
        { opponent: 'St. George', date: '2024-02-15', venue: 'Bahir Dar Stadium', price: 100 },
        { opponent: 'Adama City', date: '2024-02-28', venue: 'Bahir Dar Stadium', price: 80 }
      ]
    }
  ];

  selectClub(club: string) {
    this.selectedClub = club;
  }

  buyTicket(clubName: string, match: any) {
    alert(`Buying ticket for ${clubName} vs ${match.opponent}\nDate: ${match.date}\nVenue: ${match.venue}\nPrice: ETB ${match.price}`);
  }
}
