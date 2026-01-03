import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyNewsComponent } from './my-news/my-news.component';
import { NewsApprovalComponent } from './news-approval/news-approval.component';
import { AllNewsComponent } from './all-news/all-news.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'my-news',
        component: MyNewsComponent,
      },
      {
        path: 'approval',
        component: NewsApprovalComponent,
      },
      {
        path: 'all',
        component: AllNewsComponent,
      },
      {
        path: '',
        redirectTo: 'my-news',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewsRoutingModule { } 