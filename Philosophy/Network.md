# Network
The Network module is designed to unify common network tasks under an easy API.

## Goals
* Friendly interface to show network conditions
* Handle connectivity problems smoothly
* Provide ways to make syncing lossless
* ...

## Architecture
It has 5 channels for communication with server
### Get
get something from the server immediately
### Fetch
when you wanna do a `get` as a promise (async / await)
### Sync
sync changes, to save from client to server
* uses .time to maintain sync between client & server
* the response is empty
* responds through broadcast
* can automatically use `Offline` storage if registered using `Offline.response.sync`
### Broadcast
listens for changes
* returns on triggers like sync from you or others
* always returns .time on success
### Upload
Client:
```js
Network.upload( module_name, 'photo', value, payload );
```
Server:
```js
Hooks.set('network-upload', [module_name, 'photo'], async function ( response ) {
	let value = response.value,
		payload = response.payload;
});
```

## Model
Both the client and server have a simliar model.  
You `intercept` a Network request or a response and manipulate it.  

You can register interceptors for each channel that are triggered when needed.

[TODO] easy examples


## Server
You can intercept requests on the server using the same three channels as the client.  
Each channel by default is processed at a secondary "favor" aka level.  
If you want your processor to be favored above all, you can use:  

```js
Network.favor(PRIMARY).intercept( name, need, processor )
```

## Client
You are able to listen for specific responses for your own module.  
```js
let response = await Network.fetch(module_name, need, data);
```
You can also handle responses for requests made by others.
```js
Hooks.set('network-get', module_name, async function ( response ) {
	$.log.w( response );
});
// or
Hooks.set('network-get', [module_name, need], async function ( response ) {
	$.log.w( response );
});
```


