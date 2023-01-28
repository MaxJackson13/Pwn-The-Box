db=db.getSiblingDB('admin')

db.auth('root', 'rootpass')

db=db.getSiblingDB('appdb')

db.createCollection('users')

db.users.insertMany([
	{username: 'max', 
	 password: '$2b$10$T/Unss1Wb/3x.a5K1kit4uPyBdSCgNpZdpWs1AA4OwoVnl7mhv0Ly'},
	{username: 'superadmin', 
	 password: '$2b$10$ffvWzOOfzqRysOhMGd.0K.V3YgdIwM5EQ7il0tZ0YHyiqdWthuFsO'}
])
