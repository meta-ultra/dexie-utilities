# Welcome to @meta-ultra/dexie-utilities

<div>
  <img style="display:inline;" src="https://img.shields.io/github/package-json/v/meta-ultra/dexie-utilities?filename=packages%2Fapp-router%2Fpackage.json">
  <img style="display:inline;" src="https://img.shields.io/bundlephobia/min/%40meta-ultra/dexie-utilities">
  <img style="display:inline;" src="https://img.shields.io/bundlejs/size/%40meta-ultra/dexie-utilities">
  <img style="display:inline;" src="https://img.shields.io/github/license/meta-ultra/dexie-utilities">
</div>

Give a ⭐️ if this project helped you!

## 🌟 Features

- Powerful and easy to use `query` helper function, supports nested properties as query condition.
- `@meta-ultra/dexie-utilities` is written with type safety in mind through TypeScript.

## 🏠 Installation

Install `@meta-ultra/dexie-utilities` with your favorite package manager:

- pnpm: `pnpm add @meta-ultra/dexie-utilities@latest`
- yarn: `yarn add @meta-ultra/dexie-utilities@latest`
- npm: `npm install -S @meta-ultra/dexie-utilities@latest`

## Notes for Dexie

1. Each table must have exactly one primary key, and the primary key must be the first field in the schema string. So,
   - The `++` schema syntax only allows to be used prefixing the first field in the schema string.
   - Union primary key is not supported, we've got to make it ourselves.
   - For table definition with union primary key, add a pseudo primary key field for Dexie exclusively even it wouldn't be accessed forever.
2. Upgrading on primary key definition is not allowed, even if the version has been updated.

## 👶 Author

Hey, friends. I'm John Huang, a full stack developer majorly code with React, Next.js, GraphQL, TailwindCSS, Taro and SpringBoot. Feel free to contact with me 😃

- GitHub: <https://github.com/fsjohnhuang>
- LinkedIn: <https://www.linkedin.com/in/fsjohnhuang>
- Blog: <https://fsjohnhuang.cnblogs.com/>

## 🤝 Contributing

Contributions, issues and feature requests are welcome!
Feel free to check [issues page](https://github.com/meta-ultra/app-router/issues).
