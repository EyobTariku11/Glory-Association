import { Component, OnInit } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { CommonModule } from '@angular/common';
import { SponsorService, Sponsor } from '../../app/services/sponsor.service';

@Component({
  selector: 'app-our-sponsors',
  standalone: true,
  imports: [TranslocoPipe, CommonModule],
  templateUrl: './our-sponsors.component.html',
  styleUrl: './our-sponsors.component.scss'
})
export class OurSponsorsComponent implements OnInit {
  sponsors: Sponsor[] = [];
  loading = false;

  constructor(private sponsorService: SponsorService) {}

  ngOnInit(): void {
    this.loadSponsors();
  }

  loadSponsors(): void {
    this.loading = true;
    this.sponsorService.getActiveSponsors().subscribe({
      next: (sponsors) => {
        this.sponsors = sponsors;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading sponsors:', error);
        this.loading = false;
      }
    });
  }

  getSponsorImage(sponsor: Sponsor): string {
    return this.sponsorService.getSponsorImage(sponsor);
  }

  openSponsorWebsite(sponsor: Sponsor): void {
    if (sponsor.websiteUrl) {
      window.open(sponsor.websiteUrl, '_blank');
    }
  }
}
