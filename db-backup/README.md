# Backup av PostgreSQL databas lokalt

## DBeaver

1. Högerklicka på databasen i DBeaver och välj: 
   1. Tools ->  Backup
1. Välj rätt local client nere till vänster
1. Format **Plain** för att få allt i .sql
1. Välj output folder
1. Klart!


## CLI
```
pg_dump -U postgres -d ks-web-scraper -f .\deno\deno-api-ks-web-scraper\db-backup\backup.sql
```

Samma lösenord som i .env
