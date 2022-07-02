import { NgModule } from "@angular/core";
import { TuiAlertModule, TuiButtonModule, TuiDialogModule, TuiRootModule } from "@taiga-ui/core";

const MODULES = [
  TuiDialogModule,
  TuiAlertModule,
  TuiRootModule,
  TuiButtonModule
];

@NgModule({
  imports: MODULES,
  exports: MODULES
})
export class TuiModule {

}
