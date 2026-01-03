export interface Member {
    id: string;
    fullName: string;
    phoneNumber: string;
    gender: string;
    isProfileCompleted: boolean;
    birthDate: string;
    membershipTypeId: string;
    createdDate: string;
    memberId: string;
    imagePath: string;
    ImagePath?: string; // Handle PascalCase from API
    email: string;
    regionId: string;
    zone: string;
    woreda: string;
    CreatedDate?: string; // Handle PascalCase from API
    createdByDate?: string; // Handle what is in DTO
    status?: string; // Derived or mapped from RowStatus or existing logic
    membershipType?: string;
    membershipTypeName?: string;
}

export interface MemberResponse {
    data: Member[];
    success: boolean;
    message: string;
}
