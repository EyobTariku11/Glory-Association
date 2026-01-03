import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NewsRoutingModule } from './news-routing.module';
import { MyNewsComponent } from './my-news/my-news.component';
import { NewsApprovalComponent } from './news-approval/news-approval.component';
import { AllNewsComponent } from './all-news/all-news.component';
import { SafePipe } from '../../../pipes/safe.pipe';

@NgModule({
  declarations: [
    MyNewsComponent,
    NewsApprovalComponent,
    AllNewsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NewsRoutingModule,
    SafePipe
  ]
})
export class NewsModule { } 