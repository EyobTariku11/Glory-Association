import { Component, Input, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CommonService } from "src/app/services/common.service";
import html2pdf from "html2pdf.js";
import { HttpClient } from "@angular/common/http";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { IMembersGetDto } from "src/app/models/auth/membersDto";
import {
  AssociationGetDto,
  AssociationService,
} from "src/app/services/AssociationService";
import { environment } from "src/environments/environment";
import * as QRCode from "qrcode";

@Component({
  selector: "app-generate-id-card",
  templateUrl: "./generate-id-card.component.html",
  styleUrls: ["./generate-id-card.component.scss"],
})
export class GenerateIdCardComponent implements OnInit {
  @Input() member: IMembersGetDto;
  imagePath: string = "";
  signaturePath: string = "";
  stampPath: string = "";
  stampPath2: string = "";
  backgroundImage: string = "";
  photoStamp: string = "";
  logoPath: string = "";
  isMobile: boolean;
  association: AssociationGetDto;
  expiryDate!: Date;
  isGeneratingPdf: boolean = false;
  isLoadingAssociation: boolean = true;
  qrCodeBase64: string;

  constructor(
    private commonService: CommonService,
    private associationService: AssociationService,
    private http: HttpClient,
    private breakpointObserver: BreakpointObserver
  ) { }

