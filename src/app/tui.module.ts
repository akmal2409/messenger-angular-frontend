import { NgModule } from '@angular/core';
import {
  TuiAlertModule,
  TuiButtonModule,
  TuiDialogModule,
  TuiHintModule,
  TuiLoaderModule,
  TuiRootModule,
  TuiScrollbarModule,
} from '@taiga-ui/core';
import {
  TuiBadgedContentModule,
  TuiBadgeModule,
  TuiInputModule,
  TuiTextAreaModule,
} from '@taiga-ui/kit';

const MODULES = [
  TuiDialogModule,
  TuiAlertModule,
  TuiRootModule,
  TuiButtonModule,
  TuiBadgeModule,
  TuiScrollbarModule,
  TuiBadgedContentModule,
  TuiHintModule,
  TuiAlertModule,
  TuiLoaderModule,
  TuiTextAreaModule,
  TuiInputModule,
];

@NgModule({
  imports: MODULES,
  exports: MODULES,
})
export class TuiModule {}
