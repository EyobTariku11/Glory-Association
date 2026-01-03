import { Component, OnInit } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

import { CommonService } from "src/app/services/common.service";

import { MemberService } from "src/app/services/member.service";

import { MemberDetailComponent } from "./member-detail/member-detail.component";
import { RegisterMembersAdminComponent } from "./register-members-admin/register-members-admin.component";
import { UserService } from "src/app/services/user.service";
import { IMembersGetDto } from "src/app/models/auth/membersDto";
import { UserView } from "src/app/models/auth/userDto";
import { DeleteConfirmationComponent } from "../delete-confirmation/delete-confirmation.component";
import { AssociationService } from "src/app/services/AssociationService";
import { ConfigurationService } from "src/app/services/configuration.service";

@Component({
  selector: "app-members",
  templateUrl: "./members.component.html",
  styleUrls: ["./members.component.scss"],
})
export class MembersComponent implements OnInit {
  first: number = 0;
  rows: number = 5;
  Members: IMembersGetDto[] = [];
  paginatedMembers: IMembersGetDto[] = [];
  searchTerm: string = "";
  selectedFile: File | null = null;
  user: UserView;

  currentPage: number = 1;
  totalPages: number;
  pagesArray: number[] = [];
  totalRecords: number;

  // Filter properties
  selectedType: string = "";
  selectedRegion: string = "";
  selectedMembershipCategory: string = "";
  selectedAssociation: string = "";

  // Filter options
  types: any[] = [];
  regions: any[] = [];
  membershipCategories: any[] = [];
  associations: any[] = [];

  // Original data for filtering
  originalMembers: IMembersGetDto[] = [];

  ngOnInit(): void {
    this.user = this.userService.getCurrentUser();
    this.getMemberss();
    this.loadFilterOptions();
  }

  constructor(
    private modalService: NgbModal,
    private commonService: CommonService,
    private userService: UserService,
    private controlService: MemberService,
    private associationService: AssociationService,
    private configurationService: ConfigurationService
  ) {}

  loadFilterOptions() {
    // Load types (gender options)
    this.types = [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' }
    ];

    // Load regions
    this.configurationService.getRegions().subscribe({
      next: (res) => {
        this.regions = res.data.map((item: any) => ({ value: item.regionName, label: item.regionName }));
      }
    });

    // Load membership categories (filtered by association)
    this.loadMembershipCategories();

    // Load associations (only for Coalition users)
    if (this.user?.role === 'Coalition') {
      this.associationService.getAll().subscribe({
        next: (res) => {
          this.associations = res.map((item: any) => ({ value: item.id, label: item.name }));
        }
      });
    }
  }

  loadMembershipCategories() {
    // For Association users, filter by their association
    // For Coalition users, show all categories
    let associationId = this.user?.role === 'Association' ? this.user.loginId : undefined;
    
    this.configurationService.getMembershipTypes(associationId).subscribe({
      next: (res) => {
        this.membershipCategories = res.map((item: any) => ({ value: item.name, label: item.name }));
      }
    });
  }getMemberss() {
    let associationId: string | undefined;
    if (this.user?.role === 'Association') {
      associationId = this.user.loginId;
    }
  
    this.controlService.getMembers(associationId).subscribe({
      next: (res) => {
        // Sort by registration date only on first fetch
        const sortedMembers = res.sort(
          (a, b) => new Date(b.createdByDate).getTime() - new Date(a.createdByDate).getTime()
        );
  
        // Only set originalMembers if it's empty (first fetch)
        if (this.originalMembers.length === 0) {
          this.originalMembers = [...sortedMembers];
        }
  
        // Update Members array for display (filters will still use originalMembers)
        this.Members = [...sortedMembers];
        this.totalRecords = this.Members.length;
  
        this.calculateTotalPages();
        this.updatePagesArray();
        this.applyFilter(); // filters only, no sorting
      },
    });
  }
  
  

