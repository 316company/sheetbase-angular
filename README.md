# Sheetbase Angular

Angular module for using Sheetbase in Angular/Ionic projects.

## Install

``npm install --save sheetbase-angular``

## Usage

Import __SheetbaseModule__ to your _app.module.ts_.

```typescript	
import { SheetbaseModule } from 'sheetbase-angular';
import { SHEETBASE_CONFIG } from '../configs/sheetbase.config';

imports: [
	SheetbaseModule.forRoot(SHEETBASE_CONFIG)
]
```

Inject services into your page.

```typescript
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

## Config

There are 2 ways to config the module.

### Option 1: Data only

Get data directly from Google API.

| Key          | Type   | Description                |
|--------------|--------|----------------------------|
| googleApiKey | string | Google API Key             |
| databaseId   | string | ID of database spreadsheet |

### Option 2: Full options

Using backend to get data and other functions.

| Key        | Type   | Description     |
|------------|--------|-----------------|
| apiKey     | string | Backend API Key |
| backendUrl | string | Backend URL     |

### Other configs

| Key       | Type   | Description           |
|-----------|--------|-----------------------|
| modifiers | object | Custom modifying data |

## API

### DataService

+ ``get(collection: string, doc: string = null, query: IDataQuery = null)``

Get data from database.

```typescript
this.sheetbaseData.get('posts', 'post-1')
.subscribe(post1 => {
	console.log(post1);
});

```

### ApiService

+ ``GET(endpoint: string = null, params: any = {})``

Request GET method.

```typescript
this.sheetbaseApi.GET('/data', {
	apiKey: 'my_api_key',
	table: 'posts'
})
.subscribe(posts => {
	console.log(posts);
});

```

+ ``POST(endpoint: string = null, params: any = {}, body: any = {})``

Request POST method.

```typescript
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

+ ``getToken()``

Get user id token.

```typescript
this.sheetbaseUser.getToken()
.subscribe(token => {
	console.log(token);
});

```

+ ``getUser()``

Get user data.

```typescript
this.sheetbaseUser.getUser()
.subscribe(profile => {
	console.log(profile);
});

```

+ ``onAuthStateChanged()``

Event of user authentication status.

```typescript
this.sheetbaseUser.onAuthStateChanged()
.subscribe(profile => {
	console.log(profile);
});

```

+ ``createUserWithEmailAndPassword(email: string, password: string)``

Register new user by email and password.

```typescript
this.sheetbaseUser.createUserWithEmailAndPassword(
	'email@email.email',
	'password'
)
.subscribe(profile => {
	console.log(profile);
});

```

+ ``signInWithEmailAndPassword(email: string, password: string)``

Log user in by using email and password.

```typescript
this.sheetbaseUser.signInWithEmailAndPassword(
	'email@email.email',
	'password'
)
.subscribe(profile => {
	console.log(profile);
});

```

+ ``signOut()``

Log user out.

```typescript
this.sheetbaseUser.signOut()
.subscribe(() => {
	console.log('You are out!');
});

```

+ ``updateProfile(profile: any)``

Update user profile.

```typescript
this.sheetbaseUser.updateProfile({
	displayName: 'My Name',
	tel: '+1 2345 6789'
})
.subscribe(profile => {
	console.log(profile);
});

```

+ ``sendPasswordResetEmail(email: string)``

Ask for password reset email.

```typescript
this.sheetbaseUser.sendPasswordResetEmail('email@email.email')
.subscribe(() => {
	console.log('Email sent!');
});

```

+ ``confirmPasswordReset(oobCode: string, password: string)``

Change user password.

```typescript
this.sheetbaseUser.confirmPasswordReset(
	'my_oob_code',
	'new-password'
)
.subscribe(() => {
	console.log('Cool! Please login with your new password!');
});

```

+ ``applyActionCode(oobCode: string)``

Verify out-of-band code.

```typescript
this.sheetbaseUser.applyActionCode('my_oob_code')
.subscribe(() => {
	console.log('Valid!');
});

```

### FileService

+ ``get(fileId: string)``

Get file information by id.

```typescript
this.sheetbaseFile.get('file_id')
.subscribe(fileInfo => {
	console.log(fileInfo);
});

```

+ ``upload(appFile: IAppFile, customFolder: string = null)``

Upload a file.

```typescript
this.sheetbaseFile.upload({
	name: 'file.txt',
	mimeType: 'text/plain',
	base64String: 'Ab73Ajdwk...'
})
.subscribe(fileInfo => {
	console.log(fileInfo);
});

```

+ ``load(file: File)``

Load local file.

```typescript
this.sheetbaseFile.load(localFile)
.subscribe(localFileInfo => {
	console.log(localFileInfo);
});

```

## Homepage

Please visit [https://sheetbase.net/](https://sheetbase.net) for more.

## Support us
[<img src="https://cloakandmeeple.files.wordpress.com/2017/06/become_a_patron_button3x.png?w=200">](https://www.patreon.com/lamnhan)