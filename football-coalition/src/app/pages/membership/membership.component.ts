import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { AssociationService, AssociationWithMemberCountDto, AssociationStatsDto } from '../../services/association.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-membership',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslocoPipe],
  templateUrl: './membership.component.html',
  styleUrl: './membership.component.scss'
})
export class MembershipComponent implements OnInit {
  associations: AssociationWithMemberCountDto[] = [];
  stats: AssociationStatsDto | null = null;
  loading = true;
  error: string | null = null;
  assetUrl = environment.assetUrl;
  url = environment.url;


  // Fallback data for when API is unavailable
    fallbackClubs:any[] = [
      
      ];

  constructor(private associationService: AssociationService) {}

  ngOnInit() {
    this.loadAssociationsWithMemberCount();
  }

  loadAssociationsWithMemberCount() {
    this.loading = true;
    this.error = null;

    this.associationService.getAssociationsWithMemberCount().subscribe({
      next: (data) => {
        this.stats = data;
        this.associations = data.associations;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching associations with member counts:', error);
        this.error = 'Failed to load association data. Showing sample data.';
        this.loading = false;
        this.loadFallbackData();
      }
    });
  }

  private loadFallbackData() {
    // Convert fallback data to match our interface
    this.associations = this.fallbackClubs.map((club, index) => ({
      id: (index + 1).toString(),
      name: club.name,
      amharicName: '',
      logoPath: club.logo,
      description: `Official supporters association for ${club.name.replace(' FC Supporters', '')}`,
      websiteLink: '#',
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      phoneNumbers: [`+25191123456${index}`],
      memberCount: club.members,
      activeMemberCount: club.members,
      createdDate: new Date().toISOString()
    }));

    this.stats = {
      associations: this.associations,
      totalMembers: this.associations.reduce((sum, a) => sum + a.memberCount, 0),
      totalAssociations: this.associations.length
    };
  }

  get maxMembers(): number {
    if (this.associations.length === 0) return 1;
    return Math.max(...this.associations.map(a => a.memberCount));
  }

  getLogoUrl(logoPath: string): string {
    if (!logoPath) {
      return 'assets/images/default-club-logo.png';
    }
    
    if (logoPath.startsWith('http') || logoPath.startsWith('assets/')) {
      return logoPath;
    }
    
    return `${this.assetUrl}/${logoPath}`;
  }

  registerForAssociation(association: AssociationWithMemberCountDto) {
    // Handle registration logic here
    console.log('Registering for:', association.name);
    // You can navigate to a registration page or open a modal
  }

  retryLoading() {
    this.loadAssociationsWithMemberCount();
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/images/default-club-logo.png';
    }
  }

  joinAssociation(associationId:string) {
    if (associationId) {
     /*  window.open(`https://eplffc.et/admin/auth/register/${associationId}`, '_blank');
    */   window.open(`${this.url}${associationId}`, '_blank');
    }
  }
}
