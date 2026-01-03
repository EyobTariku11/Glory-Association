import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageErrorDirective } from '../directives/image-error.directive';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ImageErrorDirective
  ],
  exports: [
    CommonModule,
    ImageErrorDirective
  ]
})
export class SharedModule { } 