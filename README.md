# Bundler

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

This is the README file for the `bundler` package. It provides information about the package, its dependencies, and available scripts.

## Development

make sure you have [Node.js](https://nodejs.org) installed. Then, run the following command:

```bash
yarn
```

## Usage

The `bundler` package provides several scripts that can be executed using yarn. Here are the available scripts:

-   **build**: This script compiles the TypeScript source files using `tsc`. Run it with the following command:

    ```shell
    yarn build
    ```

-   **dev**: This script starts the development server using `nodemon`. It automatically restarts the server when changes are made to the source files. Run it with the following command:

    ```shell
    yarn dev
    ```

-   **preview**: This script builds the project and starts the server using the compiled files. Run it with the following command:

    ```shell
    yarn preview
    ```

## License

This package is licensed under the [MIT License](LICENSE).