  updatePagesArray(): void {
    const maxVisiblePages = 3; // Number of visible pages before the "..." 
    const pages: number[] = [];

    // Always show the first page
    pages.push(1);

    // Add dots before the current page if it's beyond the visible range
    if (this.currentPage > maxVisiblePages + 1) {
      pages.push(-1); // Use -1 as a placeholder for "..."
    }

    // Determine start and end of the visible range
    const start = Math.max(2, this.currentPage - 1);
    const end = Math.min(this.totalPages - 1, this.currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add dots after the current page if there's more to show
    if (this.currentPage < this.totalPages - maxVisiblePages) {
      pages.push(-1); // Use -1 as a placeholder for "..."
    }

    // Always show the last page if it's not already included
    if (this.totalPages > 1) {
      pages.push(this.totalPages);
    }

    this.pagesArray = pages;
  }


  onPageChange() {
    const start = (this.currentPage - 1) * this.rows;
    const end = start + this.rows;
    this.paginatedMembers = this.Members.slice(start, end);
  }

  getImagePath(url: string) {
    return this.commonService.createImgPath(url);
  }


  applyFilter() {
    let filteredMembers = [...this.originalMembers];
  
    // search filter
    if (this.searchTerm) {
      const searchTerm = this.searchTerm.toLowerCase();
      filteredMembers = filteredMembers.filter((item) => {
        return (
          (item.fullName && item.fullName.toLowerCase().includes(searchTerm)) ||
          (item.phoneNumber && item.phoneNumber.toLowerCase().includes(searchTerm)) ||
          (item.memberId && item.memberId.toLowerCase().includes(searchTerm)) ||
          (item.membershipType && item.membershipType.toLowerCase().includes(searchTerm)) ||
          (item.region && item.region.toLowerCase().includes(searchTerm)) ||
          (item.gender && item.gender.toLowerCase().includes(searchTerm)) ||
          (item.paymentStatus && item.paymentStatus.toLowerCase().includes(searchTerm)) ||
          (item.expiredDate && item.expiredDate.toString().includes(searchTerm))
        );
      });
    }
  
    // type filter
    if (this.selectedType) {
      filteredMembers = filteredMembers.filter(item =>
        item.gender && item.gender.toLowerCase() === this.selectedType.toLowerCase()
      );
    }
  
    // region filter
    if (this.selectedRegion) {
      filteredMembers = filteredMembers.filter(item =>
        item.region && item.region.toLowerCase() === this.selectedRegion.toLowerCase()
      );
    }
  
    // membership category filter
    if (this.selectedMembershipCategory) {
      filteredMembers = filteredMembers.filter(item =>
        item.membershipType && item.membershipType.toLowerCase() === this.selectedMembershipCategory.toLowerCase()
      );
    }
  
    // association filter
    if (this.selectedAssociation && this.user?.role === 'Coalition') {
      filteredMembers = filteredMembers.filter(item =>
        item.associationId === this.selectedAssociation
      );
    }
  
    // DO NOT sort here
    this.Members = filteredMembers;
    this.totalRecords = this.Members.length;
  
    // pagination
    this.calculateTotalPages();
    this.updatePagesArray();
    this.onPageChange();
  }
  

  clearFilters() {
    this.searchTerm = "";
    this.selectedType = "";
    this.selectedRegion = "";
    this.selectedMembershipCategory = "";
    this.selectedAssociation = "";
    this.applyFilter();
  }

  goToDetail(member: IMembersGetDto) {
    let modalRef = this.modalService.open(MemberDetailComponent, {
      size: "xxl",
      backdrop: "static",
      windowClass: "custom-modal-width",
    });
    modalRef.componentInstance.member = member;
    modalRef.result.then(() => {
      this.getMemberss();
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] as File;
    if (!this.selectedFile) {
      return;
    }
    this.importFromExcel();
  }
  importFromExcel() {
    const formData = new FormData();
    formData.append("ExcelFile", this.selectedFile);
    this.controlService.importFromExcel(formData).subscribe({
      next: (res) => {
        if (res.success) {
          // this.messageService.add({ severity: 'success', summary: res.message, detail: res.data })
          this.getMemberss();
        } else {
          //this.messageService.add({ severity: 'error', summary: res.message, detail: res.data })
          this.getMemberss();
        }
      },
      error: (err) => {
        //this.messageService.add({ severity: 'error', summary: 'Something went wrong', detail: err })
      },
    });
  }

  DeleteMember(memberId: string) {
    let modalRef = this.modalService.open(DeleteConfirmationComponent, {
      backdrop: "static",
    });
    modalRef.componentInstance.memberIdToDelete = memberId;
    modalRef.componentInstance.deleteType = "member";

    modalRef.result.then(() => {
      this.getMemberss();
    });

    // this.confirmationService.confirm({
    //   message: 'Are You sure you want to delete this Member?',
    //   header: 'Delete Confirmation',
    //   icon: 'pi pi-info-circle',
    //   accept: () => {
    //     this.controlService.deleteMember(memberId).subscribe({
    //       next: (res) => {

    //         if (res.success) {
    //           this.messageService.add({ severity: 'success', summary: 'Confirmed', detail: res.message });
    //           this.getMemberss()
    //         }
    //         else {
    //           this.messageService.add({ severity: 'error', summary: 'Rejected', detail: res.message });
    //         }
    //       }, error: (err) => {

    //         this.messageService.add({ severity: 'error', summary: 'Rejected', detail: err });

    //       }
    //     })

    //   },
    //   reject: (type: ConfirmEventType) => {
    //     switch (type) {
    //       case ConfirmEventType.REJECT:
    //         this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
    //         break;
    //       case ConfirmEventType.CANCEL:
    //         this.messageService.add({ severity: 'warn', summary: 'Cancelled', detail: 'You have cancelled' });
    //         break;
    //     }
    //   },
    //   key: 'positionDialog'
    // });
  }

  RegisterMember() {
    let modalRef = this.modalService.open(RegisterMembersAdminComponent, {
      size: "lg",
      backdrop: "static",
    });
    modalRef.result.then(() => {
      this.getMemberss();
    });
  }

  //pageination

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.totalRecords / this.rows);
    this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.goToPage(1);
  }

  goToPage(page: number) {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagesArray();
      this.onPageChange();
    }
  }
}
