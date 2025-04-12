# Kohaliku Redis'e seadistamine Boardshoot rakenduses

Hetkel on rakendus seadistatud kasutama Upstash pilvepõhist Redis'e teenust, kuid arenduseks ja testimiseks võite soovida kasutada kohalikku Redis'e seadistust.

## application.properties muutmine kohaliku Redis'e jaoks

Avage fail `backend/src/main/resources/application.properties` ja tehke järgmised muudatused:

### 1. Kommenteerige välja kaugserveri (Upstash) seaded

```properties
# Redis konfiguratsioon - kaugserveri seaded (Upstash)
# spring.data.redis.host=https://one-terrier-19244.upstash.io
# spring.data.redis.password=AUssAAIjcDE5NDc0OTdlNDg3NDQ0OTdiOTIwYjNmZDZhMTBiMjY1M3AxMA
# spring.data.redis.port=6379
# spring.data.redis.timeout=2000
# spring.cache.type=redis
# spring.data.redis.ssl.enabled=true
# spring.cache.redis.time-to-live=3600000
# spring.cache.redis.cache-null-values=false
```

### 2. Aktiveerige kohaliku Redis'e seadistus

```properties
# Kohaliku Redis'e seadistus
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.data.redis.timeout=2000
spring.cache.type=redis
spring.cache.redis.time-to-live=3600000
spring.cache.redis.cache-null-values=false
```

## Kohaliku Redis'e käivitamine

Veenduge, et Redis on paigaldatud ja käivitatud:

```bash
# Redis'e paigaldamine (kui pole veel paigaldatud)
brew install redis

# Redis'e käivitamine
brew services start redis

# Kontrolli, kas Redis töötab
redis-cli ping
```

Kui saate vastuseks "PONG", siis Redis töötab ja on valmis kasutamiseks.

## Rakenduse taaskäivitamine

Pärast konfiguratsiooni muutmist taaskäivitage rakendus:

```bash
mvn spring-boot:run
```

## Kohaliku Redis'e eelised arendamisel

1. **Kiire töö** - Kohalik Redis on kiirem kui pilveteenuse kasutamine
2. **Töötab ilma internetiühenduseta** - Saate arendada ja testida ka ilma internetiühenduseta
3. **Lihtne andmete puhastamine** - `FLUSHALL` käsk võimaldab kiiresti kogu vahemälu tühjendada
4. **Tasuta ja piiranguteta** - Pole vaja muretseda pilveteenuse limiitide või kulude pärast

## Pilveteenuse (Upstash) eelised

1. **Jagatud vahemälu** - Sama vahemälu on kättesaadav kõigile rakenduse instantsidele
2. **Skaleeruvus** - Automaatne skaleerumine vastavalt koormusele
3. **Haldus** - Pole vaja ise Redis'e teenust hallata

Valige konfiguratsioon vastavalt oma vajadustele, kasutades kohalikku Redis'e seadistust arenduskeskkonnas ja Upstash'i (või muud pilveteenust) tootmiskeskkonnas. 