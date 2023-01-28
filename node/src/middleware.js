const jwt = require('jsonwebtoken');
const fs = require('fs')

const verifyJwt = (req, res, next) => {
    const token = req.cookies.jwt

    if (token) {
        decodedToken = jwt.decode(token, { complete: true })
        if (!decodedToken.header.kid){
            res.sendStatus(400)
        }
        
        let key
        try {
            key = fs.readFileSync(decodedToken.header.kid) 
        }
        catch {
            res.sendStatus(500)
        }
        
        jwt.verify(token, key, (err, decoded) => {
            if (err) res.sendStatus(400)
            next()
        })
    }
    else {
        res.redirect('/login')
    }
}
const verifyAdmin = (req, res, next) => {
    const token  = req.cookies.jwt

    if (token) {
        const decodedToken = jwt.decode(token, { complete: true })
        if (!decodedToken.header.kid){
            res.sendStatus(400)
        }
        
        let key
        try {
            key = fs.readFileSync(decodedToken.header.kid) 
        }
        catch {
            res.sendStatus(500)
        }

        if (!jwt.verify(token, key).isAdmin) {
            return res.sendStatus(403)
        }
        else {
            next()
        }
    }
    else {
        res.redirect('/login')
    }
}

module.exports = { verifyJwt, verifyAdmin }