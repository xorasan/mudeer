# Network
The Network module is designed to unify common network tasks under an easy API.

## Goals
* Friendly interface to show network conditions
* ...

It has 3 channels for communication with server
* `get`	get something from the server immediately
* `sync` sync changes, to save from client to server
	* uses .time to maintain sync between client & server
	* the response is empty
	* responds through broadcast
	* can automatically use `Offline` storage if registered using `Offline.response.sync`
* `broadcast` listens for changes
	* returns on triggers like sync from you or others
	* always returns .time on success

Both the client and server have a simliar model.  
You are able to listen for specific responses for your own module.  
You `intercept` a Network request or a response and manipulate it.  

You can register interceptors for each channel that are triggered when needed.

[TODO] easy examples


## Server
You can intercept requests on the server using the same three channels as the client.  
Each channel by default is processed at a secondary "favor" aka level.  
If you can want your processor to be favored above all, you can use:  

```
Network.favor(PRIMARY).intercept( name, need, processor )
```
