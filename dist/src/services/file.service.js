import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ApiService } from './api.service';
var FileService = /** @class */ (function () {
    function FileService(ngZone, apiService) {
        this.ngZone = ngZone;
        this.apiService = apiService;
    }
    FileService.prototype.get = function (fileId) {
        return this.apiService.GET('/file', {
            id: fileId
        });
    };
    // TODO: https://xkeshi.github.io/image-compressor/
    // TODO: https://xkeshi.github.io/image-compressor/
    FileService.prototype.upload = 
    // TODO: https://xkeshi.github.io/image-compressor/
    function (appFile, customFolder, customName) {
        var _this = this;
        if (customFolder === void 0) { customFolder = null; }
        if (customName === void 0) { customName = null; }
        return new Observable(function (observer) {
            if (!appFile)
                return observer.error('No local file!');
            var body = {
                file: Object.assign(_this.base64Breakdown(appFile.base64), {
                    name: appFile.name
                })
            };
            if (customFolder)
                body.folder = customFolder;
            if (customName)
                body.name = customName;
            _this.apiService.POST('/file', {}, body)
                .subscribe(function (response) {
                observer.next(response);
            }, function (error) { return observer.error(error); });
        });
    };
    FileService.prototype.load = function (file) {
        return new Observable(function (observer) {
            if (!file)
                return observer.error(null);
            var reader = new FileReader();
            reader.onload = function (e) {
                observer.next({
                    name: file.name,
                    size: file.size,
                    mimeType: file.type,
                    base64: e.target.result
                });
            };
            reader.readAsDataURL(file);
        });
    };
    FileService.prototype.base64Breakdown = function (base64Data) {
        var breakdownData = base64Data.split(';base64,');
        return {
            mimeType: breakdownData[0].replace('data:', ''),
            base64String: breakdownData[1]
        };
    };
    FileService.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    FileService.ctorParameters = function () { return [
        { type: NgZone, },
        { type: ApiService, },
    ]; };
    return FileService;
}());
export { FileService };
//# sourceMappingURL=file.service.js.map