import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';


@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterModule, CommonModule, TranslocoPipe],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent implements OnInit {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() description: string = '';
  @Input() logoUrl: string = '';
  @Input() backgroundImage: string = '';
  @Input() inlineLogo: boolean = false;

  ngOnInit(): void {
    if (this.backgroundImage) {
      this.slides.forEach(slide => slide.background = this.backgroundImage);
    }
    setInterval(() => this.nextSlide(), 6000);
  }
  slides = [
    {
      title: 'Ethiopian Premier League ',
      subtitle: 'የፕሪሚየር ሊግ የእግር ኳስ ደጋፊዎች ማህበር',
      background: '/assets/images/stadium-bg.jpg',
    },
    {
      title: 'Support Your Club With Every Goal',
      subtitle: 'Join thousands of fans supporting their team',
      background: 'assets/images/stadium-bg.jpg',
    },
    {
      title: 'Buy Jerseys, Get E-Tickets, and More',
      subtitle: 'ከአንድ ጣቢያ ሁሉን ያግኙ',
      background: 'assets/images/stadium-bg.jpg',
    },
  ];
  currentIndex = 0;

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentIndex =
      (this.currentIndex - 1 + this.slides.length) % this.slides.length;
  }

  goTo(index: number) {
    this.currentIndex = index;
  }

  scrollToNews(event: Event) {
    event.preventDefault();
    const element = document.getElementById('latest-news');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
