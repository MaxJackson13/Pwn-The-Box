# Pwn-The-Box

## Summary

Running `start.sh` spins up three docker containers. The first is a `mongoDB` backend to the `node` container. The `node` container presents a login page at `172.18.0.2:5000/login`. There's no sign-up option, however you can use a timing attack to enumerate a username. This occurs because when you supply a valid username, the code proceeds to use `bcrypt.compare` to evaluate the submitted password against the stored hash, however the code exits before the supplied password is compared to the hash for invalid usernames. A simple brute-force finds the password almost immediately for the found username.

After authenticating, we're presented with an option to search, however any search requests yields a `403 Unauthorized`. Inspecting the cookies we find we've been set a JWT. Decoding the JWT shows two things of interest:
1. A field `isAdmin` in the payload set to `false`
2. The `kid` field in the header is set to `../../../etc/passwd`

The `kid` is a field the server uses to determine which key was used in the signature. It appears the server is using `/etc/passwd` as the key. This may seem secure at first as we've no idea what the server's `/etc/passwd` looks like. However if we supply a file for the `kid` we reliably know will be the same on the server as for us, we can forge a token. A good file to use is `/dev/null` as it's the same and present across every Linux system. So we can set `isAdmin: true` and `kid: '../../../dev/null'`, and forge a token which the server will successfully verify. 

Now we have access to the search functionality. Testing `NoSQL` injection payloads doesn't appear to work, however if we proxy the request through Burpsuite and change the `Content-Type` to `application/json` we find success with the payload `{"username":{"$ne":null}}`. This returns a new user we didn't capture in the timing attack, along with their hash. We can use `hashcat/john` to crack the hash and `ssh` into the web container.

Once inside the web container, we'll find (using `pspy64`) a root owned cron and port 8000 open on the container at `172.18.0.4` correlating to the web console of a Splunk deployment server. We can use `chisel` to tunnel traffic through the web container to the Splunk instance and recieve it on localhost. With access to the Splunk web console on localhost, we can login with default credentials and inpsect the logs. We find the logs from the web app are being stored on the Splunk server, and in particular logs appear to show a request to the `/login` endpoint with root credentials. With these we can `su -` to get root.
