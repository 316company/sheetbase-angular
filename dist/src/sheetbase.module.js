import { NgModule } from '@angular/core';
import { SheetbaseConfigService } from './services/sheetbase-config.service';
import { SheetbaseService } from './services/sheetbase.service';
var SheetbaseModule = /** @class */ (function () {
    function SheetbaseModule() {
    }
    SheetbaseModule.forRoot = function (config) {
        return {
            ngModule: SheetbaseModule,
            providers: [
                SheetbaseService,
                {
                    provide: SheetbaseConfigService,
                    useValue: config
                }
            ]
        };
    };
    SheetbaseModule.decorators = [
        { type: NgModule },
    ];
    return SheetbaseModule;
}());
export { SheetbaseModule };
//# sourceMappingURL=sheetbase.module.js.map