It's really an irresponsible idea to suggest using any of the complex database management systems as good solutions to manage a 1000 records in total.

A simple flat text based database system, that if need be in the future, can be upgraded to the complex database management systems is far better.

Easier to read and update directly in simple text editors that themselves are easy to write.

The principle here is to have people depend less on obscure magical software that they'll never have the time to verify themselves. Instead give them simpler solutions that they can verify, learn and improve upon independently.

The database module should default to using text files. All data should be stored in the same directory to make it easy to backup and restore. Each file should be named in a way that its context and purpose should be easily identifiable.

