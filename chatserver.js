var net = require('net')

var chatServer = net.createServer(),
	clientList = []

chatServer.on('connection', function(client){
	client.name = client.remoteAddress + ':' + client.remotePort
	client.write('Hi ' + client.name + '!\n');
	console.log(client.name + ' joined the chat.')
	
	clientList.push(client)
	
	client.on('data', function(data){
		broadcast(data, client)
	})
	
	client.on('end', function(){
		console.log(client.name + ' disconnected.')
		clientList.splice(clientList.indexOf(client), 1)
	})
	
	client.on('error', function(e){
		console.log(e)
	})

})

function broadcast(message, client){
	var cleanup = []
	for(var i=0;i<clientList.length;i++){
		if(client !== clientList[i]){
			if(clientList[i].writable){
				clientList[i].write(client.name + " says " + message)
			} else {
				cleanup.push(clientList[i])
				clientList[i].destroy()
			}
		}
	}
	//Remove dead nodes out of write loop to avoid trashing loop
	for(i=0;i<cleanup.length;i++){
		clientList.splice(clientList.indexOf(cleanup[i]), 1)
	}
}

chatServer.listen(9000)