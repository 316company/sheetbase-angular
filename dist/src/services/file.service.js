import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
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
    function (file, customFolder) {
        var _this = this;
        if (customFolder === void 0) { customFolder = null; }
        return new Observable(function (observer) {
            var reader = new FileReader();
            reader.onload = function (e) {
                var body = {
                    file: Object.assign(_this.base64Breakdown(e.target.result), {
                        name: file.name
                    })
                };
                if (customFolder)
                    body.folder = customFolder;
                _this.apiService.POST('/file', {}, body)
                    .then(function (response) {
                    observer.next(response);
                    observer.complete();
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