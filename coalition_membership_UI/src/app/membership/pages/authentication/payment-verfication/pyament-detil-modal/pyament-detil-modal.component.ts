import { Component, input, Input, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-pyament-detil-modal',
  templateUrl: './pyament-detil-modal.component.html',
  styleUrls: ['./pyament-detil-modal.component.scss']
})
export class PyamentDetilModalComponent  implements OnInit{

 @Input() userId:string ='';
 @Input() fullName: string='';
 @Input() membershipId: string='';
 @Input() membershipType: string='';

 copied = false;
  ngOnInit(): void {
    
  }

  constructor( private clipboard: Clipboard , private activeModal : NgbActiveModal){}



    // Copy membership ID to clipboard
    copyMembershipId() {
      this.clipboard.copy(this.membershipId);
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
  
    }

    closeModal(){
      this.activeModal.close()
      
    }

    connectTelegram() {
        const userId = this.userId;
        const token = environment.telegramBot;
        const botLink = `https://t.me/${token}?start=${userId}`;
        window.open(botLink, "_blank");
      }
    

   

}
