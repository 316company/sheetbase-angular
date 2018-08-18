export default {
    input: 'dist/src/index.js',
    external: [
		'@angular/core',
		'@angular/common/http',
		'rxjs',
		'rxjs-compat',
		'lodash',
		'pubsub-js',
		'localforage'
	],
    output: {
        file: 'dist/bundles/sheetbase.umd.js',
        format: 'umd',
        name: 'ng.sheetbase',
        globals: {
            '@angular/core': 'ng.core',
            'rxjs/Observable': 'Rx',
            'rxjs/ReplaySubject': 'Rx',
            'rxjs/add/operator/map': 'Rx.Observable.prototype',
            'rxjs/add/operator/mergeMap': 'Rx.Observable.prototype',
            'rxjs/add/observable/fromEvent': 'Rx.Observable',
            'rxjs/add/observable/of': 'Rx.Observable'
        }
    }
}