# Redis vahemälu seadistamine Boardshoot rakenduses

## Ülevaade
Selles dokumendis on juhised Redis vahemälu seadistamiseks Boardshoot rakenduses. Redis on kiire võtmete-väärtuste andmebaas, mida kasutatakse vahemälu (cache) jaoks, et vähendada päringute arvu põhiandmebaasi.

## Vajalikud eeldused
- Docker ja Docker Compose on paigaldatud (Dockeriga käivitamiseks)
- Java 17 või kõrgem
- Maven 3.6 või kõrgem
- Homebrew (MacOS kasutajatele)

## Redis'e käivitamine Docker'iga

1. Mine projekti juurkataloogi (`backend/`).
2. Käivita Redis konteiner:
```
docker-compose up -d redis
```
3. Kontrolli, kas Redis on käivitunud:
```
docker ps
```

## Redis'e paigaldamine ja käivitamine Homebrew abil (macOS)

1. Paigalda Redis kasutades Homebrew:
```
brew install redis
```

2. Käivita Redis taustaprotsessina:
```
brew services start redis
```

3. Kontrolli, et Redis töötab:
```
redis-cli ping
```
Kui saad vastuseks "PONG", siis Redis töötab edukalt.

4. Redis'e peatamiseks:
```
brew services stop redis
```

5. Redis'e info nägemiseks:
```
brew info redis
```

## Redise käivitamine ilma Dockerita (alternatiiv)

1. Laadi alla ja paigalda Redis [ametlikult lehelt](https://redis.io/download) või kasuta oma OS-i paketihalduri abil.
2. Käivita Redis server:
```
redis-server
```

## Konfiguratsiooni seadistamine

Rakenduses on juba Redis'e konfiguratsioon olemas `application.properties` failis:

```properties
# Redis konfiguratsioon
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.data.redis.timeout=2000
spring.cache.type=redis
spring.cache.redis.time-to-live=3600000
spring.cache.redis.cache-null-values=false
```

## Rakenduse käivitamine

1. Käivita rakendus:
```
mvn spring-boot:run
```

## Kuidas Redis vahemälu töötab

1. **Kasutaja sisselogimisel**:
   - Kasutaja andmed salvestatakse Redis'esse võtmega "user:kasutajanimi"
   - Andmeid hoitakse Redis'es 1 tund (konfigureeritav `application.properties` failis)

2. **Kasutajaprofiili laadimisel**:
   - Kui andmed on Redis'es olemas, tagastatakse need ilma andmebaasist päringu tegemiseta
   - Kui andmeid Redis'es pole, tehakse päring andmebaasi ja salvestatakse tulemused Redis'esse

3. **Kasutaja andmete uuendamisel**:
   - Andmed uuendatakse nii andmebaasis kui ka Redis'es
   - Enne uuendamist kustutatakse vana versioon Redis'est

## Vahemälu testimine

Saad testida vahemälu toimimist logide abil. Kui kasutaja andmeid päritakse vahemälust, kuvatakse konsoolis järgmine teade:
```
User profile fetched from cache: {username}
```

Kui andmeid päritakse andmebaasist, kuvatakse:
```
Profile fetched from database for user: {username}
```

## Redis käsurealiidese kasutamine testimiseks

1. Ühenda Redis CLI-ga:
```
redis-cli
```

2. Vaata kõiki võtmeid:
```
KEYS *
```

3. Vaata kasutaja andmeid:
```
HGETALL user:kasutajanimi
```

4. Kustuta kasutaja andmed:
```
DEL user:kasutajanimi
```

## Redis'e seisu ja töö jälgimine käsureal

### Redis'e käsud monitoorimiseks

1. Redis'e CLI käivitamine:
```
redis-cli
```

2. Kõigi võtmete vaatamine (ettevaatust suurte andmebaaside puhul):
```
KEYS *
```

3. Otsib kõiki võtmeid, mis algavad "user:"-ga:
```
KEYS user:*
```

4. Kasutaja andmete vaatamine (asenda "kasutajanimi" tegeliku kasutajanimega):
```
HGETALL user:kasutajanimi
```

5. Võtme aegumisaja kontrollimine (sekundites):
```
TTL user:kasutajanimi
```

6. Redis'e serveri info vaatamine:
```
INFO
```

7. Redis'e mälu kasutuse info:
```
INFO memory
```

### Redis'e operatsioonide jälgimine reaalajas

Redis'e `MONITOR` käsk võimaldab näha kõiki päringuid, mida Redis teenindab:

1. Käivita Redis'e monitor:
```
MONITOR
```

2. Logi nüüd oma Boardshoot rakendusse sisse või tee muid toiminguid ja jälgi monitoris kuvatavaid päringuid.
3. Väljumiseks vajuta `CTRL + C`.

**Märkus:** `MONITOR` käsk võib mõjutada Redis'e jõudlust, seega ära kasuta seda pikka aega tootmiskeskkonnas.

### Redis'e töö testimine rakendusega

Et veenduda, et Redis ja sinu rakendus töötavad koos, tee järgmised sammud:

1. Puhasta Redis'e andmebaas (eemaldab kõik võtmed, kasuta seda ainult arenduskeskkonnas):
```
FLUSHALL
```

2. Käivita rakendus ja logi sisse.
3. Kontrolli Redis CLI-ga, kas kasutaja andmed on nüüd vahemälus:
```
KEYS user:*
HGETALL user:kasutajanimi
```

4. Logi välja ja uuesti sisse ning kontrolli Redis'e logidest (kui jälgid MONITOR-iga), et infot võetakse nüüd vahemälust, mitte andmebaasist.

## Tüüpilise vahemälu testimise voog

1. Käivita Redis ja oma rakendus.
2. Ava teine terminal ja käivita:
```
redis-cli MONITOR
```
3. Logi rakendusse sisse.
4. Jälgi monitor terminalis, et näha Redis'e päringuid salvestamas andmeid vahemällu.
5. Väljumiseks vajuta `CTRL + C`.
6. Kontrolli vahemälu sisu:
```
redis-cli KEYS "*"
redis-cli HGETALL user:sinu_kasutajanimi
```
7. Mine tagasi rakendusse ja värskenda profiilileht.
8. Serveri logidest peaksid nägema teadet "User profile fetched from cache", mis näitab, et andmed tulid vahemälust, mitte andmebaasist.

## Veaotsing

* **Redis pole kättesaadav**: Veendu, et Redis server töötab ja on kättesaadav pordil 6379.
* **Vahemälu ei tööta**: Kontrolli logisid, et näha kas Redis'ega ühenduse loomine õnnestus.
* **Andmed ei uuene**: Vaata, kas uuendamisel kustutatakse vana kirje enne uue lisamist.

## Lisainfo

* Redis dokumentatsioon: [https://redis.io/documentation](https://redis.io/documentation)
* Spring Data Redis dokumentatsioon: [https://docs.spring.io/spring-data/redis/docs/current/reference/html](https://docs.spring.io/spring-data/redis/docs/current/reference/html) 