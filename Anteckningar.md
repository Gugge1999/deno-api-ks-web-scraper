## TODO

* Uppdatera postgres till senaste version: Verkar vara ganska svårt på fly.io. [Guide](https://fly.io/docs/postgres/managing/upgrades/)


* Är [deno-nessie](https://github.com/halvardssm/deno-nessie) bättre för migration?


* [Är TypeSpec bra för att ha typsäkert mellan api och SPA?](https://typespec.io/)


* [för login och registering](https://github.com/thecodeholic/deno-login-register/blob/master/routes.ts)


## Dokumentation
 
### Guide: använda postgres i fly.io via Windows Terminal
1. Ansluta: `fly postgres connect -a api-ks-web-scraper-db`
2. Anslut till databas: `\c api-ks-web-scraper`
3. `select * from watch \g` (`\g` används för att visa att sql:en är slut och postgres ska exekvera det som finns före)
4. Lista alla tabeller: `\dt`
5. Visa datatyper, pk och fk på en tabell: `\d watch` 

  
* [deno blog](https://deno.com/blog)


* [Docs för porsager/postgres](https://github.com/porsager/postgres)


* [Bra repo - api starter oak](https://github.com/asad-mlbd/deno-api-starter-oak)


* [JWT](https://github.com/wpcodevo/deno-refresh-jwt/blob/master/src/controllers/auth.controller.ts)


* [CRUD + JWT](https://github.com/22mahmoud/deno_crud_jwt)