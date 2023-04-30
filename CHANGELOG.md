# Changelog

# [0.6.0](https://github.com/DigitalBrainJS/AxiosPromise/compare/v0.5.0...v0.6.0) (2023-04-30)


### Features

* **promisifyAll:** add promisifyAll helper; ([#39](https://github.com/DigitalBrainJS/AxiosPromise/issues/39)) ([a7d07a7](https://github.com/DigitalBrainJS/AxiosPromise/commit/a7d07a718724dfe83b1eb781b402178fb1e19193))

### Contributors to this release

- Dmitriy Mozgovoy

# [0.5.0](https://github.com/DigitalBrainJS/AxiosPromise/compare/v0.4.1...v0.5.0) (2023-04-30)


### Features

* **promisify:** add passthrough option; ([#37](https://github.com/DigitalBrainJS/AxiosPromise/issues/37)) ([579ecce](https://github.com/DigitalBrainJS/AxiosPromise/commit/579ecce22203f181fe847ad0455cff39883a2222))

### Contributors to this release

- Dmitriy Mozgovoy

## [0.4.1](https://github.com/DigitalBrainJS/AxiosPromise/compare/v0.4.0...v0.4.1) (2023-04-27)


### Bug Fixes

* **core:** do not try to subscribe when the promise is already resolved; ([#35](https://github.com/DigitalBrainJS/AxiosPromise/issues/35)) ([8c04466](https://github.com/DigitalBrainJS/AxiosPromise/commit/8c044663b45234c8c06f237ad37626f574994967))

### Contributors to this release

- Dmitriy Mozgovoy

# [0.4.0](https://github.com/DigitalBrainJS/AxiosPromise/compare/v0.3.0...v0.4.0) (2023-04-27)


### Features

* **uncaught-warning:** redesigned logic for tracking unhandled promise rejection; ([#33](https://github.com/DigitalBrainJS/AxiosPromise/issues/33)) ([96b8c38](https://github.com/DigitalBrainJS/AxiosPromise/commit/96b8c3880a97b4c1e969dba59aed5c2a1e8545d8))

### Contributors to this release

- Dmitriy Mozgovoy

# [0.3.0](https://github.com/DigitalBrainJS/AxiosPromise/compare/v0.2.0...v0.3.0) (2023-04-26)


### Bug Fixes

* **core:** fix issue of unwanted unhandledRejection warning in case of late subscription with Promise.resolve; ([#29](https://github.com/DigitalBrainJS/AxiosPromise/issues/29)) ([aed04e7](https://github.com/DigitalBrainJS/AxiosPromise/commit/aed04e7e8c02aaacf0e1bca7adcc5ffb416993d8))
* **errors:** add missed code argument for TimeoutError constructor; ([#32](https://github.com/DigitalBrainJS/AxiosPromise/issues/32)) ([1a6a004](https://github.com/DigitalBrainJS/AxiosPromise/commit/1a6a0040031dc1a8536bdcf277cfa5b6d46bbd69))


### Features

* **errors:** add errorOrMessage argument for timeout method; ([#30](https://github.com/DigitalBrainJS/AxiosPromise/issues/30)) ([671b480](https://github.com/DigitalBrainJS/AxiosPromise/commit/671b48036e12aa9b922317beb1043aafe8ee61d2))

### Contributors to this release

- Dmitriy Mozgovoy

# [0.2.0](https://github.com/DigitalBrainJS/AxiosPromise/compare/v0.1.0...v0.2.0) (2023-04-26)


### Features

* **scope-context:** add scopeContext option for promisify decorator; ([#27](https://github.com/DigitalBrainJS/AxiosPromise/issues/27)) ([7e50e37](https://github.com/DigitalBrainJS/AxiosPromise/commit/7e50e37dd18f9c45b8e31284b06f4223d3db3664))

### Contributors to this release

- Dmitriy Mozgovoy

# [0.1.0](https://github.com/DigitalBrainJS/AxiosPromise/compare/v0.0.9...v0.1.0) (2023-04-24)


### Features

* **executor:** add ability to set onCancel listener by returning it from the executor function; ([#25](https://github.com/DigitalBrainJS/AxiosPromise/issues/25)) ([a200382](https://github.com/DigitalBrainJS/AxiosPromise/commit/a20038241d68e9c84307a241139cc119f9fd2cef))

### Contributors to this release

- Dmitriy Mozgovoy

## [0.0.9](https://github.com/DigitalBrainJS/AxiosPromise/compare/v0.0.8...v0.0.9) (2023-04-14)


### Bug Fixes

* **types:** fixed types for onCancel listener & promisify decorator; ([#23](https://github.com/DigitalBrainJS/AxiosPromise/issues/23)) ([96dbeba](https://github.com/DigitalBrainJS/AxiosPromise/commit/96dbebaeffcf4256a1f393de66b6bf0e9c9c3744))

### Contributors to this release

- Dmitriy Mozgovoy

## [0.0.8](https://github.com/DigitalBrainJS/AxiosPromise/compare/v0.0.7...v0.0.8) (2023-04-12)


### Bug Fixes

* **docs:** fixed examples; ([#20](https://github.com/DigitalBrainJS/AxiosPromise/issues/20)) ([9675b84](https://github.com/DigitalBrainJS/AxiosPromise/commit/9675b8459523e15e837b9bb496de9c466a326bc5))
* **types:** fixed types; ([#21](https://github.com/DigitalBrainJS/AxiosPromise/issues/21)) ([374ca3d](https://github.com/DigitalBrainJS/AxiosPromise/commit/374ca3d69b0deefc0892f6cc27a0071ecb8ccb75))

### Contributors to this release

- Dmitriy Mozgovoy

## [0.0.7](https://github.com/DigitalBrainJS/AxiosPromise/compare/v0.0.6...v0.0.7) (2023-03-10)


### Bug Fixes

* **exports:** export utils; ([#18](https://github.com/DigitalBrainJS/AxiosPromise/issues/18)) ([61681cc](https://github.com/DigitalBrainJS/AxiosPromise/commit/61681cc0f320ab0c27f773ec3c887446e869732c))

### Contributors to this release

- Dmitriy Mozgovoy

## [0.0.6](https://github.com/DigitalBrainJS/AxiosPromise/compare/v0.0.5...v0.0.6) (2023-02-26)


### Bug Fixes

* **package:** fixed module entry points; ([#13](https://github.com/DigitalBrainJS/AxiosPromise/issues/13)) ([269d145](https://github.com/DigitalBrainJS/AxiosPromise/commit/269d145834753ccac998962701fd34e1b30d6cd5))

### Contributors to this release

- Dmitriy Mozgovoy

## [0.0.5](https://github.com/DigitalBrainJS/AxiosPromise/compare/v0.0.4...v0.0.5) (2023-02-23)


### Bug Fixes

* refactored to _unhandledRejection; ([#11](https://github.com/DigitalBrainJS/AxiosPromise/issues/11)) ([f4cab96](https://github.com/DigitalBrainJS/AxiosPromise/commit/f4cab9641985e20a7249bf0bb9aad96386814b52))

### Contributors to this release

- Dmitriy Mozgovoy

## [0.0.4](https://github.com/DigitalBrainJS/AxiosPromise/compare/v0.0.3...v0.0.4) (2023-02-23)


### Bug Fixes

* added ability for isGeneratorFunction to detect wrapped functions; ([#10](https://github.com/DigitalBrainJS/AxiosPromise/issues/10)) ([3cded21](https://github.com/DigitalBrainJS/AxiosPromise/commit/3cded216fafdf7c7ef83610d6a5e6186ba395090))

### Contributors to this release

- Dmitriy Mozgovoy

## [0.0.3](https://github.com/DigitalBrainJS/AxiosPromise/compare/v0.0.2...v0.0.3) (2023-02-23)

## 0.0.1 (2023-02-19)


### Bug Fixes

* added missed `env/data.js`; ([3f6b492](https://github.com/DigitalBrainJS/AxiosPromise/commit/3f6b4929b473e944183d66f24e322c57637d0cef))
* export VERSION constant; ([1a9386e](https://github.com/DigitalBrainJS/AxiosPromise/commit/1a9386e9f62a9958ad689c5b44bc2b9813589e3e))
* fix AbortController event emitting; ([1f2cd54](https://github.com/DigitalBrainJS/AxiosPromise/commit/1f2cd541d8284ffa31810a780251b319957bdac4))

### Contributors to this release

- Dmitriy Mozgovoy

## [0.0.0] (2023-02-19)

Initial version