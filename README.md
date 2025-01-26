## TODO

* Uppdatera postgres till senaste version: Verkar vara ganska svårt på fly.io - [Guide](https://fly.io/docs/postgres/managing/upgrades/)

* Radera databasen ks-web-scraper och använd istället default postgres.


---
## Dokumentation
 
### Guide: använda postgres i fly.io via Windows Terminal
Username och pass finns i mapp på desktop (Om du behöver logga in igen)
 
1. Ansluta: `fly postgres connect -a api-ks-web-scraper-db`
1. Anslut till databas: `\c api-ks-web-scraper`
1. `select * from watch \g` (`\g` används för att visa att sql:en är slut och postgres ska exekvera det som finns före)
1. Lista alla tabeller: `\dt`
1. Visa datatyper, pk och fk på en tabell: `\d watch`


---
### Guide: Load testing
`autocannon -c=10000 192.168.1.2:3000/api/bevakningar/all-watches`

Kör med config som har 10 000 connections. För att öka tiden som lasten körs använd t.e.x. `-d=30` för att köra i 30 sekunder. Default är 10 sek.




<div align="center">

### Länkar
> [deno blog](https://deno.com/blog)
> 
> [Load testing](https://www.npmjs.com/package/autocannon)
> 
> [Docs för porsager/postgres](https://github.com/porsager/postgres)
> 
> [Bra repo - api starter oak](https://github.com/asad-mlbd/deno-api-starter-oak)
> 
> [JWT](https://github.com/wpcodevo/deno-refresh-jwt/blob/master/src/controllers/auth.controller.ts)
> 
> [CRUD + JWT](https://github.com/22mahmoud/deno_crud_jwt)

</div>