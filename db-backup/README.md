# Backup av PostgreSQL databas lokalt

## DBeaver

1. Högerklicka på databasen i DBeaver och välj: 
   1. Tools ->  Backup
1. Välj rätt local client nere till vänster
1. Format **Plain** för att få allt i .sql
1. Bocka i "Add create database statement" för att skapa själva databasen
1. Välj output folder
1. Klart!


## CLI

`pg_dump -U postgres -d ks-web-scraper -f C:\Code\deno\deno-api-ks-web-scraper\db-backup\backup.sql`

Eller för att endast schema, ingen data:

`pg_dump -U postgres -d ks-web-scraper --schema-only -f C:\Code\deno\deno-api-ks-web-scraper\db-backup\backup.sql`

Samma lösenord som i .env
