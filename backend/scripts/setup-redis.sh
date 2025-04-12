#!/bin/bash

# Kontrolli kas Homebrew on paigaldatud
if ! command -v brew &> /dev/null; then
    echo "Homebrew ei ole paigaldatud. Palun paigalda see esmalt."
    echo "Paigalduseks külasta: https://brew.sh/"
    exit 1
fi

# Funktsioon Redis'e oleku kontrollimiseks
check_redis_status() {
    if brew services list | grep redis | grep started &> /dev/null; then
        echo "Redis on käivitatud."
        return 0
    else
        echo "Redis ei ole käivitatud."
        return 1
    fi
}

# Kontrolli kas Redis on paigaldatud
if ! brew list | grep redis &> /dev/null; then
    echo "Redis ei ole paigaldatud. Paigaldan Redis'e..."
    brew install redis
    
    if [ $? -ne 0 ]; then
        echo "Redis'e paigaldamine ebaõnnestus!"
        exit 1
    fi
    echo "Redis on edukalt paigaldatud!"
else
    echo "Redis on juba paigaldatud."
fi

# Küsi kasutajalt mida teha
echo ""
echo "Mida soovid teha?"
echo "1) Käivita Redis"
echo "2) Peata Redis"
echo "3) Kontrolli Redis'e olekut"
echo "4) Testi Redis'e ühendust"
echo "5) Vaata Redis'e infot"
echo "6) Käivita Redis'e monitor (jälgi kõiki päringuid)"
echo "7) Vaata kõiki Redis'e võtmeid"
echo "8) Vaata kasutajate andmeid vahemälus"
echo "9) Puhasta Redis'e andmebaas (FLUSHALL)"
echo "10) Välju"
read -p "Sinu valik (1-10): " choice

case $choice in
    1)
        echo "Käivitan Redis'e..."
        brew services start redis
        if [ $? -eq 0 ]; then
            echo "Redis on edukalt käivitatud!"
        else
            echo "Redis'e käivitamine ebaõnnestus!"
        fi
        ;;
    2)
        echo "Peatan Redis'e..."
        brew services stop redis
        if [ $? -eq 0 ]; then
            echo "Redis on edukalt peatatud!"
        else
            echo "Redis'e peatamine ebaõnnestus!"
        fi
        ;;
    3)
        check_redis_status
        ;;
    4)
        echo "Testin Redis'e ühendust..."
        if redis-cli ping | grep PONG &> /dev/null; then
            echo "Ühendus Redis'ega on korras! Vastus: PONG"
        else
            echo "Ühenduse testimine ebaõnnestus. Veendu, et Redis töötab."
        fi
        ;;
    5)
        echo "Redis'e info:"
        redis-cli INFO | grep -E 'redis_version|connected_clients|used_memory_human|total_connections_received'
        echo ""
        echo "Täielikku infot näed käsuga: redis-cli INFO"
        ;;
    6)
        echo "Käivitan Redis'e monitori. Väljumiseks vajuta CTRL+C"
        echo "NB! Monitor näitab kõiki Redis'e päringuid reaalajas."
        echo ""
        redis-cli MONITOR
        ;;
    7)
        echo "Redis'e võtmed:"
        redis-cli KEYS "*"
        ;;
    8)
        echo "Kasutajate andmed vahemälus:"
        
        # Leiame kõik kasutajate võtmed
        USERS=$(redis-cli KEYS "user:*")
        
        if [ -z "$USERS" ]; then
            echo "Ühtegi kasutajat ei leitud vahemälust."
        else
            echo "Leitud järgmised kasutajad:"
            for USER_KEY in $USERS; do
                echo ""
                echo "Kasutaja: $USER_KEY"
                echo "Andmed:"
                redis-cli HGETALL "$USER_KEY"
                echo "Aegumisaeg (sekundites): $(redis-cli TTL "$USER_KEY")"
            done
        fi
        ;;
    9)
        echo "HOIATUS! See tegevus kustutab kõik andmed Redis'e andmebaasist!"
        read -p "Kas soovid jätkata? (y/n): " confirm
        if [ "$confirm" = "y" ]; then
            redis-cli FLUSHALL
            echo "Redis'e andmebaas on puhastatud!"
        else
            echo "Tegevus tühistatud."
        fi
        ;;
    10)
        echo "Välju."
        exit 0
        ;;
    *)
        echo "Vigane valik! Palun käivita skript uuesti ja vali number 1-10."
        exit 1
        ;;
esac

echo ""
echo "Redis'e skript on lõpetanud töö." 