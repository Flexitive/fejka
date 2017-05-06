#!/usr/bin/env node
const { ArgumentParser } = require('argparse'),
      path = require('path'),
      Hapi = require('hapi'),
      Boom = require('boom'),
      got = require('got'),
      Lru = require('lru-cache'),
      md5 = require('md5'),
      { version } = require('./package.json');

const parser = new ArgumentParser({ version });

parser.addArgument(
  [ 'filename' ],
  {
    'help': 'Filename exporting a transform function',
    'type': 'string'
  }
)

parser.addArgument(
  [ '-p', '--port' ],
  {
    'help': 'Port number to start service on',
    'defaultValue': 8080,
    'type': 'int'
  }
);

const args = parser.parseArgs();

const transform = require(path.resolve(process.cwd(), args.filename));

const cache = Lru(20);

const server = new Hapi.Server();

server.connection({ port: args.port });

server.route({
  method: 'GET',
  // NOTE multiple requests from the same endpoint will be handled in sequence.
  path: '/{creative_id*}',
  handler: (req, reply) => {
    const { creative_id } = req.params;
    const id = md5(creative_id + JSON.stringify(req.query));

    // Have it?
    if (cache.has(id)) {
      const { body, type } = cache.get(id);
      return reply(body).header('content-type', type);
    }

    // Make a request.
    got(`ad.flexitive.com/v2/${creative_id}/-/border/false/`)
    // Transform.
    .then((data) => transform(data, req.query))
    // Reply.
    .then((data) => {
      let type = 'text/html; charset=utf-8', body = data;
      if (typeof data === 'object') {
        if (data.type) type = data.type;
        body = data.body;
      }

      // Cache.
      cache.set(id, { body, type });

      // Fin.
      reply(body).header('content-type', type);
    })
    .catch((err) => {
      reply(Boom.badRequest('Bad!'));
    });
	}
});

server.start(() => {
  console.log(`fejka/${version} started on port ${server.info.port}`);
});
