import * as WSS from 'ws';

const wss = new WSS.Server({port: 25565});

let rooms: {[name: string]: {clients: {id: string, ws: WSS}[], data: string | undefined}} = {};

wss.on('connection', function connection(ws) {
    let id = `${new Date().getTime()}-${Math.floor(Math.random()*10000000)}`;
    let path: string | undefined = undefined;
    
    ws.on('message', data => {
        // convert data to a string value
        data = `${data}`;
        //if a path has not yet been established and a valid path value was provided
        if(path === undefined){
            if(/^[0-9a-zA-Z_\-]*$/.test(data)){
                path = data;
                if(rooms[path] === undefined){
                    rooms[path] = {clients: [], data: undefined};
                } else if(rooms[path].data !== undefined) {
                    try {
                        ws.send(rooms[path].data);
                    } catch(e){
                        console.error(`Failed to broadcast initial data to client ${id}`);
                    }
                }
                rooms[path].clients.push({id,ws});
            }
        } else {
            rooms[path].data = data;
            rooms[path].clients.filter(x=>x.id !== id).forEach(client=>{
                try {
                    client.ws.send(data);
                } catch(e){
                    console.error(`Failed to broadcast data to client ${client.id}`);
                }
            });
        }
    });

    ws.on('close', () => {
        if(path !== undefined){
            rooms[path].clients = rooms[path].clients.filter(x=>x.id !== id);
        }
    });
});
