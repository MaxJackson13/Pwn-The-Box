const http = require('http')

const data = JSON.stringify({username:'root',password:'rootenpotato'})
const options = {
	hostname: '172.18.0.2',
	port: 5000,
	path: '/login',
	method: 'POST',
	headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}

const req = http.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`);

  res.on('data', (d) => {
    process.stdout.write(d);
  });
});
req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
