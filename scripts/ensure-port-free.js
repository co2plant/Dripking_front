const net = require('net');

const port = Number(process.argv[2]);

if (!Number.isInteger(port) || port <= 0) {
  console.error('Usage: node scripts/ensure-port-free.js <port>');
  process.exit(1);
}

const server = net.createServer();

server.once('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Stop the existing dev server instead of falling back to another port.`);
    process.exit(1);
  }

  console.error(`Could not check port ${port}: ${error.message}`);
  process.exit(1);
});

server.once('listening', () => {
  server.close(() => process.exit(0));
});

server.listen(port, '0.0.0.0');
