import { Template } from '../core/models';

const BUILTIN_TEMPLATES: Template[] = [
  {
    id: 'python-project',
    name: 'Python Project',
    description: 'Standard Python project structure',
    format: 'tree',
    isCustom: false,
    content: `MyProject/
├── src/
│   ├── __init__.py
│   ├── main.py
│   └── utils.py
├── tests/
│   ├── __init__.py
│   └── test_main.py
├── docs/
│   └── README.md
├── .gitignore
├── requirements.txt
├── setup.py
└── README.md`
  },
  {
    id: 'unity-project',
    name: 'Unity Project',
    description: 'Unity game project structure',
    format: 'tree',
    isCustom: false,
    content: `MyGame/
├── Assets/
│   ├── Scripts/
│   │   ├── Player/
│   │   │   └── PlayerController.cs
│   │   ├── Enemies/
│   │   │   └── EnemyAI.cs
│   │   └── Managers/
│   │       └── GameManager.cs
│   ├── Prefabs/
│   │   ├── Player.prefab
│   │   └── Enemy.prefab
│   ├── Scenes/
│   │   ├── MainMenu.unity
│   │   └── GameLevel.unity
│   ├── Materials/
│   ├── Textures/
│   ├── Audio/
│   └── UI/
├── Packages/
│   └── manifest.json
└── ProjectSettings/`
  },
  {
    id: 'roblox-project',
    name: 'Roblox Project',
    description: 'Roblox game project structure',
    format: 'tree',
    isCustom: false,
    content: `MyRobloxGame/
├── src/
│   ├── ServerScriptService/
│   │   ├── GameManager.lua
│   │   └── DataStore.lua
│   ├── ReplicatedStorage/
│   │   ├── Modules/
│   │   │   └── SharedConfig.lua
│   │   └── Remotes/
│   ├── StarterGui/
│   │   └── MainGUI/
│   │       └── ScreenGui.lua
│   ├── StarterPlayer/
│   │   └── StarterPlayerScripts/
│   │       └── ClientHandler.lua
│   └── Workspace/
│       └── Map/
├── default.project.json
└── README.md`
  },
  {
    id: 'minecraft-mod',
    name: 'Minecraft Mod',
    description: 'Minecraft mod project structure',
    format: 'tree',
    isCustom: false,
    content: `MyMod/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── mymod/
│       │           ├── MyMod.java
│       │           ├── blocks/
│       │           │   └── ModBlocks.java
│       │           ├── items/
│       │           │   └── ModItems.java
│       │           └── world/
│       │               └── ModWorldGen.java
│       └── resources/
│           ├── META-INF/
│           │   └── mods.toml
│           ├── assets/
│           │   └── mymod/
│           │       ├── textures/
│           │       ├── models/
│           │       └── lang/
│           │           └── en_us.json
│           └── data/
│               └── mymod/
│                   └── recipes/
├── build.gradle
├── gradle.properties
└── README.md`
  },
  {
    id: 'web-project',
    name: 'Web Project',
    description: 'Modern web project structure',
    format: 'tree',
    isCustom: false,
    content: `my-web-app/
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Layout.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   └── About.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── utils/
│   │   └── helpers.ts
│   ├── styles/
│   │   └── globals.css
│   ├── App.tsx
│   └── main.tsx
├── public/
│   ├── favicon.ico
│   └── images/
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md`
  }
];

const STORAGE_KEY = 'folderforge_custom_templates';

export function getTemplates(): Template[] {
  const custom = getCustomTemplates();
  return [...BUILTIN_TEMPLATES, ...custom];
}

export function getBuiltinTemplates(): Template[] {
  return BUILTIN_TEMPLATES;
}

export function getCustomTemplates(): Template[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load custom templates:', e);
  }
  return [];
}

export function saveCustomTemplate(template: Omit<Template, 'id' | 'isCustom'>): Template {
  const custom = getCustomTemplates();
  const newTemplate: Template = {
    ...template,
    id: `custom-${Date.now()}`,
    isCustom: true
  };
  custom.push(newTemplate);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
  return newTemplate;
}

export function deleteCustomTemplate(id: string): void {
  const custom = getCustomTemplates().filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
}
