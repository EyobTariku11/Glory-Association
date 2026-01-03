import { Component } from '@angular/core';
import { SharedModule } from "../../shared.module";
import { EventsCarouselComponent } from '../../components/events-carousel/events-carousel.component';
import { ContactComponent } from '../../components/contact/contact.component';
import { BoardMembersComponent } from '../../components/board-members/board-members.component';
import { AdvertisementComponent } from '../../components/advertisement/advertisement.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [SharedModule, EventsCarouselComponent, ContactComponent, BoardMembersComponent, AdvertisementComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {

}

export enum AdvertisementPosition {
  Top = 1,
  Bottom = 2,
  Left = 3,
  Right = 4,
  Center = 5,
  Header = 6,
  Footer = 7,
  Sidebar = 8,
  Inline = 9
}