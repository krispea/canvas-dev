# Drupal Frontend Reviewer Agent - Fejlesztési útmutató

## Projekt áttekintés

**Agent neve:** `drupal-frontend-reviewer`
**Branch:** `agent-drupal-frontend-reviewer`
**Mappa:** `agents/drupal-frontend-reviewer`
**Technológia:** Python + strands-agents SDK + Anthropic Claude

## Agent leírás

A Drupal Frontend Reviewer agent automatikusan ellenőrzi a Drupal témák és modulok frontend kódját (Twig template-ek, SDC komponensek, CSS, JavaScript), és visszajelzést ad az accessibility, best practice-ek és kódminőség terén. Segít a code review folyamat gyorsításában és a konzisztens fejlesztési standardok betartásában.

## Miért ez az agent?

- **Valós pain point:** Code review időigényes, accessibility hibák gyakran átcsúsznak
- **Drupal-specifikus:** Kevés ilyen tool létezik Drupal frontend-re
- **Jól körülhatárolható:** Nem akar mindent megoldani, csak frontend review-ra fókuszál
- **Kiegészíti a "Design to Code" agentet:** Az generál kódot → ez reviewzza

## Tervezett funkciók (toolok)

| Tool | Mit csinál |
|------|-----------|
| `twig_reviewer` | Twig template elemzés (syntax, best practices, Drupal konvenciók) |
| `sdc_validator` | SDC component.yml validálás, props ellenőrzés, JSON schema |
| `a11y_checker` | Accessibility: WCAG, ARIA, alt szövegek, heading hierarchia |
| `css_reviewer` | CSS best practices, BEM naming, unused styles |
| `js_reviewer` | Drupal behaviors, ES6 patterns |

## Setup parancsok

```bash
# 1. Repo klónozása és branch létrehozása
git clone <REPO_URL>
cd <REPO>
git checkout -b agent-drupal-frontend-reviewer

# 2. Mappa struktúra
mkdir -p agents/drupal-frontend-reviewer
cd agents/drupal-frontend-reviewer

# 3. Python virtuális környezet
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 4. Dependencies telepítése
pip install 'strands-agents[anthropic]' strands-agents-tools

# 5. Kilépés venv-ből (ha kell)
deactivate
```

## Fájl struktúra

```
agents/drupal-frontend-reviewer/
├── __init__.py
├── requirements.txt
├── agent.py              # Fő agent definíció
├── tools/
│   ├── __init__.py
│   ├── twig_reviewer.py  # Twig elemző tool
│   ├── sdc_validator.py  # SDC komponens validátor
│   ├── a11y_checker.py   # Accessibility ellenőrző
│   └── css_reviewer.py   # CSS reviewer
└── prompts/
    └── system_prompt.md  # Agent system prompt
```

## requirements.txt tartalma

```
strands-agents>=1.0.0
strands-agents-tools>=0.2.0
anthropic
```

## Alap agent.py példa

```python
from strands import Agent
from strands.models.anthropic import AnthropicModel
import os

# Anthropic model konfiguráció
model = AnthropicModel(
    client_args={
        "api_key": os.environ.get("ANTHROPIC_API_KEY"),
    },
    max_tokens=2048,
    model_id="claude-sonnet-4-5-20250929",
    params={
        "temperature": 0.3,  # Alacsonyabb a konzisztensebb review-hoz
    }
)

# Agent system prompt
SYSTEM_PROMPT = """
Te egy Drupal Frontend Reviewer agent vagy. A feladatod Drupal témák és modulok
frontend kódjának ellenőrzése.

Fókuszterületek:
1. Twig template-ek: syntax, Drupal best practices, trans használat
2. SDC komponensek: component.yml validitás, props típusok, slots
3. Accessibility: WCAG 2.1 AA, ARIA, szemantikus HTML
4. CSS: BEM naming, specificity, Drupal library integráció
5. JavaScript: Drupal.behaviors, ES6, függőségek

Minden review-nál adj:
- Hibák listája (severity: error/warning/info)
- Konkrét javítási javaslatok
- Best practice tippek
"""

# Agent létrehozása (később custom toolokkal bővítve)
agent = Agent(
    model=model,
    system_prompt=SYSTEM_PROMPT,
    tools=[]  # IDE JÖNNEK A CUSTOM TOOLOK
)

# Teszt
if __name__ == "__main__":
    response = agent("Nézd át ezt a Twig kódot: {{ content }}")
    print(response)
```

## Következő lépések

1. [ ] Repo URL beszerzése és klónozás
2. [ ] Branch létrehozása: `agent-drupal-frontend-reviewer`
3. [ ] Python venv setup
4. [ ] Alap `agent.py` létrehozása és tesztelése
5. [ ] Első tool: `twig_reviewer` implementálása
6. [ ] Tesztelés valós Twig fájlokon (pl. internal-sdc komponensek)
7. [ ] További toolok hozzáadása

## Hasznos linkek

- Strands Agents docs: https://strandsagents.com/latest/
- Strands GitHub: https://github.com/strands-agents/sdk-python
- Anthropic Provider: https://strandsagents.com/latest/user-guide/concepts/model-providers/anthropic/
- Claude modellek: https://docs.anthropic.com/en/docs/about-claude/models/all-models

## Tesztelési ötletek

Az `internal-sdc` komponenseket használhatod tesztelésre:
- `web/modules/custom/internal-sdc/components/` - SDC komponensek
- Különböző típusok: atoms, molecules, layout
- Van component.yml, Twig, CSS mindenhol

## Megjegyzések

- Ne használd a `--break-system-packages` opciót pip-nél
- Ha pip install elhal, használj `pipx`-et
- API key-t környezeti változóban tárold, ne commitold!
