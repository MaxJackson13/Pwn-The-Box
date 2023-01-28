const fs=require('fs')
const jwt=require('jsonwebtoken')

headers = {
    kid: '../../../dev/null',
    typ: 'JWT',
    alg: 'HS256'
  }

payload = {
    "id": "63d09d48ec6f35b1f91d5506",
    "username": "max",
    "isAdmin": true,
    "iat": 1674616337
}
const key = fs.readFileSync(headers.kid)
console.log(jwt.sign(payload, key, { header: headers }))