  async ngOnInit(): Promise<void> {
    // Detect screen size
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.Small, Breakpoints.XSmall])
      .subscribe((result) => {
        this.isMobile = result.matches;
      });

    if (this.member) {
      const createdDate = new Date(this.member.lastPaid!);
      createdDate.setFullYear(createdDate.getFullYear() + 1);
      this.expiryDate = createdDate;
      this.getAssociationFromMembershipType();
    }

    if (this.member?.memberId) {
      this.qrCodeBase64 = await this.generateQrDataUrl(this.getVerificationUrl());
    }

    if (this.member?.imagePath) {
      this.imagePath = await this.toDataUrl(this.member.imagePath);
    }


  }

  // Fetch association and convert its images to base64
  getAssociationFromMembershipType() {
    this.isLoadingAssociation = true;
    this.associationService
      .getByMembershipTypeyId(this.member?.membershipTypeId)
      .subscribe({
        next: async (res) => {
          this.association = res;
          this.isLoadingAssociation = false;

          // Set CSS custom properties for association colors
          this.setAssociationColors();

          console.log('Association loaded:', this.association);
          console.log('Association stamp paths:', {
            stampPath: this.association?.stampPath,
            stampPath2: this.association?.stampPath2,
            signiturePath: this.association?.signiturePath
          });

          // Convert all association images to base64 for PDF generation
          if (this.association?.logoPath) {
            this.logoPath = await this.toDataUrl(this.association.logoPath);
          }
          if (this.association?.signiturePath) {
            this.signaturePath = await this.toDataUrl(this.association.signiturePath);
          }
          if (this.association?.stampPath) {
            this.stampPath = await this.toDataUrl(this.association.stampPath);
          }
          if (this.association?.stampPath2) {
            this.stampPath2 = await this.toDataUrl(this.association.stampPath2);
          }
          if (this.association?.backgroundImage) {
            this.backgroundImage = await this.toDataUrl(this.association.backgroundImage);
          }
          if (this.association?.photoStamp) {
            this.photoStamp = await this.toDataUrl(this.association.photoStamp);
            // Process the stamp to be transparent immediately for browser view
            this.photoStamp = await this.makeImageTransparent(this.photoStamp);
          }

          console.log('Association images loaded:', {
            logo: !!this.logoPath,
            signature: !!this.signaturePath,
            stamp: !!this.stampPath,
            stamp2: !!this.stampPath2
          });

          // Call prepareImages to ensure all images are ready
          await this.prepareImages();
        },
        error: (err) => {
          console.error("Error loading association:", err);
          this.isLoadingAssociation = false;
        },
      });
  }

  // Set CSS custom properties for association colors
  private setAssociationColors() {
    if (this.association) {
      const root = document.documentElement;
      root.style.setProperty('--association-primary', this.association.primaryColor || '#2a5298');
      root.style.setProperty('--association-secondary', this.association.secondaryColor || '#1e3c72');

      console.log('Association colors set:', {
        primary: this.association.primaryColor,
        secondary: this.association.secondaryColor
      });
    }
  }

  // Generate verification URL for QR code
  getVerificationUrl(): string {
    if (!this.member?.memberId) return "";
    return `${window.location.origin}/membership_id/${this.member.memberId}`;
  }

  // Convert image URL -> Base64
  async toDataUrl(url: string): Promise<string> {
    try {
      if (!url || url.trim() === '') {
        console.warn('Empty URL provided to toDataUrl');
        return '';
      }

      // If it's already a data URL, return it as is
      if (url.startsWith('data:')) {
        return url;
      }

      const imageUrl = this.getImage(url);
      console.log(`Converting image: ${url} -> ${imageUrl}`);

      const blob = await this.http
        .get(imageUrl, { responseType: "blob" })
        .toPromise();

      if (!blob) {
        console.error('No blob received for image:', url);
        return '';
      }

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            console.log(`Image converted to base64 successfully: ${url}`);
            resolve(reader.result as string);
          } else {
            reject(new Error('Failed to read blob'));
          }
        };
        reader.onerror = () => reject(new Error('FileReader error'));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error(`Error converting image to base64: ${url}`, error);
      return '';
    }
  }

  // Debug method to check image loading status
  logImageStatus() {
    console.log('=== Image Loading Status ===');
    console.log('Logo:', this.logoPath ? 'Loaded' : 'Not loaded');
    console.log('Signature:', this.signaturePath ? 'Loaded' : 'Not loaded');
    console.log('Stamp 1:', this.stampPath ? 'Loaded' : 'Not loaded');
    console.log('Stamp 2:', this.stampPath2 ? 'Loaded' : 'Not loaded');
    console.log('Background Image:', this.backgroundImage ? 'Loaded' : 'Not loaded');
    console.log('Photo Stamp:', this.photoStamp ? 'Loaded' : 'Not loaded');
    console.log('Member Photo:', this.imagePath ? 'Loaded' : 'Not loaded');
    console.log('QR Code:', this.qrCodeBase64 ? 'Generated' : 'Not generated');
    console.log('===========================');
  }

  // Replace all association paths with Base64
  async prepareImages() {
    console.log("Preparing images for PDF generation...");

    try {
      if (this.association?.logoPath) {
        console.log("Converting logo to base64...");
        this.association.logoPath = await this.toDataUrl(this.association.logoPath);
        console.log("Logo converted successfully");
      }

      if (this.association?.signiturePath) {
        console.log("Converting signature to base64...");
        this.association.signiturePath = await this.toDataUrl(this.association.signiturePath);
        console.log("Signature converted successfully");
      }

      if (this.association?.stampPath) {
        console.log("Converting stamp to base64...");
        this.association.stampPath = await this.toDataUrl(this.association.stampPath);
        console.log("Stamp converted successfully");
      }

      if (this.association?.stampPath2) {
        console.log("Converting stamp2 to base64...");
        this.association.stampPath2 = await this.toDataUrl(this.association.stampPath2);
        console.log("Stamp2 converted successfully");
      }

      if (this.association?.backgroundImage) {
        console.log("Converting backgroundImage to base64...");
        this.association.backgroundImage = await this.toDataUrl(this.association.backgroundImage);
        console.log("BackgroundImage converted successfully");
      }

      if (this.association?.photoStamp) {
        console.log("Converting photoStamp to base64...");
        this.association.photoStamp = await this.toDataUrl(this.association.photoStamp);
        console.log("PhotoStamp converted successfully");
      }

      console.log("All images prepared successfully");
    } catch (error) {
      console.error("Error preparing images:", error);
      // Continue with PDF generation even if some images fail
    }
  }

  // Manually remove white background from an image
  async makeImageTransparent(base64: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(base64);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Loop through pixels and make white ones transparent
        // Threshold for "white" is high (e.g. > 240 for R, G, B)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0; // Alpha to 0
          }
        }
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(base64);
      img.src = base64;
    });
  }

  // Generate QR code as base64 image
  async generateQrDataUrl(text: string): Promise<string> {
    return await QRCode.toDataURL(text, { width: 120, errorCorrectionLevel: "M" });
  }

  // Return image path (via service helper)
  getImage(url: string) {
    if (!url) return "";
    return this.commonService.createImgPath(url);
  }

  // Get image source that prioritizes base64 data
  getImageSource(imagePath: string | undefined): string {




    return environment.assetUrl + "/" + imagePath;

  }

  // Main PDF generator
  async generatePdf() {
    console.log("=== Starting Identical PDF Generation ===");
    this.isGeneratingPdf = true;

    try {
      /* Removed local transparency processing as it's now handled on load */

      // 2. Prepare all other images
      await this.prepareImages();
      await this.preloadAndVerifyImages();
      await new Promise(resolve => setTimeout(resolve, 1000));

      const frontSide = document.getElementById("front-side");
      const backSide = document.getElementById("back-side");
      const renderArea = document.getElementById("pdf-render-area");

      if (!frontSide || !backSide || !renderArea) {
        throw new Error("Elements missing");
      }

      // 3. Setup Render Area
      renderArea.innerHTML = '';
      const pdfWrapper = document.createElement("div");
      pdfWrapper.className = "id-card-container";
      pdfWrapper.style.cssText = "background: white; padding: 20px; display: block; width: 700px;";

      const frontClone = frontSide.cloneNode(true) as HTMLElement;
      const backClone = backSide.cloneNode(true) as HTMLElement;

      // --- PHOTO STAMP FIX ---
      // The photoStamp is already processed to be transparent on load
      const clonedStamp = frontClone.querySelector('.photo-stamp') as HTMLImageElement;
      if (clonedStamp && this.photoStamp) {
        clonedStamp.style.mixBlendMode = "normal";
        clonedStamp.style.opacity = "0.99";
      }

      frontClone.style.display = "block";
      frontClone.style.margin = "0 auto 40px auto";
      backClone.style.display = "block";
      backClone.style.margin = "0 auto";

      pdfWrapper.appendChild(frontClone);

      const pageBreak = document.createElement("div");
      pageBreak.className = "html2pdf__page-break";
      pdfWrapper.appendChild(pageBreak);

      pdfWrapper.appendChild(backClone);
      renderArea.appendChild(pdfWrapper);

      // 4. PDF Configuration
      const membername = `${this.member.fullName || 'Member'}_ID_Card.pdf`;

      const opt = {
        margin: [10, 5, 10, 5],
        filename: membername,
        image: { type: 'png', quality: 1.0 }, // Using PNG here preserves transparency better
        html2canvas: {
          scale: 4,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          windowWidth: 1200,
          // The following two lines are crucial for transparency
          removeContainer: true,
          imageTimeout: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // 5. Generate
      await html2pdf().from(pdfWrapper).set(opt).save();

      // 6. Cleanup
      renderArea.innerHTML = '';

    } catch (error) {
      console.error("❌ PDF Error:", error);
      alert("Generation failed. Check the photo stamp image format.");
    } finally {
      this.isGeneratingPdf = false;
    }
  }

  onImageError(type: string, event: Event) {
    console.error(`Image failed to load: ${type}`, event);
  }

  onImageLoad(type: string) {
    console.log(`Image loaded successfully: ${type}`);
  }

  // Preload and verify all images are available
  private async preloadAndVerifyImages(): Promise<void> {
    console.log("Preloading and verifying images...");

    const imagesToVerify = [
      { src: this.association?.logoPath, alt: "Organization Logo" },
      { src: this.association?.signiturePath, alt: "Signature" },
      { src: this.association?.stampPath, alt: "Stamp" },
      { src: this.association?.stampPath2, alt: "Stamp" },
      { src: this.association?.backgroundImage, alt: "Background Image" },
      { src: this.association?.photoStamp, alt: "Photo Stamp" }
    ].filter(img => img.src);

    if (imagesToVerify.length === 0) {
      console.log("No images to verify");
      return;
    }

    // Test URL encoding for each image
    imagesToVerify.forEach(img => {
      if (img.src && !img.src.startsWith('data:image')) {
        console.log(`Testing URL encoding for ${img.alt}:`);
        console.log(`  Original: ${img.src}`);
        console.log(`  Encoded: ${this.getImage(img.src)}`);
      }
    });

    const verificationPromises = imagesToVerify.map(img =>
      new Promise<void>((resolve) => {
        const imgElement = new Image();
        imgElement.onload = () => {
          console.log(`Image verified successfully: ${img.alt}`);
          resolve();
        };
        imgElement.onerror = () => {
          console.warn(`Image failed to load: ${img.alt}`);
          resolve(); // Continue even if some images fail
        };
        imgElement.src = img.src;
      })
    );

    await Promise.all(verificationPromises);
    console.log("Image verification completed");
  }

  // Test URL encoding for problematic URLs
  testUrlEncoding(): void {
    console.log('=== Testing URL Encoding ===');
    const testUrl = '/wwwroot/Association/Fasil%20Ketema%20FC%20Fans%20Association_stamp2.png';
    console.log('Test URL:', testUrl);
    console.log('Encoded result:', this.getImage(testUrl));
    console.log('=== End URL Encoding Test ===');
  }

  // Test image loading for all association images
  testImageLoading(): void {
    console.log('=== Testing Image Loading ===');
    if (this.association) {
      console.log('Logo:', this.association.logoPath);
      console.log('Signature:', this.association.signiturePath);
      console.log('Stamp:', this.association.stampPath);
      console.log('Stamp2:', this.association.stampPath2);

      // Test each image URL
      ['logoPath', 'signiturePath', 'stampPath', 'stampPath2', 'backgroundImage', 'photoStamp'].forEach(prop => {
        const path = this.association[prop];
        if (path) {
          console.log(`${prop}:`, path);
          console.log(`Encoded ${prop}:`, this.getImage(path));
        }
      });
    }
    console.log('=== End Image Loading Test ===');
  }

  // Test basic html2pdf functionality
  testHtml2Pdf(): void {
    console.log('=== Testing html2pdf ===');
    try {
      const testElement = document.createElement('div');
      testElement.innerHTML = '<h1>Test PDF</h1><p>This is a test to verify html2pdf is working.</p>';
      testElement.style.padding = '20px';

      console.log('Creating test PDF...');
      html2pdf()
        .from(testElement)
        .set({
          margin: 10,
          filename: 'test.pdf',
          html2canvas: { scale: 2 }
        })
        .save()
        .then(() => {
          console.log('✓ Test PDF created successfully');
        })
        .catch((error) => {
          console.error('❌ Test PDF failed:', error);
        });
    } catch (error) {
      console.error('❌ html2pdf test error:', error);
    }
    console.log('=== End html2pdf Test ===');
  }

  // Fallback PDF generation method
  private async fallbackPdfGeneration(element: HTMLElement, filename: string): Promise<void> {
    console.log('Using fallback PDF generation method...');

    try {
      // Create a new window and print the content
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Could not open print window');
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${filename}</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            img { max-width: 100%; height: auto; }
            .page-break { page-break-before: always; }
            @media print {
              .page-break { page-break-before: always; }
            }
          </style>
        </head>
        <body>
          ${element.innerHTML}
        </body>
        </html>
      `);

      printWindow.document.close();

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Trigger print
      printWindow.print();
      printWindow.close();

      console.log('✓ Fallback PDF generation completed (print dialog opened)');
    } catch (error) {
      console.error('❌ Fallback PDF generation failed:', error);
      throw error;
    }
  }

  // Scroll to top functionality
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    // Fallback for some layouts
    document.documentElement.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // Get member ID with Ethiopian year
  getFormattedMemberId(): string {
    if (!this.member?.memberId) return '';

    // We only convert if the year looks like a Gregorian year (e.g. 2024, 2025, 2026)
    // If it's already 2017/2018, we leave it alone.
    return this.member.memberId.replace(/\b(202\d|203\d)\b/g, (match) => {
      const gYear = parseInt(match);
      if (gYear >= 2024) { // Only convert recent/future Gregorian years
        const referenceDate = this.member.lastPaid ? new Date(this.member.lastPaid) : new Date();
        return this.getEthiopianYear(referenceDate).toString();
      }
      return match;
    });
  }

  // Calculate Ethiopian Year
  private getEthiopianYear(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();

    // Ethiopian New Year (Meskerem 1) is usually Sept 11 (or 12 in leap years)
    if (month < 9 || (month === 9 && day < 11)) {
      return year - 8;
    } else {
      return year - 7;
    }
  }
}
