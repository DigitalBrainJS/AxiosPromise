# Changelog

## [0.11.3](https://github.com/DigitalBrainJS/AxiosPromise/compare/v0.11.2...v0.11.3) (2024-09-13)


### Bug Fixes

* **types:** improve promisify types; ([#62](https://github.com/DigitalBrainJS/AxiosPromise/issues/62)) ([c64ee0f](https://github.com/DigitalBrainJS/AxiosPromise/commit/c64ee0f8b310ff4b022f16b1693f4d0515b1553c))

### Contributors to this release

- Dmitriy Mozgovoy

## [0.11.2](https://github.com/DigitalBrainJS/AxiosPromise/compare/v0.11.1...v0.11.2) (2024-09-06)


### Bug Fixes

* **signal:** improve signal reason support; ([#60](https://github.com/DigitalBrainJS/AxiosPromise/issues/60)) ([c6115d1](https://github.com/DigitalBrainJS/AxiosPromise/commit/c6115d17f83cd0551511bd8c8b68f16feadcc5e4))

### Contributors to this release

- Dmitriy Mozgovoy

## [0.11.1](https://github.com/DigitalBrainJS/AxiosPromise/compare/v0.11.0...v0.11.1) (2024-03-21)


### Bug Fixes

* **UnhandledRejectionError:** fixed UnhandledRejectionError constructor to handle a string source; ([#58](https://github.com/DigitalBrainJS/AxiosPromise/issues/58)) ([f5a7da1](https://github.com/DigitalBrainJS/AxiosPromise/commit/f5a7da171c06dbd47251e4bd61bedc4bf19b8725))

### Contributors to this release

- Dmitriy Mozgovoy

# [0.11.0](https://github.com/DigitalBrainJS/AxiosPromise/compare/v0.10.0...v0.11.0) (2024-03-19)


### Features

* **helper:** add bottleneck helper; ([#56](https://github.com/DigitalBrainJS/AxiosPromise/issues/56)) ([9463140](https://github.com/DigitalBrainJS/AxiosPromise/commit/94631400de8abf3384973614f4c1626f3a7ad08a))

### Contributors to this release

- Dmitriy Mozgovoy

# [0.10.0](https://github.com/DigitalBrainJS/AxiosPromise/compare/v0.9.3...v0.10.0) (2024-02-08)


### Bug Fixes

* **AbortController:** fix signal reason handling; ([#53](https://github.com/DigitalBrainJS/AxiosPromise/issues/53)) ([c64fec4](https://github.com/DigitalBrainJS/AxiosPromise/commit/c64fec48940f9491e77b359b1cd548488061fa31))


### Features

* **AbortController:** added support for AbortSignal.reason; ([65190e3](https://github.com/DigitalBrainJS/AxiosPromise/commit/65190e3def34111f2618053f63e4483ca628c3e2))

### Contributors to this release

- DigitalBrainJS

## [0.9.3](https://github.com/DigitalBrainJS/AxiosPromise/compare/v0.9.2...v0.9.3) (2023-12-06)


### Bug Fixes

* **EventEmitter:** fixed event emitting when the listener is removed during emit; ([#51](https://github.com/DigitalBrainJS/AxiosPromise/issues/51)) ([f21db77](https://github.com/DigitalBrainJS/AxiosPromise/commit/f21db77834596658226e1ea9350900a34cb3be6d))

### Contributors to this release

- Dmitriy Mozgovoy

## [0.9.2](https://github.com/DigitalBrainJS/AxiosPromise/compare/v0.9.1...v0.9.2) (2023-12-06)


### Bug Fixes

* **EventEmitter:** fixed event emitting when there are multiple event listeners; ([#49](https://github.com/DigitalBrainJS/AxiosPromise/issues/49)) ([654d70f](https://github.com/DigitalBrainJS/AxiosPromise/commit/654d70ffca6e27337ec0f65abf82914d292c8d2d))

### Contributors to this release

- Dmitriy Mozgovoy

## [0.9.1](https://github.com/DigitalBrainJS/AxiosPromise/compare/v0.9.0...v0.9.1) (2023-05-20)


### Bug Fixes

* **tag:** fixed promise tag rendering for unhandled rejection error; ([1035012](https://github.com/DigitalBrainJS/AxiosPromise/commit/103501297b278d563f286b07e293068cece53e11))

### Contributors to this release

- DigitalBrainJS

# [0.9.0](https://github.com/DigitalBrainJS/AxiosPromise/compare/v0.8.2...v0.9.0) (2023-05-20)


### Bug Fixes

* **promisifyAll:** support promisification for non enumerable props; ([b643bdc](https://github.com/DigitalBrainJS/AxiosPromise/commit/b643bdc1e86d2e947d624d557af9e89d044617f7))


### Features

* **UnhandledRejectionError:** added UnhandledRejectionError class to wrap unhandled errors and have stack traces; ([c44282a](https://github.com/DigitalBrainJS/AxiosPromise/commit/c44282af14d577cb8c9e6cec94bd14443a717a41))

### Contributors to this release

- DigitalBrainJS

## [0.8.2](https://github.com/DigitalBrainJS/AxiosPromise/compare/v0.8.1...v0.8.2) (2023-05-18)


### Bug Fixes

* **promisifyAll:** support promisification for non enumerable props; ([ea464d6](https://github.com/DigitalBrainJS/AxiosPromise/commit/ea464d6ac3a7d1c69403a24fdf141f431fca43a4))

### Contributors to this release

- DigitalBrainJS

## [0.8.1](https://github.com/DigitalBrainJS/AxiosPromise/compare/v0.8.0...v0.8.1) (2023-05-17)


### Bug Fixes

* **promisify:** fix catching sync errors inside plain function; ([053c8b5](https://github.com/DigitalBrainJS/AxiosPromise/commit/053c8b5cea924bbeaa00918b89218a592c23d77d))

### Contributors to this release

- DigitalBrainJS

# [0.8.0](https://github.com/DigitalBrainJS/AxiosPromise/compare/v0.7.0...v0.8.0) (2023-05-16)


### Bug Fixes

* **abort-controller:** removed erroneous argument from `abort` method; ([a8d49cf](https://github.com/DigitalBrainJS/AxiosPromise/commit/a8d49cf8f11cf4f577b4470ec938f9be115c6a9e))
* **package:** fix package entrypoints; ([a6fdfaa](https://github.com/DigitalBrainJS/AxiosPromise/commit/a6fdfaa1c45edd42a49e04292134867ed0ae051c))


### Features

* **promisify:** add ability for promisify method to decorate async and plain functions; ([83c8338](https://github.com/DigitalBrainJS/AxiosPromise/commit/83c8338440c96cfb304c9af7d55a5ac68b5efd68))

### Contributors to this release

- DigitalBrainJS

# [0.7.0](https://github.com/DigitalBrainJS/AxiosPromise/compare/v0.6.0...v0.7.0) (2023-05-03)


### Bug Fixes

* **export:** added missed CanceledError and TimeoutError ESM export; ([#41](https://github.com/DigitalBrainJS/AxiosPromise/issues/41)) ([bc051d1](https://github.com/DigitalBrainJS/AxiosPromise/commit/bc051d135d740ee5d57086d5753b21d117878562))


### Features

* **refactor:** rename addSignature method to addSignatureTo; ([#43](https://github.com/DigitalBrainJS/AxiosPromise/issues/43)) ([e78e6e4](https://github.com/DigitalBrainJS/AxiosPromise/commit/e78e6e46d88e7b143f87eb5658254cc20701add1))

### Contributors to this release

- Dmitriy Mozgovoy

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