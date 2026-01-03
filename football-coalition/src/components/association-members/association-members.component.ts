import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MemberService } from '../../app/services/member.service';
import { Member } from '../../app/models/member.model';
import { TranslocoPipe } from '@jsverse/transloco';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-association-members',
    standalone: true,
    imports: [CommonModule, TranslocoPipe],
    templateUrl: './association-members.component.html',
    styleUrl: './association-members.component.scss'
})
export class AssociationMembersComponent implements OnInit, OnChanges {
    @Input() associationId: string = '';
    members: Member[] = [];
    filteredMembers: Member[] = [];
    displayedMembers: Member[] = [];

    loading = false;
    error = '';
    searchTerm = '';

    // Pagination
    currentPage = 1;
    pageSize = 5;
    totalItems = 0;
    totalPages = 0;
    pages: number[] = [];

    assetUrl = environment.assetUrl;

    constructor(private memberService: MemberService) { }

    getMemberImage(imagePath: string | undefined): string {
        if (!imagePath) return 'assets/images/default-avatar.svg';
        if (imagePath.startsWith('http')) return imagePath;

        // Normalize path: replace backslashes with forward slashes
        let normalizedPath = imagePath.replace(/\\/g, '/');

        // Remove 'wwwroot/' if it exists
        if (normalizedPath.toLowerCase().startsWith('wwwroot/')) {
            normalizedPath = normalizedPath.substring(8);
        } else if (normalizedPath.toLowerCase().startsWith('/wwwroot/')) {
            normalizedPath = normalizedPath.substring(9);
        }

        // Ensure strictly one slash between base and path
        const baseUrl = this.assetUrl.endsWith('/') ? this.assetUrl.slice(0, -1) : this.assetUrl;
        const path = normalizedPath.startsWith('/') ? normalizedPath.slice(1) : normalizedPath;

        // Encode query parts
        const encodedPath = path.split('/').map(segment => encodeURIComponent(segment)).join('/');

        return `${baseUrl}/${encodedPath}`;
    }

    onImageError(event: Event) {
        const img = event.target as HTMLImageElement;
        // Prevent infinite loop if default image also fails (though it shouldn't since we checked existence)
        if (img.src.includes('assets/images/default-avatar.svg')) {
            return;
        }
        img.src = 'assets/images/default-avatar.svg';
    }

    ngOnInit() {
        // Initial load handled by ngOnChanges if ID is present, otherwise here
        if (this.associationId) {
            this.loadMembers();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['associationId'] && changes['associationId'].currentValue) {
            this.loadMembers();
        }
    }

    loadMembers() {
        this.loading = true;
        this.memberService.getMembersByAssociationId(this.associationId).subscribe({
            next: (data) => {
                this.members = data || [];
                this.filterMembers();
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading members', err);
                this.error = 'Failed to load members.';
                this.loading = false;
            }
        });
    }

    filterMembers() {
        if (!this.searchTerm) {
            this.filteredMembers = [...this.members];
        } else {
            const lower = this.searchTerm.toLowerCase();
            this.filteredMembers = this.members.filter(m =>
                m.fullName?.toLowerCase().includes(lower) ||
                m.memberId?.toLowerCase().includes(lower) ||
                m.membershipType?.toLowerCase().includes(lower) ||
                m.membershipTypeName?.toLowerCase().includes(lower)
            );
        }
        this.totalItems = this.filteredMembers.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.updatePages();
        this.updateDisplayedMembers();
    }

    updatePages() {
        this.pages = [];
        // Simple pagination logic: show all pages or a sliding window
        // For now, simple:
        for (let i = 1; i <= this.totalPages; i++) {
            this.pages.push(i);
        }
        // Optimization: if pages > 5, show window (omitted for brevity, can add if requested)
    }

    updateDisplayedMembers() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        this.displayedMembers = this.filteredMembers.slice(start, end);
    }

    onPageChange(page: number) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.updateDisplayedMembers();
    }

    onSearch(event: Event) {
        const target = event.target as HTMLInputElement;
        this.searchTerm = target.value;
        this.currentPage = 1;
        this.filterMembers();
    }
}
