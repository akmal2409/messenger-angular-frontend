import { NgModule } from "@angular/core";
import { TuiAlertModule, TuiButtonModule, TuiDialogModule, TuiHintModule, TuiRootModule, TuiScrollbarModule } from "@taiga-ui/core";
import { TuiBadgedContentModule, TuiBadgeModule } from "@taiga-ui/kit";

const MODULES = [
  TuiDialogModule,
  TuiAlertModule,
  TuiRootModule,
  TuiButtonModule,
  TuiBadgeModule,
  TuiScrollbarModule,
  TuiBadgedContentModule,
  TuiHintModule
];

@NgModule({
  imports: MODULES,
  exports: MODULES
})
export class TuiModule {

}
