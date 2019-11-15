const express = require('express');
const app = express();

//Fetch posts array
const posts = require('./testdata');
const mcache = require('memory-cache')
const PORT = process.env.PORT || 3000 ;
const goodRequest = 200;
const badRequest = 400;



const cache = (duration) => {
    return (req, res, next) => {
      let key = '__express__' + req.originalUrl || req.url
      let cachedBody = mcache.get(key)
      if (cachedBody) {
        res.send(cachedBody)
        return

      } else {
        res.sendResponse = res.send
        res.send = (body) => {
          mcache.put(key, body, duration * 1000);
          res.sendResponse(body)
        }
        next()
      }
    }
  }

app.get('/api/ping', cache(10), async (req, res) => {
    setTimeout(() => {
    res.status(goodRequest).send({ "success": true });
})
})

app.get('/api/posts', cache(10), (req, res) => {
    if (!req.query.hasOwnProperty('tags'))
        res.status(badRequest).send({ "error": "Tags parameter is required" })

    const tagArray = req.query.tags.split(",");
    const filterPosts = post => {
        for (i = 0; i < tagArray.length; i++) {
            if (post.tags.includes(tagArray[i])) return true;
        }
    };
    const filteredPosts = posts.filter(filterPosts);

    //Remove duplicates
    const uniquePosts = [...new Set(filteredPosts)];

    
    uniquePosts.sort((a, b) => {
        if (a.id > b.id) return 1;
        if (a.id < b.id) return -1;
        return 0;
    })

    if (req.query.hasOwnProperty('sortBy')) {
        if (req.query.sortBy == 'reads') {
            uniquePosts.sort((a, b) => {
                if (a.reads > b.reads) return 1;
                if (a.reads < b.reads) return -1;
                return 0;
            })
            res.status(goodRequest).send(uniquePosts);
            res.end();
        }

        else if (req.query.sortBy == 'likes') {
            uniquePosts.sort((a, b) => {
                if (a.likes > b.likes) return 1;
                if (a.likes < b.likes) return -1;
                return 0;
            })
            res.status(goodRequest).send(uniquePosts);
            res.end();
        }

        else if (req.query.sortBy == 'popularity') {
            uniquePosts.sort((a, b) => {
                if (a.popularity > b.popularity) return 1;
                if (a.popularity < b.popularity) return -1;
                return 0;
            })
            res.status(goodRequest).send(uniquePosts);
            res.end();
        }

        else {
            res.status(badRequest).send({ "error": "sortBy parameter is invalid" })
        }
    }
    res.status(goodRequest).send(uniquePosts);
})

module.exports = app

app.listen(PORT, () => console.log(`listening on port ${PORT}...`));