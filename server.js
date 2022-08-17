const {Server} = require('http');
const URLSearchParams = require('url').URLSearchParams;
const axios = require('axios');

const pageSize = 10;

// we'll use caching to minimise wastage of bandwidth and increase speed
// fetch(username) gets the userdata, and it memorises past values automatically
const fetch = (function(){
    const cache = {};
    return function(username) {
        return new Promise(async (resolve, reject)=>{
            if(cache[username]) resolve(cache[username]);
            axios.get(`https://api.github.com/users/${username}/repos?per_page=100`).then(
                res=>{
                    if(res.data) resolve(cache[username] = res.data);
                    else reject(res);
                }
            ).catch(reject)
        });
    }
})();

(new Server(async (req, res)=>{
    res.setHeader('Access-Control-Allow-Origin',  'http://localhost:3000');

    let x;
    if(x = req.url.match(/\/size\/(.+)/)){ // if the url is /size/someusername
        // then fetch the number of repos <username> has
        res.writeHead(200, {'Content-Type' : 'application/json',
        'Access-Control-Allow-Origin' : 'http://localhost:3000'});
        fetch(x[1]).then(
            data=>res.end(JSON.stringify(data.length))
        ).catch(
            ()=>res.end(JSON.stringify(0))
        )
        return; // end it here, the promise above will do its job
    }
    // get the query parameters from url
    const reqParams = (new URLSearchParams(req.url.slice(req.url.indexOf('?'))))
    
    // same as doing req.query.page and req.query.user in express
    const page = parseInt(reqParams.get('page')) || 0;
    const user = reqParams.get('username');
        // slice the data to get just the values on the current page,
        // and map the sliced data to include only the information we need
        fetch(user).then(
            data=>data.slice(page*pageSize, (page+1)*pageSize)
            .map(({name, svn_url, topics, description}) => 
                ({name, url : svn_url, topics, description})
        )).then(
            data=>{
                console.log('Succeeded fetch', user);
                res.writeHead(200, {'Content-Type' : 'application/json',
                'Access-Control-Allow-Origin' : 'http://localhost:3000'});
                res.write(JSON.stringify(data));
                res.end();    
            }
        ).catch((e)=>{
            console.log(e.response);
            res.writeHead( e.response?.status || 500, {'Content-Type':'application/json', 
            'Access-Control-Allow-Origin' : 'http://localhost:3000'});
            res.end(e.response?.data?.message || JSON.stringify(e));
        })
        
    }
)).listen(3001);
