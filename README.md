# fejka

Transform Flexitive content on the fly.

## Setup

```bash
$ nvm use
$ npm i
$ fejka transform.js --port 8080
# fejka v0.0.1 started on port 8080
```

## Use

First write a transform function in a file accepting (1) HTML `body` of the creative, (2) query parameter `opts` and returning a promise:

```js
module.exports = (body, opts) => {
  return new Promise((res) => {
    // ...
    res({ body, type }); // you can pass a custom `content-type` header here
  });
};
```

Now you can make a request to the server passing in a `creative_id` and a bunch of custom query parameters. The creative will be fetched from Flexitive, its content transformed using your function and cached.

```bash
$ curl -i -H http://0.0.0.0:8080/<creative_id>?ratio=lock&position=grid
# returns transformed HTML
```
### Caching

Each unique request URL is cached by the service. If you'd like to always get the latest version of the data, simply pass a timestamp as one of the query parameters, making each request unique.
