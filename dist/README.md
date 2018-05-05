# Sheetbase Angular

Angular module for using Sheetbase in Angular/Ionic projects.

## Install

``npm install --save sheetbase-angular``

## Usage

Import __SheetbaseModule__ to your _app.module.ts_.

```js	
import { SheetbaseModule } from 'sheetbase-angular';
import { SHEETBASE_CONFIG } from '../configs/sheetbase.config';

imports: [
	SheetbaseModule.forRoot(SHEETBASE_CONFIG)
]
```

Inject DataService into your page.

```js
import { DataService as DataProvider } from 'sheetbase-angular';

constructor(
	private sheetbaseData: DataProvider
) {}

ngOnInit() {
	this.sheetbaseData.get('posts')
	.subscribe(posts => {
		console.log('My posts: ', posts);
	});
}
```

## Docs

See [Documentation](https://sheetbase.net/docs) for more.

## API

### DataService

#### get(collection: string, doc: string = null, query: IDataQuery = null)

```js
this.sheetbaseData.get('posts', 'post-1')
.subscribe(post1 => {
	console.log(post1);
});

```

### ApiService

#### GET(endpoint: string = null, params: any = {})

```js
this.sheetbaseApi.GET('/data', {
	apiKey: 'my_api_key',
	table: 'posts'
})
.subscribe(posts => {
	console.log(posts);
});

```

#### POST(endpoint: string = null, params: any = {}, body: any = {})

```js
this.sheetbaseApi.POST('/user/create', {}, {
	apiKey: 'my_api_key',
	email: 'email@email.email',
	password: 'password'
})
.subscribe(profile => {
	console.log(profile);
});

```

### UserService

#### getToken()

```js
this.sheetbaseUser.getToken()
.subscribe(token => {
	console.log(token);
});

```

#### getUser()

```js
this.sheetbaseUser.getUser()
.subscribe(profile => {
	console.log(profile);
});

```

#### onAuthStateChanged()

```js
this.sheetbaseUser.onAuthStateChanged()
.subscribe(profile => {
	console.log(profile);
});

```

#### createUserWithEmailAndPassword(email: string, password: string)

```js
this.sheetbaseUser.createUserWithEmailAndPassword(
	'email@email.email',
	'password'
)
.subscribe(profile => {
	console.log(profile);
});

```

#### loginWithEmailAndPassword(email: string, password: string)

```js
this.sheetbaseUser.loginWithEmailAndPassword(
	'email@email.email',
	'password'
)
.subscribe(profile => {
	console.log(profile);
});

```

#### logout()

```js
this.sheetbaseUser.logout()
.subscribe(() => {
	console.log('You are out!');
});

```

#### updateProfile(profile: any)

```js
this.sheetbaseUser.updateProfile({
	displayName: 'My Name',
	tel: '+1 2345 6789'
})
.subscribe(profile => {
	console.log(profile);
});

```

#### resetPasswordEmail(email: string)

```js
this.sheetbaseUser.resetPasswordEmail('email@email.email')
.subscribe(() => {
	console.log('Email sent!');
});

```

#### setPassword(oobCode: string, password: string)

```js
this.sheetbaseUser.setPassword(
	'my_oob_code',
	'new-password'
)
.subscribe(() => {
	console.log('Cool! Please login with your new password!');
});

```

#### verifyCode(oobCode: string)

```js
this.sheetbaseUser.verifyCode('my_oob_code')
.subscribe(() => {
	console.log('Valid!');
});

```

### FileService

#### get(fileId: string)

```js
this.sheetbaseFile.get('file_id')
.subscribe(fileInfo => {
	console.log(fileInfo);
});

```

#### upload(appFile: IAppFile, customFolder: string = null)

```js
this.sheetbaseFile.upload({
	name: 'file.txt',
	mimeType: 'text/plain',
	base64String: 'Ab73Ajdwk...'
})
.subscribe(fileInfo => {
	console.log(fileInfo);
});

```

#### load(file: File)

```js
this.sheetbaseFile.load(localFile)
.subscribe(localFileInfo => {
	console.log(localFileInfo);
});

```

## Support us
[<img src="https://cloakandmeeple.files.wordpress.com/2017/06/become_a_patron_button3x.png?w=200">](https://www.patreon.com/lamnhan)