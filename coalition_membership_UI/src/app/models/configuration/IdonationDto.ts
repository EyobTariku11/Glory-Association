export interface DonationEventPostDto {
    title: string;
    subTitle?: string; // Optional field
    description?: string; // Optional field
    imageFile?: File; // Corresponds to IFormFile
    isDonation: boolean; // Defaults to false
    amount: number; // Defaults to 0.0
  }
  export interface DonationEventGetDto extends DonationEventPostDto {
    id:string
    imagePath: string; 
    createdDate:Date
    amountCollected:number;
  }
    