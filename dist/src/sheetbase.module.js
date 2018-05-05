import { NgModule } from '@angular/core';
import { SheetbaseConfigService } from './services/sheetbase-config.service';
import { SpreadsheetService } from './services/spreadsheet.service';
import { DataService } from './services/data.service';
import { ApiService } from './services/api.service';
import { UserService } from './services/user.service';
import { UserDataService } from './services/user-data.service';
import { FileService } from './services/file.service';
var SheetbaseModule = /** @class */ (function () {
    function SheetbaseModule() {
    }
    SheetbaseModule.forRoot = function (sheetbaseConfig) {
        return {
            ngModule: SheetbaseModule,
            providers: [
                {
                    provide: SheetbaseConfigService,
                    useValue: sheetbaseConfig
                },
                SpreadsheetService,
                DataService,
                ApiService,
                UserService,
                UserDataService,
                FileService,
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