import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ViewportScroller } from '@angular/common';
import { SharedModule } from "../../shared.module";
import { EventsCarouselComponent } from '../../components/events-carousel/events-carousel.component';
import { ContactComponent } from '../../components/contact/contact.component';
import { BoardMembersComponent } from '../../components/board-members/board-members.component';
import { AssociationMembersComponent } from '../../../components/association-members/association-members.component';
import { AdvertisementComponent } from '../../components/advertisement/advertisement.component';
import { AssociationService } from '../../services/association.service';
import { Association } from '../../models/association.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-association-detail',
  standalone: true,
  imports: [CommonModule, TranslocoPipe, SharedModule, EventsCarouselComponent, ContactComponent, BoardMembersComponent, AdvertisementComponent, AssociationMembersComponent],
  templateUrl: './association-detail.component.html',
  styleUrls: ['./association-detail.component.scss']
})
export class AssociationDetailComponent implements OnInit {
  association: Association | null = null;
  loading = true;
  error: string | null = null;
  assetUrl = environment.assetUrl;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private associationService: AssociationService,
    private sanitizer: DomSanitizer,
    private viewportScroller: ViewportScroller
  ) { }

  ngOnInit() {
    this.viewportScroller.scrollToPosition([0, 0]);
    setTimeout(() => window.scrollTo(0, 0), 100); // Fallback
    this.loadAssociation();
  }

  loadAssociation() {
    const associationId = this.route.snapshot.paramMap.get('id');
    if (!associationId) {
      this.error = 'Association ID not found';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.associationService.getAllAssociations().subscribe({
      next: (associations) => {
        this.association = associations.find(a => a.id === associationId) || null;
        if (!this.association) {
          this.error = 'Association not found';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading association:', error);
        this.error = 'Failed to load association details';
        this.loading = false;
      }
    });
  }

  getLogoUrl(logoPath: string): string {
    if (!logoPath) {
      return 'assets/images/default-club-logo.png';
    }

    if (logoPath.startsWith('http')) {
      return logoPath;
    }

    // Normalize path: replace backslashes with forward slashes
    let normalizedPath = logoPath.replace(/\\/g, '/');

    // Remove 'wwwroot/' or '/wwwroot/' if it exists at the start (case-insensitive)
    if (normalizedPath.toLowerCase().startsWith('wwwroot/')) {
      normalizedPath = normalizedPath.substring(8);
    } else if (normalizedPath.toLowerCase().startsWith('/wwwroot/')) {
      normalizedPath = normalizedPath.substring(9);
    }

    // Ensure clean slash joining
    const baseUrl = this.assetUrl.endsWith('/') ? this.assetUrl.slice(0, -1) : this.assetUrl;
    const path = normalizedPath.startsWith('/') ? normalizedPath.slice(1) : normalizedPath;

    // Encode the path to handle spaces and special characters
    const encodedPath = path.split('/').map(segment => encodeURIComponent(segment)).join('/');

    return `${baseUrl}/${encodedPath}`;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/images/default-club-logo.png';
    }
  }

  getSafeHtml(content: string): SafeHtml {
    if (!content) return '';
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  goBack() {
    this.router.navigate(['/clubs']);
  }

  visitWebsite() {
    if (this.association?.websiteLink && this.association.websiteLink !== '#') {
      window.open(this.association.websiteLink, '_blank');
    }
  }

  joinAssociation() {
    if (this.association) {
      window.open(`https://eplffc.et/admin/auth/register/${this.association.id}`, '_blank');
    }
  }
  getContactDetails() {
    if (!this.association) return null;
    return {
      phone: this.association.phoneNumbers?.[0] || '',
      email: '', // Not in model?
      address: '', // Not in model?
      website: this.association.websiteLink
    };
  }
} 