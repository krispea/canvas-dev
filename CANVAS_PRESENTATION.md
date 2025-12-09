# Canvas & Internal SDC Library - Prezentáció jegyzet

## Bevezető (2-3 perc)

### Mi a Canvas?
- Drupal **page builder** modul - vizuális oldalépítő
- **2024. december 4-én** jelent meg az **1.0.0 stable** verzió
- Lehetővé teszi, hogy tartalomszerkesztők kód írása nélkül építsenek oldalakat
- Single Directory Components (SDC) alapú - Drupal core technológia

### Miért fontos ez nekünk?
- Gyorsabb fejlesztés: komponenseket egyszer írunk meg, újrahasználhatók
- Tartalomszerkesztők önállóan tudnak dolgozni
- Konzisztens design a teljes oldalon
- Kód és tartalom szétválasztása

---

## Canvas alapok (5-7 perc)

### Architektúra
- **Components**: SDC komponensek (Twig + YAML + opcionális CSS/JS)
- **Canvas Pages**: Entitások, amik komponensekből állnak össze
- **Props**: Komponens paraméterek (JSON Schema alapú)
- **Slots**: Helyek, ahová más komponensek beágyazhatók

### Canvas Editor
- React + TypeScript alapú UI
- Drag & drop komponens elhelyezés
- Valós idejű előnézet
- Prop szerkesztés vizuális felületen

### Demo: Canvas editor bemutatása
- Új oldal létrehozása
- Komponens hozzáadása
- Props módosítása
- Előnézet

---

## Internal SDC Library (10-12 perc)

### Mi ez?
- Saját komponens könyvtárunk Canvas-hoz
- Tailwind CSS alapú styling
- Alpine.js interaktivitáshoz
- 7 színű paletta (primary, secondary, tertiary, dark, light, white, black)

### Komponens struktúra
```
components/
├── atoms/           # Alapvető építőelemek
│   ├── button/
│   ├── icon/
│   └── paragraph/
├── molecules/       # Összetett elemek
│   ├── interactive/
│   │   ├── accordion/
│   │   └── tabs/
│   ├── cards/
│   └── heroes/
└── organisms/       # Komplex szekciók
```

### Komponens felépítése (példa: tabs)
```
tabs-container/
├── tabs-container.component.yml   # Definíció, props
├── tabs-container.twig            # Template
└── (nincs külön JS - Alpine.js inline)
```

### Konvenciók
1. **Alpine.js** interaktivitáshoz (nem egyedi JS)
2. **Tailwind CSS** stylinghoz (safelist!)
3. **Props** minden testreszabható értékhez
4. **Slots** beágyazható tartalomhoz
5. **Canvas editor kompatibilitás** (rejtett elemek kezelése)

### Demo: Komponens bemutatása
- Tabs komponens különböző stílusokkal
- Props változtatása Canvas-ban
- Színek, igazítás, stílusok

---

## Fejlesztési workflow (3-5 perc)

### Új komponens létrehozása
1. Mappa létrehozása megfelelő helyen (atoms/molecules/organisms)
2. `component.yml` - props definiálása
3. `component.twig` - template
4. Tailwind classes hozzáadása a safelisthez
5. `npm run build`
6. Tesztelés Canvas editorban

### Gyakori hibák elkerülése
- Tailwind class nincs a safelistben → nem jelenik meg
- Alpine.js használata egyedi JS helyett
- Canvas editor UX: rejtett elemek láthatóvá tétele szerkesztéskor
- Minden hivatkozott fájl létrehozása és commitolása

### Parancsok
```bash
# Build
cd web/modules/custom/internal-sdc
npm run build

# Dev watch mode
npm run dev
```

---

## Best practices összefoglaló (2-3 perc)

### Komponens tervezés
- Kezdj a props-okkal: mit kell tudnia konfigurálni a szerkesztőnek?
- Használd a meglévő komponenseket referenciaként (pl. accordion → tabs)
- Gondolj a Canvas editor UX-re

### Styling
- 7 színű paletta konzisztens használata
- Új Tailwind classok → safelist
- Responsive design (sm, md, lg breakpointok)

### Interaktivitás
- Alpine.js az első választás
- Egyszerű, inline megoldások
- Parent-child kommunikáció Alpine scope-on keresztül

---

## Q&A

### Gyakori kérdések amikre készülj fel:
1. **"Mi a különbség a Layout Builder és a Canvas között?"**
   - Canvas: komponens alapú, SDC, modernebb UI
   - Layout Builder: blokk alapú, Drupal core

2. **"Hogyan adunk hozzá új színt?"**
   - tailwind.config.js: colors + safelist

3. **"Lehet-e egyedi JS-t használni?"**
   - Igen, de Alpine.js preferált a konzisztencia miatt

4. **"Hogyan teszteljük a komponenseket?"**
   - Canvas editorban + frontend preview

---

## Hasznos linkek
- Canvas modul: https://www.drupal.org/project/canvas
- Tailwind docs: https://tailwindcss.com/docs
- Alpine.js docs: https://alpinejs.dev
